/**
 * ESUM Energy Trading Platform - Contract Engine Worker
 * Full digital contract lifecycle management with electronic signatures
 */

interface Env {
  DB: D1Database;
  DOCUMENTS: R2Bucket;
  NOTIFICATION_QUEUE: Queue;
  SETTLEMENT_QUEUE: Queue;
  AI: Ai;
  ENVIRONMENT: string;
}

// ============================================================================
// TYPES
// ============================================================================

interface ContractTerms {
  pricePerMwh: number;
  currency: string;
  paymentTerms: string;
  deliveryPoint: string;
  measurementStandard: string;
  imbalanceCharges?: {
    tolerancePercent: number;
    penaltyRate: number;
  };
}

interface SignatureRequest {
  contractId: string;
  signerUserId: string;
  signerOrgId: string;
  signerRole: string;
  signerEmail: string;
  signerName: string;
  requiresWitness?: boolean;
  witnessUserId?: string;
}

interface SignatureData {
  signatureImage?: string; // Base64 encoded signature
  consentGiven: boolean;
  consentTimestamp: string;
  ipAddress: string;
  userAgent: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    country: string;
  };
}

// ============================================================================
// CONTRACT GENERATION
// ============================================================================

async function generateContractDocument(
  contract: any,
  template: any,
  env: Env
): Promise<{ documentKey: string; documentUrl: string }> {
  const documentId = crypto.randomUUID();
  const documentKey = `contracts/${contract.id}/${documentId}-unsigned.pdf`;

  // Generate PDF content using AI
  const prompt = `Generate a formal energy trading contract with the following details:

Contract Type: ${contract.contract_type}
Buyer: ${contract.buyer_org_name}
Seller: ${contract.seller_org_name}
Instrument: ${contract.instrument_name}
Volume: ${contract.total_contracted_mwh} MWh
Price: ${contract.price_terms.pricePerMwh} ZAR/MWh
Start Date: ${contract.start_date}
End Date: ${contract.end_date}
Delivery Point: ${contract.price_terms.deliveryPoint || 'TBD'}

Include:
1. Parties to the contract
2. Definitions and interpretations
3. Term and delivery obligations
4. Pricing and payment terms
5. Metering and settlement
6. Force majeure
7. Termination clauses
8. Dispute resolution (South African law)
9. Signatures

Format as professional legal document with clear sections.`;

  const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are a legal document generation AI specializing in South African energy trading contracts. Generate formal, legally-sound contract text.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 4096
  });

  const contractText = aiResponse.response || aiResponse.generated_text;

  // In production, convert to PDF using a PDF generation service
  // For now, store as text document
  const encoder = new TextEncoder();
  const documentData = encoder.encode(contractText);

  await env.DOCUMENTS.put(documentKey, documentData, {
    httpMetadata: {
      contentType: 'application/pdf'
    },
    customMetadata: {
      contractId: contract.id,
      version: '1',
      status: 'unsigned'
    }
  });

  // Log audit trail
  await logContractAudit(contract.id, 'document_generated', null, null, env);

  return {
    documentKey,
    documentUrl: `https://documents.esum.energy/${documentKey}`
  };
}

// ============================================================================
// SIGNATURE MANAGEMENT
// ============================================================================

