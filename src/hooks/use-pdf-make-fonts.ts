'use client';
import { useEffect, useState } from 'react';
import { amiriRegularBase64, amiriBoldBase64 } from '@/components/returns/amiri_base64';

// Lazy loading for PDF generation libraries
const lazyPdfMake = async () => (await import('pdfmake/build/pdfmake')).default;

// This hook initializes pdfmake with custom Arabic fonts.
// It ensures that font loading happens only on the client-side and only once.
export const usePdfMakeFonts = () => {
  const [pdfMake, setPdfMake] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure this runs only in the browser
    if (typeof window !== 'undefined' && !pdfMake) {
      lazyPdfMake().then(pdfmakeInstance => {
        // Always assign VFS and fonts upon initialization.
        // This is safer and ensures they are always available.
        pdfmakeInstance.vfs = {
            "Amiri-Regular.ttf": amiriRegularBase64,
            "Amiri-Bold.ttf": amiriBoldBase64
        };
        pdfmakeInstance.fonts = {
            Amiri: {
                normal: "Amiri-Regular.ttf",
                bold: "Amiri-Bold.ttf"
            }
        };
        
        setPdfMake(() => pdfmakeInstance); // Use a function to set state to ensure it gets the instance
        setIsReady(true);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { pdfMake, isReady };
};
