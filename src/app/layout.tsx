
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

import { LoginExperienceProvider } from '@/context/LoginExperienceContext';

import { 
  Tajawal,
  Inter
} from 'next/font/google';

const tajawal = Tajawal({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-tajawal' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-inter' });


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
      `}
    >
      <body>
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
