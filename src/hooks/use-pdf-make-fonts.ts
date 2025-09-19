'use client';
import { useEffect, useState } from 'react';
import { amiriRegularBase64, amiriBoldBase64 } from '@/components/returns/amiri-fonts';

// This hook initializes pdfmake with custom Arabic fonts.
// It ensures that font loading happens only on the client-side and only once.
export const usePdfMakeFonts = () => {
    const [state, setState] = useState<{ pdfMake: any, isReady: boolean }>({ pdfMake: null, isReady: false });

    useEffect(() => {
        // Ensure this runs only in the browser and only once
        if (typeof window !== 'undefined' && !state.isReady && !state.pdfMake) {
            Promise.all([
                import('pdfmake/build/pdfmake'),
                import('pdfmake/build/vfs_fonts'),
            ]).then(([pdfmakeModule, pdfFontsModule]) => {
                const pdfmakeInstance = pdfmakeModule.default;
                
                // The vfs object is on pdfFontsModule.default.pdfMake.vfs
                if (pdfFontsModule.default.pdfMake) {
                    pdfmakeInstance.vfs = pdfFontsModule.default.pdfMake.vfs;
                }

                // Now, define the custom fonts
                // Add the font files to the vfs
                if(pdfmakeInstance.vfs){
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
        }
    }, [state.isReady, state.pdfMake]);

    return state;
};
