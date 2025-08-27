
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

const isClient = typeof window !== 'undefined';

// Define the shape of the settings
interface SocialLinks {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

interface LoginSettings {
  welcomeMessage: string;
  cardColor: string;
  loginLogo: string | null;
  loginBg: string | null;
  showForgotPassword: boolean;
  socialLinks: SocialLinks;
}

// Define the context shape
interface LoginExperienceContextType {
  settings: LoginSettings;
  setSetting: <K extends keyof LoginSettings>(key: K, value: LoginSettings[K]) => void;
  setSocialLink: <K extends keyof SocialLinks>(key: K, value: SocialLinks[K]) => void;
}

// Create the context
export const LoginExperienceContext = createContext<LoginExperienceContextType | undefined>(undefined);

// Default settings
const defaultSettings: LoginSettings = {
  welcomeMessage: 'أهلاً بعودتك!',
  cardColor: '#ffffff',
  loginLogo: null,
  loginBg: null,
  showForgotPassword: true,
  socialLinks: {
    whatsapp: '',
    instagram: '',
    facebook: '',
  },
};

// Create the provider component
export const LoginExperienceProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<LoginSettings>(() => {
    if (!isClient) return defaultSettings;
    try {
      const item = window.localStorage.getItem('loginExperienceSettings');
      return item ? JSON.parse(item) : defaultSettings;
    } catch (error) {
      console.error(error);
      return defaultSettings;
    }
  });

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    if (!isClient) return;
    try {
      window.localStorage.setItem('loginExperienceSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  // Generic function to update a top-level setting
  const setSetting = <K extends keyof LoginSettings>(key: K, value: LoginSettings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };
  
  // Specific function to update a nested social link
  const setSocialLink = <K extends keyof SocialLinks>(key: K, value: SocialLinks[K]) => {
      setSettings(prevSettings => ({
          ...prevSettings,
          socialLinks: {
              ...prevSettings.socialLinks,
              [key]: value,
          }
      }))
  }

  return (
    <LoginExperienceContext.Provider value={{ settings, setSetting, setSocialLink }}>
      {children}
    </LoginExperienceContext.Provider>
  );
};
