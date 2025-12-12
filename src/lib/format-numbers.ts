/**
 * Convert Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to Western Arabic numerals (0123456789)
 */
export function toWesternNumerals(str: string | number): string {
  const arabicToWestern: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  return String(str).replace(/[٠-٩]/g, (match) => arabicToWestern[match] || match);
}

/**
 * Format number input to always use Western numerals
 */
export function formatNumberInput(value: string): string {
  // Convert to Western numerals
  const western = toWesternNumerals(value);
  // Remove any non-digit characters except decimal point
  return western.replace(/[^\d.]/g, '');
}

/**
 * Format phone number to Western numerals with proper format
 */
export function formatPhoneNumber(phone: string): string {
  const western = toWesternNumerals(phone);
  // Remove any non-digit characters
  return western.replace(/\D/g, '');
}
