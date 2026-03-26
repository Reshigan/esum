'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, LayoutDashboard, TrendingUp, Leaf, Bell, Settings, LogOut, Menu, X,
  Plus, Filter, ArrowUpRight, ArrowDownRight, Certificate, TreePine, Factory, Droplets
} from 'lucide-react';

const carbonCredits = [
  { id: 1, project: 'Limpopo Afforestation', standard: 'gold_standard', vintage: 2024, quantity: 50000, price: 195, status: 'available' },
  { id: 2, project: 'Eastern Cape Wind Farm', standard: 'verra_vcs', vintage: 2023, quantity: 35000, price: 185, status: 'available' },
  { id: 3, project: 'KZN Biogas Project', standard: 'cdm', vintage: 2024, quantity: 25000, price: 175, status: 'available' },
  { id: 4, project: 'SA Clean Cookstoves', standard: 'sa_national', vintage: 2025, quantity: 15000, price: 200, status: 'available' },
];

const portfolio = {
  totalCredits: 125000,
  retiredCredits: 45000,
  availableCredits: 80000,
  totalValue: 24375000,
  avoidedEmissions: 125000
};

export default function CarbonPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const standardIcons: Record<string, any> = {
    gold_standard: Certificate,
    verra_vcs: TreePine,
    cdm: Factory,
    sa_national: Droplets
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-esum-navy dark:to-gray-900">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 glass border-r border-white/10 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-esum-green" />
            <span className="text-xl font-serif font-bold text-white">ESUM</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Markets', href: '/markets', icon: TrendingUp },
            { name: 'Carbon', href: '/carbon', icon: Leaf },
            { name: 'Auctions', href: '/auctions', icon: Zap },
            { name: 'Portfolio', href: '/portfolios', icon: Zap },
            { name: 'Settings', href: '/settings', icon: Settings },
          ].map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition">
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-20 glass border-b border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-serif font-bold text-white">Carbon Credits</h1>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Register Credits
          </button>
        </header>

        <main className="p-6">
          {/* Portfolio summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Total Credits</p>
              <p className="text-3xl font-bold text-white">{portfolio.totalCredits.toLocaleString()}</p>
              <p className="text-esum-green text-sm mt-1">tCO2e</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Available</p>
              <p className="text-3xl font-bold text-white">{portfolio.availableCredits.toLocaleString()}</p>
              <p className="text-esum-green text-sm mt-1">tCO2e</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Retired</p>
              <p className="text-3xl font-bold text-white">{portfolio.retiredCredits.toLocaleString()}</p>
              <p className="text-esum-green text-sm mt-1">tCO2e</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Portfolio Value</p>
              <p className="text-3xl font-bold text-white">R {(portfolio.totalValue / 1000000).toFixed(2)}M</p>
            </motion.div>
          </div>

          {/* Available credits */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Available Carbon Credits</h2>
              <button className="flex items-center px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:text-white transition">
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Project</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Standard</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Vintage</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Quantity</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Price</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carbonCredits.map((credit, index) => {
                    const StandardIcon = standardIcons[credit.standard] || Certificate;
                    
                    return (
                      <tr key={credit.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-esum-green/20 flex items-center justify-center">
                              <StandardIcon className="w-5 h-5 text-esum-green" />
                            </div>
                            <span className="text-white font-medium">{credit.project}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300 text-sm capitalize">{credit.standard.replace('_', ' ')}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-white font-medium">{credit.vintage}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-white font-mono">{credit.quantity.toLocaleString()} tCO2e</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-white font-mono">R {credit.price}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-3 py-1 bg-esum-green/20 text-esum-green text-xs font-medium rounded-full">
                            {credit.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="px-3 py-1 bg-esum-green/20 text-esum-green text-sm font-medium rounded hover:bg-esum-green/30 transition">
                              Buy
                            </button>
                            <button className="px-3 py-1 bg-white/10 text-white text-sm font-medium rounded hover:bg-white/20 transition">
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carbon impact */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Carbon Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Avoided Emissions</span>
                  <span className="text-white font-medium">{portfolio.avoidedEmissions.toLocaleString()} tCO2e</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Equivalent Trees Planted</span>
                  <span className="text-white font-medium">{(portfolio.avoidedEmissions * 20).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Equivalent Cars Off Road</span>
                  <span className="text-white font-medium">{Math.round(portfolio.avoidedEmissions / 4.6).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tax Benefits</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Carbon Tax Rate</span>
                  <span className="text-white font-medium">R 190 / tCO2e</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Potential Offset Savings</span>
                  <span className="text-esum-green font-medium">R {(portfolio.retiredCredits * 190).toLocaleString()}</span>
                </div>
                <div className="p-4 bg-esum-green/10 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    By retiring {portfolio.retiredCredits.toLocaleString()} tCO2e, you've offset R {(portfolio.retiredCredits * 190).toLocaleString()} in carbon tax liability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
