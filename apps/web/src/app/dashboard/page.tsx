"use client";

import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

const stats = [
  { name: "Total Energy Traded", value: "2,450", unit: "MWh", change: "+12.5%", up: true },
  { name: "Carbon Credits", value: "1,890", unit: "tCO2e", change: "+8.2%", up: true },
  { name: "Active Contracts", value: "47", unit: "", change: "+3", up: true },
  { name: "Portfolio Value", value: "R 4.2M", unit: "", change: "+5.7%", up: true },
];

const recentTrades = [
  { id: 1, instrument: "Solar PPA - Northern Cape", type: "buy", volume: "500 MWh", price: "R 0.75", time: "2 min ago", status: "completed" },
  { id: 2, instrument: "Wind PPA - Eastern Cape", type: "sell", volume: "300 MWh", price: "R 0.62", time: "15 min ago", status: "completed" },
  { id: 3, instrument: "Carbon Credits - Gold Standard", type: "buy", volume: "100 tCO2e", price: "R 190", time: "1 hour ago", status: "pending" },
  { id: 4, instrument: "REC Batch #234", type: "buy", volume: "200 MWh", price: "R 125", time: "2 hours ago", status: "completed" },
];

const marketOverview = [
  { name: "Solar PPA", price: "R 0.75/MWh", change: "+2.3%", up: true, color: "bg-amber-100 text-amber-600" },
  { name: "Wind PPA", price: "R 0.62/MWh", change: "-1.2%", up: false, color: "bg-sky-100 text-sky-600" },
  { name: "Carbon Credits", price: "R 190/tCO2e", change: "+5.8%", up: true, color: "bg-green-100 text-green-600" },
  { name: "RECs", price: "R 125/MWh", change: "+1.5%", up: true, color: "bg-violet-100 text-violet-600" },
];

const energyMix = [
  { name: "Solar", pct: 45, color: "bg-amber-400" },
  { name: "Wind", pct: 30, color: "bg-sky-400" },
  { name: "Grid", pct: 25, color: "bg-gray-400" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome back! Here&apos;s your trading overview.</p>
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
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">{s.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{s.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{s.value}<span className="text-sm font-normal text-gray-400 ml-1">{s.unit}</span></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Market Overview</h2>
                <Link href="/markets" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition">View All &rarr;</Link>
              </div>
              <div className="space-y-3">
                {marketOverview.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${item.color}`}>{item.name.charAt(0)}</div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono font-medium text-gray-900">{item.price}</span>
                      <span className={`text-xs font-medium ${item.up ? "text-green-600" : "text-red-500"}`}>{item.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-5">Your Energy Mix</h2>
              <div className="space-y-4">
                {energyMix.map((e) => (
                  <div key={e.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-500">{e.name}</span>
                      <span className="text-sm font-medium text-gray-900">{e.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${e.color} rounded-full`} style={{ width: `${e.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-400">Renewable Target</span>
                  <span className="text-sm font-medium text-green-600">75% / 80%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-400 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Recent Trades</h2>
              <Link href="/markets" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition">View All &rarr;</Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Instrument</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                  <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="text-center py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-3 text-sm font-medium text-gray-700">{t.instrument}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.type === "buy" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{t.type.toUpperCase()}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-mono text-gray-700">{t.volume}</td>
                    <td className="py-3 px-3 text-right text-sm font-mono text-gray-700">{t.price}</td>
                    <td className="py-3 px-3 text-sm text-gray-400">{t.time}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === "completed" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>{t.status}</span>
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
