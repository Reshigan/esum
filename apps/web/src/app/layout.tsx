import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ESUM | Energy Trading Platform',
  description: "World's first integrated Open Market Energy Trading Platform for South Africa",
  keywords: ['energy trading', 'carbon credits', 'renewable energy', 'South Africa', 'green energy'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-brand-gray text-gray-900 font-sans antialiased">{children}</body>
    </html>
  );
}