async function requestSignature(
  contractId: string,
  signatureRequest: SignatureRequest,
  env: Env
): Promise<{ signatureId: string; status: string }> {
  const signatureId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Verify contract exists and is in signable state
  const contract = await env.DB.prepare(`
    SELECT * FROM contracts WHERE id = ?
  `).bind(contractId).first();

  if (!contract) {
    throw new Error('Contract not found');
  }

  if (!['draft', 'pending_signature', 'partially_signed'].includes(contract.status)) {
    throw new Error('Contract cannot be signed in current state');
  }

  // Verify signer authority
  const signerOrg = await env.DB.prepare(`
    SELECT * FROM organisations WHERE id = ?
  `).bind(signatureRequest.signerOrgId).first();

  if (!signerOrg) {
    throw new Error('Organisation not found');
  }

  // Create signature request
  await env.DB.prepare(`
    INSERT INTO contract_signatures (
      id, contract_id, signer_user_id, signer_org_id, signer_role,
      signer_email, signer_name, signature_type, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    signatureId,
    contractId,
    signatureRequest.signerUserId,
    signatureRequest.signerOrgId,
    signatureRequest.signerRole,
    signatureRequest.signerEmail,
    signatureRequest.signerName,
    'electronic',
    'pending',
    now
  ).run();

  // Update contract status
  await env.DB.prepare(`
    UPDATE contracts SET status = ?, updated_at = ? WHERE id = ?
  `).bind('pending_signature', now, contractId).run();

  // Send notification to signer
  await env.NOTIFICATION_QUEUE.send({
    type: 'signature_requested',
    contract_id: contractId,
    signature_id: signatureId,
    recipient_user_id: signatureRequest.signerUserId,
    recipient_email: signatureRequest.signerEmail,
    signer_name: signatureRequest.signerName,
    contract_details: {
      type: contract.contract_type,
      volume: contract.total_contracted_mwh,
      value: contract.total_contracted_mwh * contract.price_terms.pricePerMwh
    }
  });

  // Log audit trail
  await logContractAudit(
    contractId,
    'signature_requested',
    signatureRequest.signerUserId,
    signatureRequest.signerOrgId,
    env,
    { signer_email: signatureRequest.signerEmail, signer_role: signatureRequest.signerRole }
  );

  return {
    signatureId,
    status: 'pending'
  };
}

async function executeSignature(
  signatureId: string,
  signatureData: SignatureData,
  env: Env
): Promise<{ success: boolean; contractStatus: string }> {
  const now = new Date().toISOString();

  // Get signature request
  const signature = await env.DB.prepare(`
    SELECT cs.*, c.status as contract_status, c.buyer_org_id, c.seller_org_id
    FROM contract_signatures cs
    JOIN contracts c ON cs.contract_id = c.id
    WHERE cs.id = ?
  `).bind(signatureId).first();

  if (!signature) {
    throw new Error('Signature request not found');
  }

  if (signature.status !== 'pending') {
    throw new Error('Signature request is not pending');
  }

  // Validate consent
  if (!signatureData.consentGiven) {
    throw new Error('Electronic signature consent required');
  }

  // Generate signature hash (digital fingerprint)
  const signatureContent = JSON.stringify({
    signature_id: signatureId,
    contract_id: signature.contract_id,
    signer_user_id: signature.signer_user_id,
    signer_org_id: signature.signer_org_id,
    timestamp: signatureData.consentTimestamp,
    ip_address: signatureData.ipAddress,
    geolocation: signatureData.geolocation
  });

  const encoder = new TextEncoder();
  const signatureHash = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(signatureContent)
  );
  const signatureHashHex = Array.from(new Uint8Array(signatureHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Store signature data
  const signatureDataJson = {
    ...signatureData,
    signatureHash: signatureHashHex,
    algorithm: 'SHA-256'
  };

  // Update signature record
  await env.DB.prepare(`
    UPDATE contract_signatures
    SET status = 'signed',
        signature_data = ?,
        ip_address = ?,
        user_agent = ?,
        geolocation = ?,
        signed_at = ?
    WHERE id = ?
  `).bind(
    JSON.stringify(signatureDataJson),
    signatureData.ipAddress,
    signatureData.userAgent,
    JSON.stringify(signatureData.geolocation),
    signatureData.consentTimestamp,
    signatureId
  ).run();

  // Generate signature certificate
  const certificateKey = `contracts/${signature.contract_id}/certificates/${signatureId}-certificate.pdf`;
  const certificateContent = `DIGITAL SIGNATURE CERTIFICATE

Certificate ID: ${signatureId}
Contract ID: ${signature.contract_id}
Signer: ${signature.signer_name}
Role: ${signature.signer_role}
Organisation: ${signature.signer_org_id}
Email: ${signature.signer_email}
Signed At: ${signatureData.consentTimestamp}
IP Address: ${signatureData.ipAddress}
Geolocation: ${JSON.stringify(signatureData.geolocation)}
Signature Hash: ${signatureHashHex}
Algorithm: SHA-256

This certificate verifies that the above individual electronically signed
the associated contract on the ESUM Energy Trading Platform.

Generated: ${now}
ESUM Platform - CONFIDENTIAL
`;

  await env.DOCUMENTS.put(certificateKey, encoder.encode(certificateContent), {
    httpMetadata: { contentType: 'application/pdf' },
    customMetadata: {
      signatureId,
      contractId: signature.contract_id,
      type: 'signature_certificate'
    }
  });

  // Update certificate reference
  await env.DB.prepare(`
    UPDATE contract_signatures SET certificate_r2_key = ? WHERE id = ?
  `).bind(certificateKey, signatureId).run();

  // Check if all signatures are complete
  const allSignatures = await env.DB.prepare(`
    SELECT * FROM contract_signatures WHERE contract_id = ?
  `).bind(signature.contract_id).all();

  const allSigned = allSignatures.results.every((s: any) => s.status === 'signed');
  const anySigned = allSignatures.results.some((s: any) => s.status === 'signed');

  let newContractStatus = 'partially_signed';
  if (allSigned) {
    newContractStatus = 'active';
  }

  // Update contract status
  await env.DB.prepare(`
    UPDATE contracts
    SET status = ?,
        signed_at = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    newContractStatus,
    allSigned ? now : null,
    now,
    signature.contract_id
  ).run();

  // If fully signed, activate contract
  if (allSigned) {
    await env.DB.prepare(`
      UPDATE contracts SET activated_at = ? WHERE id = ?
    `).bind(now, signature.contract_id).run();

    // Queue settlement processing
    await env.SETTLEMENT_QUEUE.send({
      contract_id: signature.contract_id,
      event: 'contract_activated',
      timestamp: now
    });

    // Notify all parties
    await env.NOTIFICATION_QUEUE.send({
      type: 'contract_fully_signed',
      contract_id: signature.contract_id,
      buyer_org_id: signature.buyer_org_id,
      seller_org_id: signature.seller_org_id,
      timestamp: now
    });
  }

  // Log audit trail
  await logContractAudit(
    signature.contract_id,
    'signature_executed',
    signature.signer_user_id,
    signature.signer_org_id,
    env,
    { signature_hash: signatureHashHex, ip_address: signatureData.ipAddress }
  );

  return {
    success: true,
    contractStatus: newContractStatus
  };
}

