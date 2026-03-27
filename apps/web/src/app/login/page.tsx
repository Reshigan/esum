"use client";

import Link from "next/link";
import { useState } from "react";

const LogoSvg = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#1A1D23"/>
    <path d="M8 16.5L13 11V14.5H19V11L24 16.5L19 22V18.5H13V22L8 16.5Z" fill="url(#llg)"/>
    <defs><linearGradient id="llg" x1="8" y1="11" x2="24" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#C8E64E"/><stop offset="1" stopColor="#A3D139"/></linearGradient></defs>
  </svg>
);

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition mb-8">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-6"><LogoSvg /></div>
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Sign in to your ESUM account</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input type="email" placeholder="you@company.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Enter password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4C3 4 1 8 1 8s2 4 7 4 7-4 7-4-2-4-7-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
                Remember me
              </label>
              <Link href="#" className="text-xs text-lime-600 hover:text-lime-700 font-medium">Forgot password?</Link>
            </div>
            <button className="w-full bg-[#1A1D23] text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition text-sm">Sign In</button>
          </div>

          <p className="text-sm text-gray-400 text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-lime-600 hover:text-lime-700 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
