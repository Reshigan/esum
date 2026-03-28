"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

interface DashboardStats {
  totalEnergyTraded: number;
  carbonCredits: number;
  activeContracts: number;
  portfolioValue: number;
}

interface Trade {
  id: string;
  instrument_name: string;
  type: "buy" | "sell";
  volume_mwh: number;
  unit_price_zar: number;
  total_value_zar: number;
  created_at: string;
  status: string;
}

interface MarketItem {
  name: string;
  type: string;
  price: number;
  change_24h: number;
  up: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEnergyTraded: 0,
    carbonCredits: 0,
    activeContracts: 0,
    portfolioValue: 0,
  });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [marketOverview, setMarketOverview] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      setError(null);

      const tradesResponse = await fetch("/api/v1/trades", { headers });
      if (!tradesResponse.ok) throw new Error("Failed to fetch trades");
      const tradesData = await tradesResponse.json();
      const trades = tradesData.data || [];
      setRecentTrades(trades.slice(0, 5));

      const totalVolume = trades.reduce((sum: number, t: any) => sum + (t.volume_mwh || 0), 0);
      const totalValue = trades.reduce((sum: number, t: any) => sum + (t.total_value_zar || 0), 0);

      const contractsResponse = await fetch("/api/v1/contracts?status=active", { headers });
      const contractsData = contractsResponse.ok ? await contractsResponse.json() : { data: [] };
      const activeContracts = contractsData.data?.length || 0;

      const carbonResponse = await fetch("/api/v1/carbon/credits", { headers });
      const carbonData = carbonResponse.ok ? await carbonResponse.json() : { data: [] };
      const carbonCredits = carbonData.data?.length || 0;

      const instrumentsResponse = await fetch("/api/v1/instruments?status=active");
      const instrumentsData = instrumentsResponse.ok ? await instrumentsResponse.json() : { data: [] };
      const instruments = instrumentsData.data || [];

      setStats({
        totalEnergyTraded: totalVolume,
        carbonCredits: carbonCredits,
        activeContracts: activeContracts,
        portfolioValue: totalValue,
      });

      setMarketOverview(
        instruments.slice(0, 4).map((inst: any) => ({
          name: inst.name,
          type: inst.type,
          price: inst.unit_price_zar || 0,
          change_24h: (Math.random() - 0.5) * 10,
          up: Math.random() > 0.5,
        }))
      );

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome back! Here's your trading overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition relative">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14 6A5 5 0 004 6c0 5.25 3 7 5 7s5-1.75 5-7z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 13v.5a2 2 0 004 0V13" stroke="currentColor" strokeWidth="1.5"/></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
          </div>
        </header>

        <main className="px-8 pb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 font-medium">Error loading data</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchDashboardData} className="mt-2 text-sm text-red-700 underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-4 gap-4 mb-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Total Energy Traded</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">+12.5%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalEnergyTraded.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">MWh</span></div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Carbon Credits</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">+8.2%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.carbonCredits.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">tCO2e</span></div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Active Contracts</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">+3</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeContracts}<span className="text-sm font-normal text-gray-400 ml-1"></span></div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Portfolio Value</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">+5.7%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">R {(stats.portfolioValue / 1000000).toFixed(1)}M<span className="text-sm font-normal text-gray-400 ml-1"></span></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Market Overview</h2>
                <Link href="/markets" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition">View All →</Link>
              </div>
              <div className="space-y-3">
                {marketOverview.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-green-100 text-green-600">{item.name.charAt(0)}</div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">R {item.price.toFixed(2)}</div>
                      <div className={`text-xs ${item.up ? "text-green-600" : "text-red-600"}`}>
                        {item.up ? "+" : ""}{item.change_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Recent Trades</h2>
                <Link href="/markets" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition">View All →</Link>
              </div>
              <div className="space-y-3">
                {recentTrades.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recent trades</p>
                ) : (
                  recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{trade.instrument_name}</p>
                        <p className="text-xs text-gray-500">{new Date(trade.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.type === 'buy' ? 'BUY' : 'SELL'}
                        </p>
                        <p className="text-xs text-gray-600">{trade.volume_mwh} MWh @ R {trade.unit_price_zar.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
