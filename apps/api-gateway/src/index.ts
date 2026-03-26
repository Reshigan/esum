/**
 * ESUM Energy Trading Platform - API Gateway
 * Central API router using Hono framework
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { generateTraceId } from '@esum/utils';
import type { APIErrorResponse } from '@esum/shared-types';

interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  CACHE: KVNamespace;
  FEATURE_FLAGS: KVNamespace;
  DOCUMENTS: R2Bucket;
  INVOICES: R2Bucket;
  REPORTS: R2Bucket;
  ORDER_QUEUE: Queue;
  TRADE_QUEUE: Queue;
  SETTLEMENT_QUEUE: Queue;
  NOTIFICATION_QUEUE: Queue;
  ORDER_BOOK: DurableObjectNamespace;
  AUCTION_MANAGER: DurableObjectNamespace;
  NEGOTIATION_ROOM: DurableObjectNamespace;
  SEARCH_INDEX: VectorizeIndex;
  AI: Ai;
  RESEND_API_KEY: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://esum.energy'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Trace-ID'],
  exposeHeaders: ['X-Trace-ID'],
  credentials: true,
  maxAge: 86400
}));

app.use('*', async (c, next) => {
  const traceId = c.req.header('X-Trace-ID') || generateTraceId();
  c.set('traceId', traceId);
  c.header('X-Trace-ID', traceId);
  await next();
});

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing authorization' });
  }
  
  const token = authHeader.substring(7);
  const sessionData = await c.env.SESSIONS.get(`session:${token}`);
  
  if (!sessionData) {
    throw new HTTPException(401, { message: 'Invalid session' });
  }
  
  const session = JSON.parse(sessionData);
  if (new Date(session.expires_at) < new Date()) {
    await c.env.SESSIONS.delete(`session:${token}`);
    throw new HTTPException(401, { message: 'Session expired' });
  }
  
  c.set('user', session.user);
  c.set('organisation', session.organisation);
  await next();
};

app.onError((err, c) => {
  const traceId = c.get('traceId') || generateTraceId();
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  
  if (err instanceof HTTPException) {
    statusCode = err.status;
    errorCode = `HTTP_${statusCode}`;
    message = err.message;
  }
  
  return c.json({
    error_code: errorCode,
    message,
    trace_id: traceId
  } as APIErrorResponse, statusCode);
});

// Health check
app.get('/health', async (c) => {
  const checks: Record<string, { status: string; latency_ms?: number }> = {};
  
  try {
    const start = Date.now();
    await c.env.DB.prepare('SELECT 1').first();
    checks.d1 = { status: 'healthy', latency_ms: Date.now() - start };
  } catch { checks.d1 = { status: 'unhealthy' }; }
  
  try {
    const start = Date.now();
    await c.env.CACHE.get('health');
    checks.kv = { status: 'healthy', latency_ms: Date.now() - start };
  } catch { checks.kv = { status: 'unhealthy' }; }
  
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  
  return c.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    checks
  });
});

// Auth routes
app.post('/api/v1/auth/register/org', async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.email || !body.type) {
    throw new HTTPException(400, { message: 'Missing required fields' });
  }
  
  const orgId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO organisations (id, name, type, status, contact_email, province, city, address_line1, postal_code, kyc_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(orgId, body.name, body.type, 'pending', body.email, body.province || 'gauteng', body.city || 'Johannesburg', body.address || 'TBD', body.postalCode || '0000', 'not_submitted', now, now).run();
  
  return c.json({ success: true, data: { organisation_id: orgId } }, 201);
});

app.post('/api/v1/auth/register/user', async (c) => {
  const body = await c.req.json();
  if (!body.email || !body.password || !body.organisation_id) {
    throw new HTTPException(400, { message: 'Missing required fields' });
  }
  
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.password));
  const passwordHashHex = Array.from(new Uint8Array(passwordHash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  await c.env.DB.prepare(`
    INSERT INTO users (id, organisation_id, email, name, role, password_hash, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(userId, body.organisation_id, body.email, body.name || body.email.split('@')[0], body.role || 'trader', passwordHashHex, 'active', now, now).run();
  
  return c.json({ success: true, data: { user_id: userId } }, 201);
});

app.post('/api/v1/auth/login', async (c) => {
  const body = await c.req.json();
  if (!body.email || !body.password) {
    throw new HTTPException(400, { message: 'Email and password required' });
  }
  
  const user = await c.env.DB.prepare(`
    SELECT u.*, o.name as organisation_name, o.type as organisation_type, o.status as org_status
    FROM users u JOIN organisations o ON u.organisation_id = o.id WHERE u.email = ?
  `).bind(body.email).first();
  
  if (!user) throw new HTTPException(401, { message: 'Invalid credentials' });
  
  const passwordHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.password));
  const passwordHashHex = Array.from(new Uint8Array(passwordHash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  if (user.password_hash !== passwordHashHex) throw new HTTPException(401, { message: 'Invalid credentials' });
  if (user.org_status !== 'active') throw new HTTPException(403, { message: 'Organisation not active' });
  
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const sessionData = {
    user_id: user.id,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    organisation: { id: user.organisation_id, name: user.organisation_name, type: user.organisation_type },
    expires_at: expiresAt
  };
  
  await c.env.SESSIONS.put(`session:${token}`, JSON.stringify(sessionData), { expirationTtl: 24 * 60 * 60 });
  await c.env.DB.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).bind(new Date().toISOString(), user.id).run();
  
  return c.json({ success: true, data: { access_token: token, expires_at: expiresAt, user: sessionData.user, organisation: sessionData.organisation } });
});

app.post('/api/v1/auth/logout', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization')!;
  await c.env.SESSIONS.delete(`session:${authHeader.substring(7)}`);
  return c.json({ success: true, data: { message: 'Logged out' } });
});

// Organisation routes
app.get('/api/v1/organisations/me', authMiddleware, async (c) => {
  const org = await c.env.DB.prepare(`SELECT * FROM organisations WHERE id = ?`).bind(c.get('organisation').id).first();
  return c.json({ success: true, data: org });
});

app.get('/api/v1/organisations', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'super_admin' && user.role !== 'platform_admin') {
    throw new HTTPException(403, { message: 'Insufficient permissions' });
  }
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { results } = await c.env.DB.prepare(`SELECT * FROM organisations ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(limit, (page - 1) * limit).all();
  const { total } = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM organisations`).first();
  
  return c.json({ success: true, data: results, pagination: { page, limit, total: total as number, total_pages: Math.ceil((total as number) / limit) } });
});

// Instrument routes
app.get('/api/v1/instruments', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const type = c.req.query('type');
  const status = c.req.query('status') || 'active';
  
  let query = `SELECT i.*, o.name as seller_name FROM instruments i JOIN organisations o ON i.seller_org_id = o.id WHERE 1=1`;
  const params: any[] = [];
  if (type) { query += ` AND i.type = ?`; params.push(type); }
  if (status) { query += ` AND i.status = ?`; params.push(status); }
  query += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, (page - 1) * limit);
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results, pagination: { page, limit, total: results.length, total_pages: Math.ceil(results.length / limit) } });
});

app.get('/api/v1/instruments/:id', async (c) => {
  const instrument = await c.env.DB.prepare(`SELECT i.*, o.name as seller_name FROM instruments i JOIN organisations o ON i.seller_org_id = o.id WHERE i.id = ?`).bind(c.req.param('id')).first();
  if (!instrument) throw new HTTPException(404, { message: 'Instrument not found' });
  return c.json({ success: true, data: instrument });
});

app.post('/api/v1/instruments', authMiddleware, async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const organisation = c.get('organisation');
  const requiredFields = ['name', 'type', 'unit_price_zar', 'energy_source'];
  for (const field of requiredFields) {
    if (!body[field]) throw new HTTPException(400, { message: `Missing: ${field}` });
  }
  
  const instrumentId = crypto.randomUUID();
  const now = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO instruments (id, name, description, type, status, seller_org_id, energy_source, province, latitude, longitude, capacity_mw, unit_price_zar, price_type, min_order_volume_mwh, carbon_credits_included, recs_included, created_by_user_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(instrumentId, body.name, body.description, body.type, 'pending_approval', organisation.id, body.energy_source, body.province, body.latitude, body.longitude, body.capacity_mw, body.unit_price_zar, body.price_type || 'fixed', body.min_order_volume_mwh || 1, body.carbon_credits_included || false, body.recs_included || false, user.id, now, now).run();
  
  await c.env.NOTIFICATION_QUEUE.send({ type: 'instrument_submitted', instrument_id: instrumentId });
  return c.json({ success: true, data: { instrument_id: instrumentId } }, 201);
});

// Order routes
app.get('/api/v1/orders', authMiddleware, async (c) => {
  const organisation = c.get('organisation');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { results } = await c.env.DB.prepare(`
    SELECT o.*, i.name as instrument_name FROM orders o JOIN instruments i ON o.instrument_id = i.id
    WHERE o.trader_org_id = ? ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).bind(organisation.id, limit, (page - 1) * limit).all();
  return c.json({ success: true, data: results, pagination: { page, limit, total: results.length, total_pages: Math.ceil(results.length / limit) } });
});

app.post('/api/v1/orders', authMiddleware, async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const organisation = c.get('organisation');
  if (!body.instrument_id || !body.order_type || !body.volume_mwh || !body.limit_price_zar) {
    throw new HTTPException(400, { message: 'Missing required fields' });
  }
  
  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO orders (id, instrument_id, order_type, status, trader_org_id, trader_user_id, volume_mwh, filled_volume_mwh, remaining_volume_mwh, limit_price_zar, time_in_force, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(orderId, body.instrument_id, body.order_type, 'open', organisation.id, user.id, body.volume_mwh, 0, body.volume_mwh, body.limit_price_zar, body.time_in_force || 'gtc', now, now).run();
  
  await c.env.ORDER_QUEUE.send({ order_id: orderId, action: 'created', timestamp: now });
  return c.json({ success: true, data: { order_id: orderId } }, 201);
});

app.patch('/api/v1/orders/:id/cancel', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const organisation = c.get('organisation');
  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND trader_org_id = ?`).bind(id, organisation.id).first();
  if (!order) throw new HTTPException(404, { message: 'Order not found' });
  if (order.status !== 'open' && order.status !== 'partially_filled') throw new HTTPException(400, { message: 'Cannot cancel' });
  await c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`).bind('cancelled', new Date().toISOString(), id).run();
  return c.json({ success: true, data: { message: 'Order cancelled' } });
});

// Trade routes
app.get('/api/v1/trades', authMiddleware, async (c) => {
  const organisation = c.get('organisation');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, i.name as instrument_name FROM trades t JOIN instruments i ON t.instrument_id = i.id
    WHERE t.buyer_org_id = ? OR t.seller_org_id = ? ORDER BY t.created_at DESC LIMIT ? OFFSET ?
  `).bind(organisation.id, organisation.id, limit, (page - 1) * limit).all();
  return c.json({ success: true, data: results, pagination: { page, limit, total: results.length, total_pages: Math.ceil(results.length / limit) } });
});

// Contract routes
app.get('/api/v1/contracts', authMiddleware, async (c) => {
  const organisation = c.get('organisation');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { results } = await c.env.DB.prepare(`
    SELECT c.*, i.name as instrument_name, buyer.name as buyer_name, seller.name as seller_name
    FROM contracts c JOIN instruments i ON c.instrument_id = i.id JOIN organisations buyer ON c.buyer_org_id = buyer.id JOIN organisations seller ON c.seller_org_id = seller.id
    WHERE c.buyer_org_id = ? OR c.seller_org_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?
  `).bind(organisation.id, organisation.id, limit, (page - 1) * limit).all();
  return c.json({ success: true, data: results, pagination: { page, limit, total: results.length, total_pages: Math.ceil(results.length / limit) } });
});

// Carbon routes
app.get('/api/v1/carbon/credits', authMiddleware, async (c) => {
  const organisation = c.get('organisation');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { results } = await c.env.DB.prepare(`SELECT * FROM carbon_credits WHERE owner_org_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(organisation.id, limit, (page - 1) * limit).all();
  return c.json({ success: true, data: results, pagination: { page, limit, total: results.length, total_pages: Math.ceil(results.length / limit) } });
});

app.post('/api/v1/carbon/credits/retire', authMiddleware, async (c) => {
  const body = await c.req.json();
  const organisation = c.get('organisation');
  if (!body.credit_ids || !Array.isArray(body.credit_ids)) throw new HTTPException(400, { message: 'credit_ids required' });
  
  const now = new Date().toISOString();
  for (const creditId of body.credit_ids) {
    await c.env.DB.prepare(`UPDATE carbon_credits SET status = ?, retirement_date = ?, retirement_beneficiary = ?, updated_at = ? WHERE id = ? AND owner_org_id = ?`).bind('retired', now, body.beneficiary || organisation.name, now, creditId, organisation.id).run();
  }
  return c.json({ success: true, data: { message: `${body.credit_ids.length} credits retired` } });
});

// Auction routes
app.get('/api/v1/auctions', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status');
  let query = `SELECT a.*, i.name as instrument_name FROM auctions a JOIN instruments i ON a.instrument_id = i.id WHERE 1=1`;
  const params: any[] = [];
  if (status) { query += ` AND a.status = ?`; params.push(status); }
  query += ` ORDER BY a.opens_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, (page - 1) * limit);
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results, pagination: { page, limit, total: results.length, total_pages: Math.ceil(results.length / limit) } });
});

app.get('/api/v1/auctions/:id', async (c) => {
  const auction = await c.env.DB.prepare(`SELECT a.*, i.name as instrument_name, o.name as seller_name FROM auctions a JOIN instruments i ON a.instrument_id = i.id JOIN organisations o ON i.seller_org_id = o.id WHERE a.id = ?`).bind(c.req.param('id')).first();
  if (!auction) throw new HTTPException(404, { message: 'Auction not found' });
  return c.json({ success: true, data: auction });
});

app.post('/api/v1/auctions/:id/bids', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const user = c.get('user');
  const organisation = c.get('organisation');
  
  const auction = await c.env.DB.prepare(`SELECT * FROM auctions WHERE id = ? AND status = 'open'`).bind(id).first();
  if (!auction) throw new HTTPException(404, { message: 'Auction not found or not open' });
  
  const bidId = crypto.randomUUID();
  const now = new Date().toISOString();
  await c.env.DB.prepare(`INSERT INTO auction_bids (id, auction_id, bidder_org_id, bidder_user_id, volume_mwh, bid_price_zar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(bidId, id, organisation.id, user.id, body.volume_mwh, body.bid_price_zar, now).run();
  await c.env.DB.prepare(`UPDATE auctions SET total_bids = total_bids + 1, total_volume_mwh = total_volume_mwh + ?, updated_at = ? WHERE id = ?`).bind(body.volume_mwh, now, id).run();
  
  return c.json({ success: true, data: { bid_id: bidId } }, 201);
});

// Notification routes
app.get('/api/v1/notifications', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const { results } = await c.env.DB.prepare(`SELECT * FROM notifications WHERE recipient_user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(user.id, limit, (page - 1) * limit).all();
  return c.json({ success: true, data: results, pagination: { page, limit, total: results.length, total_pages: Math.ceil(results.length / limit) } });
});

app.patch('/api/v1/notifications/:id/read', authMiddleware, async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare(`UPDATE notifications SET read_at = ? WHERE id = ? AND recipient_user_id = ?`).bind(new Date().toISOString(), c.req.param('id'), user.id).run();
  return c.json({ success: true, data: { message: 'Notification marked as read' } });
});

// Search routes
app.get('/api/v1/search/instruments', async (c) => {
  const query = c.req.query('q');
  if (!query) throw new HTTPException(400, { message: 'Search query required' });
  
  const embeddings = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: query });
  const results = await c.env.SEARCH_INDEX.query(embeddings.data || embeddings.embeddings, { topK: 20 });
  
  const enrichedResults = [];
  for (const match of results.matches || []) {
    const instrument = await c.env.DB.prepare(`SELECT i.*, o.name as seller_name FROM instruments i JOIN organisations o ON i.seller_org_id = o.id WHERE i.id = ?`).bind(match.id).first();
    if (instrument) enrichedResults.push({ ...instrument, score: match.score });
  }
  return c.json({ success: true, data: enrichedResults });
});

export default app;
