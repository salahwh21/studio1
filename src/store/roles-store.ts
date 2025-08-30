import { create } from 'zustand';

export type Role = {
  id: 'admin' | 'supervisor' | 'customer_service' | 'driver';
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
};

export const allPermissions = [
  { id: 'dashboard', label: 'لوحة التحكم' },
  { id: 'orders', label: 'عرض الطلبات' },
  { id: 'parse-order', label: 'إضافة طلبات' },
  { id: 'optimize', label: 'تحسين المسار' },
  { id: 'drivers-map', label: 'خريطة السائقين' },
  { id: 'returns', label: 'إدارة المرتجعات' },
  { id: 'financials', label: 'المحاسبة' },
  { id: 'settings', label: 'الإعدادات' },
  { id: 'driver-app', label: 'تطبيق السائق' },
];

const initialRoles: Role[] = [
  {
    id: 'admin',
    name: 'المدير العام',
    description: 'وصول كامل لجميع أجزاء النظام والإعدادات.',
    userCount: 1,
    permissions: ['all'],
  },
  {
    id: 'supervisor',
    name: 'مشرف',
    description: 'يمكنه إدارة الطلبات والسائقين والتقارير.',
    userCount: 3,
    permissions: ['dashboard', 'orders', 'parse-order', 'optimize', 'drivers-map', 'returns', 'financials'],
  },
  {
    id: 'customer_service',
    name: 'خدمة العملاء',
    description: 'يمكنه إضافة الطلبات ومتابعتها والتواصل مع العملاء.',
    userCount: 5,
    permissions: ['orders', 'parse-order'],
  },
  {
    id: 'driver',
    name: 'سائق',
    description: 'يستخدم تطبيق السائق فقط لتحديث حالات الطلبات.',
    userCount: 15,
    permissions: ['driver-app'],
  },
];

type RolesState = {
  roles: Role[];
  updateRolePermissions: (roleId: string, permissions: string[]) => void;
};

export const useRolesStore = create<RolesState>((set) => ({
  roles: initialRoles,
  updateRolePermissions: (roleId, permissions) =>
    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === roleId ? { ...role, permissions } : role
      ),
    })),
}));
