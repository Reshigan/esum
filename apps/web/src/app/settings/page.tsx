'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, LayoutDashboard, TrendingUp, Leaf, Bell, Settings, LogOut, Menu, X,
  User, Building2, Shield, CreditCard, Globe, Moon, Sun as SunIcon, Bell as BellIcon
} from 'lucide-react';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'organisation', name: 'Organisation', icon: Building2 },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ];

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
            <h1 className="text-2xl font-serif font-bold text-white">Settings</h1>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-4xl">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-esum-green text-white'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="glass rounded-xl p-6">
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-esum-green to-esum-blue flex items-center justify-center text-2xl font-bold text-white">
                        JD
                      </div>
                      <button className="btn-secondary text-sm">Change Photo</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                        <input type="text" defaultValue="John" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                        <input type="text" defaultValue="Doe" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input type="email" defaultValue="john.doe@angloamerican.co.za" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                        <input type="tel" defaultValue="+27 11 123 4567" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                      <button className="btn-secondary">Cancel</button>
                      <button className="btn-primary">Save Changes</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'organisation' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-white mb-6">Organisation Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Organisation Name</label>
                      <input type="text" defaultValue="Anglo American Mining" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Organisation Type</label>
                      <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green">
                        <option>Buyer</option>
                        <option>Seller</option>
                        <option>Trader</option>
                      </select>
                    </div>
                    <div className="p-4 bg-esum-green/10 rounded-lg border border-esum-green/20">
                      <p className="text-esum-green text-sm">
                        <strong>KYC Status:</strong> Approved ✓
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Your organisation is verified and can trade on the platform.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                      <button className="btn-secondary">Cancel</button>
                      <button className="btn-primary">Save Changes</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <input type="password" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <input type="password" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <input type="password" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                      </div>
                      <button className="btn-secondary text-sm">Enable</button>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                      <button className="btn-secondary">Cancel</button>
                      <button className="btn-primary">Update Password</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MoonIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">Dark Mode</p>
                          <p className="text-gray-400 text-sm">Use dark theme across the platform</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-esum-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-esum-green"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BellIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">Email Notifications</p>
                          <p className="text-gray-400 text-sm">Receive trade and auction notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-esum-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-esum-green"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Default Currency</label>
                      <select defaultValue="ZAR" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green">
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                      <button className="btn-secondary">Cancel</button>
                      <button className="btn-primary">Save Preferences</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {(activeTab === 'billing' || activeTab === 'notifications') && (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
                  <p className="text-gray-400">This section is under development.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
