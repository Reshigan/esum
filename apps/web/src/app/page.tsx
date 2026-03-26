'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Leaf, 
  ArrowRight,
  BarChart3,
  Globe,
  Cpu,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Zap,
    title: 'Real-Time Trading',
    description: 'Central limit order book with instant matching and execution'
  },
  {
    icon: Leaf,
    title: 'Carbon-Native',
    description: 'Every trade includes verified carbon credits and environmental attributes'
  },
  {
    icon: Cpu,
    title: 'AI-Powered',
    description: 'Intelligent scenario planning and portfolio optimization'
  },
  {
    icon: Globe,
    title: 'Grid Connected',
    description: 'Real-time Eskom data and municipal tariff integration'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive reporting and compliance tools'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with POPIA compliance'
  }
];

const stats = [
  { value: 'R250B+', label: 'Addressable Market' },
  { value: '120+', label: 'C&I Participants' },
  { value: '24/7', label: 'Platform Availability' },
  { value: '99.9%', label: 'Uptime SLA' }
];

const partners = [
  'NXT Business Solutions',
  'LTM Energy Group',
  'NTT DATA'
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-esum-navy to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-esum-green" />
              <span className="text-2xl font-serif font-bold text-white">ESUM</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
              <Link href="#platform" className="text-gray-300 hover:text-white transition">Platform</Link>
              <Link href="#about" className="text-gray-300 hover:text-white transition">About</Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition">Login</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </div>

            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-esum-green/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-esum-blue/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-6">
              Powering South Africa&apos;s{' '}
              <span className="gradient-text">Green Energy</span> Future
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              The world&apos;s first integrated Open Market Energy Trading Platform enabling 
              free-market exchange of green energy contracts and carbon credits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-4 flex items-center">
                Start Trading <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#platform" className="btn-secondary text-lg px-8 py-4">
                Explore Platform
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need for intelligent energy trading
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass rounded-2xl p-8 card-hover"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <feature.icon className="w-12 h-12 text-esum-green mb-6" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section id="platform" className="py-20 bg-gradient-to-b from-transparent to-esum-navy/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                Trade Energy.<br />
                <span className="gradient-text">Trade Carbon.</span><br />
                Trade Smart.
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Access a unified marketplace where energy contracts and environmental 
                attributes are priced, traded, and settled as a single atomic unit.
              </p>
              <ul className="space-y-4">
                {[
                  'Physical & Virtual PPAs',
                  'Renewable Energy Certificates',
                  'Carbon Credits (Gold Standard, Verra)',
                  'Auction & OTC Trading',
                  'AI Scenario Planning'
                ].map((item) => (
                  <li key={item} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-esum-green mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="glass rounded-2xl p-8"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-esum-navy to-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Market Overview</h3>
                  <TrendingUp className="w-5 h-5 text-esum-green" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Solar PPA</span>
                    <span className="text-white font-mono">R 0.75/MWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Wind PPA</span>
                    <span className="text-white font-mono">R 0.62/MWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Carbon Credits</span>
                    <span className="text-white font-mono">R 190/tCO2e</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Grid Emission Factor</span>
                    <span className="text-white font-mono">1.04 kg/kWh</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-400 mb-8">
              In Partnership With
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-12">
              {partners.map((partner) => (
                <div key={partner} className="text-2xl font-semibold text-white/60 hover:text-white transition">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Ready to Transform Your Energy Future?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the revolution in green energy trading today.
            </p>
            <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center">
              Create Account <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-esum-green" />
                <span className="text-xl font-serif font-bold text-white">ESUM</span>
              </div>
              <p className="text-gray-400 text-sm">
                Powering South Africa&apos;s Green Energy Future
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Partners</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400 text-sm">
            © 2026 ESUM Energy Trading Platform. NXT Business Solutions | LTM Energy Group | NTT DATA
          </div>
        </div>
      </footer>
    </div>
  );
}
