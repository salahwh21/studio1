
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

import { Tajawal } from 'next/font/google';

const tajawal = Tajawal({ 
  subsets: ['latin', 'arabic'], 
  weight: ['400', '700'],
  variable: '--font-tajawal' 
});

export const metadata: Metadata = {
  title: 'إدارة توصيل الطلبات - الوميض',
  description: 'حل شامل لإدارة التوصيل والطلبات والشؤون المالية والسائقين لشركة الوميض.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossOrigin=""/>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Inter:wght@400;700&family=PT+Sans:wght@400;700&family=Roboto:wght@400;700&family=Tajawal:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${tajawal.variable} font-sans antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
