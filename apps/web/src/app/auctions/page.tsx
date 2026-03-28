"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { apiClient } from "@/lib/api-client";

interface Auction {
  id: string;
  name: string;
  auction_type: string;
  start_price: number;
  closes_at: string;
  total_bids: number;
  status: string;
  instrument_name?: string;
}

const typeColors: Record<string, string> = {
  "sealed_first_price": "bg-blue-50 text-blue-600",
  "sealed_second_price": "bg-indigo-50 text-indigo-600",
  "dutch": "bg-amber-50 text-amber-600",
  "english": "bg-violet-50 text-violet-600",
};

const formatType = (type: string) => {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function AuctionsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const response = await apiClient.getAuctions({ limit: 50 });
        setAuctions(response.data);
      } catch (error: any) {
        showError("Failed to load auctions");
        console.error("Auctions fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAuctions();
  }, [showError]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: Record<string, string> = {};
      auctions.forEach((auction) => {
        const endTime = new Date(auction.closes_at).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const days = Math.floor(hours / 24);
          
          if (days > 0) {
            newTimeLeft[auction.id] = `${days}d ${hours % 24}h`;
          } else if (hours > 0) {
            newTimeLeft[auction.id] = `${hours}h ${minutes}m`;
          } else {
            newTimeLeft[auction.id] = `${minutes}m`;
          }
        } else {
          newTimeLeft[auction.id] = "Ended";
        }
      });
      setTimeLeft(newTimeLeft);
    }, 60000);

    return () => clearInterval(timer);
  }, [auctions]);

  const formatPrice = (price: number) => {
    return `R ${price.toFixed(2)}/MWh`;
  };

  const activeCount = auctions.filter((a) => a.status === "open").length;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
            <p className="text-sm text-gray-400 mt-0.5">Browse and participate in energy auctions</p>
          </div>
          <button className="bg-[#1A1D23] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Create Auction
          </button>
        </header>

        <main className="px-8 pb-8">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl p-5 border border-lime-100">
              <span className="text-xs font-medium text-gray-400">Active Auctions</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">{activeCount}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Your Active Bids</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">-</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Won This Month</span>
              <div className="text-2xl font-bold text-green-600 mt-2">-</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Auction</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Starting Price</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Time Left</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Bids</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.length > 0 ? (
                    auctions.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-3.5 px-4">
                          <div className="text-sm font-medium text-gray-700">{a.instrument_name || a.name}</div>
                          <div className="text-xs text-gray-400">{a.id}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[a.auction_type] || "bg-gray-100 text-gray-600"}`}>
                            {formatType(a.auction_type)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-700">{formatPrice(a.start_price)}</td>
                        <td className="py-3.5 px-4 text-center text-sm text-gray-500">{timeLeft[a.id] || "-"}</td>
                        <td className="py-3.5 px-4 text-center text-sm font-medium text-gray-700">{a.total_bids}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === "open" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button 
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                              a.status === "open" 
                                ? "bg-[#1A1D23] text-white hover:bg-gray-800" 
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {a.status === "open" ? "Place Bid" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                        No auctions available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
