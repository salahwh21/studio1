
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

import { LoginExperienceProvider } from '@/context/LoginExperienceContext';
import { RegionalSettingsProvider } from '@/context/RegionalSettingsContext';
import { SettingsProvider } from '@/contexts/SettingsContext'; // Import the new provider

import { 
  Tajawal,
  Inter,
  Cairo,
  IBM_Plex_Sans_Arabic
} from 'next/font/google';

const tajawal = Tajawal({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-tajawal' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-cairo' });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-ibm-plex-sans-arabic' });


export const metadata: Metadata = {
  title: 'إدارة تسجيل الطلبات - الوميض',
  description:
    'حل شامل لإدارة تسجيل الطلبات والشؤون المالية والسائقين لشركة الوميض.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      suppressHydrationWarning 
      className={`
        ${tajawal.variable} 
        ${inter.variable}
        ${cairo.variable}
        ${ibmPlexSansArabic.variable}
      `}
    >
      <body>
        <SettingsProvider>
          <LoginExperienceProvider>
            <RegionalSettingsProvider>
              <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              >
              {children}
              <Toaster />
              </ThemeProvider>
            </RegionalSettingsProvider>
          </LoginExperienceProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
