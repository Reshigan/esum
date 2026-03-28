/**
 * ESUM Energy Trading Platform - Trading Engine
 * Order book matching engine using Durable Objects
 */

import type { Env } from './types';

// ============================================================================
// ORDER BOOK DURABLE OBJECT
// ============================================================================

export class OrderBook {
  private state: DurableObjectState;
  private env: Env;
  private bids: Map<string, OrderLevel>;
  private asks: Map<string, OrderLevel>;
  private trades: Trade[];

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.bids = new Map();
    this.asks = new Map();
    this.trades = [];
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'GET' && path === '/orderbook') {
      return this.getOrderBook();
    } else if (request.method === 'POST' && path === '/order') {
      const body = await request.json();
      return this.processOrder(body);
    } else if (request.method === 'POST' && path === '/cancel') {
      const body = await request.json();
      return this.cancelOrder(body);
    } else if (request.method === 'GET' && path === '/trades') {
      return this.getTrades();
    }

    return new Response('Not Found', { status: 404 });
  }

  async getOrderBook(): Promise<Response> {
    const bids = Array.from(this.bids.values())
      .filter(level => level.volume > 0)
      .sort((a, b) => b.price - a.price);

    const asks = Array.from(this.asks.values())
      .filter(level => level.volume > 0)
      .sort((a, b) => a.price - b.price);

    return Response.json({
      bids: bids.slice(0, 20),
      asks: asks.slice(0, 20),
      spread: asks.length > 0 && bids.length > 0 ? asks[0].price - bids[0].price : null,
      timestamp: new Date().toISOString()
    });
  }

  async processOrder(order: OrderInput): Promise<Response> {
    const orderId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const orderRecord: Order = {
      id: orderId,
      instrumentId: order.instrument_id,
      orderType: order.order_type,
      traderOrgId: order.trader_org_id,
      traderUserId: order.trader_user_id,
      volume: order.volume_mwh,
      filledVolume: 0,
      remainingVolume: order.volume_mwh,
      limitPrice: order.limit_price_zar,
      averageFillPrice: 0,
      timeInForce: order.time_in_force || 'gtc',
      status: 'open',
      createdAt: timestamp
    };

    // Store order in D1
    await this.env.DB.prepare(`
      INSERT INTO orders (id, instrument_id, order_type, status, trader_org_id, trader_user_id, volume_mwh, filled_volume_mwh, remaining_volume_mwh, limit_price_zar, time_in_force, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId, order.instrument_id, order.order_type, 'open', order.trader_org_id, order.trader_user_id,
      order.volume_mwh, 0, order.volume_mwh, order.limit_price_zar, order.time_in_force || 'gtc', timestamp, timestamp
    ).run();

    // Try to match the order
    const matches = await this.matchOrder(orderRecord);

    // If partially filled or unfilled, add to order book
    if (orderRecord.remainingVolume > 0) {
      const book = order.orderType === 'bid' ? this.bids : this.asks;
      const priceKey = order.limitPrice.toString();
      const existingLevel = book.get(priceKey);

      if (existingLevel) {
        existingLevel.volume += orderRecord.remainingVolume;
        existingLevel.orders.push(orderId);
      } else {
        book.set(priceKey, {
          price: order.limitPrice,
          volume: orderRecord.remainingVolume,
          orders: [orderId]
        });
      }
    }

    return Response.json({
      order_id: orderId,
      status: orderRecord.status,
      filled_volume: orderRecord.filledVolume,
      remaining_volume: orderRecord.remainingVolume,
      average_fill_price: orderRecord.averageFillPrice,
      trades: matches
    });
  }

  async matchOrder(order: Order): Promise<Trade[]> {
    const trades: Trade[] = [];
    const oppositeBook = order.orderType === 'bid' ? this.asks : this.bids;

    // Sort opposite book
    const levels = Array.from(oppositeBook.values()).sort((a, b) =>
      order.orderType === 'bid' ? a.price - b.price : b.price - a.price
    );

    for (const level of levels) {
      if (order.remainingVolume <= 0) break;

      // Check price compatibility
      if (order.orderType === 'bid' && level.price > order.limitPrice) break;
      if (order.orderType === 'ask' && level.price < order.limitPrice) break;

      // Match volume
      const matchVolume = Math.min(order.remainingVolume, level.volume);

      for (const oppositeOrderId of level.orders) {
        if (matchVolume <= 0) break;

        // Get opposite order details
        const oppositeOrder = await this.env.DB.prepare(`
          SELECT * FROM orders WHERE id = ?
        `).bind(oppositeOrderId).first();

        if (!oppositeOrder) continue;

        const fillVolume = Math.min(matchVolume, oppositeOrder.remaining_volume_mwh);
        if (fillVolume <= 0) continue;

        // Create trade
        const tradeId = crypto.randomUUID();
        const tradePrice = oppositeOrder.limit_price_zar;
        const tradeValue = fillVolume * tradePrice;
        const platformFee = tradeValue * 0.0025;
        const timestamp = new Date().toISOString();

        const buyerOrgId = order.orderType === 'bid' ? order.traderOrgId : oppositeOrder.trader_org_id;
        const sellerOrgId = order.orderType === 'bid' ? oppositeOrder.trader_org_id : order.traderOrgId;

        await this.env.DB.prepare(`
          INSERT INTO trades (id, buy_order_id, sell_order_id, instrument_id, buyer_org_id, seller_org_id, status, volume_mwh, unit_price_zar, total_value_zar, platform_fee_zar, settlement_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          tradeId,
          order.orderType === 'bid' ? order.id : oppositeOrderId,
          order.orderType === 'bid' ? oppositeOrderId : order.id,
          order.instrumentId,
          buyerOrgId,
          sellerOrgId,
          'confirmed',
          fillVolume,
          tradePrice,
          tradeValue,
          platformFee,
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          timestamp,
          timestamp
        ).run();

        // Update order volumes
        order.filledVolume += fillVolume;
        order.remainingVolume -= fillVolume;
        order.averageFillPrice = (order.averageFillPrice * (order.filledVolume - fillVolume) + tradePrice * fillVolume) / order.filledVolume;

        await this.env.DB.prepare(`
          UPDATE orders SET filled_volume_mwh = ?, remaining_volume_mwh = ?, average_fill_price_zar = ?, status = ?, updated_at = ?
          WHERE id = ?
        `).bind(order.filledVolume, order.remainingVolume, order.averageFillPrice, order.remainingVolume > 0 ? 'partially_filled' : 'filled', timestamp, order.id).run();

        await this.env.DB.prepare(`
          UPDATE orders SET filled_volume_mwh = filled_volume_mwh + ?, remaining_volume_mwh = remaining_volume_mwh - ?, updated_at = ?
          WHERE id = ?
        `).bind(fillVolume, fillVolume, timestamp, oppositeOrderId).run();

        // Update order book level
        level.volume -= fillVolume;

        // Send to trade queue
        await this.env.TRADE_QUEUE.send({
          trade_id: tradeId,
          buyer_org_id: buyerOrgId,
          seller_org_id: sellerOrgId,
          instrument_id: order.instrumentId,
          volume_mwh: fillVolume,
          price_zar: tradePrice,
          timestamp
        });

        trades.push({
          id: tradeId,
          buyOrderId: order.orderType === 'bid' ? order.id : oppositeOrderId,
          sellOrderId: order.orderType === 'bid' ? oppositeOrderId : order.id,
          volume: fillVolume,
          price: tradePrice,
          value: tradeValue,
          timestamp
        });

        matchVolume -= fillVolume;
      }

      // Remove empty levels
      if (level.volume <= 0) {
        oppositeBook.delete(level.price.toString());
      }
    }

    return trades;
  }

  async cancelOrder(input: { order_id: string; trader_org_id: string }): Promise<Response> {
    const order = await this.env.DB.prepare(`
      SELECT * FROM orders WHERE id = ? AND trader_org_id = ?
    `).bind(input.order_id, input.trader_org_id).first();

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'open' && order.status !== 'partially_filled') {
      return Response.json({ error: 'Cannot cancel order in current status' }, { status: 400 });
    }

    // Remove from order book
    const book = order.order_type === 'bid' ? this.bids : this.asks;
    const level = book.get(order.limit_price_zar.toString());

    if (level) {
      level.volume -= order.remaining_volume_mwh;
      level.orders = level.orders.filter(id => id !== order.id);

      if (level.volume <= 0) {
        book.delete(order.limit_price_zar.toString());
      }
    }

    // Update order status
    await this.env.DB.prepare(`
      UPDATE orders SET status = ?, updated_at = ? WHERE id = ?
    `).bind('cancelled', new Date().toISOString(), input.order_id).run();

    return Response.json({ success: true, message: 'Order cancelled' });
  }

  async getTrades(): Promise<Response> {
    return Response.json({
      trades: this.trades.slice(-100)
    });
  }
}

