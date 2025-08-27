
'use server';

import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';

const themeSchema = z.object({
  primary: z.string().regex(/^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/, "Invalid HSL format"),
  background: z.string().regex(/^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/, "Invalid HSL format"),
  accent: z.string().regex(/^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/, "Invalid HSL format"),
});

export async function updateThemeAction(formData: FormData) {
  const validatedFields = themeSchema.safeParse({
    primary: formData.get('primary'),
    background: formData.get('background'),
    accent: formData.get('accent'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { primary, background, accent } = validatedFields.data;
  const cssFilePath = path.join(process.cwd(), 'src', 'app', 'globals.css');

  try {
    let cssContent = await fs.readFile(cssFilePath, 'utf-8');

    // Replace colors for light theme
    cssContent = cssContent.replace(/--background:\s*[\d\s%]+;/, `--background: ${background};`);
    cssContent = cssContent.replace(/--primary:\s*[\d\s%]+;/, `--primary: ${primary};`);
    cssContent = cssContent.replace(/--accent:\s*[\d\s%]+;/, `--accent: ${accent};`);

    // A simple way to derive dark theme colors. 
    // This could be made more sophisticated later.
    const darkBg = '202 45% 10%';
    const darkPrimary = primary; // Keep primary the same for brand consistency
    const darkAccent = accent; // Keep accent the same

    // Replace colors for dark theme
    cssContent = cssContent.replace(/\.dark\s*{[^}]+--background:\s*[\d\s%]+;/, `.dark {\n    --background: ${darkBg};`);
    cssContent = cssContent.replace(/\.dark\s*{[^}]+--primary:\s*[\d\s%]+;/, `.dark {\n    --background: ${darkBg};\n    --primary: ${darkPrimary};`);
     cssContent = cssContent.replace(/\.dark\s*{[^}]+--accent:\s*[\d\s%]+;/, `.dark {\n    --background: ${darkBg};\n    --primary: ${darkPrimary};\n    --accent: ${darkAccent};`);


    await fs.writeFile(cssFilePath, cssContent, 'utf-8');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating theme:', error);
    return { success: false, error: 'Failed to update theme file.' };
  }
}
