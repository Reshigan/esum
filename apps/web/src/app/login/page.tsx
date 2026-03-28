"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { DEMO_ACCOUNTS, getCredentialForAccount } from "@/lib/demo-accounts";

const LogoSvg = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#1A1D23"/>
    <path d="M8 16.5L13 11V14.5H19V11L24 16.5L19 22V18.5H13V22L8 16.5Z" fill="url(#llg)"/>
    <defs><linearGradient id="llg" x1="8" y1="11" x2="24" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#C8E64E"/><stop offset="1" stopColor="#A3D139"/></linearGradient></defs>
  </svg>
);

export default function LoginPage() {
  const [showSecret, setShowSecret] = useState(false);
  const [email, setEmail] = useState("");
  const [credential, setCredential] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = login(email, credential);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
      setIsSubmitting(false);
    }
  };

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

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  placeholder="Enter credential"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition placeholder:text-gray-300 pr-10"
                />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1A1D23] text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setCredential(getCredentialForAccount(acc)); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-xs"
                >
                  <span className="text-gray-600 font-medium">{acc.role}</span>
                  <span className="text-gray-400">{acc.email}</span>
                </button>
              ))}
            </div>
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
