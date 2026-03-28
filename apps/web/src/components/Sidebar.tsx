'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from './AuthProvider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Markets', href: '/markets', icon: MarketsIcon },
  { name: 'Carbon', href: '/carbon', icon: CarbonIcon },
  { name: 'Auctions', href: '/auctions', icon: AuctionsIcon },
  { name: 'Portfolio', href: '/portfolios', icon: PortfolioIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'JD';

  return (
    <aside className="fixed top-0 left-0 z-50 h-full w-[220px] bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 pb-8">
        <Logo size={28} />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-lime-400 text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon active={isActive} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Guest'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.company || ''}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 11L14 8L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="6.5" height="6.5" rx="2" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
      <rect x="10.5" y="1" width="6.5" height="6.5" rx="2" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
      <rect x="1" y="10.5" width="6.5" height="6.5" rx="2" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
      <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="2" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
    </svg>
  );
}

function MarketsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 14L6.5 9L10 12L16 4" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4H16V8" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CarbonIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 16C9 16 3 12 3 7.5C3 4.5 5 2 9 2C13 2 15 4.5 15 7.5C15 12 9 16 9 16Z" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 9V6M9 6L7 8M9 6L11 8" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AuctionsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 15H15" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 15V8L9 5L13 8V15" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 15V11H10V15" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PortfolioIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="11" rx="2" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
      <path d="M6 4V3C6 2.44772 6.44772 2 7 2H11C11.5523 2 12 2.44772 12 3V4" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
      <path d="M2 9H16" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
    </svg>
  );
}

function SettingsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5"/>
      <path d="M9 1.5V3.5M9 14.5V16.5M1.5 9H3.5M14.5 9H16.5M3.4 3.4L4.8 4.8M13.2 13.2L14.6 14.6M14.6 3.4L13.2 4.8M4.8 13.2L3.4 14.6" stroke={active ? '#1A1D23' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
