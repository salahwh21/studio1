'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

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
export interface PolicySettings {
    paperSize: 'a4' | 'a5' | 'label_4x6' | 'label_4x4' | 'label_4x2' | 'label_3x2' | 'label_2x3';
    layout: 'default' | 'compact' | 'detailed';
    showCompanyLogo: boolean;
    showCompanyName: boolean;
    showCompanyAddress: boolean;
    showRefNumber: boolean;
    showItems: boolean;
    showPrice: boolean;
    showBarcode: boolean;
    footerNotes: string;
    customFields: {label: string, value: string}[];
}


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
  setSetting: <K extends keyof ComprehensiveSettings, V extends ComprehensiveSettings[K]>(key: K, value: V) => void;
  updateOrderSetting: <K extends keyof OrderSettings>(key: K, value: OrderSettings[K]) => void;
  updateLoginSetting: <K extends keyof LoginSettings>(key: K, value: LoginSettings[K]) => void;
  updateSocialLink: <K extends keyof SocialLinks>(key: K, value: SocialLinks[K]) => void;
  updateRegionalSetting: <K extends keyof RegionalSettings>(key: K, value: RegionalSettings[K]) => void;
  updateUiSetting: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => void;
  updatePolicySetting: <K extends keyof PolicySettings>(key: K, value: PolicySettings[K]) => void;
  setPolicySettings: (newPolicySettings: PolicySettings) => void;
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
      { id: 'tpl_3', statusId: 'POSTPONED', recipients: ['customer'], whatsApp: 'مرحباً {{customerName}}، تم تأجيل توصيل طلبك رقم *{{orderId}}* حسب طلبكم. سيتم التواصل معكم قريباً لتحديد موعد جديد.', sms: 'تم تأجيل طلبك {{orderId}} بناء على طلبك.' },
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
      paperSize: 'a4',
      layout: 'default',
      showCompanyLogo: true,
      showCompanyName: true,
      showCompanyAddress: true,
      showRefNumber: true,
      showItems: true,
      showPrice: true,
      showBarcode: true,
      footerNotes: 'شكراً لثقتكم بخدماتنا. يمكنكم التواصل معنا على 079xxxxxxx لأي استفسار.',
      customFields: [],
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
           policy: {
            ...defaultSettingsData.policy,
            ...(savedSettings.policy || {}),
          }
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
  const setSetting = <K extends keyof ComprehensiveSettings, V extends ComprehensiveSettings[K]>(key: K, value: V) => {
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
  
  const setPolicySettings = (newPolicySettings: PolicySettings) => setSetting('policy', newPolicySettings);

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

  const value = { settings, setSetting, updateOrderSetting, updateLoginSetting, updateSocialLink, updateRegionalSetting, updateUiSetting, updatePolicySetting, setPolicySettings, isHydrated };

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
