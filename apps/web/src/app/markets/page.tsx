"use client";

import { Sidebar } from "@/components/Sidebar";

const instruments = [
  { name: "Solar PPA - Northern Cape", type: "Solar", bid: "R 0.74", ask: "R 0.76", last: "R 0.75", volume: "12.5K MWh", change: "+2.3%", up: true },
  { name: "Wind PPA - Eastern Cape", type: "Wind", bid: "R 0.61", ask: "R 0.63", last: "R 0.62", volume: "8.3K MWh", change: "-1.2%", up: false },
  { name: "Carbon Credits - Gold Standard", type: "Carbon", bid: "R 188", ask: "R 192", last: "R 190", volume: "45K tCO2e", change: "+5.8%", up: true },
  { name: "Carbon Credits - Verra VCS", type: "Carbon", bid: "R 175", ask: "R 178", last: "R 176", volume: "32K tCO2e", change: "+3.2%", up: true },
  { name: "RECs - IREC Standard", type: "REC", bid: "R 123", ask: "R 127", last: "R 125", volume: "23K MWh", change: "+1.5%", up: true },
  { name: "Baseload PPA - Gauteng", type: "Baseload", bid: "R 0.89", ask: "R 0.92", last: "R 0.90", volume: "5.2K MWh", change: "-0.8%", up: false },
];

const typeColors: Record<string, string> = {
  Solar: "bg-amber-100 text-amber-600",
  Wind: "bg-sky-100 text-sky-600",
  Carbon: "bg-green-100 text-green-600",
  REC: "bg-violet-100 text-violet-600",
  Baseload: "bg-gray-100 text-gray-600",
};

export default function MarketsPage() {
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
            <input type="text" placeholder="Search instruments..." className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 w-64 bg-white placeholder:text-gray-300" />
          </div>
        </header>

        <main className="px-8 pb-8">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                {instruments.map((inst) => (
                  <tr key={inst.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-700">{inst.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[inst.type] || "bg-gray-100 text-gray-600"}`}>{inst.type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-600">{inst.bid}</td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-600">{inst.ask}</td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono font-medium text-gray-900">{inst.last}</td>
                    <td className="py-3.5 px-4 text-right text-sm text-gray-500">{inst.volume}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`text-xs font-medium ${inst.up ? "text-green-600" : "text-red-500"}`}>{inst.change}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1D23] text-white hover:bg-gray-800 transition">Trade</button>
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
