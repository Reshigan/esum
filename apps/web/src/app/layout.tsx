import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ESUM | Energy Trading Platform',
  description: "World's first integrated Open Market Energy Trading Platform for South Africa",
  keywords: ['energy trading', 'carbon credits', 'renewable energy', 'South Africa', 'green energy'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
