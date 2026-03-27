"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

const tabs = ["Profile", "Organisation", "Security", "Billing", "Notifications", "Preferences"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Sidebar />
      <div className="ml-[220px]">
        <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-md px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
        </header>

        <main className="px-8 pb-8">
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab ? "bg-lime-400 text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Profile" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-white text-xl font-bold">JD</div>
                <button className="text-sm font-medium text-lime-600 border border-lime-200 px-4 py-2 rounded-xl hover:bg-lime-50 transition">Change Photo</button>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">First Name</label>
                  <input type="text" defaultValue="John" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Last Name</label>
                  <input type="text" defaultValue="Doe" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input type="email" defaultValue="john@angloamerican.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
                  <input type="tel" defaultValue="+27 82 123 4567" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button className="px-5 py-2.5 rounded-xl bg-[#1A1D23] text-white text-sm font-medium hover:bg-gray-800 transition">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "Preferences" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 max-w-xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dark Mode</p>
                    <p className="text-xs text-gray-400">Use dark theme across the platform</p>
                  </div>
                  <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
                  </div>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Trade Notifications</p>
                    <p className="text-xs text-gray-400">Receive trade and auction notifications</p>
                  </div>
                  <div className="w-10 h-6 bg-lime-400 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                  </div>
                </div>
                <div className="border-t border-gray-100" />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Default Currency</p>
                  <select className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 w-48">
                    <option>ZAR (R)</option>
                    <option>USD ($)</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button className="px-5 py-2.5 rounded-xl bg-[#1A1D23] text-white text-sm font-medium hover:bg-gray-800 transition">Save Preferences</button>
              </div>
            </div>
          )}

          {activeTab !== "Profile" && activeTab !== "Preferences" && (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="2"/></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{activeTab}</h3>
              <p className="text-sm text-gray-400">This section is coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
