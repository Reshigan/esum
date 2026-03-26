'use client';

import Link from 'next/link';
import { useState } from 'react';

const LogoSvg = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#1A1D23"/>
    <path d="M8 16.5L13 11V14.5H19V11L24 16.5L19 22V18.5H13V22L8 16.5Z" fill="url(#lg1)"/>
    <defs><linearGradient id="lg1" x1="8" y1="11" x2="24" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#C8E64E"/><stop offset="1" stopColor="#A3D139"/></linearGradient></defs>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#C8E64E"/><path d="M5.5 9L8 11.5L12.5 7" stroke="#1A1D23" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const features = [
  { icon: '\u26A1', title: 'Real-Time Trading', desc: 'Central limit order book with instant matching and execution', color: 'bg-amber-50 border-amber-100' },
  { icon: '\uD83C\uDF31', title: 'Carbon-Native', desc: 'Every trade includes verified carbon credits and environmental attributes', color: 'bg-green-50 border-green-100' },
  { icon: '\uD83E\uDD16', title: 'AI-Powered', desc: 'Intelligent scenario planning and portfolio optimization', color: 'bg-blue-50 border-blue-100' },
  { icon: '\uD83C\uDF10', title: 'Grid Connected', desc: 'Real-time Eskom data and municipal tariff integration', color: 'bg-purple-50 border-purple-100' },
  { icon: '\uD83D\uDCCA', title: 'Advanced Analytics', desc: 'Comprehensive reporting and compliance tools', color: 'bg-indigo-50 border-indigo-100' },
  { icon: '\uD83D\uDD12', title: 'Enterprise Security', desc: 'Bank-grade security with POPIA compliance', color: 'bg-red-50 border-red-100' },
];

const stats = [
  { value: 'R250B+', label: 'Addressable Market' },
  { value: '120+', label: 'C&I Participants' },
  { value: '24/7', label: 'Platform Availability' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const marketItems = [
  { name: 'Solar PPA', price: 'R 0.75/MWh' },
  { name: 'Wind PPA', price: 'R 0.62/MWh' },
  { name: 'Carbon Credits', price: 'R 190/tCO2e' },
  { name: 'Grid Emission Factor', price: '1.04 kg/kWh' },
];

const checklistItems = ['Physical & Virtual PPAs', 'Renewable Energy Certificates', 'Carbon Credits (Gold Standard, Verra)', 'Auction & OTC Trading', 'AI Scenario Planning'];

const partners = ['NXT Business Solutions', 'LTM Energy Group', 'NTT DATA'];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <LogoSvg />
              <span className="text-xl font-bold text-gray-900 tracking-tight">ESUM</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition">Features</Link>
              <Link href="#platform" className="text-sm text-gray-500 hover:text-gray-900 transition">Platform</Link>
              <Link href="#about" className="text-sm text-gray-500 hover:text-gray-900 transition">About</Link>
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition">Login</Link>
              <Link href="/register" className="bg-[#1A1D23] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition">Get Started</Link>
            </div>
            <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <Link href="#features" className="block text-sm text-gray-600 py-2">Features</Link>
            <Link href="#platform" className="block text-sm text-gray-600 py-2">Platform</Link>
            <Link href="/login" className="block text-sm text-gray-600 py-2">Login</Link>
            <Link href="/register" className="block bg-[#1A1D23] text-white text-sm font-medium px-5 py-2.5 rounded-xl text-center">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-lime-50 text-lime-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-lime-200">
            <span className="w-1.5 h-1.5 bg-lime-500 rounded-full" />
            Now Live in South Africa
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Powering South Africa&apos;s{' '}
            <span className="gradient-text">Green Energy</span> Future
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            The world&apos;s first integrated Open Market Energy Trading Platform enabling free-market exchange of green energy contracts and carbon credits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="bg-[#1A1D23] text-white font-medium px-8 py-3.5 rounded-xl hover:bg-gray-800 transition inline-flex items-center gap-2">
              Start Trading <ArrowIcon />
            </Link>
            <Link href="#platform" className="text-gray-600 font-medium px-8 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition">
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Platform Features</h2>
            <p className="text-gray-500">Everything you need for intelligent energy trading</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className={`rounded-2xl p-6 border ${f.color} transition hover:shadow-md`}>
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section id="platform" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Trade Energy.<br />
                <span className="gradient-text">Trade Carbon.</span><br />
                Trade Smart.
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Access a unified marketplace where energy contracts and environmental attributes are priced, traded, and settled as a single atomic unit.
              </p>
              <ul className="space-y-3">
                {checklistItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                    <CheckIcon /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="bg-gradient-to-br from-lime-50 to-green-50 p-6 rounded-xl border border-lime-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900">Market Overview</h3>
                  <span className="text-xs text-gray-400 bg-white px-2.5 py-1 rounded-lg">Live</span>
                </div>
                <div className="space-y-4">
                  {marketItems.map((item) => (
                    <div key={item.name} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-mono font-semibold text-gray-900">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="about" className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-8">In Partnership With</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {partners.map((p) => (
              <span key={p} className="text-xl font-semibold text-gray-300 hover:text-gray-500 transition">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-lime-50 to-green-50 p-12 rounded-3xl border border-lime-100">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Transform Your Energy Future?</h2>
            <p className="text-gray-600 mb-8">Join the revolution in green energy trading today.</p>
            <Link href="/register" className="bg-[#1A1D23] text-white font-medium px-8 py-3.5 rounded-xl hover:bg-gray-800 transition inline-flex items-center gap-2">
              Create Account <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LogoSvg size={24} />
                <span className="text-lg font-bold text-gray-900">ESUM</span>
              </div>
              <p className="text-sm text-gray-400">Powering South Africa&apos;s Green Energy Future</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-gray-600 transition">Features</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-gray-600 transition">About</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition">Partners</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-gray-600 transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-gray-600 transition">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-10 pt-8 text-center text-sm text-gray-400">
            &copy; 2026 ESUM Energy Trading Platform. NXT Business Solutions | LTM Energy Group | NTT DATA
          </div>
        </div>
      </footer>
    </div>
  );
}
