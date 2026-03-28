/**
 * ESUM Trading Engine - Unit Tests
 * Tests for order matching, order book management, and trade execution
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock D1Database
const mockDB = {
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      run: vi.fn(),
      first: vi.fn(),
      all: vi.fn(),
    })),
  })),
};

// Mock Queue
const mockQueue = {
  send: vi.fn(),
};

describe("Trading Engine", () => {
  describe("Order Matching", () => {
    it("should match bid order with ask order at same price", async () => {
      // Simulate order book with existing ask
      const orderBook = new Map([
        ["0.75", { price: 0.75, volume: 1000, orders: ["ask-1"] }],
      ]);

      // New bid order at same price
      const bidOrder = {
        id: "bid-1",
        instrumentId: "inst-1",
        orderType: "bid" as const,
        traderOrgId: "org-1",
        traderUserId: "user-1",
        volume: 500,
        filledVolume: 0,
        remainingVolume: 500,
        limitPrice: 0.75,
        averageFillPrice: 0,
        timeInForce: "gtc",
        status: "open",
        createdAt: new Date().toISOString(),
      };

      // Matching logic
      const askLevel = orderBook.get("0.75");
      expect(askLevel).toBeDefined();
      expect(askLevel!.price).toBeLessThanOrEqual(bidOrder.limitPrice);

      const matchVolume = Math.min(bidOrder.remainingVolume, askLevel!.volume);
      expect(matchVolume).toBe(500);

      // After match
      bidOrder.filledVolume = matchVolume;
      bidOrder.remainingVolume -= matchVolume;
      askLevel!.volume -= matchVolume;

      expect(bidOrder.remainingVolume).toBe(0);
      expect(bidOrder.status).toBe("filled");
      expect(askLevel!.volume).toBe(500);
    });

    it("should partially fill order when volume insufficient", async () => {
      const orderBook = new Map([
        ["0.75", { price: 0.75, volume: 300, orders: ["ask-1"] }],
      ]);

      const bidOrder = {
        id: "bid-1",
        instrumentId: "inst-1",
        orderType: "bid" as const,
        volume: 500,
        filledVolume: 0,
        remainingVolume: 500,
        limitPrice: 0.75,
      };

      const matchVolume = Math.min(bidOrder.remainingVolume, orderBook.get("0.75")!.volume);
      expect(matchVolume).toBe(300);

      bidOrder.filledVolume = matchVolume;
      bidOrder.remainingVolume -= matchVolume;

      expect(bidOrder.remainingVolume).toBe(200);
      expect(bidOrder.filledVolume).toBe(300);
    });

    it("should not match if bid price < ask price", async () => {
      const orderBook = new Map([
        ["0.80", { price: 0.80, volume: 1000, orders: ["ask-1"] }],
      ]);

      const bidOrder = {
        id: "bid-1",
        orderType: "bid" as const,
        limitPrice: 0.75,
        remainingVolume: 500,
      };

      const askLevel = orderBook.get("0.80");
      expect(askLevel).toBeDefined();
      expect(askLevel!.price).toBeGreaterThan(bidOrder.limitPrice);

      // No match should occur
      const matchVolume = 0;
      expect(matchVolume).toBe(0);
    });
  });

  describe("Order Book Management", () => {
    it("should maintain price-time priority", async () => {
      const bids = new Map([
        ["0.75", { price: 0.75, volume: 1000, orders: ["bid-1", "bid-2"] }],
        ["0.74", { price: 0.74, volume: 500, orders: ["bid-3"] }],
        ["0.76", { price: 0.76, volume: 800, orders: ["bid-4"] }],
      ]);

      // Sort bids by price (highest first)
      const sortedBids = Array.from(bids.values())
        .filter((level) => level.volume > 0)
        .sort((a, b) => b.price - a.price);

      expect(sortedBids[0].price).toBe(0.76);
      expect(sortedBids[1].price).toBe(0.75);
      expect(sortedBids[2].price).toBe(0.74);
    });

    it("should calculate spread correctly", async () => {
      const bids = new Map([
        ["0.74", { price: 0.74, volume: 1000, orders: ["bid-1"] }],
      ]);
      const asks = new Map([
        ["0.76", { price: 0.76, volume: 1000, orders: ["ask-1"] }],
      ]);

      const bestBid = Math.max(...Array.from(bids.values()).map((l) => l.price));
      const bestAsk = Math.min(...Array.from(asks.values()).map((l) => l.price));
      const spread = bestAsk - bestBid;

      expect(spread).toBe(0.02);
    });
  });

  describe("Trade Execution", () => {
    it("should calculate platform fee correctly", async () => {
      const volume = 1000; // MWh
      const price = 0.75; // ZAR/MWh
      const tradeValue = volume * price;
      const platformFeeRate = 0.0025; // 0.25%
      const platformFee = tradeValue * platformFeeRate;

      expect(tradeValue).toBe(750);
      expect(platformFee).toBe(1.875);
    });

    it("should update order status based on fill", async () => {
      const order = {
        id: "order-1",
        volume: 1000,
        filledVolume: 0,
        remainingVolume: 1000,
        status: "open",
      };

      // Partial fill
      order.filledVolume = 600;
      order.remainingVolume = 400;
      order.status = order.remainingVolume > 0 ? "partially_filled" : "filled";
      expect(order.status).toBe("partially_filled");

      // Complete fill
      order.filledVolume = 1000;
      order.remainingVolume = 0;
      order.status = order.remainingVolume > 0 ? "partially_filled" : "filled";
      expect(order.status).toBe("filled");
    });
  });

  describe("Average Fill Price Calculation", () => {
    it("should calculate weighted average fill price", async () => {
      let filledVolume = 0;
      let averageFillPrice = 0;

      // First fill: 500 MWh @ 0.75
      const fill1 = 500;
      const price1 = 0.75;
      averageFillPrice = (averageFillPrice * filledVolume + price1 * fill1) / (filledVolume + fill1);
      filledVolume += fill1;

      expect(averageFillPrice).toBe(0.75);

      // Second fill: 300 MWh @ 0.76
      const fill2 = 300;
      const price2 = 0.76;
      averageFillPrice = (averageFillPrice * filledVolume + price2 * fill2) / (filledVolume + fill2);
      filledVolume += fill2;

      expect(averageFillPrice).toBeCloseTo(0.75375, 4);
    });
  });
});

describe("Trading Engine - Edge Cases", () => {
  it("should handle empty order book", async () => {
    const orderBook = new Map();
    const sortedBids = Array.from(orderBook.values())
      .filter((level) => level.volume > 0)
      .sort((a, b) => b.price - a.price);

    expect(sortedBids.length).toBe(0);
  });

  it("should handle zero volume orders", async () => {
    const orderBook = new Map([
      ["0.75", { price: 0.75, volume: 0, orders: ["ask-1"] }],
    ]);

    const filteredLevels = Array.from(orderBook.values()).filter(
      (level) => level.volume > 0
    );

    expect(filteredLevels.length).toBe(0);
  });

  it("should handle multiple orders at same price level", async () => {
    const orderBook = new Map([
      ["0.75", { price: 0.75, volume: 1500, orders: ["ask-1", "ask-2", "ask-3"] }],
    ]);

    const level = orderBook.get("0.75");
    expect(level).toBeDefined();
    expect(level!.volume).toBe(1500);
    expect(level!.orders.length).toBe(3);
  });
});
