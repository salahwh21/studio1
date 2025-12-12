-- Create settings table to store all application settings
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER DEFAULT 1, -- For multi-tenancy support in future
    settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(company_id)
);

-- Create index on company_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_company_id ON settings(company_id);

-- Create index on settings_data for JSONB queries
CREATE INDEX IF NOT EXISTS idx_settings_data ON settings USING GIN (settings_data);

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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists (may have been created by 001_initial_schema.sql)
DROP TRIGGER IF EXISTS settings_updated_at_trigger ON settings;

CREATE TRIGGER settings_updated_at_trigger
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Add comment to table
COMMENT ON TABLE settings IS 'Stores all application settings including notifications, orders, login, regional, UI, policy, menu visibility, and AI agent settings';
COMMENT ON COLUMN settings.settings_data IS 'JSONB column containing all settings data for flexible schema';
