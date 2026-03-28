"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

interface Instrument {
  id: string;
  name: string;
  type: string;
  bid_price: number;
  ask_price: number;
  last_price: number;
  volume: number;
  change_percent: number;
}

interface OrderBookLevel {
  price: number;
  volume: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

const typeColors: Record<string, string> = {
  Solar: "bg-amber-100 text-amber-600",
  Wind: "bg-sky-100 text-sky-600",
  Carbon: "bg-green-100 text-green-600",
  REC: "bg-violet-100 text-violet-600",
  Baseload: "bg-gray-100 text-gray-600",
};

export default function MarketsPage() {
  const { showSuccess, showError } = useToast();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrderBook, setIsLoadingOrderBook] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const response = await apiClient.getInstruments({ limit: 50 });
        setInstruments(response.data);
      } catch (error: any) {
        showError("Failed to load market data");
        console.error("Markets fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInstruments();
  }, [showError]);

  const loadOrderBook = async (instrument: Instrument) => {
    setIsLoadingOrderBook(true);
    setSelectedInstrument(instrument);
    try {
      const response = await apiClient.getOrderBook(instrument.id);
      setOrderBook(response.data);
    } catch (error: any) {
      showError("Failed to load order book");
      console.error("Order book fetch error:", error);
    } finally {
      setIsLoadingOrderBook(false);
    }
  };

  const formatPrice = (price: number) => {
    return `R ${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const filteredInstruments = instruments.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Energy Markets</h1>
            <p className="text-sm text-gray-400 mt-0.5">Live market data and order book</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <input 
              type="text" 
              placeholder="Search instruments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 w-64 bg-white placeholder:text-gray-300" 
            />
          </div>
        </header>

        <main className="px-8 pb-8">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Instrument</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Bid</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Ask</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Last</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstruments.length > 0 ? (
                      filteredInstruments.map((inst) => (
                        <tr key={inst.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${selectedInstrument?.id === inst.id ? 'bg-lime-50' : ''}`}>
                          <td className="py-3.5 px-4 text-sm font-medium text-gray-700">{inst.name}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[inst.type] || "bg-gray-100 text-gray-600"}`}>{inst.type}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-600">{formatPrice(inst.bid_price)}</td>
                          <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-600">{formatPrice(inst.ask_price)}</td>
                          <td className="py-3.5 px-4 text-right text-sm font-mono font-medium text-gray-900">{formatPrice(inst.last_price)}</td>
                          <td className="py-3.5 px-4 text-right text-sm text-gray-500">{formatVolume(inst.volume)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`text-xs font-medium ${inst.change_percent >= 0 ? "text-green-600" : "text-red-500"}`}>
                              {inst.change_percent >= 0 ? "+" : ""}{inst.change_percent.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button 
                              onClick={() => loadOrderBook(inst)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1D23] text-white hover:bg-gray-800 transition"
                            >
                              Trade
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                          {searchQuery ? "No instruments found" : "No market data available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Order Book</h3>
                {selectedInstrument && (
                  <span className="text-xs text-gray-400">{selectedInstrument.name}</span>
                )}
              </div>

              {isLoadingOrderBook ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : orderBook ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-2 flex justify-between">
                      <span>Ask</span>
                      <span>Volume</span>
                    </div>
                    <div className="space-y-1">
                      {orderBook.asks.slice(0, 5).reverse().map((ask, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          <div className="flex-1 flex items-center justify-end gap-2">
                            <span className="text-red-600 font-mono">{formatPrice(ask.price)}</span>
                            <span className="text-gray-600 w-12 text-right">{formatVolume(ask.volume)}</span>
                          </div>
                          <div className="w-24 h-4 bg-red-50 rounded ml-2 relative overflow-hidden">
                            <div className="absolute right-0 top-0 h-full bg-red-100" style={{ width: `${Math.min(ask.volume / orderBook.asks[0]?.volume * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="py-2 border-y border-gray-100">
                    <div className="text-lg font-bold text-gray-900 text-center">
                      {selectedInstrument ? formatPrice(selectedInstrument.last_price) : "-"}
                    </div>
                    <div className="text-xs text-gray-400 text-center">Last Price</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-2 flex justify-between">
                      <span>Bid</span>
                      <span>Volume</span>
                    </div>
                    <div className="space-y-1">
                      {orderBook.bids.slice(0, 5).map((bid, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          <div className="w-24 h-4 bg-green-50 rounded mr-2 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-green-100" style={{ width: `${Math.min(bid.volume / orderBook.bids[0]?.volume * 100, 100)}%` }} />
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-green-600 font-mono">{formatPrice(bid.price)}</span>
                            <span className="text-gray-600 w-12 text-right">{formatVolume(bid.volume)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  Select an instrument to view order book
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
