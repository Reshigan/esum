export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  TRADE_QUEUE: Queue;
  NOTIFICATION_QUEUE: Queue;
  ORDER_BOOK: DurableObjectNamespace;
  AUCTION_MANAGER: DurableObjectNamespace;
  NEGOTIATION_ROOM: DurableObjectNamespace;
  ENVIRONMENT: string;
}
