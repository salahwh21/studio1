'use client';
import { useEffect, useState } from 'react';
import { amiriRegularBase64, amiriBoldBase64 } from '@/components/returns/amiri_base64';

// Lazy loading for PDF generation libraries
const lazyPdfMake = async () => (await import('pdfmake/build/pdfmake')).default;

export const usePdfMakeFonts = () => {
  const [pdfMake, setPdfMake] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    lazyPdfMake().then(pdfmakeInstance => {
        if (!pdfmakeInstance.vfs) {
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
        }
        setPdfMake(() => pdfmakeInstance);
        setIsReady(true);
    });
  }, []);

  return { pdfMake, isReady };
};
