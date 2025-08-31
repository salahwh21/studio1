import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
};

export const allPermissionGroups = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم الرئيسية',
    permissions: [
      { id: 'dashboard:view', label: 'عرض لوحة التحكم' },
    ],
  },
  {
    id: 'orders',
    label: 'إدارة الطلبات',
    permissions: [
      { id: 'orders:view', label: 'عرض الطلبات' },
      { id: 'orders:create', label: 'إنشاء طلبات' },
      { id: 'orders:edit', label: 'تعديل الطلبات' },
      { id: 'orders:delete', label: 'حذف الطلبات' },
    ],
  },
  {
    id: 'parse-order',
    label: 'إدخال الطلبات بالـ AI',
    permissions: [{ id: 'parse-order:use', label: 'استخدام صفحة إدخال الطلبات' }],
  },
  {
    id: 'optimize',
    label: 'تحسين المسار',
    permissions: [{ id: 'optimize:use', label: 'استخدام أداة تحسين المسار' }],
  },
  {
    id: 'drivers-map',
    label: 'خريطة السائقين',
    permissions: [{ id: 'drivers-map:view', label: 'عرض خريطة السائقين' }],
  },
  {
    id: 'returns',
    label: 'إدارة المرتجعات',
    permissions: [
        { id: 'returns:view', label: 'عرض المرتجعات' },
        { id: 'returns:manage', label: 'إدارة المرتجعات' },
    ],
  },
  {
    id: 'financials',
    label: 'الإدارة المالية',
    permissions: [
        { id: 'financials:view', label: 'عرض التقارير المالية' },
        { id: 'financials:manage_drivers', label: 'إدارة محاسبة السائقين' },
        { id: 'financials:manage_merchants', label: 'إدارة محاسبة التجار' },
    ],
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    permissions: [
        { id: 'settings:view', label: 'الوصول إلى الإعدادات' },
        { id: 'settings:manage_general', label: 'إدارة الإعدادات العامة' },
        { id: 'settings:manage_roles', label: 'إدارة الأدوار والصلاحيات' },
        { id: 'settings:manage_users', label: 'إدارة المستخدمين' },
    ],
  },
  {
    id: 'driver-app',
    label: 'تطبيق السائق',
    permissions: [{ id: 'driver-app:use', label: 'استخدام تطبيق السائق' }],
  },
  {
    id: 'merchant-portal',
    label: 'بوابة التاجر',
    permissions: [{ id: 'merchant-portal:use', label: 'استخدام بوابة التاجر' }],
  },
];


export const allPermissions = allPermissionGroups.flatMap(g => g.permissions.map(p => p.id));

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
    permissions: [
        'dashboard:view', 
        'orders:view', 
        'orders:create', 
        'orders:edit',
        'parse-order:use',
        'optimize:use',
        'drivers-map:view',
        'returns:view',
        'returns:manage',
        'financials:view',
        'settings:view',
        'settings:manage_roles',
        'settings:manage_users',
    ],
  },
  {
    id: 'customer_service',
    name: 'خدمة العملاء',
    description: 'يمكنه إضافة الطلبات ومتابعتها والتواصل مع العملاء.',
    userCount: 5,
    permissions: ['orders:view', 'orders:create', 'parse-order:use'],
  },
  {
    id: 'driver',
    name: 'سائق',
    description: 'يستخدم تطبيق السائق فقط لتحديث حالات الطلبات.',
    userCount: 15,
    permissions: ['driver-app:use'],
  },
  {
    id: 'merchant',
    name: 'تاجر',
    description: 'يستخدم بوابة التجار لمتابعة الطلبات والأمور المالية.',
    userCount: 50,
    permissions: ['merchant-portal:use'],
  },
];

type RolesState = {
  roles: Role[];
  addRole: (newRole: Omit<Role, 'id' | 'userCount'>) => void;
  updateRole: (roleId: string, updatedRole: Omit<Role, 'id' | 'permissions' | 'userCount'>) => void;
  updateRolePermissions: (roleId: string, permissions: string[]) => void;
  deleteRole: (roleId: string) => void;
  incrementUserCount: (roleId: string) => void;
  decrementUserCount: (roleId: string) => void;
};

export const useRolesStore = create<RolesState>()(immer((set) => ({
  roles: initialRoles,
  
  addRole: (newRole) => {
    set(state => {
      state.roles.push({
        ...newRole,
        id: newRole.name.toLowerCase().replace(/\s+/g, '-'),
        userCount: 0,
        permissions: [],
      });
    });
  },

  updateRole: (roleId, updatedRole) => {
      set(state => {
          const role = state.roles.find(r => r.id === roleId);
          if (role) {
              role.name = updatedRole.name;
              role.description = updatedRole.description;
          }
      });
  },

  updateRolePermissions: (roleId, permissions) =>
    set((state) => {
      const role = state.roles.find(r => r.id === roleId);
      if (role) {
          role.permissions = permissions;
      }
    }),

  deleteRole: (roleId) => {
      set(state => {
          state.roles = state.roles.filter(r => r.id !== roleId);
      });
  },

  incrementUserCount: (roleId) => {
      set(state => {
          const role = state.roles.find(r => r.id === roleId);
          if (role) {
              role.userCount++;
          }
      });
  },

  decrementUserCount: (roleId) => {
      set(state => {
          const role = state.roles.find(r => r.id === roleId);
          if (role) {
              role.userCount--;
          }
      });
  },
})));