// ============================================================================
// AUCTION MANAGER DURABLE OBJECT
// ============================================================================

export class AuctionManager {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/create') {
      const body = await request.json();
      return this.createAuction(body);
    } else if (request.method === 'POST' && url.pathname === '/close') {
      const body = await request.json();
      return this.closeAuction(body);
    } else if (request.method === 'GET' && url.pathname === '/results') {
      const auctionId = url.searchParams.get('auction_id');
      return this.getAuctionResults(auctionId!);
    }

    return new Response('Not Found', { status: 404 });
  }

  async createAuction(input: AuctionInput): Promise<Response> {
    const auctionId = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.env.DB.prepare(`
      INSERT INTO auctions (id, instrument_id, auction_type, status, opens_at, closes_at, reserve_price_zar_per_mwh, created_by_user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      auctionId, input.instrument_id, input.auction_type, 'scheduled',
      input.opens_at, input.closes_at, input.reserve_price, input.created_by_user_id, now, now
    ).run();

    return Response.json({ auction_id: auctionId, status: 'scheduled' });
  }

  async closeAuction(input: { auction_id: string }): Promise<Response> {
    const auction = await this.env.DB.prepare(`SELECT * FROM auctions WHERE id = ?`).bind(input.auction_id).first();

    if (!auction) {
      return Response.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Get all bids
    const { results: bids } = await this.env.DB.prepare(`
      SELECT * FROM auction_bids WHERE auction_id = ? ORDER BY bid_price_zar DESC
    `).bind(input.auction_id).all();

    // Calculate clearing price based on auction type
    let clearingPrice = 0;
    const winningBidIds: string[] = [];

    if (auction.auction_type === 'sealed_first_price' || auction.auction_type === 'english') {
      // Highest bid wins at their bid price
      if (bids.length > 0) {
        clearingPrice = bids[0].bid_price_zar;
        winningBidIds.push(bids[0].id);
      }
    } else if (auction.auction_type === 'sealed_second_price' || auction.auction_type === 'dutch') {
      // Second price auction
      if (bids.length >= 2) {
        clearingPrice = bids[1].bid_price_zar;
        winningBidIds.push(bids[0].id);
      } else if (bids.length === 1) {
        clearingPrice = bids[0].bid_price_zar;
        winningBidIds.push(bids[0].id);
      }
    }

    // Mark winning bids
    for (const bidId of winningBidIds) {
      await this.env.DB.prepare(`UPDATE auction_bids SET is_winner = ? WHERE id = ?`).bind(true, bidId).run();
    }

    // Update auction
    await this.env.DB.prepare(`
      UPDATE auctions SET status = ?, clearing_price_zar_per_mwh = ?, winning_bid_ids = ?, updated_at = ?
      WHERE id = ?
    `).bind('settled', clearingPrice, JSON.stringify(winningBidIds), new Date().toISOString(), input.auction_id).run();

    // Create trades for winning bids
    for (const bidId of winningBidIds) {
      const bid = bids.find(b => b.id === bidId);
      if (!bid) continue;

      const tradeId = crypto.randomUUID();
      const tradeValue = bid.volume_mwh * clearingPrice;

      await this.env.DB.prepare(`
        INSERT INTO trades (id, buy_order_id, sell_order_id, instrument_id, buyer_org_id, seller_org_id, status, volume_mwh, unit_price_zar, total_value_zar, settlement_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        tradeId, bid.id, null, auction.instrument_id, bid.bidder_org_id, null, 'confirmed',
        bid.volume_mwh, clearingPrice, tradeValue, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(), new Date().toISOString()
      ).run();
    }

    return Response.json({
      auction_id: input.auction_id,
      status: 'settled',
      clearing_price: clearingPrice,
      winning_bids: winningBidIds
    });
  }

  async getAuctionResults(auctionId: string): Promise<Response> {
    const auction = await this.env.DB.prepare(`
      SELECT a.*, i.name as instrument_name FROM auctions a
      JOIN instruments i ON a.instrument_id = i.id WHERE a.id = ?
    `).bind(auctionId).first();

    if (!auction) {
      return Response.json({ error: 'Auction not found' }, { status: 404 });
    }

    const { results: bids } = await this.env.DB.prepare(`
      SELECT ab.*, o.name as bidder_name FROM auction_bids ab
      JOIN organisations o ON ab.bidder_org_id = o.id
      WHERE ab.auction_id = ? ORDER BY ab.bid_price_zar DESC
    `).bind(auctionId).all();

    return Response.json({
      auction,
      bids,
      total_bids: bids.length
    });
  }
}

