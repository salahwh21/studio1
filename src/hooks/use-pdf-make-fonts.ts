
'use client';
import { useEffect, useState } from 'react';

// This hook initializes pdfmake with custom Arabic fonts.
// It ensures that font loading happens only on the client-side and only once.
export const usePdfMakeFonts = () => {
    const [state, setState] = useState<{ pdfMake: any, isReady: boolean }>({ pdfMake: null, isReady: false });

    useEffect(() => {
        if (typeof window !== 'undefined' && !state.isReady && !state.pdfMake) {
            Promise.all([
                import('pdfmake/build/pdfmake'),
                import('pdfmake/build/vfs_fonts'),
            ]).then(([pdfmakeModule, pdfFontsModule]) => {
                const pdfmakeInstance = pdfmakeModule.default;
                
                if (pdfmakeInstance && pdfFontsModule.default?.pdfMake?.vfs) {
                    pdfmakeInstance.vfs = pdfFontsModule.default.pdfMake.vfs;
                    // Use the default Roboto font which has basic Arabic support
                    pdfmakeInstance.fonts = {
                        Roboto: {
                            normal: 'Roboto-Regular.ttf',
                            bold: 'Roboto-Medium.ttf',
                            italics: 'Roboto-Italic.ttf',
                            bolditalics: 'Roboto-MediumItalic.ttf'
                        }
                    };
                }
                
                setState({ pdfMake: pdfmakeInstance, isReady: true });
            });
        }
    }, [state.isReady, state.pdfMake]);

    return state;
};
