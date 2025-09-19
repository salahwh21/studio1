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
            import('pdfmake/build/pdfmake').then(pdfmakeModule => {
                import('pdfmake/build/vfs_fonts').then(pdfFontsModule => {
                    const pdfmakeInstance = pdfmakeModule.default;
                    
                    // The vfs object is on pdfFontsModule.default.pdfMake.vfs
                    if (pdfFontsModule.default.pdfMake) {
                       pdfmakeInstance.vfs = pdfFontsModule.default.pdfMake.vfs;
                    }

                    // Now, define the custom fonts
                    pdfmakeInstance.fonts = {
                        ...pdfmakeInstance.fonts, // Keep existing fonts like Roboto
                        Amiri: {
                            normal: "Amiri-Regular.ttf",
                            bold: "Amiri-Bold.ttf"
                        }
                    };
                    // Add the font files to the vfs
                    if(pdfmakeInstance.vfs){
                      pdfmakeInstance.vfs["Amiri-Regular.ttf"] = amiriRegularBase64;
                      pdfmakeInstance.vfs["Amiri-Bold.ttf"] = amiriBoldBase64;
                    }
                    
                    setState({ pdfMake: pdfmakeInstance, isReady: true });
                });
            });
        }
    }, [state.isReady]); // Depend on isReady to prevent re-running

    return state;
};
