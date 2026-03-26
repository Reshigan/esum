"use client";

import { Sidebar } from "@/components/Sidebar";

const credits = [
  { project: "Cookhouse Wind Farm", standard: "Gold Standard", vintage: "2025", qty: "15,000", price: "R 190", status: "available" },
  { project: "De Aar Solar", standard: "Verra VCS", vintage: "2025", qty: "10,000", price: "R 176", status: "available" },
  { project: "Sasol CDM Project", standard: "CDM", vintage: "2024", qty: "7,500", price: "R 165", status: "available" },
  { project: "SA National Carbon", standard: "SA National", vintage: "2025", qty: "12,500", price: "R 155", status: "retired" },
];

const standardColors: Record<string, string> = {
  "Gold Standard": "bg-amber-100 text-amber-600",
  "Verra VCS": "bg-green-100 text-green-600",
  "CDM": "bg-blue-100 text-blue-600",
  "SA National": "bg-violet-100 text-violet-600",
};

export default function CarbonPage() {
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
              <div className="text-2xl font-bold text-gray-900 mt-2">45,000<span className="text-sm font-normal text-gray-400 ml-1">tCO2e</span></div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Available</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">32,500<span className="text-sm font-normal text-gray-400 ml-1">tCO2e</span></div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Retired</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">12,500<span className="text-sm font-normal text-gray-400 ml-1">tCO2e</span></div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Portfolio Value</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">R 8.55M</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Carbon Marketplace</h2>
            </div>
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
                {credits.map((c) => (
                  <tr key={c.project} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-700">{c.project}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${standardColors[c.standard] || "bg-gray-100 text-gray-600"}`}>{c.standard}</span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">{c.vintage}</td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-700">{c.qty}</td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono font-medium text-gray-900">{c.price}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === "available" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1D23] text-white hover:bg-gray-800 transition">{c.status === "available" ? "Buy" : "View"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Environmental Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-400">Total Avoided Emissions</span><span className="text-sm font-medium text-gray-900">45,000 tCO2e</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-400">Equivalent Trees Planted</span><span className="text-sm font-medium text-gray-900">2.1M</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-400">Equivalent Cars Off Road</span><span className="text-sm font-medium text-gray-900">9,783</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Carbon Tax Savings</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-400">Carbon Tax Rate</span><span className="text-sm font-medium text-gray-900">R 190/tCO2e</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-400">Potential Offset Savings</span><span className="text-sm font-bold text-green-600">R 8,550,000</span></div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-lime-50 border border-lime-100">
                <p className="text-xs text-gray-600">By retiring 45,000 tCO2e, you&apos;ve offset R 8,550,000 in carbon tax liability.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
