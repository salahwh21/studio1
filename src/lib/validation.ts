import { z } from 'zod';

// Order validation schemas
export const orderSchema = z.object({
  recipient: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').max(100, 'الاسم طويل جداً'),
  phone: z.string().regex(/^07\d{8}$/, 'رقم الهاتف يجب أن يكون بصيغة 07XXXXXXXX'),
  whatsapp: z.string().regex(/^07\d{8}$/, 'رقم الواتساب يجب أن يكون بصيغة 07XXXXXXXX').optional().or(z.literal('')),
  address: z.string().min(5, 'العنوان يجب أن يكون على الأقل 5 أحرف').max(500),
  city: z.string().min(2, 'يجب اختيار المدينة'),
  region: z.string().min(2, 'يجب اختيار المنطقة'),
  cod: z.number().positive('قيمة التحصيل يجب أن تكون أكبر من صفر'),
  itemPrice: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر').optional(),
  deliveryFee: z.number().min(0, 'رسوم التوصيل يجب أن تكون أكبر من أو تساوي صفر').optional(),
  notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'التاريخ بصيغة غير صحيحة'),
});

export const userSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح').or(z.string().regex(/^07\d{8}$/, 'رقم الهاتف يجب أن يكون بصيغة 07XXXXXXXX')),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف').max(100),
  roleId: z.string().min(1, 'يجب اختيار الدور'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني أو رقم الهاتف مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate phone number
export function validatePhone(phone: string): boolean {
  return /^07\d{8}$/.test(phone);
}

// Validate email or phone
export function validateEmailOrPhone(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^07\d{8}$/;
  return emailRegex.test(input) || phoneRegex.test(input);
}

