

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
type ElementType = 'text' | 'image' | 'barcode' | 'rect' | 'line' | 'table';
type FontWeight = 'normal' | 'bold';

type TableCellData = { id: string; content: string };
type TableRowData = { id: string; cells: TableCellData[] };

export type PolicyElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  zIndex: number;
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  backgroundColor?: string;
  // Table specific properties
  rowCount?: number;
  colCount?: number;
  tableData?: TableRowData[];
  headers?: string[];
};

export type SavedTemplate = {
  id: string;
  name: string;
  elements: PolicyElement[];
  paperSize: PolicySettings['paperSize'];
  customDimensions: { width: number; height: number };
  margins: { top: number; right: number; bottom: number; left: number };
  isReadyMade?: boolean;
};

export interface PolicySettings {
    paperSize: 'a4' | 'a5' | 'label_4x6' | 'label_4x4' | 'custom';
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
    customDimensions: { width: number, height: number };
    margins: { top: number, right: number, bottom: number, left: number };
    elements: PolicyElement[];
}

export const readyTemplates: Record<string, SavedTemplate> = {
    "a4_default": {
        id: "a4_default", name: "A4 احترافي", paperSize: "a4", isReadyMade: true,
        customDimensions: { width: 210, height: 297 }, margins: { top: 10, right: 10, bottom: 10, left: 10 },
        elements: [
            { id: "1", type: "rect", x: 16, y: 16, width: 752, height: 112, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 2, backgroundColor: "#f3f4f6", opacity: 1, color: '#000000', fontSize: 14, fontWeight: 'normal' },
            { id: "2", type: "text", x: 576, y: 24, width: 184, height: 40, zIndex: 1, content: "بوليصة شحن", fontSize: 24, fontWeight: "bold", color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "3", type: "image", x: 24, y: 24, width: 144, height: 56, zIndex: 1, content: "{company_logo}", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "4", type: "text", x: 24, y: 88, width: 200, height: 24, zIndex: 1, content: "اسم الشركة: {company_name}", fontSize: 12, color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "5", type: "barcode", x: 584, y: 72, width: 176, height: 48, zIndex: 1, content: "{order_id}", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "6", type: "rect", x: 16, y: 144, width: 376, height: 200, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 1, backgroundColor: '#ffffff', opacity: 1, color: '#000000', fontSize: 14, fontWeight: 'normal' },
            { id: "7", type: "rect", x: 400, y: 144, width: 368, height: 200, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 1, backgroundColor: '#ffffff', opacity: 1, color: '#000000', fontSize: 14, fontWeight: 'normal' },
            { id: "8", type: "text", x: 408, y: 152, width: 120, height: 24, zIndex: 1, content: "إلى (المستلم):", fontSize: 16, fontWeight: "bold", color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "9", type: "text", x: 24, y: 152, width: 120, height: 24, zIndex: 1, content: "من (المرسل):", fontSize: 16, fontWeight: "bold", color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "10", type: "text", x: 32, y: 184, width: 352, height: 152, zIndex: 1, content: "اسم المتجر: {merchant_name}\nهاتف: {merchant_phone}\nعنوان: {merchant_address}", fontSize: 14, color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "11", type: "text", x: 408, y: 184, width: 352, height: 152, zIndex: 1, content: "اسم المستلم: {recipient_name}\nهاتف: {recipient_phone}\nعنوان: {recipient_address}", fontSize: 14, color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "12", type: "rect", x: 16, y: 360, width: 752, height: 160, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 1, backgroundColor: '#ffffff', opacity: 1, color: '#000000', fontSize: 14, fontWeight: 'normal' },
            { id: "13", type: "text", x: 608, y: 368, width: 152, height: 32, zIndex: 1, content: "ملخص الطلب", fontSize: 16, fontWeight: "bold", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "14", type: "text", x: 48, y: 368, width: 150, height: 30, zIndex: 1, content: "قيمة التحصيل (COD)", fontSize: 18, fontWeight: "bold", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "15", type: "text", x: 32, y: 408, width: 200, height: 60, zIndex: 1, content: "{cod_amount}", fontSize: 36, fontWeight: "bold", color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "16", type: "text", x: 408, y: 400, width: 352, height: 112, zIndex: 1, content: "المنتجات: {order_items}\nالكمية: {items_count}\nملاحظات: {notes}", fontSize: 12, color: "#374151", opacity: 1, borderWidth: 0, borderColor: '#000000' },
        ]
    },
    "label_4x6_default": {
        id: "label_4x6_default", name: "بوليصة 4x6 عملية", paperSize: "label_4x6", isReadyMade: true,
        customDimensions: { width: 101.6, height: 152.4 }, margins: { top: 5, right: 5, bottom: 5, left: 5 },
        elements: [
            { id: "1", type: "text", x: 16, y: 16, width: 184, height: 24, zIndex: 1, content: "من: {merchant_name}", fontSize: 14, fontWeight: "bold", color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "2", type: "text", x: 16, y: 48, width: 352, height: 120, zIndex: 1, content: "إلى: {recipient_name}\n{recipient_address}\n{recipient_phone}", fontSize: 18, color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "3", type: "barcode", x: 40, y: 176, width: 304, height: 80, zIndex: 1, content: "{order_id}", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "4", type: "text", x: 16, y: 264, width: 352, height: 48, zIndex: 1, content: "المبلغ: {cod_amount}", fontSize: 28, fontWeight: "bold", color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "5", type: "text", x: 16, y: 320, width: 352, height: 48, zIndex: 1, content: "{order_id}", fontSize: 12, fontWeight: "normal", color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "6", type: "text", x: 16, y: 376, width: 352, height: 24, zIndex: 1, content: "مرجع: {reference_id}", fontSize: 12, color: "#000000", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "7", type: "image", x: 232, y: 8, width: 144, height: 40, zIndex: 1, content: "{company_logo}", opacity: 1, borderWidth: 0, borderColor: '#000000' },
            { id: "8", type: "line", x: 16, y: 168, width: 352, height: 2, zIndex: 0, content: "", color: "#000000", opacity: 1 },
            { id: "9", type: "line", x: 16, y: 312, width: 352, height: 2, zIndex: 0, content: "", color: "#000000", opacity: 1 },
        ]
    },
    "label_45x75_default": {
        id: "label_45x75_default", name: "بوليصة 75x45 (عرضية)", paperSize: "custom", isReadyMade: true,
        customDimensions: { width: 75, height: 45 }, margins: { top: 2, right: 2, bottom: 2, left: 2 },
        elements: [
            { id: "el_brcd", type: "barcode", x: 128, y: 8, width: 136, height: 88, zIndex: 1, content: "{order_id}", fontSize: 14, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
            { id: "el_brcd_txt", type: "text", x: 128, y: 104, width: 136, height: 24, zIndex: 1, content: "{order_id}", fontSize: 12, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
            { id: "el_logo", type: "image", x: 16, y: 8, width: 104, height: 120, zIndex: 1, content: "{company_logo}", fontSize: 14, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
        ]
    }
};

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

const defaultPolicyElements: PolicyElement[] = [
    { id: "el_brcd", type: "barcode", x: 128, y: 8, width: 136, height: 88, zIndex: 1, content: "{order_id}", fontSize: 14, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
    { id: "el_brcd_txt", type: "text", x: 128, y: 104, width: 136, height: 24, zIndex: 1, content: "{order_id}", fontSize: 12, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
    { id: "el_logo", type: "image", x: 16, y: 8, width: 104, height: 120, zIndex: 1, content: "{company_logo}", fontSize: 14, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
];

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
      paperSize: 'custom',
      layout: 'default',
      showCompanyLogo: true,
      showCompanyName: true,
      showCompanyAddress: false,
      showRefNumber: true,
      showItems: false,
      showPrice: true,
      showBarcode: true,
      footerNotes: 'شكراً لثقتكم بخدماتنا.',
      customFields: [],
      customDimensions: { width: 75, height: 45 },
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      elements: defaultPolicyElements,
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

  const value = { settings, setSetting, updateOrderSetting, updateLoginSetting, updateSocialLink, updateRegionalSetting, updateUiSetting, updatePolicySetting, formatCurrency, isHydrated };

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
