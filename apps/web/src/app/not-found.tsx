"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-lime-100 flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L4 32h28L18 4z" stroke="#7CB518" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M18 14v8M18 26v.5" stroke="#7CB518" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-400 mb-8">Page not found</p>
        <Link href="/" className="bg-[#1A1D23] text-white font-medium px-6 py-3 rounded-xl hover:bg-gray-800 transition inline-flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}