// ============================================================================
// NEGOTIATION ROOM DURABLE OBJECT
// ============================================================================

export class NegotiationRoom {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/create') {
      const body = await request.json();
      return this.createNegotiation(body);
    } else if (request.method === 'POST' && url.pathname === '/message') {
      const body = await request.json();
      return this.sendMessage(body);
    } else if (request.method === 'POST' && url.pathname === '/propose') {
      const body = await request.json();
      return this.proposeTerms(body);
    } else if (request.method === 'POST' && url.pathname === '/accept') {
      const body = await request.json();
      return this.acceptTerms(body);
    } else if (request.method === 'GET' && url.pathname === '/history') {
      const negotiationId = url.searchParams.get('negotiation_id');
      return this.getMessageHistory(negotiationId!);
    }

    return new Response('Not Found', { status: 404 });
  }

  async createNegotiation(input: NegotiationInput): Promise<Response> {
    const negotiationId = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await this.env.DB.prepare(`
      INSERT INTO negotiations (id, instrument_id, initiator_org_id, counterparty_org_id, status, term_sheet, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      negotiationId, input.instrument_id, input.initiator_org_id, input.counterparty_org_id,
      'invited', JSON.stringify(input.initial_terms || {}), expiresAt, now, now
    ).run();

    // Send invitation notification
    await this.env.NOTIFICATION_QUEUE.send({
      type: 'negotiation_invited',
      negotiation_id: negotiationId,
      recipient_org_id: input.counterparty_org_id
    });

    return Response.json({ negotiation_id: negotiationId, status: 'invited' });
  }

  async sendMessage(input: { negotiation_id: string; sender_user_id: string; sender_org_id: string; content: string; message_type?: string }): Promise<Response> {
    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.env.DB.prepare(`
      INSERT INTO negotiation_messages (id, negotiation_id, sender_user_id, sender_org_id, message_type, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      messageId, input.negotiation_id, input.sender_user_id, input.sender_org_id,
      input.message_type || 'text', input.content, now
    ).run();

    // Update negotiation updated_at
    await this.env.DB.prepare(`UPDATE negotiations SET updated_at = ? WHERE id = ?`).bind(now, input.negotiation_id).run();

    return Response.json({ message_id: messageId, created_at: now });
  }

  async proposeTerms(input: { negotiation_id: string; user_id: string; org_id: string; terms: any }): Promise<Response> {
    const now = new Date().toISOString();

    await this.env.DB.prepare(`
      UPDATE negotiations SET term_sheet = ?, status = ?, updated_at = ? WHERE id = ?
    `).bind(JSON.stringify(input.terms), 'terms_proposed', now, input.negotiation_id).run();

    await this.sendMessage({
      negotiation_id: input.negotiation_id,
      sender_user_id: input.user_id,
      sender_org_id: input.org_id,
      content: 'New terms proposed',
      message_type: 'term_update'
    });

    return Response.json({ success: true, status: 'terms_proposed' });
  }

  async acceptTerms(input: { negotiation_id: string; user_id: string; org_id: string }): Promise<Response> {
    const negotiation = await this.env.DB.prepare(`SELECT * FROM negotiations WHERE id = ?`).bind(input.negotiation_id).first();

    if (!negotiation) {
      return Response.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    await this.env.DB.prepare(`
      UPDATE negotiations SET status = ?, updated_at = ? WHERE id = ?
    `).bind('terms_accepted', now, input.negotiation_id).run();

    // Generate contract
    const contractId = crypto.randomUUID();
    const tradeId = crypto.randomUUID();

    await this.env.DB.prepare(`
      INSERT INTO trades (id, instrument_id, buyer_org_id, seller_org_id, status, volume_mwh, unit_price_zar, total_value_zar, settlement_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tradeId, negotiation.instrument_id, negotiation.initiator_org_id, negotiation.counterparty_org_id,
      'confirmed', 100, 0.75, 75, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), now, now
    ).run();

    await this.env.DB.prepare(`
      INSERT INTO contracts (id, trade_id, instrument_id, buyer_org_id, seller_org_id, contract_type, status, start_date, end_date, total_contracted_mwh, remaining_mwh, price_terms, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contractId, tradeId, negotiation.instrument_id, negotiation.initiator_org_id, negotiation.counterparty_org_id,
      'term', 'draft', new Date().toISOString(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      100, 100, negotiation.term_sheet, now, now
    ).run();

    return Response.json({
      success: true,
      status: 'contract_generated',
      contract_id: contractId,
      trade_id: tradeId
    });
  }

  async getMessageHistory(negotiationId: string): Promise<Response> {
    const { results } = await this.env.DB.prepare(`
      SELECT nm.*, u.name as sender_name, o.name as sender_org_name
      FROM negotiation_messages nm
      JOIN users u ON nm.sender_user_id = u.id
      JOIN organisations o ON nm.sender_org_id = o.id
      WHERE nm.negotiation_id = ? ORDER BY nm.created_at ASC
    `).bind(negotiationId).all();

    return Response.json({ messages: results });
  }
}

// ============================================================================
// WORKER DEFAULT EXPORT (required for ES module format with Durable Objects)
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route to appropriate Durable Object
    if (path.startsWith('/orderbook') || path.startsWith('/order') || path.startsWith('/cancel') || path === '/trades') {
      const instrumentId = url.searchParams.get('instrument_id') || 'default';
      const id = env.ORDER_BOOK.idFromName(instrumentId);
      const stub = env.ORDER_BOOK.get(id);
      return stub.fetch(request);
    }

    if (path.startsWith('/auction')) {
      const auctionId = url.searchParams.get('auction_id') || 'default';
      const id = env.AUCTION_MANAGER.idFromName(auctionId);
      const stub = env.AUCTION_MANAGER.get(id);
      return stub.fetch(request);
    }

    if (path.startsWith('/negotiation') || path.startsWith('/message') || path.startsWith('/propose') || path.startsWith('/accept')) {
      const negotiationId = url.searchParams.get('negotiation_id') || 'default';
      const id = env.NEGOTIATION_ROOM.idFromName(negotiationId);
      const stub = env.NEGOTIATION_ROOM.get(id);
      return stub.fetch(request);
    }

    return Response.json({ service: 'esum-trading-engine', status: 'ok' });
  }
};

// ============================================================================
// TYPES
// ============================================================================

interface OrderLevel {
  price: number;
  volume: number;
  orders: string[];
}

interface Order {
  id: string;
  instrumentId: string;
  orderType: 'bid' | 'ask';
  traderOrgId: string;
  traderUserId: string;
  volume: number;
  filledVolume: number;
  remainingVolume: number;
  limitPrice: number;
  averageFillPrice: number;
  timeInForce: string;
  status: string;
  createdAt: string;
}

interface OrderInput {
  instrument_id: string;
  order_type: 'bid' | 'ask';
  trader_org_id: string;
  trader_user_id: string;
  volume_mwh: number;
  limit_price_zar: number;
  time_in_force?: string;
}

interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  volume: number;
  price: number;
  value: number;
  timestamp: string;
}

interface AuctionInput {
  instrument_id: string;
  auction_type: string;
  opens_at: string;
  closes_at: string;
  reserve_price: number;
  created_by_user_id: string;
}

interface NegotiationInput {
  instrument_id: string;
  initiator_org_id: string;
  counterparty_org_id: string;
  initial_terms?: any;
}
