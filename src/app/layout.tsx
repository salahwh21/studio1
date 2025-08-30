
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

import { LoginExperienceProvider } from '@/context/LoginExperienceContext';

import { 
  Tajawal, 
  Cairo, 
  Almarai, 
  Lalezar, 
  Markazi_Text, 
  Changa, 
  Lemonada, 
  El_Messiri, 
  Scheherazade_New, 
  Mada, 
  Reem_Kufi, 
  IBM_Plex_Sans_Arabic, 
  Noto_Sans_Arabic, 
  Noto_Kufi_Arabic, 
  Amiri, 
  Lateef, 
  Kufam, 
  Harmattan, 
  Aref_Ruqaa, 
  Vazirmatn,
  Inter,
  Roboto,
  PT_Sans
} from 'next/font/google';

const tajawal = Tajawal({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-tajawal' });
const cairo = Cairo({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-cairo' });
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-almarai' });
const lalezar = Lalezar({ subsets: ['latin', 'arabic'], weight: ['400'], variable: '--font-lalezar' });
const markazi_text = Markazi_Text({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-markazi-text' });
const changa = Changa({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-changa' });
const lemonada = Lemonada({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-lemonada' });
const el_messiri = El_Messiri({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-el-messiri' });
const scheherazade_new = Scheherazade_New({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-scheherazade-new' });
const mada = Mada({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-mada' });
const reem_kufi = Reem_Kufi({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-reem-kufi' });
const ibm_plex_sans_arabic = IBM_Plex_Sans_Arabic({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-ibm-plex-sans-arabic' });
const noto_sans_arabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-noto-sans-arabic' });
const noto_kufi_arabic = Noto_Kufi_Arabic({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-noto-kufi-arabic' });
const amiri = Amiri({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-amiri' });
const lateef = Lateef({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-lateef' });
const kufam = Kufam({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-kufam' });
const harmattan = Harmattan({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-harmattan' });
const aref_ruqaa = Aref_Ruqaa({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-aref-ruqaa' });
const vazirmatn = Vazirmatn({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-vazirmatn' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-inter' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto' });
const pt_sans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pt-sans' });


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
        ${cairo.variable}
        ${almarai.variable}
        ${lalezar.variable}
        ${markazi_text.variable}
        ${changa.variable}
        ${lemonada.variable}
        ${el_messiri.variable}
        ${scheherazade_new.variable}
        ${mada.variable}
        ${reem_kufi.variable}
        ${ibm_plex_sans_arabic.variable}
        ${noto_sans_arabic.variable}
        ${noto_kufi_arabic.variable}
        ${amiri.variable}
        ${lateef.variable}
        ${kufam.variable}
        ${harmattan.variable}
        ${aref_ruqaa.variable}
        ${vazirmatn.variable}
        ${inter.variable}
        ${roboto.variable}
        ${pt_sans.variable}
      `}
    >
      <body className={`font-sans antialiased`}>
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
