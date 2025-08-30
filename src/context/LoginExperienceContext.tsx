
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

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
  setLoginLogo: (logo: string | null) => void;
  isHydrated: boolean;
}

// Create the context
export const LoginExperienceContext = createContext<LoginExperienceContextType | undefined>(undefined);

// Default settings
const defaultSettings: LoginSettings = {
  welcomeMessage: 'مرحباً',
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
  const [settings, setSettings] = useState<LoginSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('loginExperienceSettings');
      if (item) {
        setSettings(JSON.parse(item));
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
            window.localStorage.setItem('loginExperienceSettings', JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }
  }, [settings, isHydrated]);

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

  const setLoginLogo = (logo: string | null) => {
    setSetting('loginLogo', logo);
  };

  const value = { settings, setSetting, setSocialLink, setLoginLogo, isHydrated };

  return (
    <LoginExperienceContext.Provider value={value}>
      {children}
    </LoginExperienceContext.Provider>
  );
};
