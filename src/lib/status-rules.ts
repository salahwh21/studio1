/**
 * Status transition rules and validations
 */

export type OrderStatus =
  | 'بالانتظار'
  | 'بانتظار السائق'
  | 'جاري التوصيل'
  | 'تم التوصيل'
  | 'مرتجع'
  | 'مؤجل'
  | 'تم استلام المال في الفرع'
  | 'تم محاسبة التاجر';

export interface StatusTransitionRule {
  from: OrderStatus;
  to: OrderStatus;
  requiresDriver: boolean;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  allowedRoles?: string[];
}

export const STATUS_RULES: StatusTransitionRule[] = [
  // من "بالانتظار" إلى "بانتظار السائق" - عند تعيين سائق
  {
    from: 'بالانتظار',
    to: 'بانتظار السائق',
    requiresDriver: true,
    requiresConfirmation: false,
  },

  // من "بانتظار السائق" إلى "جاري التوصيل" - موافقة السائق
  {
    from: 'بانتظار السائق',
    to: 'جاري التوصيل',
    requiresDriver: true,
    requiresConfirmation: true,
    confirmationMessage: 'هل تود استلام هذا الطلب وتوصيله؟',
    allowedRoles: ['admin', 'driver'],
  },

  // من "بالانتظار" إلى "جاري التوصيل" - تجاوز (Admin Override) أو مباشر
  {
    from: 'بالانتظار',
    to: 'جاري التوصيل',
    requiresDriver: true,
    requiresConfirmation: true,
    confirmationMessage: 'يجب تعيين سائق قبل تغيير الحالة إلى "جاري التوصيل"',
  },

  // من "جاري التوصيل" إلى "تم التوصيل"
  {
    from: 'جاري التوصيل',
    to: 'تم التوصيل',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تم تسليم الطلب بنجاح؟',
  },

  // من "جاري التوصيل" إلى "مرتجع"
  {
    from: 'جاري التوصيل',
    to: 'مرتجع',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد إرجاع الطلب؟',
  },

  // من "بالانتظار" إلى "مؤجل"
  {
    from: 'بالانتظار',
    to: 'مؤجل',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد تأجيل هذا الطلب؟',
  },

  // من "تم التوصيل" إلى "تم استلام المال في الفرع"
  {
    from: 'تم التوصيل',
    to: 'تم استلام المال في الفرع',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تم استلام المال في الفرع؟',
    allowedRoles: ['admin', 'supervisor'],
  },

  // من "تم استلام المال في الفرع" إلى "تم محاسبة التاجر"
  {
    from: 'تم استلام المال في الفرع',
    to: 'تم محاسبة التاجر',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد تأكيد تسليم المبلغ للتاجر؟',
    allowedRoles: ['admin', 'supervisor'],
  },

  // التحويلات العكسية والخاصة
  
  // من "جاري التوصيل" إلى "بانتظار السائق" - عند إلغاء التوصيل أو تغيير السائق
  {
    from: 'جاري التوصيل',
    to: 'بانتظار السائق',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد إلغاء التوصيل وإعادة الطلب إلى انتظار السائق؟',
    allowedRoles: ['admin', 'supervisor'],
  },

  // من "جاري التوصيل" إلى "بالانتظار" - عند إلغاء التوصيل تماماً
  {
    from: 'جاري التوصيل',
    to: 'بالانتظار',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد إلغاء التوصيل وإعادة الطلب إلى قائمة الانتظار؟',
    allowedRoles: ['admin', 'supervisor'],
  },

  // من "بانتظار السائق" إلى "بالانتظار" - عند إلغاء تعيين السائق
  {
    from: 'بانتظار السائق',
    to: 'بالانتظار',
    requiresDriver: false,
    requiresConfirmation: false,
    allowedRoles: ['admin', 'supervisor'],
  },

  // من "مؤجل" إلى "بالانتظار" - عند إلغاء التأجيل
  {
    from: 'مؤجل',
    to: 'بالانتظار',
    requiresDriver: false,
    requiresConfirmation: false,
  },

  // من "مؤجل" إلى "بانتظار السائق" - عند تعيين سائق لطلب مؤجل
  {
    from: 'مؤجل',
    to: 'بانتظار السائق',
    requiresDriver: true,
    requiresConfirmation: false,
  },

  // من "مؤجل" إلى "جاري التوصيل" - عند بدء التوصيل مباشرة
  {
    from: 'مؤجل',
    to: 'جاري التوصيل',
    requiresDriver: true,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد بدء التوصيل مباشرة؟',
  },

  // من "مرتجع" إلى "بالانتظار" - عند إعادة الطلب المرتجع
  {
    from: 'مرتجع',
    to: 'بالانتظار',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد إعادة الطلب المرتجع إلى قائمة الانتظار؟',
    allowedRoles: ['admin', 'supervisor'],
  },

  // من "مرتجع" إلى "بانتظار السائق" - عند تعيين سائق لطلب مرتجع
  {
    from: 'مرتجع',
    to: 'بانتظار السائق',
    requiresDriver: true,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد إعادة محاولة التوصيل للطلب المرتجع؟',
    allowedRoles: ['admin', 'supervisor'],
  },

  // من "تم التوصيل" إلى "جاري التوصيل" - عند تصحيح خطأ
  {
    from: 'تم التوصيل',
    to: 'جاري التوصيل',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد إعادة الطلب إلى حالة "جاري التوصيل"؟',
    allowedRoles: ['admin', 'supervisor'],
  },

  // من "تم استلام المال في الفرع" إلى "تم التوصيل" - عند تصحيح خطأ
  {
    from: 'تم استلام المال في الفرع',
    to: 'تم التوصيل',
    requiresDriver: false,
    requiresConfirmation: true,
    confirmationMessage: 'هل تريد إعادة الحالة إلى "تم التوصيل"؟',
    allowedRoles: ['admin', 'supervisor'],
  },
];

