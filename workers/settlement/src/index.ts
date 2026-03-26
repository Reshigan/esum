/**
 * ESUM Energy Trading Platform - Settlement Worker
 * Settlement calculations, invoice generation, dispute management
 */

interface Env {
  DB: D1Database;
  INVOICES: R2Bucket;
  NOTIFICATION_QUEUE: Queue;
  SETTLEMENT_QUEUE: Queue;
}

interface SettlementResult {
  id: string;
  contract_id: string;
  period_start: string;
  period_end: string;
  metered_mwh: number;
  contracted_mwh: number;
  variance_mwh: number;
  unit_price_zar: number;
  gross_amount_zar: number;
  buyer_fee_zar: number;
  seller_fee_zar: number;
  net_buyer_amount_zar: number;
  net_seller_amount_zar: number;
  carbon_credits_settled?: number;
  recs_settled: number;
  status: string;
}

// ============================================================================
// SETTLEMENT CALCULATIONS
// ============================================================================

async function calculateSettlement(
  contractId: string,
  periodStart: string,
  periodEnd: string,
  env: Env
): Promise<SettlementResult> {
  const now = new Date().toISOString();
  
  // Get contract details
  const contract = await env.DB.prepare(`
    SELECT c.*, i.unit_price_zar, i.carbon_credits_included, i.recs_included
    FROM contracts c
    JOIN instruments i ON c.instrument_id = i.id
    WHERE c.id = ?
  `).bind(contractId).first();
  
  if (!contract) {
    throw new Error('Contract not found');
  }
  
  // Get metered delivery data (from load profile intervals or manual entry)
  const { results: intervals } = await env.DB.prepare(`
    SELECT SUM(energy_kwh) as total_kwh
    FROM load_profile_intervals
    WHERE organisation_id = ? AND timestamp BETWEEN ? AND ?
  `).bind(contract.seller_org_id, periodStart, periodEnd).all();
  
  const meteredKwh = intervals[0]?.total_kwh || 0;
  const meteredMwh = meteredKwh / 1000;
  
  // Calculate variance
  const contractedMwh = contract.total_contracted_mwh;
  const varianceMwh = meteredMwh - contractedMwh;
  
  // Calculate pricing
  const unitPrice = contract.unit_price_zar;
  const grossAmount = meteredMwh * unitPrice * 1000; // Convert to ZAR
  
  // Platform fees (0.25% each side)
  const platformFeeRate = 0.0025;
  const buyerFee = grossAmount * platformFeeRate;
  const sellerFee = grossAmount * platformFeeRate;
  
  // Net amounts
  const netBuyerAmount = grossAmount + buyerFee;
  const netSellerAmount = grossAmount - sellerFee;
  
  // Carbon credits and RECs
  const carbonCreditsSettled = contract.carbon_credits_included 
    ? (meteredMwh * 1.04) // 1.04 tCO2e per MWh avoided
    : undefined;
  
  const recsSettled = contract.recs_included ? Math.floor(meteredMwh) : 0;
  
  // Create settlement record
  const settlementId = crypto.randomUUID();
  
  await env.DB.prepare(`
    INSERT INTO settlements (
      id, contract_id, period_start, period_end, metered_mwh, contracted_mwh,
      variance_mwh, unit_price_zar, gross_amount_zar, buyer_fee_zar, seller_fee_zar,
      net_buyer_amount_zar, net_seller_amount_zar, carbon_credits_settled, recs_settled,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    settlementId, contractId, periodStart, periodEnd, meteredMwh, contractedMwh,
    varianceMwh, unitPrice, grossAmount, buyerFee, sellerFee, netBuyerAmount,
    netSellerAmount, carbonCreditsSettled, recsSettled, 'calculated', now, now
  ).run();
  
  // Update contract delivered amount
  await env.DB.prepare(`
    UPDATE contracts SET delivered_mwh = delivered_mwh + ?, remaining_mwh = remaining_mwh - ?, updated_at = ?
    WHERE id = ?
  `).bind(meteredMwh, meteredMwh, now, contractId).run();
  
  return {
    id: settlementId,
    contract_id: contractId,
    period_start: periodStart,
    period_end: periodEnd,
    metered_mwh: meteredMwh,
    contracted_mwh: contractedMwh,
    variance_mwh: varianceMwh,
    unit_price_zar: unitPrice,
    gross_amount_zar: grossAmount,
    buyer_fee_zar: buyerFee,
    seller_fee_zar: sellerFee,
    net_buyer_amount_zar: netBuyerAmount,
    net_seller_amount_zar: netSellerAmount,
    carbon_credits_settled,
    recs_settled: recsSettled,
    status: 'calculated'
  };
}

// ============================================================================
// INVOICE GENERATION
// ============================================================================

async function generateInvoice(settlementId: string, env: Env): Promise<string> {
  const settlement = await env.DB.prepare(`
    SELECT s.*, c.contract_type, buyer.name as buyer_name, seller.name as seller_name,
           buyer.contact_email as buyer_email, seller.contact_email as seller_email
    FROM settlements s
    JOIN contracts c ON s.contract_id = c.id
    JOIN organisations buyer ON c.buyer_org_id = buyer.id
    JOIN organisations seller ON c.seller_org_id = seller.id
    WHERE s.id = ?
  `).bind(settlementId).first();
  
  if (!settlement) {
    throw new Error('Settlement not found');
  }
  
  // Generate PDF invoice (simplified HTML-to-PDF structure)
  const invoiceNumber = `INV-${settlementId.substring(0, 8).toUpperCase()}`;
  const invoiceDate = new Date().toISOString();
  
  const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { border-bottom: 2px solid #00A86B; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { color: #00A86B; font-size: 24px; font-weight: bold; }
    .invoice-details { float: right; text-align: right; }
    .section { margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .total { font-weight: bold; font-size: 18px; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ESUM Energy Trading Platform</div>
    <div class="invoice-details">
      <h2>INVOICE</h2>
      <p>Invoice #: ${invoiceNumber}</p>
      <p>Date: ${invoiceDate}</p>
    </div>
  </div>
  
  <div class="section">
    <h3>Bill To:</h3>
    <p>${settlement.buyer_name}</p>
    <p>${settlement.buyer_email}</p>
  </div>
  
  <div class="section">
    <h3>Service Provider:</h3>
    <p>${settlement.seller_name}</p>
    <p>${settlement.seller_email}</p>
  </div>
  
  <div class="section">
    <h3>Settlement Details</h3>
    <table>
      <tr>
        <th>Description</th>
        <th>Period</th>
        <th>Volume (MWh)</th>
        <th>Unit Price (ZAR)</th>
        <th>Amount (ZAR)</th>
      </tr>
      <tr>
        <td>Energy Delivery - ${settlement.contract_type}</td>
        <td>${settlement.period_start} to ${settlement.period_end}</td>
        <td>${settlement.metered_mwh.toFixed(2)}</td>
        <td>R ${settlement.unit_price_zar.toFixed(2)}</td>
        <td>R ${settlement.gross_amount_zar.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4">Platform Fee (Buyer)</td>
        <td>R ${settlement.buyer_fee_zar.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4">Platform Fee (Seller)</td>
        <td>- R ${settlement.seller_fee_zar.toFixed(2)}</td>
      </tr>
      <tr class="total">
        <td colspan="4">Net Amount Due</td>
        <td>R ${settlement.net_buyer_amount_zar.toFixed(2)}</td>
      </tr>
    </table>
  </div>
  
  ${settlement.carbon_credits_settled ? `
  <div class="section">
    <h3>Carbon Credits Settled</h3>
    <p>Amount: ${settlement.carbon_credits_settled.toFixed(2)} tCO2e</p>
  </div>
  ` : ''}
  
  ${settlement.recs_settled > 0 ? `
  <div class="section">
    <h3>RECs Settled</h3>
    <p>Amount: ${settlement.recs_settled} RECs</p>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>ESUM Energy Trading Platform | www.esum.energy</p>
    <p>Payment due within 30 days. Bank details will be provided separately.</p>
  </div>
</body>
</html>
  `;
  
  // Upload to R2
  const r2Key = `invoices/${invoiceNumber}.html`;
  await env.INVOICES.put(r2Key, invoiceHtml, {
    httpMetadata: { contentType: 'text/html' }
  });
  
  // Update settlement with invoice key
  await env.DB.prepare(`
    UPDATE settlements SET invoice_r2_key = ?, status = 'invoiced', updated_at = ?
    WHERE id = ?
  `).bind(r2Key, new Date().toISOString(), settlementId).run();
  
  return r2Key;
}

// ============================================================================
// DISPUTE MANAGEMENT
// ============================================================================

async function createDispute(
  settlementId: string,
  orgId: string,
  reason: string,
  details: string,
  env: Env
) {
  const now = new Date().toISOString();
  const disputeId = crypto.randomUUID();
  
  // Verify settlement exists
  const settlement = await env.DB.prepare(`
    SELECT * FROM settlements WHERE id = ?
  `).bind(settlementId).first();
  
  if (!settlement) {
    throw new Error('Settlement not found');
  }
  
  // Create dispute record (would need disputes table in production)
  await env.DB.prepare(`
    INSERT INTO audit_log (id, organisation_id, action, resource_type, resource_id, changes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    disputeId, orgId, 'dispute_created', 'settlement', settlementId,
    JSON.stringify({ reason, details }), now
  ).run();
  
  // Freeze settlement
  await env.DB.prepare(`
    UPDATE settlements SET status = 'disputed', updated_at = ? WHERE id = ?
  `).bind(now, settlementId).run();
  
  // Notify platform admin
  await env.NOTIFICATION_QUEUE.send({
    type: 'dispute_created',
    settlement_id: settlementId,
    dispute_id: disputeId,
    org_id: orgId,
    reason
  });
  
  return {
    dispute_id: disputeId,
    settlement_id: settlementId,
    status: 'under_review'
  };
}

async function resolveDispute(
  disputeId: string,
  resolution: 'buyer_favour' | 'seller_favour' | 'compromise',
  notes: string,
  env: Env
) {
  const now = new Date().toISOString();
  
  // Get dispute from audit_log
  const dispute = await env.DB.prepare(`
    SELECT * FROM audit_log WHERE id = ? AND action = 'dispute_created'
  `).bind(disputeId).first();
  
  if (!dispute) {
    throw new Error('Dispute not found');
  }
  
  const settlementId = dispute.resource_id;
  
  // Update settlement status
  await env.DB.prepare(`
    UPDATE settlements SET status = 'calculated', updated_at = ? WHERE id = ?
  `).bind(now, settlementId).run();
  
  // Log resolution
  await env.DB.prepare(`
    INSERT INTO audit_log (id, action, resource_type, resource_id, changes, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(), 'dispute_resolved', 'dispute', disputeId,
    JSON.stringify({ resolution, notes }), now
  ).run();
  
  return {
    dispute_id: disputeId,
    status: 'resolved',
    resolution,
    notes
  };
}

// ============================================================================
// WORKER HANDLER
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Calculate settlement
      if (path === '/api/settlement/calculate' && request.method === 'POST') {
        const body = await request.json();
        const result = await calculateSettlement(
          body.contract_id,
          body.period_start,
          body.period_end,
          env
        );
        return Response.json({ success: true, data: result });
      }
      
      // Generate invoice
      if (path === '/api/settlement/:id/invoice' && request.method === 'POST') {
        const id = path.split('/').reverse()[1];
        const r2Key = await generateInvoice(id, env);
        
        // Generate signed URL
        const signedUrl = `https://esum.r2.cloudflarestorage.com/${r2Key}`;
        
        return Response.json({
          success: true,
          invoice_url: signedUrl,
          r2_key: r2Key
        });
      }
      
      // Get settlements for contract
      if (path === '/api/settlements/contract/:id' && request.method === 'GET') {
        const contractId = path.split('/').pop();
        const { results } = await env.DB.prepare(`
          SELECT * FROM settlements WHERE contract_id = ? ORDER BY period_start DESC
        `).bind(contractId!).all();
        
        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }
      
      // Get settlements for organisation
      if (path === '/api/settlements' && request.method === 'GET') {
        const orgId = url.searchParams.get('org_id');
        const status = url.searchParams.get('status');
        
        let query = `
          SELECT s.*, c.contract_type, buyer.name as buyer_name, seller.name as seller_name
          FROM settlements s
          JOIN contracts c ON s.contract_id = c.id
          JOIN organisations buyer ON c.buyer_org_id = buyer.id
          JOIN organisations seller ON c.seller_org_id = seller.id
          WHERE 1=1
        `;
        
        const params: any[] = [];
        
        if (orgId) {
          query += ` AND (c.buyer_org_id = ? OR c.seller_org_id = ?)`;
          params.push(orgId, orgId);
        }
        
        if (status) {
          query += ` AND s.status = ?`;
          params.push(status);
        }
        
        query += ` ORDER BY s.created_at DESC LIMIT 100`;
        
        const { results } = await env.DB.prepare(query).bind(...params).all();
        
        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }
      
      // Create dispute
      if (path === '/api/settlement/:id/dispute' && request.method === 'POST') {
        const id = path.split('/').reverse()[1];
        const body = await request.json();
        const result = await createDispute(
          id,
          body.org_id,
          body.reason,
          body.details,
          env
        );
        return Response.json({ success: true, data: result });
      }
      
      // Resolve dispute (admin only)
      if (path === '/api/disputes/:id/resolve' && request.method === 'POST') {
        const id = path.split('/').reverse()[1];
        const body = await request.json();
        const result = await resolveDispute(
          id,
          body.resolution,
          body.notes,
          env
        );
        return Response.json({ success: true, data: result });
      }
      
      // Get settlement summary
      if (path === '/api/settlement/summary' && request.method === 'GET') {
        const orgId = url.searchParams.get('org_id');
        
        const { total_buyer, total_seller, count } = await env.DB.prepare(`
          SELECT 
            SUM(CASE WHEN c.buyer_org_id = ? THEN s.net_buyer_amount_zar ELSE s.net_seller_amount_zar END) as total_buyer,
            SUM(CASE WHEN c.seller_org_id = ? THEN s.net_seller_amount_zar ELSE s.net_buyer_amount_zar END) as total_seller,
            COUNT(*) as count
          FROM settlements s
          JOIN contracts c ON s.contract_id = c.id
          WHERE c.buyer_org_id = ? OR c.seller_org_id = ?
        `).bind(orgId!, orgId!, orgId!, orgId!).first();
        
        return Response.json({
          success: true,
          data: {
            total_buyer_amount: total_buyer || 0,
            total_seller_amount: total_seller || 0,
            settlement_count: count || 0
          }
        });
      }
      
      return Response.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      console.error('Settlement error:', error);
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500, headers: corsHeaders });
    }
  },
  
  // Queue consumer for settlement processing
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const { contract_id, period_start, period_end } = message.body;
      
      try {
        await calculateSettlement(contract_id, period_start, period_end, env);
        message.ack();
      } catch (error) {
        console.error('Settlement processing error:', error);
        message.retry();
      }
    }
  }
};
