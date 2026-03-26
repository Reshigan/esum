"use client";

import Link from "next/link";
import { useState } from "react";

const LogoSvg = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#1A1D23"/>
    <path d="M8 16.5L13 11V14.5H19V11L24 16.5L19 22V18.5H13V22L8 16.5Z" fill="url(#rlg)"/>
    <defs><linearGradient id="rlg" x1="8" y1="11" x2="24" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#C8E64E"/><stop offset="1" stopColor="#A3D139"/></linearGradient></defs>
  </svg>
);

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition mb-8">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-6"><LogoSvg /></div>
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Create Account</h1>
          <p className="text-sm text-gray-400 text-center mb-6">Join the ESUM energy trading platform</p>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? "bg-lime-400" : "bg-gray-100"}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Work Email</label>
                <input type="email" placeholder="you@company.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                <input type="password" placeholder="Min 8 characters" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1A1D23] text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition text-sm">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Organisation Name</label>
                <input type="text" placeholder="Acme Energy Ltd" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Registration Number</label>
                <input type="text" placeholder="2024/123456/07" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Participant Type</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition text-gray-400">
                  <option>Select type</option>
                  <option>Generator</option>
                  <option>Consumer (C&amp;I)</option>
                  <option>Trader</option>
                  <option>Municipal Utility</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#1A1D23] text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition text-sm">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-lime-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#7CB518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Almost there!</h3>
                <p className="text-sm text-gray-400">Review and accept the terms to create your account.</p>
              </div>
              <label className="flex items-start gap-3 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 mt-0.5" />
                I agree to the Terms of Service and Privacy Policy, and confirm POPIA compliance.
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Back</button>
                <button className="flex-1 bg-[#1A1D23] text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition text-sm">Create Account</button>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-400 text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-lime-600 hover:text-lime-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
