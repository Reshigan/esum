'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, LayoutDashboard, TrendingUp, Leaf, Bell, Settings, LogOut, Menu, X,
  PieChart, TrendingUp as TrendUp, Download, Plus
} from 'lucide-react';

const contracts = [
  { id: 'CTR-001', instrument: 'Solar PPA - Northern Cape', type: 'physical_ppa', volume: 5000, delivered: 2500, startDate: '2024-01-01', endDate: '2029-12-31', status: 'active', value: 3750000 },
  { id: 'CTR-002', instrument: 'Wind PPA - Eastern Cape', type: 'physical_ppa', volume: 8000, delivered: 4200, startDate: '2024-02-01', endDate: '2034-01-31', status: 'active', value: 4960000 },
  { id: 'CTR-003', instrument: 'Carbon Credits - Gold Standard', type: 'carbon_credit', volume: 50000, delivered: 50000, startDate: '2024-01-15', endDate: '2024-01-15', status: 'completed', value: 9750000 },
];

export default function PortfoliosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <h1 className="text-2xl font-serif font-bold text-white">Portfolio</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:text-white transition">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
            <button className="btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              New Contract
            </button>
          </div>
        </header>

        <main className="p-6">
          {/* Portfolio summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <PieChart className="w-8 h-8 text-esum-green" />
                <span className="text-esum-green text-sm font-medium">+12.5%</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-white">R 18.5M</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendUp className="w-8 h-8 text-esum-blue" />
                <span className="text-esum-green text-sm font-medium">+8.2%</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Energy Under Contract</p>
              <p className="text-3xl font-bold text-white">18,000 MWh</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Leaf className="w-8 h-8 text-esum-gold" />
                <span className="text-esum-green text-sm font-medium">+15.3%</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Carbon Credits</p>
              <p className="text-3xl font-bold text-white">125K tCO2e</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-esum-solar" />
                <span className="text-esum-green text-sm font-medium">75%</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">Renewable Mix</p>
              <p className="text-3xl font-bold text-white">Target: 80%</p>
            </motion.div>
          </div>

          {/* Active contracts */}
          <div className="glass rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Contracts</h2>
              <Link href="/markets" className="text-esum-green hover:text-esum-green-light text-sm font-medium">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Contract ID</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Instrument</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Type</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Volume</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Delivered</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Value</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-4">
                        <span className="text-white font-mono text-sm">{contract.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">{contract.instrument}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-300 text-sm capitalize">{contract.type.replace('_', ' ')}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white font-mono">{contract.volume.toLocaleString()} MWh</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-esum-green rounded-full" 
                              style={{ width: `${(contract.delivered / contract.volume) * 100}%` }}
                            />
                          </div>
                          <span className="text-white font-mono text-sm">{contract.delivered.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white font-mono">R {(contract.value / 1000000).toFixed(2)}M</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          contract.status === 'active' 
                            ? 'bg-esum-green/20 text-esum-green'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Energy mix visualization */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Energy Mix</h3>
              <div className="space-y-4">
                {[
                  { name: 'Solar', percentage: 45, color: 'from-esum-solar to-esum-gold' },
                  { name: 'Wind', percentage: 30, color: 'from-esum-wind to-esum-blue' },
                  { name: 'Grid', percentage: 25, color: 'from-gray-400 to-gray-600' }
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">{item.name}</span>
                      <span className="text-white font-medium">{item.percentage}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Avg. Cost per MWh</span>
                  <span className="text-white font-mono">R 0.72</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Carbon Intensity</span>
                  <span className="text-white font-mono">0.26 kg/kWh</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Grid Emission Factor</span>
                  <span className="text-white font-mono">1.04 kg/kWh</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-esum-green/10 rounded-lg">
                  <span className="text-gray-300">Reduction vs Grid</span>
                  <span className="text-esum-green font-mono">-75%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
