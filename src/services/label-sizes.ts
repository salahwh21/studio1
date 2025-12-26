// Standard label size definitions (mm) for Playwright PDF generation
// These sizes are used throughout the app to guarantee that the generated HTML
// matches the physical label dimensions and that Playwright receives the correct
// page size parameters.

export interface LabelSize {
    width: number; // mm
    height: number; // mm
    orientation?: 'portrait' | 'landscape'; // optional, derived from dimensions
    description: string; // human readable description
}

export const LABEL_SIZES: Record<string, LabelSize> = {
    // Common thermal label sizes (mm)
    '58x100': { width: 58, height: 100, orientation: 'portrait', description: '58 mm × 100 mm (standard small thermal)' },
    '76x127': { width: 76, height: 127, orientation: 'portrait', description: '76 mm × 127 mm (medium thermal)' },
    '80x120': { width: 80, height: 120, orientation: 'portrait', description: '80 mm × 120 mm (medium‑large thermal)' },
    '100x150': { width: 100, height: 150, orientation: 'portrait', description: '100 mm × 150 mm (large thermal, default)' },
    '150x100': { width: 150, height: 100, orientation: 'landscape', description: '150 mm × 100 mm (large thermal landscape)' },
    // A4 policy sheet (mm)
    'A4': { width: 210, height: 297, orientation: 'portrait', description: 'A4 (210 mm × 297 mm) – standard policy sheet' },
    // Custom sizes can be added here
};

/**
 * Helper to retrieve a size definition. If the key does not exist, the function
 * falls back to the default "100x150" thermal size.
 */
export function getLabelSize(key: string): LabelSize {
    return LABEL_SIZES[key] ?? LABEL_SIZES['100x150'];
}
