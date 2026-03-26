'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, LayoutDashboard, TrendingUp, Leaf, Bell, Settings, LogOut, Menu, X,
  Clock, AlertCircle, CheckCircle
} from 'lucide-react';

const auctions = [
  { id: 1, instrument: 'Solar PPA - 50MW Northern Cape', type: 'sealed_first_price', volume: 5000, reservePrice: 0.70, currentBid: 0.73, bids: 12, opensAt: '2024-03-28T09:00:00', closesAt: '2024-03-28T17:00:00', status: 'open' },
  { id: 2, instrument: 'Wind PPA - 100MW Eastern Cape', type: 'sealed_second_price', volume: 10000, reservePrice: 0.55, currentBid: 0.58, bids: 8, opensAt: '2024-03-29T09:00:00', closesAt: '2024-03-29T17:00:00', status: 'scheduled' },
  { id: 3, instrument: 'Carbon Credits - 25K tCO2e', type: 'english', volume: 25000, reservePrice: 180, currentBid: 192, bids: 23, opensAt: '2024-03-27T10:00:00', closesAt: '2024-03-27T16:00:00', status: 'open' },
];

export default function AuctionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-esum-green/20 text-esum-green';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-500';
      case 'closed': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
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
            <h1 className="text-2xl font-serif font-bold text-white">Auctions</h1>
          </div>
          <button className="btn-primary flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Create Auction
          </button>
        </header>

        <main className="p-6">
          {/* Auction info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-esum-green" />
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <p className="text-gray-400">Active Auctions</p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-white">5</span>
              </div>
              <p className="text-gray-400">Scheduled This Week</p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-esum-blue" />
                <span className="text-2xl font-bold text-white">12</span>
              </div>
              <p className="text-gray-400">Completed This Month</p>
            </div>
          </div>

          {/* Auctions list */}
          <div className="space-y-6">
            {auctions.map((auction, index) => (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-xl font-semibold text-white">{auction.instrument}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(auction.status)}`}>
                        {auction.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Auction Type</p>
                        <p className="text-white font-medium capitalize">{auction.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Volume</p>
                        <p className="text-white font-medium">{auction.volume.toLocaleString()} MWh</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Reserve Price</p>
                        <p className="text-white font-medium">R {auction.reservePrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Current Bid</p>
                        <p className="text-esum-green font-medium">R {auction.currentBid}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-4">
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Bids Received</p>
                      <p className="text-2xl font-bold text-white">{auction.bids}</p>
                    </div>
                    
                    {auction.status === 'open' && (
                      <div className="flex space-x-3">
                        <button className="btn-primary px-6 py-2">
                          Place Bid
                        </button>
                        <button className="btn-secondary px-6 py-2">
                          Details
                        </button>
                      </div>
                    )}
                    
                    {auction.status === 'scheduled' && (
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Opens In</p>
                        <p className="text-white font-medium">2 days</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar for open auctions */}
                {auction.status === 'open' && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Time Remaining</span>
                      <span className="text-esum-green font-medium">6 hours</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[75%] bg-gradient-to-r from-esum-green to-esum-green-light rounded-full" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Auction types info */}
          <div className="mt-8 glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Auction Types</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Sealed First Price', desc: 'Highest bidder wins at their bid price' },
                { name: 'Sealed Second Price', desc: 'Highest bidder wins at second-highest price' },
                { name: 'Dutch', desc: 'Price starts high and decreases until bid' },
                { name: 'English', desc: 'Open ascending price auction' }
              ].map((type) => (
                <div key={type.name} className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">{type.name}</h3>
                  <p className="text-gray-400 text-sm">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
