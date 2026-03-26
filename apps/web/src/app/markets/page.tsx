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
  Plus,
  Filter,
  Sun,
  Wind,
  Battery,
  Droplets,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const instruments = [
  { id: 1, name: 'Solar PPA - Northern Cape', type: 'physical_ppa', source: 'solar', price: 0.75, volume: 5000, seller: 'SolarCo Energy', status: 'active' },
  { id: 2, name: 'Wind PPA - Eastern Cape', type: 'physical_ppa', source: 'wind', price: 0.62, volume: 8000, seller: 'WindForce Power', status: 'active' },
  { id: 3, name: 'Carbon Credits - Gold Standard', type: 'carbon_credit', source: 'carbon', price: 190, volume: 10000, seller: 'SA Carbon Fund', status: 'active' },
  { id: 4, name: 'REC Batch #234', type: 'rec', source: 'solar', price: 125, volume: 2000, seller: 'GreenGen Renewables', status: 'active' },
  { id: 5, name: 'Bundled Green Contract', type: 'bundled_green', source: 'mixed', price: 0.85, volume: 3000, seller: 'AfriSun Solar', status: 'active' },
  { id: 6, name: 'Virtual PPA - 5 Year', type: 'virtual_ppa', source: 'wind', price: 0.68, volume: 6000, seller: 'Cape Wind Farms', status: 'active' },
];

const sourceIcons: Record<string, any> = {
  solar: Sun,
  wind: Wind,
  carbon: Leaf,
  battery: Battery,
  hydro: Droplets,
  mixed: Zap
};

export default function MarketsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredInstruments = selectedType === 'all' 
    ? instruments 
    : instruments.filter(i => i.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-esum-navy dark:to-gray-900">
      {/* Sidebar - same as dashboard */}
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
            <h1 className="text-2xl font-serif font-bold text-white">Markets</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              List Instrument
            </button>
          </div>
        </header>

        <main className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
              {['all', 'physical_ppa', 'virtual_ppa', 'rec', 'carbon_credit', 'bundled_green'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    selectedType === type
                      ? 'bg-esum-green text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <button className="flex items-center px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:text-white transition">
              <Filter className="w-5 h-5 mr-2" />
              More Filters
            </button>
          </div>

          {/* Instruments grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstruments.map((instrument, index) => {
              const SourceIcon = sourceIcons[instrument.source] || Zap;
              
              return (
                <motion.div
                  key={instrument.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6 card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-esum-green/20 flex items-center justify-center">
                        <SourceIcon className="w-6 h-6 text-esum-green" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{instrument.name}</h3>
                        <p className="text-gray-400 text-sm">{instrument.seller}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-esum-green/20 text-esum-green text-xs font-medium rounded-full">
                      {instrument.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Price</span>
                      <span className="text-white font-mono font-medium">
                        R {instrument.price} {instrument.type === 'carbon_credit' ? '/tCO2e' : '/MWh'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Available Volume</span>
                      <span className="text-white font-medium">{instrument.volume.toLocaleString()} MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Type</span>
                      <span className="text-white text-sm capitalize">{instrument.type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 btn-primary py-2 text-sm">
                      Buy
                    </button>
                    <button className="flex-1 btn-secondary py-2 text-sm">
                      Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