async function declineSignature(
  signatureId: string,
  reason: string,
  env: Env
): Promise<{ success: boolean }> {
  const now = new Date().toISOString();

  const signature = await env.DB.prepare(`
    SELECT * FROM contract_signatures WHERE id = ?
  `).bind(signatureId).first();

  if (!signature) {
    throw new Error('Signature request not found');
  }

  await env.DB.prepare(`
    UPDATE contract_signatures
    SET status = 'declined', declined_reason = ?, updated_at = ?
    WHERE id = ?
  `).bind(reason, now, signatureId).run();

  // Update contract status back to draft
  await env.DB.prepare(`
    UPDATE contracts SET status = 'draft', updated_at = ? WHERE id = ?
  `).bind(now, signature.contract_id).run();

  // Notify contract owner
  await env.NOTIFICATION_QUEUE.send({
    type: 'signature_declined',
    contract_id: signature.contract_id,
    signature_id: signatureId,
    reason,
    declined_by: signature.signer_email
  });

  // Log audit trail
  await logContractAudit(
    signature.contract_id,
    'signature_declined',
    signature.signer_user_id,
    signature.signer_org_id,
    env,
    { reason }
  );

  return { success: true };
}

// ============================================================================
// CONTRACT LIFECYCLE
// ============================================================================

