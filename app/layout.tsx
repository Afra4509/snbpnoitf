import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Livestream Queue Status',
  description: 'Priority queue system for high-traffic livestreams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
