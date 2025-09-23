
      import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { SettingsProvider } from '@/contexts/SettingsContext';

import { Tajawal } from 'next/font/google';

const tajawal = Tajawal({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-tajawal' });

export const metadata: Metadata = {
  title: 'إدارة تسجيل الطلبات - الوميض',
  description:
    'حل شامل لإدارة تسجيل الطلبات والشؤون المالية والسائقين لشركة الوميض.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      suppressHydrationWarning 
      className={tajawal.variable}
    >
      <body>
        <SettingsProvider>
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          {children}
          <Toaster />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

    