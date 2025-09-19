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
                    
                    // The correct way is to use the imported vfs, not assign to the instance.
                    // The vfs object is on pdfFonts.default.pdfMake.vfs
                    if (pdfFonts.default.pdfMake) {
                       pdfmakeInstance.vfs = pdfFonts.default.pdfMake.vfs;
                    }

                    // Now, define the custom fonts
                    if (pdfmakeInstance.vfs) {
                      pdfmakeInstance.vfs["Amiri-Regular.ttf"] = amiriRegularBase64;
                      pdfmakeInstance.vfs["Amiri-Bold.ttf"] = amiriBoldBase64;
                    }


                    pdfmakeInstance.fonts = {
                        ...pdfmakeInstance.fonts, // Keep existing fonts like Roboto
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
