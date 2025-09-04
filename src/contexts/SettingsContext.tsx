

'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';

// 1. Define the shapes of our settings

// Notifications
export type NotificationTemplate = {
  id: string;
  statusId: string;
  recipients: ('customer' | 'merchant' | 'driver' | 'admin')[];
  whatsApp: string;
  sms: string;
};

export type AiNotificationRule = {
    statusId: string;
    recipients: ('customer' | 'merchant' | 'driver' | 'admin')[];
};

interface NotificationsSettings {
  manualTemplates: NotificationTemplate[];
  aiSettings: {
      useAI: boolean;
      aiTone: 'friendly' | 'formal' | 'concise';
      rules: AiNotificationRule[];
  };
}

// Orders
interface OrderSettings {
    orderPrefix: string;
    defaultStatus: string;
    refPrefix: string;
    archiveStartStatus: string;
    archiveAfterDays: number;
    archiveWarningDays: number;
}

// Login
interface SocialLinks {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

interface LoginSettings {
  companyName: string;
  welcomeMessage: string;
  loginLogo: string | null;
  headerLogo: string | null;
  loginBg: string | null;
  reportsLogo: string | null;
  policyLogo: string | null;
  favicon: string | null;
  showForgotPassword: boolean;
  socialLinks: SocialLinks;
}

// Regional
interface RegionalSettings {
    currency: string;
    currencySymbol: string;
    currencySymbolPosition: 'before' | 'after';
    thousandsSeparator: string;
    decimalSeparator: string;
    language: string;
    timezone: string;
    dateFormat: string;
    firstDayOfWeek: string;
    unitsSystem: 'metric' | 'imperial';
}

// UI Customization
interface UiSettings {
  density: string;
  borderRadius: string;
  iconStrokeWidth: number;
  iconLibrary: string;
}

// Policy
export type ElementType = 'text' | 'barcode' | 'image' | 'shape';
export type PolicyElement = {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline';
    color: string;
    borderColor: string;
    borderWidth: number;
    zIndex: number;
    opacity: number;
    backgroundColor: string;
    textAlign: string;
    borderRadius: number;
    ref?: React.RefObject<HTMLDivElement>;
};

export type PaperSize = 'a4' | 'a5' | 'a6' | '4x6' | 'custom';
export type PolicySettings = {
    elements: PolicyElement[];
    paperSize: PaperSize;
    customDimensions: { width: number; height: number };
    margins: { top: number; right: number; bottom: number; left: number };
};
export type SavedTemplate = PolicySettings & { id: string; name: string; isReadyMade?: boolean; };

// Re-defining the ready-made templates
export const readyTemplates: SavedTemplate[] = [
    {
        id: 'ready-1', name: 'قالب حراري أساسي (Zebra)', isReadyMade: true,
        paperSize: '4x6', customDimensions: { width: 101.6, height: 152.4 }, margins: { top: 2, right: 2, bottom: 2, left: 2 },
        elements: [
            { id: 'el-r1-1', type: 'text', x: 20, y: 10, width: 150, height: 20, content: 'شركة الوميض للشحن', fontSize: 18, fontWeight: 'bold', fontStyle: 'normal', zIndex: 0, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, textDecoration: 'none' },
            { id: 'el-r1-2', type: 'text', x: 200, y: 30, width: 150, height: 20, content: 'إلى: {{recipient}}', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', zIndex: 1, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, textDecoration: 'none' },
            { id: 'el-r1-3', type: 'text', x: 200, y: 55, width: 150, height: 40, content: '{{address}}', fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', zIndex: 2, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, textDecoration: 'none' },
            { id: 'el-r1-4', type: 'text', x: 200, y: 100, width: 150, height: 20, content: 'هاتف: {{phone}}', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', zIndex: 3, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, textDecoration: 'none' },
            { id: 'el-r1-5', type: 'text', x: 20, y: 100, width: 150, height: 20, content: 'الدفع عند الاستلام: {{cod}}', fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', zIndex: 4, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'left', borderRadius: 0, textDecoration: 'none' },
            { id: 'el-r1-6', type: 'barcode', x: 70, y: 130, width: 250, height: 60, content: '{{orderId}}', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', zIndex: 5, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, textDecoration: 'none' },
        ]
    },
    {
        id: 'ready-2', name: 'قالب A4 (4 بوالص)', isReadyMade: true,
        paperSize: 'a4', customDimensions: { width: 210, height: 297 }, margins: { top: 5, right: 5, bottom: 5, left: 5 },
        elements: [
             { id: 'el-r2-1', type: 'text', x: 10, y: 10, width: 150, height: 20, content: 'من: {{merchant}}', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', zIndex: 1, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, textDecoration: 'none' },
             { id: 'el-r2-2', type: 'text', x: 200, y: 10, width: 150, height: 20, content: 'إلى: {{recipient}}', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', zIndex: 1, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, textDecoration: 'none' },
             { id: 'el-r2-3', type: 'barcode', x: 120, y: 80, width: 150, height: 40, content: '{{orderId}}', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', zIndex: 5, color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, textDecoration: 'none' },
        ]
    },
    {
        id: 'ready-3', name: 'قالب بطاقة عرضي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 45 }, margins: { top: 2, right: 2, bottom: 2, left: 2 },
        elements: [
            { id: 'el-r3-1', type: 'image', x: 195, y: 5, width: 80, height: 35, content: '{{company_logo}}', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-r3-2', type: 'barcode', x: 8, y: 8, width: 120, height: 35, content: '{{orderId}}', zIndex: 1, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-r3-3', type: 'text', x: 10, y: 50, width: 265, height: 20, content: 'التاجر: {{merchant}}', zIndex: 2, fontSize: 12, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-r3-4', type: 'text', x: 160, y: 75, width: 115, height: 20, content: 'المستلم: {{recipient}}', zIndex: 3, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-r3-5', type: 'text', x: 10, y: 75, width: 115, height: 20, content: 'هاتف: {{phone}}', zIndex: 4, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-r3-6', type: 'text', x: 160, y: 95, width: 115, height: 20, content: 'المنطقة: {{region}}', zIndex: 5, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-r3-7', type: 'text', x: 10, y: 95, width: 115, height: 20, content: 'COD: {{cod}}', zIndex: 6, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-r3-8', type: 'text', x: 10, y: 120, width: 265, height: 40, content: 'ملاحظات: {{notes}}', zIndex: 7, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#dddddd', borderWidth: 1, opacity: 1, backgroundColor: '#f9f9f9', textAlign: 'right', borderRadius: 4, },
        ]
    }
];

// Main settings structure
interface ComprehensiveSettings {
  notifications: NotificationsSettings;
  orders: OrderSettings;
  login: LoginSettings;
  regional: RegionalSettings;
  ui: UiSettings;
  policy: PolicySettings;
}

// 2. Define the context shape
interface SettingsContextType {
  settings: ComprehensiveSettings;
  setSetting: <K extends keyof ComprehensiveSettings>(key: K, value: ComprehensiveSettings[K]) => void;
  updateOrderSetting: <K extends keyof OrderSettings>(key: K, value: OrderSettings[K]) => void;
  updateLoginSetting: <K extends keyof LoginSettings>(key: K, value: LoginSettings[K]) => void;
  updateSocialLink: <K extends keyof SocialLinks>(key: K, value: SocialLinks[K]) => void;
  updateRegionalSetting: <K extends keyof RegionalSettings>(key: K, value: RegionalSettings[K]) => void;
  updateUiSetting: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => void;
  updatePolicySetting: <K extends keyof PolicySettings>(key: K, value: PolicySettings[K]) => void;
  formatCurrency: (amount: number) => string;
  isHydrated: boolean;
}

// 3. Create the context
export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// 4. Define default settings data
const defaultSettingsData: ComprehensiveSettings = {
  notifications: {
    manualTemplates: [
      { id: 'tpl_1', statusId: 'OUT_FOR_DELIVERY', recipients: ['customer'], whatsApp: 'مرحباً {{customerName}}، طلبك رقم *{{orderId}}* في طريقه إليك الآن مع السائق {{driverName}}. نتمنى لك يوماً سعيداً!', sms: 'طلبك {{orderId}} خرج للتوصيل. الوميض.' },
      { id: 'tpl_2', statusId: 'DELIVERED', recipients: ['customer', 'merchant'], whatsApp: 'مرحباً {{customerName}}، تم توصيل طلبك رقم *{{orderId}}* بنجاح. شكراً لثقتكم بخدماتنا!', sms: 'تم توصيل طلبك {{orderId}}. الوميض.' },
      { id: 'tpl_3', statusId: 'POSTPONED', recipients: ['customer'], whatsApp: 'مرحباً {{customerName}}، تم تأجيل توصيل طلبك رقم *{{orderId}}* حسب طلبكم. سيتم التواصل معكم قريباً لتحديد موعد جديد.', sms: 'تم تأجيل طلبك {{orderId}}.' },
      { id: 'tpl_4', statusId: 'RETURNED', recipients: ['merchant'], whatsApp: 'تنبيه: تم إنشاء طلب مرتجع للشحنة رقم *{{orderId}}*. سبب الإرجاع: {{reason}}.', sms: 'مرتجع جديد للطلب {{orderId}}.' },
      { id: 'tpl_5', statusId: 'CANCELLED', recipients: ['merchant'], whatsApp: 'نأسف لإبلاغكم بأنه تم إلغاء الطلب رقم *{{orderId}}* من قبل العميل.', sms: 'تم إلغاء الطلب {{orderId}}.' },
    ],
    aiSettings: {
        useAI: false,
        aiTone: 'friendly',
        rules: []
    }
  },
  orders: {
    orderPrefix: 'ORD-',
    defaultStatus: 'PENDING',
    refPrefix: 'REF-',
    archiveStartStatus: 'COMPLETED',
    archiveAfterDays: 90,
    archiveWarningDays: 7,
  },
  login: {
    companyName: 'الوميض',
    welcomeMessage: 'مرحباً',
    loginLogo: null,
    headerLogo: null,
    loginBg: null,
    reportsLogo: null,
    policyLogo: null,
    favicon: null,
    showForgotPassword: true,
    socialLinks: {
      whatsapp: '',
      instagram: '',
      facebook: '',
    },
  },
  regional: {
    currency: 'JOD',
    currencySymbol: 'د.أ',
    currencySymbolPosition: 'after',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    language: 'ar',
    timezone: 'Asia/Amman',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 'saturday',
    unitsSystem: 'metric',
  },
  ui: {
    density: 'comfortable',
    borderRadius: '0.5',
    iconStrokeWidth: 2,
    iconLibrary: 'lucide',
  },
  policy: {
    elements: [],
    paperSize: 'custom',
    customDimensions: { width: 100, height: 150 }, // Standard 4x6 inch in mm
    margins: { top: 5, right: 5, bottom: 5, left: 5 },
  }
};

// 5. Create the provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ComprehensiveSettings>(defaultSettingsData);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('comprehensiveAppSettings');
      if (item) {
        const savedSettings = JSON.parse(item);
        // Deep merge to ensure new default settings are not lost
        const mergedSettings = {
          ...defaultSettingsData,
          ...savedSettings,
           policy: {
            ...defaultSettingsData.policy,
            ...(savedSettings.policy || {}),
          },
          notifications: {
            ...defaultSettingsData.notifications,
            ...(savedSettings.notifications || {}),
          },
          orders: {
              ...defaultSettingsData.orders,
              ...(savedSettings.orders || {}),
          },
          login: {
              ...defaultSettingsData.login,
              ...(savedSettings.login || {}),
          },
          regional: {
            ...defaultSettingsData.regional,
            ...(savedSettings.regional || {}),
          },
          ui: {
            ...defaultSettingsData.ui,
            ...(savedSettings.ui || {}),
          },
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    } finally {
        setIsHydrated(true);
    }
  }, []);

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
        try {
            window.localStorage.setItem('comprehensiveAppSettings', JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }
  }, [settings, isHydrated]);

  // Generic function to update a top-level setting
  const setSetting = <K extends keyof ComprehensiveSettings>(key: K, value: ComprehensiveSettings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };
  
  const updateNestedSetting = <T extends keyof ComprehensiveSettings, K extends keyof ComprehensiveSettings[T]>(
      topLevelKey: T,
      nestedKey: K,
      value: ComprehensiveSettings[T][K]
  ) => {
       setSettings(prev => ({
          ...prev,
          [topLevelKey]: {
              ...prev[topLevelKey],
              [nestedKey]: value,
          }
      }));
  }

  const updateOrderSetting = (key: keyof OrderSettings, value: any) => updateNestedSetting('orders', key, value);
  const updateLoginSetting = (key: keyof LoginSettings, value: any) => updateNestedSetting('login', key, value);
  const updateRegionalSetting = (key: keyof RegionalSettings, value: any) => updateNestedSetting('regional', key, value);
  const updateUiSetting = (key: keyof UiSettings, value: any) => updateNestedSetting('ui', key, value);
  const updatePolicySetting = (key: keyof PolicySettings, value: any) => updateNestedSetting('policy', key, value);

  const updateSocialLink = (key: keyof SocialLinks, value: string) => {
      setSettings(prev => ({
          ...prev,
          login: {
              ...prev.login,
              socialLinks: {
                  ...prev.login.socialLinks,
                  [key]: value
              }
          }
      }))
  }
  
  const formatCurrency = useCallback((amount: number): string => {
    const { currencySymbol, currencySymbolPosition, thousandsSeparator, decimalSeparator } = settings.regional;
    const fixedAmount = amount.toFixed(2);
    let [integerPart, decimalPart] = fixedAmount.split('.');

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    const formattedNumber = `${integerPart}${decimalSeparator}${decimalPart}`;

    if (currencySymbolPosition === 'before') {
      return `${currencySymbol} ${formattedNumber}`;
    }
    return `${formattedNumber} ${currencySymbol}`;
  }, [settings.regional]);

  const value = { settings, setSetting, updateOrderSetting, updateLoginSetting, updateSocialLink, updateRegionalSetting, updateUiSetting, formatCurrency, isHydrated, updatePolicySetting };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// 6. Custom hook to use the context easily
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
