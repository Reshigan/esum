"use client";

import { Sidebar } from "@/components/Sidebar";

const holdings = [
  { name: "Solar PPAs", value: "R 1.8M", allocation: 43, change: "+8.2%", up: true, color: "bg-amber-400" },
  { name: "Wind PPAs", value: "R 1.1M", allocation: 26, change: "+3.5%", up: true, color: "bg-sky-400" },
  { name: "Carbon Credits", value: "R 850K", allocation: 20, change: "+12.1%", up: true, color: "bg-green-400" },
  { name: "RECs", value: "R 450K", allocation: 11, change: "-1.8%", up: false, color: "bg-violet-400" },
];

const contracts = [
  { name: "Solar PPA - Northern Cape", counterparty: "Eskom SOC", startDate: "Jan 2025", endDate: "Dec 2030", volume: "500 MWh/m", value: "R 4.5M", status: "active" },
  { name: "Wind PPA - Eastern Cape", counterparty: "City of Cape Town", startDate: "Mar 2025", endDate: "Feb 2030", volume: "300 MWh/m", value: "R 2.2M", status: "active" },
  { name: "Carbon Offset Agreement", counterparty: "Sasol Ltd", startDate: "Jun 2025", endDate: "Jun 2026", volume: "10K tCO2e", value: "R 1.9M", status: "pending" },
];

export default function PortfoliosPage() {
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
              <div className="text-2xl font-bold text-gray-900 mt-2">R 4.2M</div>
              <div className="text-xs text-green-600 font-medium mt-1">+5.7% this month</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Active Contracts</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">47</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Monthly Revenue</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">R 385K</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <h2 className="font-semibold text-gray-900 mb-5">Asset Allocation</h2>
            <div className="space-y-4">
              {holdings.map((h) => (
                <div key={h.name} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${h.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{h.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">{h.value}</span>
                        <span className={`text-xs font-medium ${h.up ? "text-green-600" : "text-red-500"}`}>{h.change}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${h.color} rounded-full`} style={{ width: `${h.allocation}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Active Contracts</h2>
            </div>
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
                {contracts.map((c) => (
                  <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-700">{c.name}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">{c.counterparty}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">{c.startDate} - {c.endDate}</td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-700">{c.volume}</td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono font-medium text-gray-900">{c.value}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
