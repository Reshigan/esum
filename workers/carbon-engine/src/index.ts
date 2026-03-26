/**
 * ESUM Energy Trading Platform - Carbon Engine Worker
 * Full carbon credit lifecycle management and accounting
 */

interface Env {
  DB: D1Database;
  NOTIFICATION_QUEUE: Queue;
  DOCUMENTS: R2Bucket;
  GRID_EMISSION_FACTOR?: string;
  CARBON_TAX_RATE?: string;
}

const GRID_EMISSION_FACTOR = 1.04; // kg CO2e per kWh
const CARBON_TAX_RATE = 190; // ZAR per tCO2e

// ============================================================================
// CARBON CREDIT MANAGEMENT
// ============================================================================

async function registerCarbonCredits(input: {
  instrument_id: string;
  project_name: string;
  project_id_external: string;
  standard: 'gold_standard' | 'verra_vcs' | 'cdm' | 'sa_national';
  vintage_year: number;
  quantity_tco2e: number;
  owner_org_id: string;
  originated_by_org_id: string;
  serial_number_start: string;
  registry_url?: string;
}, env: Env) {
  const credits = [];
  const now = new Date().toISOString();
  
  // Generate individual credit tokens (batch registration)
  const batchSize = Math.min(Math.ceil(input.quantity_tco2e), 1000);
  
  for (let i = 0; i < batchSize; i++) {
    const creditId = crypto.randomUUID();
    const serialNumber = `${input.serial_number_start}-${String(i).padStart(6, '0')}`;
    
    await env.DB.prepare(`
      INSERT INTO carbon_credits (
        id, instrument_id, project_name, project_id_external, standard, vintage_year,
        quantity_tco2e, serial_number_start, serial_number_end, status, owner_org_id,
        originated_by_org_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      creditId, input.instrument_id, input.project_name, input.project_id_external,
      input.standard, input.vintage_year, input.quantity_tco2e / batchSize,
      serialNumber, `${serialNumber}-END`, 'available', input.owner_org_id,
      input.originated_by_org_id, now, now
    ).run();
    
    credits.push({ id: creditId, serial_number: serialNumber });
  }
  
  // Send notification
  await env.NOTIFICATION_QUEUE.send({
    type: 'carbon_credits_registered',
    instrument_id: input.instrument_id,
    quantity: input.quantity_tco2e,
    standard: input.standard
  });
  
  return {
    success: true,
    credits_registered: credits.length,
    total_tco2e: input.quantity_tco2e,
    credits
  };
}

async function transferCarbonCredits(
  creditIds: string[],
  fromOrgId: string,
  toOrgId: string,
  env: Env
) {
  const now = new Date().toISOString();
  const transferred: string[] = [];
  const failed: string[] = [];
  
  for (const creditId of creditIds) {
    // Verify credit exists and is owned by fromOrg
    const credit = await env.DB.prepare(`
      SELECT * FROM carbon_credits WHERE id = ? AND owner_org_id = ? AND status = 'available'
    `).bind(creditId, fromOrgId).first();
    
    if (!credit) {
      failed.push(creditId);
      continue;
    }
    
    // Atomic transfer
    await env.DB.prepare(`
      UPDATE carbon_credits SET owner_org_id = ?, status = 'transferred', updated_at = ?
      WHERE id = ?
    `).bind(toOrgId, now, creditId).run();
    
    transferred.push(creditId);
    
    // Audit log
    await env.DB.prepare(`
      INSERT INTO audit_log (id, organisation_id, action, resource_type, resource_id, changes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), fromOrgId, 'credit_transfer', 'carbon_credit', creditId,
      JSON.stringify({ from: fromOrgId, to: toOrgId }), now
    ).run();
  }
  
  return {
    success: true,
    transferred,
    failed,
    count: transferred.length
  };
}

