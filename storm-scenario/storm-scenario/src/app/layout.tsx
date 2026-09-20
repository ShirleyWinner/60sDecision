import type { Metadata, Viewport } from 'next';
import './style.css';
import './mobile.css';
import './comic.css';
import './portraits.css';

export const metadata: Metadata = {
  title: '60s Decisions · Storm Corridor',
  description: '60s Decisions — Storm Corridor tactical decision simulation',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230b1920'/%3E%3Cpath d='M16 3 27 26 16 21 5 26Z' fill='%237ee2c1'/%3E%3C/svg%3E",
  },
  appleWebApp: { capable: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#091a23',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
