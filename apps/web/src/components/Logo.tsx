'use client';

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#1A1D23"/>
        <path d="M8 16.5L13 11V14.5H19V11L24 16.5L19 22V18.5H13V22L8 16.5Z" fill="url(#logo-grad)"/>
        <defs>
          <linearGradient id="logo-grad" x1="8" y1="11" x2="24" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C8E64E"/>
            <stop offset="1" stopColor="#A3D139"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xl font-bold text-gray-900 tracking-tight">ESUM</span>
    </div>
  );
}

export function LogoIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#1A1D23"/>
      <path d="M8 16.5L13 11V14.5H19V11L24 16.5L19 22V18.5H13V22L8 16.5Z" fill="url(#icon-grad)"/>
      <defs>
        <linearGradient id="icon-grad" x1="8" y1="11" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C8E64E"/>
          <stop offset="1" stopColor="#A3D139"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
