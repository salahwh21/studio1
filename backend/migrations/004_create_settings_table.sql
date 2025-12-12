-- Migration: 004 Create Settings Table (Default Data)
-- Date: 2025-12-11
-- Description: Inserts default settings data into the settings table
-- NOTE: The settings table structure is already created in 001_initial_schema.sql
-- NOTE: The trigger for updated_at is already configured in 001_initial_schema.sql

-- Insert default settings
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

-- Add comment to table (if not already added by 001)
COMMENT ON TABLE settings IS 'Stores all application settings including notifications, orders, login, regional, UI, policy, menu visibility, and AI agent settings';
COMMENT ON COLUMN settings.settings_data IS 'JSONB column containing all settings data for flexible schema';
