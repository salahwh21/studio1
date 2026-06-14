'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

const MIGRATED_KEY = 'prefs_migrated_v1';

export function useMigrateLocalStorage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(MIGRATED_KEY)) return;

    const patch: Record<string, unknown> = {};

    // أعمدة الجدول
    try {
      const raw = localStorage.getItem('ordersTableColumnSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.savedVisibleKeys)) {
          patch.ordersTableColumns = parsed.savedVisibleKeys;
        }
      }
    } catch {}

    // حقول التصدير
    try {
      const raw = localStorage.getItem('ordersExportFieldsSettings');
      if (raw) {
        const keys = JSON.parse(raw);
        if (Array.isArray(keys)) patch.exportFields = keys;
      }
    } catch {}

    // الفلاتر المحفوظة
    try {
      const raw = localStorage.getItem('orders-saved-filters');
      if (raw) {
        const filters = JSON.parse(raw);
        if (Array.isArray(filters)) patch.savedFilters = filters;
      }
    } catch {}

    // إعدادات الذكاء الاصطناعي
    try {
      const raw = localStorage.getItem('ai_config');
      if (raw) {
        patch.aiConfig = { providers: JSON.parse(raw), defaultProvider: undefined, customProviders: [] };
      }
    } catch {}

    // التكاملات
    try {
      const raw = localStorage.getItem('user-integrations');
      if (raw) {
        const integrations = JSON.parse(raw);
        if (Array.isArray(integrations)) patch.integrations = integrations;
      }
    } catch {}

    // إعدادات الثيم
    try {
      const raw = localStorage.getItem('themeSettings');
      if (raw) patch.theme = JSON.parse(raw);
    } catch {}

    if (Object.keys(patch).length > 0) {
      api.savePreferences(patch)
        .then(() => {
          // حذف المفاتيح القديمة بعد النقل
          localStorage.removeItem('ordersTableColumnSettings');
          localStorage.removeItem('ordersExportFieldsSettings');
          localStorage.removeItem('orders-saved-filters');
          localStorage.removeItem('ai_config');
          localStorage.removeItem('user-integrations');
          localStorage.removeItem('themeSettings');
          localStorage.removeItem('comprehensiveAppSettings');
          localStorage.setItem(MIGRATED_KEY, '1');
        })
        .catch(() => {
          // سيُعاد المحاولة في الزيارة القادمة
        });
    } else {
      localStorage.setItem(MIGRATED_KEY, '1');
    }
  }, []);
}
