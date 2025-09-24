
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { SettingsProvider } from '@/contexts/SettingsContext';

import { Tajawal, Inter, Cairo, IBM_Plex_Sans_Arabic } from 'next/font/google';

const tajawal = Tajawal({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-tajawal' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-cairo' });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-ibm-plex-sans-arabic' });

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
      className={`${tajawal.variable} ${inter.variable} ${cairo.variable} ${ibmPlexSansArabic.variable}`}
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
