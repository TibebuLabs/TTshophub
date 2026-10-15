import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import ChatBot from '@/components/ChatBot';
import CompareDrawer from '@/components/CompareDrawer';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { LiveNotifications } from '@/components/Notifications';
import QuickViewModal from '@/components/QuickViewModal';
import Toaster from '@/components/Toaster';

export const metadata: Metadata = {
  title: "ShopHub – Ethiopia's Smart Marketplace",
  description:
    'Shop authentic Ethiopian coffee, fashion, electronics, gifts and more with smart AI assistance, fast nationwide delivery, and modern digital payments.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f1b33',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col bg-bg text-ink transition-colors">
        <Header />
        <main className="container-x flex-1 pt-4 pb-12">{children}</main>
        <Footer />
        <BottomNav />
        <ChatBot />
        <QuickViewModal />
        <CompareDrawer />
        <Toaster />
        <LiveNotifications />
      </body>
    </html>
  );
}
