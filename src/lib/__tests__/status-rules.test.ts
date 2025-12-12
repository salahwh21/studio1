import { describe, it, expect } from 'vitest';
import { validateStatusTransition, requiresDriver } from '../status-rules';

describe('Status Rules', () => {
  describe('requiresDriver', () => {
    it('should require driver when changing to "جاري التوصيل"', () => {
      expect(requiresDriver('بالانتظار', 'جاري التوصيل')).toBe(true);
    });

    it('should not require driver for other status changes', () => {
      expect(requiresDriver('بالانتظار', 'ملغي')).toBe(false);
      expect(requiresDriver('جاري التوصيل', 'تم التوصيل')).toBe(false);
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid status transition without driver requirement', () => {
      const result = validateStatusTransition('بالانتظار', 'مؤجل', 'غير معين');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject transition to "جاري التوصيل" without driver', () => {
      const result = validateStatusTransition('بالانتظار', 'جاري التوصيل', 'غير معين');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('يجب تعيين سائق');
    });

    it('should allow transition to "جاري التوصيل" with driver', () => {
      const result = validateStatusTransition('بالانتظار', 'جاري التوصيل', 'ابو العبد');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow same status transition', () => {
      const result = validateStatusTransition('بالانتظار', 'بالانتظار', 'غير معين');
      expect(result.valid).toBe(true);
    });

    it('should allow transition from "جاري التوصيل" to "تم التوصيل"', () => {
      const result = validateStatusTransition('جاري التوصيل', 'تم التوصيل', 'ابو العبد');
      expect(result.valid).toBe(true);
    });

    it('should allow transition from "جاري التوصيل" to "مرتجع"', () => {
      const result = validateStatusTransition('جاري التوصيل', 'مرتجع', 'ابو العبد');
      expect(result.valid).toBe(true);
    });

    it('should reject transition from "جاري التوصيل" to "مؤجل" (no rule)', () => {
      const result = validateStatusTransition('جاري التوصيل', 'مؤجل', 'ابو العبد');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('لا يمكن تغيير الحالة');
    });
  });
});
