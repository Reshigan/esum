"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { apiClient } from "@/lib/api-client";

interface CarbonCredit {
  id: string;
  project_name: string;
  standard: string;
  vintage: string;
  quantity_tco2e: number;
  price_zar: number;
  status: string;
}

const standardColors: Record<string, string> = {
  "gold_standard": "bg-amber-100 text-amber-600",
  "verra_vcs": "bg-green-100 text-green-600",
  "cdm": "bg-blue-100 text-blue-600",
  "sa_national": "bg-violet-100 text-violet-600",
};

const formatStandard = (standard: string) => {
  return standard.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function CarbonPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_credits: 0,
    available_credits: 0,
    retired_credits: 0,
    portfolio_value: 0,
  });

  useEffect(() => {
    async function fetchCarbonCredits() {
      try {
        const response = await apiClient.getCarbonCredits({ limit: 50 });
        setCredits(response.data);
        
        // Calculate stats
        const total = response.data.reduce((sum: number, c: CarbonCredit) => sum + c.quantity_tco2e, 0);
        const available = response.data.filter((c: CarbonCredit) => c.status === "available").reduce((sum: number, c: CarbonCredit) => sum + c.quantity_tco2e, 0);
        const retired = response.data.filter((c: CarbonCredit) => c.status === "retired").reduce((sum: number, c: CarbonCredit) => sum + c.quantity_tco2e, 0);
        const value = response.data.filter((c: CarbonCredit) => c.status === "available").reduce((sum: number, c: CarbonCredit) => sum + (c.quantity_tco2e * c.price_zar), 0);
        
        setStats({
          total_credits: total,
          available_credits: available,
          retired_credits: retired,
          portfolio_value: value,
        });
      } catch (error: any) {
        showError("Failed to load carbon credits");
        console.error("Carbon credits fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCarbonCredits();
  }, [showError]);

  const formatPrice = (price: number) => {
    return `R ${price.toFixed(0)}`;
  };

  const formatQuantity = (qty: number) => {
    return new Intl.NumberFormat("en-ZA").format(qty);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R ${(value / 1000000).toFixed(2)}M`;
    }
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
  };

  const handleRetireCredits = async (creditId: string) => {
    try {
      await apiClient.retireCarbonCredits({ credit_ids: [creditId], beneficiary: organisation?.name });
      showSuccess("Credits retired successfully");
      // Refresh data
      const response = await apiClient.getCarbonCredits({ limit: 50 });
      setCredits(response.data);
    } catch (error: any) {
      showError("Failed to retire credits");
      console.error("Retire error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carbon Credits</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your carbon credit portfolio</p>
          </div>
          <button className="bg-[#1A1D23] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Register Credits
          </button>
        </header>

        <main className="px-8 pb-8">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl p-5 border border-lime-100">
              <span className="text-xs font-medium text-gray-400">Total Credits</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {formatQuantity(stats.total_credits)}
                <span className="text-sm font-normal text-gray-400 ml-1">tCO2e</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Available</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {formatQuantity(stats.available_credits)}
                <span className="text-sm font-normal text-gray-400 ml-1">tCO2e</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Retired</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {formatQuantity(stats.retired_credits)}
                <span className="text-sm font-normal text-gray-400 ml-1">tCO2e</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Portfolio Value</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.portfolio_value)}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Carbon Marketplace</h2>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Standard</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Vintage</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.length > 0 ? (
                    credits.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-3.5 px-4 text-sm font-medium text-gray-700">{c.project_name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${standardColors[c.standard] || "bg-gray-100 text-gray-600"}`}>
                            {formatStandard(c.standard)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-500">{c.vintage}</td>
                        <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-700">{formatQuantity(c.quantity_tco2e)}</td>
                        <td className="py-3.5 px-4 text-right text-sm font-mono font-medium text-gray-900">{formatPrice(c.price_zar)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === "available" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {c.status === "available" ? (
                            <button 
                              onClick={() => handleRetireCredits(c.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1D23] text-white hover:bg-gray-800 transition"
                            >
                              Retire
                            </button>
                          ) : (
                            <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                        No carbon credits available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Environmental Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Avoided Emissions</span>
                  <span className="text-sm font-medium text-gray-900">{formatQuantity(stats.total_credits)} tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Equivalent Trees Planted</span>
                  <span className="text-sm font-medium text-gray-900">{formatQuantity(Math.round(stats.total_credits * 46.7))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Equivalent Cars Off Road</span>
                  <span className="text-sm font-medium text-gray-900">{formatQuantity(Math.round(stats.total_credits * 0.217))}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Carbon Tax Savings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Carbon Tax Rate</span>
                  <span className="text-sm font-medium text-gray-900">R 190/tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Potential Offset Savings</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(stats.retired_credits * 190)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-lime-50 border border-lime-100">
                <p className="text-xs text-gray-600">
                  By retiring {formatQuantity(stats.retired_credits)} tCO2e, you&apos;ve offset {formatCurrency(stats.retired_credits * 190)} in carbon tax liability.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
