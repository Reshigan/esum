"use client";

import { Sidebar } from "@/components/Sidebar";

const auctions = [
  { id: "AUC-001", name: "Solar PPA Bundle - 500MW", type: "Sealed Bid", startPrice: "R 0.70/MWh", endTime: "2h 45m", bids: 12, status: "active" },
  { id: "AUC-002", name: "Wind Credits - Gold Standard", type: "Dutch", startPrice: "R 195/tCO2e", endTime: "5h 20m", bids: 8, status: "active" },
  { id: "AUC-003", name: "REC Bundle Q2 2026", type: "English", startPrice: "R 120/MWh", endTime: "1d 3h", bids: 15, status: "active" },
  { id: "AUC-004", name: "Baseload PPA - Mpumalanga", type: "Sealed Bid", startPrice: "R 0.85/MWh", endTime: "Ended", bids: 22, status: "completed" },
  { id: "AUC-005", name: "Carbon Offset Portfolio", type: "English", startPrice: "R 2.1M", endTime: "Ended", bids: 18, status: "completed" },
];

const typeColors: Record<string, string> = {
  "Sealed Bid": "bg-blue-50 text-blue-600",
  "Dutch": "bg-amber-50 text-amber-600",
  "English": "bg-violet-50 text-violet-600",
};

export default function AuctionsPage() {
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
              <div className="text-2xl font-bold text-gray-900 mt-2">3</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Your Active Bids</span>
              <div className="text-2xl font-bold text-gray-900 mt-2">7</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">Won This Month</span>
              <div className="text-2xl font-bold text-green-600 mt-2">2</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                {auctions.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="text-sm font-medium text-gray-700">{a.name}</div>
                      <div className="text-xs text-gray-400">{a.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[a.type] || "bg-gray-100 text-gray-600"}`}>{a.type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-sm font-mono text-gray-700">{a.startPrice}</td>
                    <td className="py-3.5 px-4 text-center text-sm text-gray-500">{a.endTime}</td>
                    <td className="py-3.5 px-4 text-center text-sm font-medium text-gray-700">{a.bids}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>{a.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${a.status === "active" ? "bg-[#1A1D23] text-white hover:bg-gray-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        {a.status === "active" ? "Place Bid" : "View"}
                      </button>
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
