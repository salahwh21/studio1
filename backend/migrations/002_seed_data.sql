-- Migration: 002 Seed Data
-- Date: 2025-12-11
-- Description: Default roles, statuses, and initial admin user
-- Note: Run this AFTER 001_initial_schema.sql

-- =============================================
-- SEED: Roles
-- =============================================
INSERT INTO roles (id, name, description, permissions, user_count) VALUES
    ('admin', 'المدير العام', 'وصول كامل لجميع أجزاء النظام والإعدادات.', ARRAY['all'], 0),
    ('supervisor', 'مشرف', 'يمكنه إدارة الطلبات والسائقين والتقارير.', ARRAY['dashboard:view', 'orders:view', 'orders:create', 'orders:edit'], 0),
    ('customer_service', 'خدمة العملاء', 'يمكنه إضافة الطلبات ومتابعتها.', ARRAY['orders:view', 'orders:create'], 0),
    ('driver', 'سائق', 'يستخدم تطبيق السائق لتحديث حالات الطلبات.', ARRAY['driver-app:use'], 0),
    ('merchant', 'تاجر', 'يستخدم بوابة التجار لمتابعة الطلبات.', ARRAY['merchant-portal:use'], 0)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- =============================================
-- SEED: Statuses
-- =============================================
INSERT INTO statuses (id, code, name, icon, color, is_active) VALUES
    ('STS_001', 'PENDING', 'بالانتظار', 'Clock', '#607D8B', true),
    ('STS_002', 'OUT_FOR_DELIVERY', 'جاري التوصيل', 'Truck', '#1976D2', true),
    ('STS_003', 'DELIVERED', 'تم التوصيل', 'PackageCheck', '#2E7D32', true),
    ('STS_004', 'POSTPONED', 'مؤجل', 'CalendarClock', '#F9A825', true),
    ('STS_005', 'RETURNED', 'مرتجع', 'Undo2', '#8E24AA', true),
    ('STS_006', 'CANCELLED', 'ملغي', 'XCircle', '#D32F2F', true),
    ('STS_007', 'MONEY_RECEIVED', 'تم استلام المال في الفرع', 'HandCoins', '#004D40', true),
    ('STS_008', 'COMPLETED', 'مكتمل', 'CheckCheck', '#1B5E20', true),
    ('STS_009', 'EXCHANGE', 'تبديل', 'Repeat', '#fb923c', true),
    ('STS_010', 'REFUSED_PAID', 'رفض ودفع أجور', 'ThumbsDown', '#ef4444', true),
    ('STS_011', 'REFUSED_UNPAID', 'رفض ولم يدفع أجور', 'Ban', '#b91c1c', true),
    ('STS_012', 'BRANCH_RETURNED', 'مرجع للفرع', 'Building', '#7e22ce', true),
    ('STS_013', 'MERCHANT_RETURNED', 'مرجع للتاجر', 'Undo2', '#581c87', true),
    ('STS_014', 'ARCHIVED', 'مؤرشف', 'Archive', '#4b5563', false),
    ('STS_015', 'NO_ANSWER', 'لا رد', 'PhoneOff', '#f59e0b', true),
    ('STS_016', 'ARRIVAL_NO_ANSWER', 'وصول وعدم رد', 'UserX', '#e11d48', true),
    ('STS_017', 'MERCHANT_PAID', 'تم محاسبة التاجر', 'Banknote', '#0891b2', true),
    ('STS_018', 'WAITING_DRIVER_APPROVAL', 'بانتظار السائق', 'UserCheck', '#78909C', true)
ON CONFLICT (id) DO UPDATE SET 
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    is_active = EXCLUDED.is_active;

