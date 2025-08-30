
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

import { LoginExperienceProvider } from '@/context/LoginExperienceContext';

import { Tajawal } from 'next/font/google';
const tajawal = Tajawal({ 
  subsets: ['latin', 'arabic'], 
  weight: ['400', '700'],
  variable: '--font-tajawal' 
});











// تهيئة خط Tajawal


export const metadata: Metadata = {
  title: 'إدارة تسجيل الطلبات - الوميض',
  description:
    'حل شامل لإدارة تسجيل الطلبات والشؤون المالية والسائقين لشركة الوميض.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${tajawal.variable} font-sans antialiased`>
      <head>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Google Fonts المحسنة */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;700&family=Changa:wght@400;700&family=El+Messiri:wght@400;700&family=Harmattan:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;700&family=Kufam:wght@400;700&family=Lalezar&family=Lateef:wght@400;700&family=Lemonada:wght@400;700&family=Mada:wght@400;700&family=Markazi+Text:wght@400;700&family=Noto+Kufi+Arabic:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&family=PT+Sans:wght@400;700&family=Reem+Kufi:wght@400;700&family=Roboto:wght@400;700&family=Scheherazade+New:wght@400;700&family=Tajawal:wght@400;700&family=Vazirmatn:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <LoginExperienceProvider>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            {children}
            <Toaster />
            </ThemeProvider>
        </LoginExperienceProvider>
      </body>
    </html>
  );
}