/**
 * Get rule for status transition
 */
export function getStatusRule(from: string, to: string): StatusTransitionRule | null {
  return STATUS_RULES.find(rule => rule.from === from && rule.to === to) || null;
}

/**
 * Check if status transition is valid
 */
export function isValidTransition(from: string, to: string): boolean {
  // Same status is always valid
  if (from === to) return true;

  // Check if there's a rule for this transition
  const rule = getStatusRule(from, to);
  return rule !== null;
}

/**
 * Check if driver is required for transition
 */
export function requiresDriver(from: string, to: string): boolean {
  const rule = getStatusRule(from, to);
  return rule?.requiresDriver || false;
}

/**
 * Check if confirmation is required
 */
export function requiresConfirmation(from: string, to: string): boolean {
  const rule = getStatusRule(from, to);
  return rule?.requiresConfirmation || false;
}

/**
 * Get confirmation message
 */
export function getConfirmationMessage(from: string, to: string): string | null {
  const rule = getStatusRule(from, to);
  return rule?.confirmationMessage || null;
}

/**
 * Validate status transition with driver
 */
export function validateStatusTransition(
  from: string,
  to: string,
  driverId?: string,
  userRole?: string
): { valid: boolean; error?: string } {
  // Same status
  if (from === to) {
    return { valid: true };
  }

  const rule = getStatusRule(from, to);

  // No rule found - invalid transition
  if (!rule) {
    return {
      valid: false,
      error: `لا يمكن تغيير الحالة من "${from}" إلى "${to}"`,
    };
  }

  // Check role permission
  if (rule.allowedRoles && userRole && !rule.allowedRoles.includes(userRole)) {
    return {
      valid: false,
      error: 'ليس لديك صلاحية لتغيير هذه الحالة',
    };
  }

  // Check driver requirement
  if (rule.requiresDriver && (!driverId || driverId === 'غير معين')) {
    return {
      valid: false,
      error: 'يجب تعيين سائق قبل تغيير الحالة إلى "جاري التوصيل"',
    };
  }

  return { valid: true };
}