async function retireCarbonCredits(
  creditIds: string[],
  beneficiary: string,
  reason: string,
  env: Env
) {
  const now = new Date().toISOString();
  const retired: string[] = [];
  let totalTco2e = 0;
  
  for (const creditId of creditIds) {
    const credit = await env.DB.prepare(`
      SELECT * FROM carbon_credits WHERE id = ? AND status IN ('available', 'transferred')
    `).bind(creditId).first();
    
    if (!credit) continue;
    
    await env.DB.prepare(`
      UPDATE carbon_credits
      SET status = 'retired', retirement_date = ?, retirement_beneficiary = ?, updated_at = ?
      WHERE id = ?
    `).bind(now, beneficiary, now, creditId).run();
    
    retired.push(creditId);
    totalTco2e += credit.quantity_tco2e;
    
    // Audit log
    await env.DB.prepare(`
      INSERT INTO audit_log (id, organisation_id, action, resource_type, resource_id, changes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), credit.owner_org_id, 'credit_retirement', 'carbon_credit', creditId,
      JSON.stringify({ beneficiary, reason, quantity: credit.quantity_tco2e }), now
    ).run();
  }
  
  return {
    success: true,
    retired,
    total_tco2e: totalTco2e,
    beneficiary,
    reason
  };
}

// ============================================================================
// EMISSIONS CALCULATIONS
// ============================================================================

function calculateAvoidedEmissions(
  renewableMwh: number,
  lossFactor: number = 0.05
) {
  const grossMwh = renewableMwh;
  const netMwh = grossMwh * (1 - lossFactor);
  const emissionFactorKgPerKwh = GRID_EMISSION_FACTOR;
  
  // Calculate avoided emissions
  // netMWh * 1000 kWh/MWh * emissionFactor kg/kWh / 1000 kg/tCO2e
  const avoidedTco2e = (netMwh * 1000 * emissionFactorKgPerKwh) / 1000;
  const equivalentCarbonCredits = avoidedTco2e; // 1 credit = 1 tCO2e
  
  return {
    grossMwh,
    netMwh,
    emissionFactorKgPerKwh,
    avoidedTco2e: Math.round(avoidedTco2e * 100) / 100,
    equivalentCarbonCredits: Math.round(equivalentCarbonCredits * 100) / 100
  };
}

function calculateCarbonTaxLiability(
  gridConsumptionMwh: number,
  carbonCreditsRetired: number = 0
) {
  const grossEmissions = (gridConsumptionMwh * 1000 * GRID_EMISSION_FACTOR) / 1000;
  const offsets = carbonCreditsRetired;
  const netEmissions = Math.max(0, grossEmissions - offsets);
  const taxRate = CARBON_TAX_RATE;
  
  const grossLiability = grossEmissions * taxRate;
  const offsetSavings = offsets * taxRate;
  const netLiability = netEmissions * taxRate;
  
  return {
    grossEmissions: Math.round(grossEmissions * 100) / 100,
    offsets,
    netEmissions: Math.round(netEmissions * 100) / 100,
    taxRate,
    grossLiability: Math.round(grossLiability * 100) / 100,
    offsetSavings: Math.round(offsetSavings * 100) / 100,
    netLiability: Math.round(netLiability * 100) / 100
  };
}

async function getCarbonWaterfall(contractId: string, env: Env) {
  // Get contract details
  const contract = await env.DB.prepare(`
    SELECT * FROM contracts WHERE id = ?
  `).bind(contractId).first();
  
  if (!contract) {
    throw new Error('Contract not found');
  }
  
  // Get settlements for this contract
  const { results: settlements } = await env.DB.prepare(`
    SELECT * FROM settlements WHERE contract_id = ? ORDER BY period_start DESC
  `).bind(contractId).all();
  
  const waterfall = [];
  
  for (const settlement of settlements) {
    const emissions = calculateAvoidedEmissions(settlement.metered_mwh);
    
    waterfall.push({
      period: settlement.period_start,
      generation_mwh: settlement.metered_mwh,
      wheeling_losses_mwh: settlement.metered_mwh - emissions.netMwh,
      delivered_mwh: emissions.netMwh,
      grid_emission_factor: GRID_EMISSION_FACTOR,
      avoided_emissions_tco2e: emissions.avoidedTco2e,
      carbon_credits_generated: emissions.equivalentCarbonCredits,
      carbon_credits_retired: settlement.carbon_credits_settled || 0
    });
  }
  
  return {
    contract_id: contractId,
    waterfall,
    total: {
      generation_mwh: waterfall.reduce((sum, w) => sum + w.generation_mwh, 0),
      avoided_emissions_tco2e: waterfall.reduce((sum, w) => sum + w.avoided_emissions_tco2e, 0),
      credits_retired: waterfall.reduce((sum, w) => sum + w.carbon_credits_retired, 0)
    }
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
      // Register carbon credits
      if (path === '/api/carbon/credits/register' && request.method === 'POST') {
        const body = await request.json();
        const result = await registerCarbonCredits(body, env);
        return Response.json(result, { status: 201 });
      }
      
      // Transfer credits
      if (path === '/api/carbon/credits/transfer' && request.method === 'POST') {
        const body = await request.json();
        const result = await transferCarbonCredits(
          body.credit_ids,
          body.from_org_id,
          body.to_org_id,
          env
        );
        return Response.json(result);
      }
      
      // Retire credits
      if (path === '/api/carbon/credits/retire' && request.method === 'POST') {
        const body = await request.json();
        const result = await retireCarbonCredits(
          body.credit_ids,
          body.beneficiary,
          body.reason,
          env
        );
        return Response.json(result);
      }
      
      // Get credits by organisation
      if (path === '/api/carbon/credits' && request.method === 'GET') {
        const orgId = url.searchParams.get('org_id');
        const status = url.searchParams.get('status');
        
        let query = `SELECT * FROM carbon_credits WHERE 1=1`;
        const params: any[] = [];
        
        if (orgId) {
          query += ` AND owner_org_id = ?`;
          params.push(orgId);
        }
        
        if (status) {
          query += ` AND status = ?`;
          params.push(status);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const { results } = await env.DB.prepare(query).bind(...params).all();
        
        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }
      
      // Calculate avoided emissions
      if (path === '/api/carbon/calculate/avoided' && request.method === 'POST') {
        const body = await request.json();
        const result = calculateAvoidedEmissions(
          body.renewable_mwh,
          body.loss_factor
        );
        return Response.json({ success: true, data: result });
      }
      
      // Calculate carbon tax liability
      if (path === '/api/carbon/calculate/tax' && request.method === 'POST') {
        const body = await request.json();
        const result = calculateCarbonTaxLiability(
          body.grid_consumption_mwh,
          body.credits_retired
        );
        return Response.json({ success: true, data: result });
      }
      
      // Get carbon waterfall
      if (path === '/api/carbon/waterfall/:contractId' && request.method === 'GET') {
        const contractId = path.split('/').pop();
        const result = await getCarbonWaterfall(contractId!, env);
        return Response.json({ success: true, data: result });
      }
      
      // Get carbon market prices
      if (path === '/api/carbon/prices' && request.method === 'GET') {
        // Return indicative carbon prices
        return Response.json({
          success: true,
          data: {
            sa_carbon_tax: CARBON_TAX_RATE,
            eu_ets: 85.50, // EUR per tCO2e
            voluntary_market: {
              gold_standard: 15.50,
              verra_vcs: 12.30,
              sa_national: 18.00
            },
            currency: 'USD',
            last_updated: new Date().toISOString()
          }
        });
      }
      
      return Response.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      console.error('Carbon engine error:', error);
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500, headers: corsHeaders });
    }
  }
};
