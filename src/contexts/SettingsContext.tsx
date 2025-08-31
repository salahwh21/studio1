
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { nanoid } from 'nanoid';

// 1. Define the shapes of our settings

export type NotificationTemplate = {
  id: string;
  statusId: string;
  recipients: ('customer' | 'merchant' | 'driver' | 'admin')[];
  whatsApp: string;
  sms: string;
};

interface NotificationsSettings {
  useAI: boolean;
  aiTone: 'friendly' | 'formal' | 'concise';
  templates: NotificationTemplate[];
}

interface ComprehensiveSettings {
  notifications: NotificationsSettings;
  // ... other settings can be added here later
}

// 2. Define the context shape
interface SettingsContextType {
  settings: ComprehensiveSettings;
  setSetting: <K extends keyof ComprehensiveSettings, V extends ComprehensiveSettings[K]>(key: K, value: V) => void;
  isHydrated: boolean;
}

// 3. Create the context
export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// 4. Define default settings data, including our templates
const defaultSettingsData: ComprehensiveSettings = {
  notifications: {
    useAI: false,
    aiTone: 'friendly',
    templates: [
      { id: nanoid(), statusId: 'OUT_FOR_DELIVERY', recipients: ['customer'], whatsApp: 'مرحباً {{customerName}}، طلبك رقم *{{orderId}}* في طريقه إليك الآن مع السائق {{driverName}}. نتمنى لك يوماً سعيداً!', sms: 'طلبك {{orderId}} خرج للتوصيل. الوميض.' },
      { id: nanoid(), statusId: 'DELIVERED', recipients: ['customer', 'merchant'], whatsApp: 'مرحباً {{customerName}}، تم توصيل طلبك رقم *{{orderId}}* بنجاح. شكراً لثقتكم بخدماتنا!', sms: 'تم توصيل طلبك {{orderId}}. الوميض.' },
      { id: nanoid(), statusId: 'POSTPONED', recipients: ['customer'], whatsApp: 'مرحباً {{customerName}}، تم تأجيل توصيل طلبك رقم *{{orderId}}* حسب طلبكم. سيتم التواصل معكم قريباً لتحديد موعد جديد.', sms: 'تم تأجيل طلبك {{orderId}} بناء على طلبك.' },
      { id: nanoid(), statusId: 'RETURNED', recipients: ['merchant'], whatsApp: 'تنبيه: تم إنشاء طلب مرتجع للشحنة رقم *{{orderId}}*. سبب الإرجاع: {{reason}}.', sms: 'مرتجع جديد للطلب {{orderId}}.' },
      { id: nanoid(), statusId: 'CANCELLED', recipients: ['merchant'], whatsApp: 'نأسف لإبلاغكم بأنه تم إلغاء الطلب رقم *{{orderId}}* من قبل العميل.', sms: 'تم إلغاء الطلب {{orderId}}.' },
      { id: nanoid(), statusId: 'MONEY_RECEIVED', recipients: ['admin'], whatsApp: 'تم استلام مبلغ *{{amount}}* من السائق {{driverName}} عن الشحنات التي تم توصيلها.', sms: 'تم استلام مبلغ {{amount}} من {{driverName}}.' },
      { id: nanoid(), statusId: 'COMPLETED', recipients: ['merchant'], whatsApp: 'مرحباً {{merchantName}}، تم إيداع مبلغ *{{amount}}* في حسابكم. شكراً لتعاملكم معنا.', sms: 'تم إيداع مبلغ {{amount}} في حسابكم.' },
    ],
  },
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
        // Merge saved settings with defaults to avoid errors if new settings are added
        // A deep merge would be better for nested objects
        const mergedSettings = {
          ...defaultSettingsData,
          ...savedSettings,
          notifications: {
            ...defaultSettingsData.notifications,
            ...(savedSettings.notifications || {}),
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
  const setSetting = <K extends keyof ComprehensiveSettings, V extends ComprehensiveSettings[K]>(key: K, value: V) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const value = { settings, setSetting, isHydrated };

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