-- =============================================
-- SEED: Default Settings
-- =============================================
INSERT INTO settings (company_id, settings_data, created_by) 
VALUES (1, '{
  "notifications": {
    "manualTemplates": [
      {
        "id": "tpl_1",
        "statusId": "OUT_FOR_DELIVERY",
        "recipients": ["customer"],
        "whatsApp": "مرحباً {{customerName}}، طلبك رقم *{{orderId}}* في طريقه إليك الآن مع السائق {{driverName}}. نتمنى لك يوماً سعيداً!",
        "sms": "طلبك {{orderId}} خرج للتوصيل. الوميض."
      },
      {
        "id": "tpl_2",
        "statusId": "DELIVERED",
        "recipients": ["customer", "merchant"],
        "whatsApp": "مرحباً {{customerName}}، تم توصيل طلبك رقم *{{orderId}}* بنجاح. شكراً لثقتكم بخدماتنا!",
        "sms": "تم توصيل طلبك {{orderId}}. الوميض."
      }
    ],
    "aiSettings": {
      "useAI": false,
      "aiTone": "friendly",
      "rules": []
    }
  },
  "orders": {
    "orderPrefix": "ORD-",
    "defaultStatus": "PENDING",
    "refPrefix": "REF-",
    "archiveStartStatus": "COMPLETED",
    "archiveAfterDays": 90,
    "archiveWarningDays": 7
  },
  "login": {
    "companyName": "الوميض",
    "welcomeMessage": "مرحباً",
    "loginLogo": null,
    "headerLogo": null,
    "loginBg": null,
    "reportsLogo": null,
    "policyLogo": null,
    "favicon": null,
    "showForgotPassword": true,
    "socialLinks": {
      "whatsapp": "",
      "instagram": "",
      "facebook": ""
    }
  },
  "regional": {
    "currency": "JOD",
    "currencySymbol": "د.أ",
    "currencySymbolPosition": "after",
    "thousandsSeparator": ",",
    "decimalSeparator": ".",
    "language": "ar",
    "timezone": "Asia/Amman",
    "dateFormat": "DD/MM/YYYY",
    "firstDayOfWeek": "saturday",
    "unitsSystem": "metric"
  },
  "ui": {
    "density": "comfortable",
    "borderRadius": "0.5",
    "iconStrokeWidth": 2,
    "iconLibrary": "lucide"
  },
  "policy": {
    "elements": [],
    "paperSize": "custom",
    "customDimensions": {
      "width": 100,
      "height": 150
    },
    "margins": {
      "top": 5,
      "right": 5,
      "bottom": 5,
      "left": 5
    }
  },
  "menuVisibility": {
    "merchant": ["dashboard:view", "orders:view", "financials:view", "merchant-portal:use"],
    "driver": ["driver-app:use"]
  },
  "aiAgent": {
    "enabled": true
  }
}'::jsonb, 'system')
ON CONFLICT (company_id) DO NOTHING;

-- =============================================
-- SEED: Sample Cities (Jordan)
-- =============================================
INSERT INTO cities (id, name) VALUES
    ('CITY_AMM', 'عمان'),
    ('CITY_IRB', 'إربد'),
    ('CITY_ZRQ', 'الزرقاء'),
    ('CITY_AQB', 'العقبة'),
    ('CITY_SAL', 'السلط'),
    ('CITY_MAD', 'مادبا'),
    ('CITY_JRS', 'جرش'),
    ('CITY_AJL', 'عجلون'),
    ('CITY_KRK', 'الكرك'),
    ('CITY_MFQ', 'المفرق')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED: Sample Regions (Amman)
-- =============================================
INSERT INTO regions (id, name, city_id) VALUES
    ('REG_AMM_001', 'تلاع العلي', 'CITY_AMM'),
    ('REG_AMM_002', 'عبدون', 'CITY_AMM'),
    ('REG_AMM_003', 'الصويفية', 'CITY_AMM'),
    ('REG_AMM_004', 'دابوق', 'CITY_AMM'),
    ('REG_AMM_005', 'خلدا', 'CITY_AMM'),
    ('REG_AMM_006', 'الجاردنز', 'CITY_AMM'),
    ('REG_AMM_007', 'مرج الحمام', 'CITY_AMM'),
    ('REG_AMM_008', 'الجبيهة', 'CITY_AMM'),
    ('REG_AMM_009', 'شفا بدران', 'CITY_AMM'),
    ('REG_AMM_010', 'طبربور', 'CITY_AMM'),
    ('REG_AMM_011', 'ماركا', 'CITY_AMM'),
    ('REG_AMM_012', 'الهاشمي الشمالي', 'CITY_AMM'),
    ('REG_AMM_013', 'جبل الحسين', 'CITY_AMM'),
    ('REG_AMM_014', 'وسط البلد', 'CITY_AMM'),
    ('REG_AMM_015', 'جبل عمان', 'CITY_AMM')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED: Sample Regions (Irbid)
-- =============================================
INSERT INTO regions (id, name, city_id) VALUES
    ('REG_IRB_001', 'الحي الشرقي', 'CITY_IRB'),
    ('REG_IRB_002', 'شارع الجامعة', 'CITY_IRB'),
    ('REG_IRB_003', 'الحصن', 'CITY_IRB'),
    ('REG_IRB_004', 'بيت راس', 'CITY_IRB')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED: Sample Regions (Zarqa)
-- =============================================
INSERT INTO regions (id, name, city_id) VALUES
    ('REG_ZRQ_001', 'جبل طارق', 'CITY_ZRQ'),
    ('REG_ZRQ_002', 'الهاشمية', 'CITY_ZRQ'),
    ('REG_ZRQ_003', 'الرصيفة', 'CITY_ZRQ')
ON CONFLICT (id) DO NOTHING;
