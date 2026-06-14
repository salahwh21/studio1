/**
 * Converts any image File to a WebP data URL using the browser Canvas API.
 * Falls back to original data URL if WebP is not supported.
 */
export async function fileToWebP(file: File, quality = 0.9): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(objectUrl); return; }
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(objectUrl);

            const webp = canvas.toDataURL('image/webp', quality);
            // If browser returned PNG fallback (no WebP support), use PNG
            resolve(webp);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };

        img.src = objectUrl;
    });
}
