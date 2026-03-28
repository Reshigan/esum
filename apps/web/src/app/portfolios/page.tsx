"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { apiClient } from "@/lib/api-client";

interface Holding {
  name: string;
  value_zar: number;
  allocation_percent: number;
  change_percent: number;
  color: string;
}

interface Contract {
  id: string;
  name: string;
  counterparty: string;
  start_date: string;
  end_date: string;
  volume: string;
  value_zar: number;
  status: string;
}

export default function PortfoliosPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState({
    total_value: 0,
    active_contracts: 0,
    monthly_revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await apiClient.getPortfolio();
        const data = response.data;
        
        setHoldings(data.holdings || []);
        setContracts(data.contracts || []);
        setStats({
          total_value: data.total_value_zar || 0,
          active_contracts: data.contracts?.filter((c: Contract) => c.status === "active").length || 0,
          monthly_revenue: data.monthly_revenue_zar || 0,
        });
      } catch (error: any) {
        showError("Failed to load portfolio data");
        console.error("Portfolio fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPortfolio();
  }, [showError]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R ${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
  };

  const defaultHoldings: Holding[] = [
    { name: "Solar PPAs", value_zar: 0, allocation_percent: 43, change_percent: 8.2, color: "bg-amber-400" },
    { name: "Wind PPAs", value_zar: 0, allocation_percent: 26, change_percent: 3.5, color: "bg-sky-400" },
    { name: "Carbon Credits", value_zar: 0, allocation_percent: 20, change_percent: 12.1, color: "bg-green-400" },
    { name: "RECs", value_zar: 0, allocation_percent: 11, change_percent: -1.8, color: "bg-violet-400" },
  ];

  const displayHoldings = holdings.length > 0 ? holdings : defaultHoldings;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your energy asset portfolio overview</p>
        </header>

        <main className="px-8 pb-8">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl p-5 border border-lime-100">
              <span className="text-xs font-medium text-gray-400">Total Portfolio Value</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.total_value)}</div>
              <div className="text-xs text-green-600 font-medium mt-1">+5.7% this month</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Active Contracts</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">{stats.active_contracts}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Monthly Revenue</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.monthly_revenue)}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">Asset Allocation</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayHoldings.map((h) => (
                  <div key={h.name} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${h.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{h.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(h.value_zar)}</span>
                          <span className={`text-xs font-medium ${h.change_percent >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {h.change_percent >= 0 ? "+" : ""}{h.change_percent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${h.color} rounded-full`} style={{ width: `${h.allocation_percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Active Contracts</h2>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Contract</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Counterparty</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Period</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length > 0 ? (
                    contracts.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-3.5 px-4 text-sm font-medium text-gray-700">{c.name}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-500">{c.counterparty}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-500">{c.start_date} - {c.end_date}</td>
                        <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-700">{c.volume}</td>
                        <td className="py-3.5 px-4 text-right text-sm font-mono font-medium text-gray-900">{formatCurrency(c.value_zar)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                        No active contracts
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
