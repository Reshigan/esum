'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  LayoutDashboard, 
  TrendingUp, 
  Leaf, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Sun,
  Wind,
  Battery,
  Factory
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Carbon', href: '/carbon', icon: Leaf },
  { name: 'Auctions', href: '/auctions', icon: Activity },
  { name: 'Portfolio', href: '/portfolios', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const stats = [
  { name: 'Total Energy Traded', value: '2,450 MWh', change: '+12.5%', trend: 'up' },
  { name: 'Carbon Credits', value: '1,890 tCO2e', change: '+8.2%', trend: 'up' },
  { name: 'Active Contracts', value: '47', change: '+3', trend: 'up' },
  { name: 'Portfolio Value', value: 'R 4.2M', change: '+5.7%', trend: 'up' },
];

const recentTrades = [
  { id: 1, instrument: 'Solar PPA - Northern Cape', type: 'buy', volume: 500, price: 0.75, time: '2 min ago', status: 'completed' },
  { id: 2, instrument: 'Wind PPA - Eastern Cape', type: 'sell', volume: 300, price: 0.62, time: '15 min ago', status: 'completed' },
  { id: 3, instrument: 'Carbon Credits - Gold Standard', type: 'buy', volume: 100, price: 190, time: '1 hour ago', status: 'pending' },
  { id: 4, instrument: 'REC Batch #234', type: 'buy', volume: 200, price: 125, time: '2 hours ago', status: 'completed' },
];

const marketOverview = [
  { name: 'Solar PPA', price: 0.75, change: 2.3, volume: '12.5K MWh' },
  { name: 'Wind PPA', price: 0.62, change: -1.2, volume: '8.3K MWh' },
  { name: 'Carbon Credits', price: 190, change: 5.8, volume: '45K tCO2e' },
  { name: 'RECs', price: 125, change: 1.5, volume: '23K MWh' },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-esum-navy dark:to-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 glass border-r border-white/10
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-esum-green" />
            <span className="text-xl font-serif font-bold text-white">ESUM</span>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition group"
            >
              <item.icon className="w-5 h-5 mr-3 group-hover:text-esum-green transition" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-esum-green to-esum-blue flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div>
              <p className="text-white font-medium">John Doe</p>
              <p className="text-gray-400 text-sm">Anglo American</p>
            </div>
          </div>
          <button className="flex items-center w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-20 glass border-b border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className={`relative transition-all duration-300 ${searchOpen ? 'w-96' : 'w-64'}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search instruments, contracts..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-esum-green focus:ring-1 focus:ring-esum-green transition"
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-esum-green rounded-full" />
              </button>
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium">John Doe</p>
                <p className="text-gray-400 text-sm">Trader</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your trading overview.</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 card-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">{stat.name}</p>
                  <span className={`flex items-center text-sm font-medium ${
                    stat.trend === 'up' ? 'text-esum-green' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Market overview */}
            <div className="lg:col-span-2 glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Market Overview</h2>
                <Link href="/markets" className="text-esum-green hover:text-esum-green-light text-sm font-medium">
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {marketOverview.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.name.includes('Solar') ? 'bg-esum-solar/20' :
                        item.name.includes('Wind') ? 'bg-esum-wind/20' :
                        item.name.includes('Carbon') ? 'bg-esum-gold/20' : 'bg-esum-blue/20'
                      }`}>
                        {item.name.includes('Solar') ? <Sun className="w-5 h-5 text-esum-solar" /> :
                         item.name.includes('Wind') ? <Wind className="w-5 h-5 text-esum-wind" /> :
                         item.name.includes('Carbon') ? <Leaf className="w-5 h-5 text-esum-gold" /> : <Battery className="w-5 h-5 text-esum-blue" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">Vol: {item.volume}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono font-medium">
                        {item.name.includes('Carbon') ? 'R ' : 'R '}{item.price}
                        {item.name.includes('Carbon') ? '/tCO2e' : '/MWh'}
                      </p>
                      <p className={`text-sm font-medium ${
                        item.change >= 0 ? 'text-esum-green' : 'text-red-500'
                      }`}>
                        {item.change >= 0 ? '+' : ''}{item.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Energy mix */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Your Energy Mix</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sun className="w-5 h-5 text-esum-solar" />
                    <span className="text-gray-300">Solar</span>
                  </div>
                  <span className="text-white font-medium">45%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-gradient-to-r from-esum-solar to-esum-gold rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wind className="w-5 h-5 text-esum-wind" />
                    <span className="text-gray-300">Wind</span>
                  </div>
                  <span className="text-white font-medium">30%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[30%] bg-gradient-to-r from-esum-wind to-esum-blue rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Factory className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Grid</span>
                  </div>
                  <span className="text-white font-medium">25%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[25%] bg-gradient-to-r from-gray-400 to-gray-600 rounded-full" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Renewable Target</span>
                  <span className="text-esum-green font-medium">75% / 80%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-gradient-to-r from-esum-green to-esum-green-light rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent trades */}
          <div className="mt-6 glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
              <Link href="/markets" className="text-esum-green hover:text-esum-green-light text-sm font-medium">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Instrument</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Type</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Volume</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Price</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Time</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">{trade.instrument}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.type === 'buy' 
                            ? 'bg-esum-green/20 text-esum-green' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-white font-mono">
                        {trade.volume} MWh
                      </td>
                      <td className="py-4 px-4 text-right text-white font-mono">
                        R {trade.price}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {trade.time}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trade.status === 'completed'
                            ? 'bg-esum-green/20 text-esum-green'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
