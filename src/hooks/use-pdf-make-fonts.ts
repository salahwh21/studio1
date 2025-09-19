'use client';
import { useEffect, useState } from 'react';
import { amiriRegularBase64, amiriBoldBase64 } from '@/components/returns/amiri_base64';

// This hook initializes pdfmake with custom Arabic fonts.
// It ensures that font loading happens only on the client-side and only once.
export const usePdfMakeFonts = () => {
    const [state, setState] = useState<{ pdfMake: any, isReady: boolean }>({ pdfMake: null, isReady: false });

    useEffect(() => {
        // Ensure this runs only in the browser and only once
        if (typeof window !== 'undefined' && !state.isReady) {
            import('pdfmake/build/pdfmake').then(pdfmakeInstance => {
                import('pdfmake/build/vfs_fonts').then(pdfFonts => {
                    // Assign vfs and fonts upon initialization.
                    pdfmakeInstance.vfs = {
                        ...pdfFonts.pdfMake.vfs, // Include default fonts
                        "Amiri-Regular.ttf": amiriRegularBase64,
                        "Amiri-Bold.ttf": amiriBoldBase64
                    };

                    pdfmakeInstance.fonts = {
                        ...pdfmakeInstance.fonts, // Keep existing fonts
                        Amiri: {
                            normal: "Amiri-Regular.ttf",
                            bold: "Amiri-Bold.ttf"
                        }
                    };
                    
                    setState({ pdfMake: pdfmakeInstance, isReady: true });
                });
            });
        }
    }, [state.isReady]); // Depend on isReady to prevent re-running

    return state;
};
