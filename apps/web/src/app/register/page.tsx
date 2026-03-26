'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowLeft, Building2, Phone, User } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-esum-navy via-gray-900 to-esum-navy flex items-center justify-center p-4">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Link href="/" className="absolute -top-16 left-0 flex items-center text-white hover:text-esum-green transition">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-12 h-12 text-esum-green" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-400">
              Join the future of energy trading
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-esum-green text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded ${
                      step > s ? 'bg-esum-green' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-esum-green focus:ring-1 focus:ring-esum-green transition"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-esum-green focus:ring-1 focus:ring-esum-green transition"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-esum-green focus:ring-1 focus:ring-esum-green transition"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full btn-primary py-3"
                >
                  Next Step
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organisation Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-esum-green focus:ring-1 focus:ring-esum-green transition"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organisation Type
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-esum-green">
                    <option value="">Select type</option>
                    <option value="buyer">Energy Buyer (C&I Consumer)</option>
                    <option value="seller">Energy Seller (IPP)</option>
                    <option value="trader">Energy Trader</option>
                    <option value="carbon_fund">Carbon Fund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-esum-green focus:ring-1 focus:ring-esum-green transition"
                      placeholder="+27 11 123 4567"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary py-3"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 btn-primary py-3"
                  >
                    Next Step
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-esum-green focus:ring-1 focus:ring-esum-green transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                <div className="flex items-start">
                  <input type="checkbox" required className="w-4 h-4 mt-1 rounded border-white/10 bg-white/5 text-esum-green focus:ring-esum-green" />
                  <span className="ml-2 text-sm text-gray-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-esum-green hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-esum-green hover:underline">Privacy Policy</Link>
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 btn-secondary py-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-3"
                  >
                    Create Account
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-esum-green hover:text-esum-green-light transition font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>✓ Free 30-day trial • ✓ No credit card required • ✓ POPIA Compliant</p>
        </div>
      </motion.div>
    </div>
  );
}
