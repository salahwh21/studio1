
'use server';

import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';

const themeSchema = z.object({
  primary: z.string().optional().nullable(),
  background: z.string().optional().nullable(),
  accent: z.string().optional().nullable(),
  fontFamily: z.string().optional().nullable(),
  fontSize: z.string().optional().nullable(),
});

// Helper function to convert HEX to HSL string
const hexToHslString = (hex: string): string | null => {
    if (!hex || !hex.startsWith('#')) return null;
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    } else {
        return null; // Invalid hex format
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};


export async function updateThemeAction(formData: FormData) {
  const validatedFields = themeSchema.safeParse({
    primary: formData.get('primary'),
    background: formData.get('background'),
    accent: formData.get('accent'),
    fontFamily: formData.get('fontFamily'),
    fontSize: formData.get('fontSize'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { primary, background, accent, fontFamily, fontSize } = validatedFields.data;

  try {
    // Update globals.css
    const cssFilePath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    let cssContent = await fs.readFile(cssFilePath, 'utf-8');

    const primaryHsl = hexToHslString(primary || '');
    const backgroundHsl = hexToHslString(background || '');
    const accentHsl = hexToHslString(accent || '');

    if (primaryHsl) {
      cssContent = cssContent.replace(/--primary:\s*[\d\s%]+;/g, `--primary: ${primaryHsl};`);
      cssContent = cssContent.replace(/--ring:\s*[\d\s%]+;/g, `--ring: ${primaryHsl};`);
      cssContent = cssContent.replace(/--chart-1:\s*[\d\s%]+;/g, `--chart-1: ${primaryHsl};`);
    }
    if (backgroundHsl) {
      cssContent = cssContent.replace(/--background:\s*[\d\s%]+;/g, `--background: ${backgroundHsl};`);
    }
    if (accentHsl) {
      cssContent = cssContent.replace(/--accent:\s*[\d\s%]+;/g, `--accent: ${accentHsl};`);
    }
     if (fontSize) {
      // Use a more robust regex to find the font-size in the body
      cssContent = cssContent.replace(/(body\s*{[^}]*font-size:\s*)[^;]+(;[^}]*})/s, `$1${fontSize}px$2`);
    }

    if (fontFamily) {
        const fontVarName = `--font-${fontFamily.toLowerCase().replace(/ /g, '-')}`;
        // This regex will replace the font-family in the body tag.
        // It's designed to be robust against different formatting.
        cssContent = cssContent.replace(
            /(body\s*{[^}]*font-family:\s*)[^;]+(;[^}]*})/s,
            `$1var(${fontVarName}), sans-serif$2`
        );
    }
    
    await fs.writeFile(cssFilePath, cssContent, 'utf-8');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating theme:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update theme file(s).';
    return { success: false, error: errorMessage };
  }
}
