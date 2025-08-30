
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the settings
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

// Define the context shape
interface RegionalSettingsContextType {
  settings: RegionalSettings;
  setSetting: <K extends keyof RegionalSettings>(key: K, value: RegionalSettings[K]) => void;
  isHydrated: boolean;
}

// Create the context
export const RegionalSettingsContext = createContext<RegionalSettingsContextType | undefined>(undefined);

// Default settings
const defaultSettings: RegionalSettings = {
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
};

// Create the provider component
export const RegionalSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<RegionalSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('regionalSettings');
      if (item) {
        const savedSettings = JSON.parse(item);
        setSettings(prev => ({...prev, ...savedSettings}));
      }
    } catch (error) {
      console.error("Failed to load regional settings from localStorage", error);
    } finally {
        setIsHydrated(true);
    }
  }, []);

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
        try {
            window.localStorage.setItem('regionalSettings', JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save regional settings to localStorage", error);
        }
    }
  }, [settings, isHydrated]);

  // Generic function to update a setting
  const setSetting = <K extends keyof RegionalSettings>(key: K, value: RegionalSettings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const value = { settings, setSetting, isHydrated };

  return (
    <RegionalSettingsContext.Provider value={value}>
      {children}
    </RegionalSettingsContext.Provider>
  );
};
