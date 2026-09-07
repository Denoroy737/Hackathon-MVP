import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './globals.css';
import { ProgressProvider } from '@/components/ProgressProvider';
import { Header, Footer } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Suraksha Coach — A safer digital life starts with practice',
  description: 'Don’t just detect scams. Learn to recognize them. Build confidence with safe, simple scam practice. No real links, no personal details, no pressure.',
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F9FAF6' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body><ProgressProvider><Header />{children}<Footer /></ProgressProvider></body></html>;
}
