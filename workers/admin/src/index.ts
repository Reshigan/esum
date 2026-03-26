/**
 * ESUM Energy Trading Platform - Admin Worker
 * Platform administration, KYC review, system health, feature flags
 */

interface Env {
  DB: D1Database;
  FEATURE_FLAGS: KVNamespace;
  DOCUMENTS: R2Bucket;
  CACHE: KVNamespace;
}

// ============================================================================
// KYC REVIEW
// ============================================================================

async function getPendingKYCSubmissions(env: Env) {
  const { results } = await env.DB.prepare(`
    SELECT o.*, 
           GROUP_CONCAT(DISTINCT k.document_type) as document_types,
           MAX(k.created_at) as last_document_upload
    FROM organisations o
    LEFT JOIN kyc_documents k ON o.id = k.organisation_id
    WHERE o.kyc_status = 'pending_review'
    GROUP BY o.id
    ORDER BY last_document_upload DESC
  `).all();
  
  return results;
}

async function reviewKYC(
  orgId: string,
  approved: boolean,
  notes: string,
  reviewerId: string,
  env: Env
) {
  const now = new Date().toISOString();
  
  // Update organisation KYC status
  await env.DB.prepare(`
    UPDATE organisations SET
      kyc_status = ?,
      kyc_approved_at = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    approved ? 'approved' : 'rejected',
    approved ? now : null,
    now,
    orgId
  ).run();
  
  // Update document review status
  await env.DB.prepare(`
    UPDATE kyc_documents SET
      status = ?,
      review_notes = ?,
      reviewed_by_user_id = ?,
      reviewed_at = ?
    WHERE organisation_id = ?
  `).bind(
    approved ? 'approved' : 'rejected',
    notes,
    reviewerId,
    now,
    orgId
  ).run();
  
  // Audit log
  await env.DB.prepare(`
    INSERT INTO audit_log (id, action, resource_type, resource_id, changes, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    approved ? 'kyc_approved' : 'kyc_rejected',
    'organisation',
    orgId,
    JSON.stringify({ approved, notes, reviewer_id: reviewerId }),
    now
  ).run();
  
  return {
    success: true,
    organisation_id: orgId,
    status: approved ? 'approved' : 'rejected',
    notes
  };
}

// ============================================================================
// INSTRUMENT REVIEW
// ============================================================================

async function getPendingInstruments(env: Env) {
  const { results } = await env.DB.prepare(`
    SELECT i.*, o.name as seller_name, u.name as created_by_name
    FROM instruments i
    JOIN organisations o ON i.seller_org_id = o.id
    JOIN users u ON i.created_by_user_id = u.id
    WHERE i.status = 'pending_approval'
    ORDER BY i.created_at DESC
  `).all();
  
  return results;
}

async function reviewInstrument(
  instrumentId: string,
  approved: boolean,
  notes: string,
  reviewerId: string,
  env: Env
) {
  const now = new Date().toISOString();
  
  await env.DB.prepare(`
    UPDATE instruments SET
      status = ?,
      approved_by_user_id = ?,
      approved_at = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    approved ? 'active' : 'cancelled',
    reviewerId,
    approved ? now : null,
    now,
    instrumentId
  ).run();
  
  return {
    success: true,
    instrument_id: instrumentId,
    status: approved ? 'active' : 'cancelled'
  };
}

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

async function getSystemHealth(env: Env) {
  const health: Record<string, any> = {
    timestamp: new Date().toISOString(),
    components: {}
  };
  
  // Check D1
  try {
    const start = Date.now();
    await env.DB.prepare('SELECT 1').first();
    health.components.d1 = {
      status: 'healthy',
      latency_ms: Date.now() - start
    };
  } catch (error) {
    health.components.d1 = { status: 'unhealthy', error: 'Connection failed' };
  }
  
  // Check KV
  try {
    const start = Date.now();
    await env.CACHE.get('health_check');
    health.components.kv = {
      status: 'healthy',
      latency_ms: Date.now() - start
    };
  } catch (error) {
    health.components.kv = { status: 'unhealthy', error: 'Connection failed' };
  }
  
  // Check R2
  try {
    const start = Date.now();
    await env.DOCUMENTS.head('health_check');
    health.components.r2 = {
      status: 'healthy',
      latency_ms: Date.now() - start
    };
  } catch (error) {
    health.components.r2 = { status: 'unhealthy', error: 'Connection failed' };
  }
  
  // Get platform statistics
  const stats = await env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM organisations) as total_organisations,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM instruments WHERE status = 'active') as active_instruments,
      (SELECT COUNT(*) FROM trades) as total_trades,
      (SELECT SUM(total_value_zar) FROM trades) as total_trade_volume,
      (SELECT COUNT(*) FROM carbon_credits WHERE status = 'retired') as retired_credits
  `).first();
  
  health.statistics = stats;
  
  // Calculate overall status
  const allHealthy = Object.values(health.components).every(
    (c: any) => c.status === 'healthy'
  );
  health.overall_status = allHealthy ? 'healthy' : 'degraded';
  
  return health;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

async function getFeatureFlags(env: Env) {
  const keys = await env.FEATURE_FLAGS.list();
  const flags: Record<string, any> = {};
  
  for (const key of keys.keys || []) {
    const value = await env.FEATURE_FLAGS.get(key.name);
    flags[key.name] = value ? JSON.parse(value) : { enabled: false };
  }
  
  return flags;
}

async function updateFeatureFlag(
  name: string,
  enabled: boolean,
  metadata: any,
  env: Env
) {
  const flagData = {
    enabled,
    metadata,
    updated_at: new Date().toISOString()
  };
  
  await env.FEATURE_FLAGS.put(name, JSON.stringify(flagData));
  
  return { success: true, name, ...flagData };
}

// ============================================================================
// PLATFORM ANALYTICS
// ============================================================================

async function getPlatformAnalytics(env: Env, period: string = '30d') {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  // Trading volume over time
  const { results: volumeData } = await env.DB.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as trades, SUM(total_value_zar) as volume
    FROM trades
    WHERE created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `).bind(cutoff).all();
  
  // Instrument breakdown
  const { results: instrumentBreakdown } = await env.DB.prepare(`
    SELECT i.type, COUNT(*) as count, SUM(i.available_volume_mwh) as volume
    FROM instruments i
    WHERE i.status = 'active'
    GROUP BY i.type
  `).all();
  
  // Top traders
  const { results: topTraders } = await env.DB.prepare(`
    SELECT o.name, COUNT(*) as trade_count, SUM(t.total_value_zar) as total_volume
    FROM trades t
    JOIN organisations o ON t.buyer_org_id = o.id
    WHERE t.created_at >= ?
    GROUP BY t.buyer_org_id, o.name
    ORDER BY total_volume DESC
    LIMIT 10
  `).bind(cutoff).all();
  
  // Carbon impact
  const { total_retired } = await env.DB.prepare(`
    SELECT SUM(quantity_tco2e) as total_retired
    FROM carbon_credits
    WHERE status = 'retired' AND retirement_date >= ?
  `).bind(cutoff).first();
  
  return {
    period,
    trading_volume: volumeData,
    instrument_breakdown: instrumentBreakdown,
    top_traders: topTraders,
    carbon_impact: {
      total_retired_tco2e: total_retired || 0
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // System health
      if (path === '/api/admin/health' && request.method === 'GET') {
        const health = await getSystemHealth(env);
        return Response.json({ success: true, data: health });
      }
      
      // Get pending KYC submissions
      if (path === '/api/admin/kyc/pending' && request.method === 'GET') {
        const submissions = await getPendingKYCSubmissions(env);
        return Response.json({
          success: true,
          data: submissions,
          count: submissions.length
        });
      }
      
      // Review KYC
      if (path === '/api/admin/kyc/:id/review' && request.method === 'POST') {
        const id = path.split('/').reverse()[1];
        const body = await request.json();
        const result = await reviewKYC(
          id,
          body.approved,
          body.notes,
          body.reviewer_id,
          env
        );
        return Response.json(result);
      }
      
      // Get pending instruments
      if (path === '/api/admin/instruments/pending' && request.method === 'GET') {
        const instruments = await getPendingInstruments(env);
        return Response.json({
          success: true,
          data: instruments,
          count: instruments.length
        });
      }
      
      // Review instrument
      if (path === '/api/admin/instruments/:id/review' && request.method === 'POST') {
        const id = path.split('/').reverse()[1];
        const body = await request.json();
        const result = await reviewInstrument(
          id,
          body.approved,
          body.notes,
          body.reviewer_id,
          env
        );
        return Response.json(result);
      }
      
      // Get feature flags
      if (path === '/api/admin/flags' && request.method === 'GET') {
        const flags = await getFeatureFlags(env);
        return Response.json({ success: true, data: flags });
      }
      
      // Update feature flag
      if (path === '/api/admin/flags/:name' && request.method === 'PATCH') {
        const name = path.split('/').reverse()[1];
        const body = await request.json();
        const result = await updateFeatureFlag(
          name,
          body.enabled,
          body.metadata,
          env
        );
        return Response.json(result);
      }
      
      // Platform analytics
      if (path === '/api/admin/analytics' && request.method === 'GET') {
        const period = url.searchParams.get('period') || '30d';
        const analytics = await getPlatformAnalytics(env, period);
        return Response.json({ success: true, data: analytics });
      }
      
      // Get all organisations (admin view)
      if (path === '/api/admin/organisations' && request.method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;
        
        const { results } = await env.DB.prepare(`
          SELECT * FROM organisations ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).bind(limit, offset).all();
        
        const { total } = await env.DB.prepare(`
          SELECT COUNT(*) as total FROM organisations
        `).first();
        
        return Response.json({
          success: true,
          data: results,
          pagination: {
            page,
            limit,
            total: total as number,
            total_pages: Math.ceil((total as number) / limit)
          }
        });
      }
      
      // Suspend/activate organisation
      if (path === '/api/admin/organisations/:id/status' && request.method === 'PATCH') {
        const id = path.split('/').reverse()[1];
        const body = await request.json();
        
        await env.DB.prepare(`
          UPDATE organisations SET status = ?, updated_at = ? WHERE id = ?
        `).bind(body.status, new Date().toISOString(), id).run();
        
        return Response.json({
          success: true,
          organisation_id: id,
          status: body.status
        });
      }
      
      // Audit log
      if (path === '/api/admin/audit' && request.method === 'GET') {
        const resourceType = url.searchParams.get('resource_type');
        const limit = parseInt(url.searchParams.get('limit') || '100');
        
        let query = `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?`;
        const params: any[] = [limit];
        
        if (resourceType) {
          query = `SELECT * FROM audit_log WHERE resource_type = ? ORDER BY created_at DESC LIMIT ?`;
          params.unshift(resourceType);
        }
        
        const { results } = await env.DB.prepare(query).bind(...params).all();
        
        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }
      
      return Response.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      console.error('Admin error:', error);
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500, headers: corsHeaders });
    }
  }
};