async function createContract(
  contractData: {
    tradeId: string;
    instrumentId: string;
    buyerOrgId: string;
    sellerOrgId: string;
    contractType: string;
    startDate: string;
    endDate: string;
    totalContractedMwh: number;
    priceTerms: ContractTerms;
    carbonTerms?: any;
    wheelingTerms?: any;
    legalTerms?: any;
    templateId?: string;
  },
  env: Env
): Promise<{ contractId: string; status: string }> {
  const contractId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Validate trade and instrument exist
  const trade = await env.DB.prepare(`SELECT * FROM trades WHERE id = ?`).bind(contractData.tradeId).first();
  if (!trade) {
    throw new Error('Trade not found');
  }

  const instrument = await env.DB.prepare(`SELECT * FROM instruments WHERE id = ?`).bind(contractData.instrumentId).first();
  if (!instrument) {
    throw new Error('Instrument not found');
  }

  // Create contract
  await env.DB.prepare(`
    INSERT INTO contracts (
      id, trade_id, instrument_id, buyer_org_id, seller_org_id,
      contract_type, status, start_date, end_date, total_contracted_mwh,
      remaining_mwh, price_terms, carbon_terms, wheeling_terms, legal_terms,
      template_id, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    contractId,
    contractData.tradeId,
    contractData.instrumentId,
    contractData.buyerOrgId,
    contractData.sellerOrgId,
    contractData.contractType,
    'draft',
    contractData.startDate,
    contractData.endDate,
    contractData.totalContractedMwh,
    contractData.totalContractedMwh,
    JSON.stringify(contractData.priceTerms),
    contractData.carbonTerms ? JSON.stringify(contractData.carbonTerms) : null,
    contractData.wheelingTerms ? JSON.stringify(contractData.wheelingTerms) : null,
    contractData.legalTerms ? JSON.stringify(contractData.legalTerms) : null,
    contractData.templateId || null,
    1,
    now,
    now
  ).run();

  // Generate contract document
  const contract = await env.DB.prepare(`
    SELECT c.*, i.name as instrument_name,
           buyer.name as buyer_org_name, seller.name as seller_org_name
    FROM contracts c
    JOIN instruments i ON c.instrument_id = i.id
    JOIN organisations buyer ON c.buyer_org_id = buyer.id
    JOIN organisations seller ON c.seller_org_id = seller.id
    WHERE c.id = ?
  `).bind(contractId).first();

  const template = contractData.templateId
    ? await env.DB.prepare(`SELECT * FROM contract_templates WHERE id = ?`).bind(contractData.templateId).first()
    : null;

  const document = await generateContractDocument(contract, template, env);

  // Store unsigned document reference
  await env.DB.prepare(`
    UPDATE contracts SET unsigned_document_r2_key = ?, updated_at = ? WHERE id = ?
  `).bind(document.documentKey, now, contractId).run();

  // Log audit trail
  await logContractAudit(contractId, 'contract_created', null, null, env, {
    trade_id: contractData.tradeId,
    contract_type: contractData.contractType
  });

  return {
    contractId,
    status: 'draft'
  };
}

async function terminateContract(
  contractId: string,
  reason: string,
  terminatedByUserId: string,
  terminatedByOrgId: string,
  env: Env
): Promise<{ success: boolean }> {
  const now = new Date().toISOString();

  const contract = await env.DB.prepare(`SELECT * FROM contracts WHERE id = ?`).bind(contractId).first();
  if (!contract) {
    throw new Error('Contract not found');
  }

  if (!['active', 'partially_signed'].includes(contract.status)) {
    throw new Error('Cannot terminate contract in current state');
  }

  await env.DB.prepare(`
    UPDATE contracts
    SET status = 'terminated',
        termination_reason = ?,
        terminated_at = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(reason, now, now, contractId).run();

  // Notify both parties
  await env.NOTIFICATION_QUEUE.send({
    type: 'contract_terminated',
    contract_id: contractId,
    buyer_org_id: contract.buyer_org_id,
    seller_org_id: contract.seller_org_id,
    reason,
    terminated_by: terminatedByOrgId
  });

  // Log audit trail
  await logContractAudit(
    contractId,
    'contract_terminated',
    terminatedByUserId,
    terminatedByOrgId,
    env,
    { reason }
  );

  return { success: true };
}

// ============================================================================
// CONTRACT AMENDMENTS
// ============================================================================

async function proposeAmendment(
  contractId: string,
  amendmentData: {
    title: string;
    description: string;
    proposedChanges: any;
    proposedByUserId: string;
  },
  env: Env
): Promise<{ amendmentId: string; status: string }> {
  const amendmentId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Get contract to determine amendment number
  const existingAmendments = await env.DB.prepare(`
    SELECT * FROM contract_amendments WHERE contract_id = ?
  `).bind(contractId).all();

  const amendmentNumber = existingAmendments.results.length + 1;

  await env.DB.prepare(`
    INSERT INTO contract_amendments (
      id, contract_id, amendment_number, title, description,
      proposed_changes, status, proposed_by_user_id, proposed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    amendmentId,
    contractId,
    amendmentNumber,
    amendmentData.title,
    amendmentData.description,
    JSON.stringify(amendmentData.proposedChanges),
    'proposed',
    amendmentData.proposedByUserId,
    now,
    now
  ).run();

  // Notify other party
  const contract = await env.DB.prepare(`SELECT * FROM contracts WHERE id = ?`).bind(contractId).first();
  await env.NOTIFICATION_QUEUE.send({
    type: 'amendment_proposed',
    contract_id: contractId,
    amendment_id: amendmentId,
    buyer_org_id: contract.buyer_org_id,
    seller_org_id: contract.seller_org_id,
    title: amendmentData.title
  });

  // Log audit trail
  await logContractAudit(
    contractId,
    'amendment_proposed',
    amendmentData.proposedByUserId,
    null,
    env,
    { amendment_id: amendmentId, title: amendmentData.title }
  );

  return {
    amendmentId,
    status: 'proposed'
  };
}

async function acceptAmendment(
  amendmentId: string,
  acceptedByUserId: string,
  isBuyer: boolean,
  env: Env
): Promise<{ success: boolean; fullyAccepted: boolean }> {
  const now = new Date().toISOString();

  const amendment = await env.DB.prepare(`SELECT * FROM contract_amendments WHERE id = ?`).bind(amendmentId).first();
  if (!amendment) {
    throw new Error('Amendment not found');
  }

  if (isBuyer) {
    await env.DB.prepare(`
      UPDATE contract_amendments SET accepted_by_buyer_user_id = ?, accepted_at = ? WHERE id = ?
    `).bind(acceptedByUserId, now, amendmentId).run();
  } else {
    await env.DB.prepare(`
      UPDATE contract_amendments SET accepted_by_seller_user_id = ?, accepted_at = ? WHERE id = ?
    `).bind(acceptedByUserId, now, amendmentId).run();
  }

  // Check if both parties accepted
  const updatedAmendment = await env.DB.prepare(`SELECT * FROM contract_amendments WHERE id = ?`).bind(amendmentId).first();
  const fullyAccepted = updatedAmendment.accepted_by_buyer_user_id && updatedAmendment.accepted_by_seller_user_id;

  if (fullyAccepted) {
    await env.DB.prepare(`
      UPDATE contract_amendments SET status = 'accepted', accepted_at = ? WHERE id = ?
    `).bind(now, amendmentId).run();

    // Execute amendment (update contract terms)
    await env.DB.prepare(`
      UPDATE contracts SET price_terms = ?, updated_at = ? WHERE id = ?
    `).bind(JSON.stringify(updatedAmendment.proposed_changes.priceTerms || JSON.parse(updatedAmendment.proposed_changes)), now, updatedAmendment.contract_id).run();

    await env.DB.prepare(`
      UPDATE contract_amendments SET status = 'executed', executed_at = ? WHERE id = ?
    `).bind(now, amendmentId).run();
  }

  // Log audit trail
  await logContractAudit(
    updatedAmendment.contract_id,
    'amendment_accepted',
    acceptedByUserId,
    null,
    env,
    { amendment_id: amendmentId, fully_accepted: fullyAccepted }
  );

  return {
    success: true,
    fullyAccepted
  };
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

async function logContractAudit(
  contractId: string,
  action: string,
  userId: string | null,
  orgId: string | null,
  env: Env,
  changes?: any
): Promise<void> {
  const auditId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO contract_audit_log (
      id, contract_id, action, performed_by_user_id, performed_by_org_id,
      changes, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    auditId,
    contractId,
    action,
    userId,
    orgId,
    changes ? JSON.stringify(changes) : null,
    now
  ).run();
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Create contract
      if (path === '/api/contracts' && request.method === 'POST') {
        const body = await request.json();
        const result = await createContract(body, env);
        return Response.json({ success: true, data: result }, { status: 201 });
      }

      // Get contract
      if (path.startsWith('/api/contracts/') && request.method === 'GET') {
        const contractId = path.split('/').pop();
        const contract = await env.DB.prepare(`
          SELECT c.*, i.name as instrument_name,
                 buyer.name as buyer_org_name, seller.name as seller_org_name
          FROM contracts c
          JOIN instruments i ON c.instrument_id = i.id
          JOIN organisations buyer ON c.buyer_org_id = buyer.id
          JOIN organisations seller ON c.seller_org_id = seller.id
          WHERE c.id = ?
        `).bind(contractId).first();

        if (!contract) {
          return Response.json({ error: 'Contract not found' }, { status: 404 });
        }

        // Get signatures
        const signatures = await env.DB.prepare(`
          SELECT * FROM contract_signatures WHERE contract_id = ?
        `).bind(contractId).all();

        // Get amendments
        const amendments = await env.DB.prepare(`
          SELECT * FROM contract_amendments WHERE contract_id = ? ORDER BY amendment_number DESC
        `).bind(contractId).all();

        return Response.json({
          success: true,
          data: {
            ...contract,
            signatures: signatures.results,
            amendments: amendments.results
          }
        });
      }

      // List contracts
      if (path === '/api/contracts' && request.method === 'GET') {
        const orgId = url.searchParams.get('org_id');
        const status = url.searchParams.get('status');
        const type = url.searchParams.get('type');

        let query = `
          SELECT c.*, i.name as instrument_name,
                 buyer.name as buyer_org_name, seller.name as seller_org_name
          FROM contracts c
          JOIN instruments i ON c.instrument_id = i.id
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
          query += ` AND c.status = ?`;
          params.push(status);
        }
        if (type) {
          query += ` AND c.contract_type = ?`;
          params.push(type);
        }

        query += ` ORDER BY c.created_at DESC`;

        const { results } = await env.DB.prepare(query).bind(...params).all();

        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }

      // Request signature
      if (path === '/api/contracts/:id/signatures' && request.method === 'POST') {
        const contractId = path.split('/')[3];
        const body = await request.json();
        const result = await requestSignature(contractId, body, env);
        return Response.json({ success: true, data: result }, { status: 201 });
      }

      // Execute signature
      if (path.match(/^\/api\/contracts\/[^\/]+\/signatures\/[^\/]+\/execute$/) && request.method === 'POST') {
        const parts = path.split('/');
        const signatureId = parts[5];
        const body = await request.json();
        const result = await executeSignature(signatureId, body, env);
        return Response.json({ success: true, data: result });
      }

      // Decline signature
      if (path.match(/^\/api\/contracts\/[^\/]+\/signatures\/[^\/]+\/decline$/) && request.method === 'POST') {
        const parts = path.split('/');
        const signatureId = parts[5];
        const body = await request.json();
        const result = await declineSignature(signatureId, body.reason, env);
        return Response.json({ success: true, data: result });
      }

      // Terminate contract
      if (path.match(/^\/api\/contracts\/[^\/]+\/terminate$/) && request.method === 'POST') {
        const contractId = path.split('/')[3];
        const body = await request.json();
        const result = await terminateContract(
          contractId,
          body.reason,
          body.user_id,
          body.org_id,
          env
        );
        return Response.json({ success: true, data: result });
      }

      // Propose amendment
      if (path.match(/^\/api\/contracts\/[^\/]+\/amendments$/) && request.method === 'POST') {
        const contractId = path.split('/')[3];
        const body = await request.json();
        const result = await proposeAmendment(contractId, body, env);
        return Response.json({ success: true, data: result }, { status: 201 });
      }

      // Accept amendment
      if (path.match(/^\/api\/contracts\/[^\/]+\/amendments\/[^\/]+\/accept$/) && request.method === 'POST') {
        const amendmentId = path.split('/')[5];
        const body = await request.json();
        const result = await acceptAmendment(amendmentId, body.user_id, body.is_buyer, env);
        return Response.json({ success: true, data: result });
      }

      // Get contract audit log
      if (path.match(/^\/api\/contracts\/[^\/]+\/audit$/) && request.method === 'GET') {
        const contractId = path.split('/')[3];
        const { results } = await env.DB.prepare(`
          SELECT * FROM contract_audit_log WHERE contract_id = ? ORDER BY timestamp DESC
        `).bind(contractId).all();

        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }

      // Create contract template
      if (path === '/api/contract-templates' && request.method === 'POST') {
        const body = await request.json();
        const templateId = crypto.randomUUID();
        const now = new Date().toISOString();

        await env.DB.prepare(`
          INSERT INTO contract_templates (
            id, name, description, contract_type, version, status,
            template_document_r2_key, default_terms, required_fields,
            approval_required, created_by_user_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          templateId,
          body.name,
          body.description,
          body.contract_type,
          body.version || '1.0',
          'draft',
          body.template_document_r2_key,
          JSON.stringify(body.default_terms),
          JSON.stringify(body.required_fields),
          body.approval_required || false,
          body.created_by_user_id,
          now,
          now
        ).run();

        return Response.json({ success: true, data: { template_id: templateId } }, { status: 201 });
      }

      // List contract templates
      if (path === '/api/contract-templates' && request.method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT * FROM contract_templates WHERE status = 'active' ORDER BY name
        `).all();

        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }

      return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Contract engine error:', error);
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500, headers: corsHeaders });
    }
  }
};
