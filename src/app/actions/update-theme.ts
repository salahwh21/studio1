
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
    
    await fs.writeFile(cssFilePath, cssContent, 'utf-8');

    // Update tailwind.config.ts and layout.tsx for font family
    if (fontFamily) {
        const fontVarName = `--font-${fontFamily.toLowerCase().replace(/ /g, '-')}`;

        // 1. Update tailwind.config.ts
        const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
        let tailwindConfigContent = await fs.readFile(tailwindConfigPath, 'utf-8');
        
        // This regex is more robust to handle different formatting
        tailwindConfigContent = tailwindConfigContent.replace(
            /fontFamily:\s*{[^}]*sans:\s*\[([^\]]+)\]/s,
            `fontFamily: {\n        sans: ["var(${fontVarName})", "sans-serif"]`
        );
        await fs.writeFile(tailwindConfigPath, tailwindConfigContent, 'utf-8');


        // 2. Update layout.tsx
        const layoutFilePath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
        let layoutContent = await fs.readFile(layoutFilePath, 'utf-8');

        // Remove existing Google Font imports and const declarations
        layoutContent = layoutContent.replace(/import\s*{[^}]+}\s*from 'next\/font\/google';/gs, '');
        layoutContent = layoutContent.replace(/const\s+\w+\s*=\s*\w+\({[^}]*}\);/gs, '');
        
        // Prepare new font details
        const fontImportName = fontFamily.replace(/ /g, '_');
        const fontConstName = `${fontFamily.toLowerCase().replace(/ /g, '_')}`;

        const newImport = `import { ${fontImportName} } from 'next/font/google';`;
        const newConst = `const ${fontConstName} = ${fontImportName}({ 
  subsets: ['latin', 'arabic'], 
  weight: ['400', '700'],
  variable: '${fontVarName}' 
});`;
        
        // Add new import and const after other imports
        const lastImportMatch = Array.from(layoutContent.matchAll(/import.*from\s*['"].*['"];/g)).pop();
        if (lastImportMatch) {
            const endOfLastImport = lastImportMatch.index! + lastImportMatch[0].length;
            layoutContent = 
                layoutContent.slice(0, endOfLastImport) +
                `\n\n${newImport}\n${newConst}` +
                layoutContent.slice(endOfLastImport);
        } else {
             // Fallback if no imports found (unlikely)
             const headIndex = layoutContent.indexOf('<head>');
             layoutContent = layoutContent.slice(0, headIndex) + `${newImport}\n${newConst}\n` + layoutContent.slice(headIndex);
        }

        // Update className in body tag to use the new font variable
        layoutContent = layoutContent.replace(
            /className={`[^`]+`}/, 
            `className={\`\${${fontConstName}.variable} font-sans antialiased\``
        );
        
        await fs.writeFile(layoutFilePath, layoutContent, 'utf-8');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating theme:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update theme file(s).';
    return { success: false, error: errorMessage };
  }
}
