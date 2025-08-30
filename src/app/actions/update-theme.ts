
'use server';

import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';

const themeSchema = z.object({
  primary: z.string().optional().nullable(),
  primaryForeground: z.string().optional().nullable(),
  background: z.string().optional().nullable(),
  foreground: z.string().optional().nullable(),
  accent: z.string().optional().nullable(),
  card: z.string().optional().nullable(),
  cardForeground: z.string().optional().nullable(),
  destructive: z.string().optional().nullable(),
  border: z.string().optional().nullable(),
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
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
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
    primaryForeground: formData.get('primaryForeground'),
    background: formData.get('background'),
    foreground: formData.get('foreground'),
    accent: formData.get('accent'),
    card: formData.get('card'),
    cardForeground: formData.get('cardForeground'),
    destructive: formData.get('destructive'),
    border: formData.get('border'),
    fontFamily: formData.get('fontFamily'),
    fontSize: formData.get('fontSize'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  try {
    const cssFilePath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    let cssContent = await fs.readFile(cssFilePath, 'utf-8');

    const colorMappings = {
        primary: { hsl: hexToHslString(data.primary || ''), vars: ['--primary', '--ring', '--chart-1'] },
        primaryForeground: { hsl: hexToHslString(data.primaryForeground || ''), vars: ['--primary-foreground'] },
        background: { hsl: hexToHslString(data.background || ''), vars: ['--background'] },
        foreground: { hsl: hexToHslString(data.foreground || ''), vars: ['--foreground'] },
        accent: { hsl: hexToHslString(data.accent || ''), vars: ['--accent'] },
        card: { hsl: hexToHslString(data.card || ''), vars: ['--card'] },
        cardForeground: { hsl: hexToHslString(data.cardForeground || ''), vars: ['--card-foreground'] },
        destructive: { hsl: hexToHslString(data.destructive || ''), vars: ['--destructive'] },
        border: { hsl: hexToHslString(data.border || ''), vars: ['--border', '--input'] },
    };

    for (const key in colorMappings) {
        const item = colorMappings[key as keyof typeof colorMappings];
        if (item.hsl) {
            item.vars.forEach(cssVar => {
                const regex = new RegExp(`(${cssVar}:\\s*)[\\d\\s%]+;`, 'g');
                cssContent = cssContent.replace(regex, `$1${item.hsl};`);
            });
        }
    }

     if (data.fontSize) {
      cssContent = cssContent.replace(/(body\s*{[^}]*font-size:\s*)[^;]+(;[^}]*})/s, `$1${data.fontSize}px$2`);
    }

    if (data.fontFamily) {
        const fontVarName = `--font-${data.fontFamily.toLowerCase().replace(/ /g, '-')}`;
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
