
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

    if (primary) {
      cssContent = cssContent.replace(/--primary:\s*[\d\s%]+;/g, `--primary: ${primary};`);
    }
    if (background) {
      cssContent = cssContent.replace(/--background:\s*[\d\s%]+;/g, `--background: ${background};`);
    }
    if (accent) {
      cssContent = cssContent.replace(/--accent:\s*[\d\s%]+;/g, `--accent: ${accent};`);
    }
     if (fontSize) {
      cssContent = cssContent.replace(/font-size:\s*[^;]+;/, `font-size: ${fontSize}px;`);
    }
    
    await fs.writeFile(cssFilePath, cssContent, 'utf-8');

    // Update tailwind.config.ts for font family
    if (fontFamily) {
        const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
        let tailwindConfigContent = await fs.readFile(tailwindConfigPath, 'utf-8');
        
        // More robust regex to handle different spacings and single/double quotes
        tailwindConfigContent = tailwindConfigContent.replace(
            /fontFamily:\s*{[^}]*sans:\s*\[[^\]]+\]/s,
            `fontFamily: {\n        sans: ["var(--font-${fontFamily.toLowerCase().replace(/[\s_]/g, '-')})", 'sans-serif']`
        );

        await fs.writeFile(tailwindConfigPath, tailwindConfigContent, 'utf-8');

         // Update layout.tsx
        const layoutFilePath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
        let layoutContent = await fs.readFile(layoutFilePath, 'utf-8');

        // Dynamically create font import and variable based on selection
        const fontName = fontFamily.replace(/ /g, '_');
        const fontVarName = `font${fontName.replace(/_/g, '')}`;
        const fontVarNameLower = fontVarName.toLowerCase();
        
        // Remove existing font imports from next/font/google
        const fontImportRegex = /import\s*{[^}]+}\s*from 'next\/font\/google';/g;
        layoutContent = layoutContent.replace(fontImportRegex, '');
        
        // Remove existing font const declarations
        const fontConstRegex = /const\s+\w+\s*=\s*\w+\([^)]+\);/g;
        layoutContent = layoutContent.replace(fontConstRegex, '');

        // Add new font import and const
        const newImport = `import { ${fontName} } from 'next/font/google';`;
        const newConst = `const ${fontVarNameLower} = ${fontName}({ 
  subsets: ['latin', 'arabic'], 
  weight: ['400', '700'],
  variable: '--font-${fontFamily.toLowerCase().replace(/[\s_]/g, '-')}' 
});`;
        
        // Prepend new import and const after the first 'use client' or import statement
        const firstImportIndex = layoutContent.indexOf('import');
        layoutContent = 
            layoutContent.slice(0, firstImportIndex) + 
            `${newImport}\n${newConst}\n` +
            layoutContent.slice(firstImportIndex);
        
        // Update className in body
        const classNameRegex = /className=\{`([^`]+)`\}/;
        layoutContent = layoutContent.replace(classNameRegex, `className={\`${fontVarNameLower}.variable font-sans antialiased\``);
        
        await fs.writeFile(layoutFilePath, layoutContent, 'utf-8');

    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating theme:', error);
    return { success: false, error: 'Failed to update theme file(s).' };
  }
}
