
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';

// 1. Define the shapes of our settings

// Menu Visibility
export type MenuVisibilitySettings = {
    [roleId: string]: string[]; // e.g. { 'merchant': ['dashboard:view', 'orders:view'] }
};


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

// AI Agent Settings
interface AiAgentSettings {
    enabled: boolean;
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
    // ========== قالب حراري 100×150 عمودي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-100x150-portrait', name: '🏷️ حراري 100×150 عمودي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 100, height: 150 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود في الأعلى
            { id: 'th1-1', type: 'barcode', x: 40, y: 10, width: 300, height: 65, content: '{{orderId}}', zIndex: 1, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // خلفية المبلغ
            { id: 'th1-2', type: 'shape', x: 10, y: 85, width: 358, height: 70, content: '', zIndex: 2, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 8 },
            // عنوان المبلغ
            { id: 'th1-3', type: 'text', x: 15, y: 90, width: 348, height: 20, content: 'المبلغ المطلوب (COD)', zIndex: 3, fontSize: 12, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            // قيمة المبلغ
            { id: 'th1-4', type: 'text', x: 15, y: 110, width: 348, height: 40, content: '{{cod}} ر.س', zIndex: 4, fontSize: 36, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            // رقم الطلب
            { id: 'th1-5', type: 'text', x: 10, y: 165, width: 358, height: 30, content: '#{{orderId}}', zIndex: 5, fontSize: 18, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            // خلفية المستلم
            { id: 'th1-6', type: 'shape', x: 10, y: 205, width: 358, height: 75, content: '', zIndex: 6, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 8 },
            // عنوان المستلم
            { id: 'th1-7', type: 'text', x: 15, y: 210, width: 100, height: 15, content: 'المستلم', zIndex: 7, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            // اسم المستلم
            { id: 'th1-8', type: 'text', x: 15, y: 225, width: 348, height: 25, content: '{{recipient}}', zIndex: 8, fontSize: 16, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            // رقم الهاتف
            { id: 'th1-9', type: 'text', x: 15, y: 250, width: 348, height: 25, content: '{{phone}}', zIndex: 9, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // خلفية العنوان
            { id: 'th1-10', type: 'shape', x: 10, y: 290, width: 358, height: 100, content: '', zIndex: 10, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 8 },
            // عنوان العنوان
            { id: 'th1-11', type: 'text', x: 15, y: 295, width: 100, height: 15, content: 'العنوان', zIndex: 11, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            // نص العنوان
            { id: 'th1-12', type: 'text', x: 15, y: 310, width: 348, height: 45, content: '{{address}}', zIndex: 12, fontSize: 13, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            // المدينة
            { id: 'th1-13', type: 'text', x: 15, y: 360, width: 100, height: 25, content: '{{city}}', zIndex: 13, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
            // المنطقة
            { id: 'th1-14', type: 'text', x: 120, y: 360, width: 100, height: 25, content: '{{region}}', zIndex: 14, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
            // التاجر
            { id: 'th1-15', type: 'shape', x: 10, y: 400, width: 175, height: 45, content: '', zIndex: 15, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            { id: 'th1-16', type: 'text', x: 15, y: 405, width: 165, height: 15, content: 'التاجر', zIndex: 16, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#666666', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            { id: 'th1-17', type: 'text', x: 15, y: 420, width: 165, height: 20, content: '{{merchant}}', zIndex: 17, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            // التاريخ
            { id: 'th1-18', type: 'shape', x: 193, y: 400, width: 175, height: 45, content: '', zIndex: 18, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            { id: 'th1-19', type: 'text', x: 198, y: 405, width: 165, height: 15, content: 'التاريخ', zIndex: 19, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#666666', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            { id: 'th1-20', type: 'text', x: 198, y: 420, width: 165, height: 20, content: '{{date}}', zIndex: 20, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
        ]
    },
    // ========== قالب حراري 100×150 أفقي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-100x150-landscape', name: '🏷️ حراري 100×150 أفقي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 150, height: 100 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الجانب الأيسر - الباركود
            { id: 'th2-1', type: 'shape', x: 0, y: 0, width: 225, height: 378, content: '', zIndex: 1, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            { id: 'th2-2', type: 'barcode', x: 15, y: 15, width: 195, height: 55, content: '{{orderId}}', zIndex: 2, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ في الجانب الأيسر
            { id: 'th2-3', type: 'shape', x: 15, y: 80, width: 195, height: 70, content: '', zIndex: 3, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            { id: 'th2-4', type: 'text', x: 20, y: 85, width: 185, height: 15, content: 'COD', zIndex: 4, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            { id: 'th2-5', type: 'text', x: 20, y: 100, width: 185, height: 45, content: '{{cod}} ر.س', zIndex: 5, fontSize: 28, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            // الجانب الأيمن - المعلومات
            { id: 'th2-6', type: 'text', x: 235, y: 15, width: 320, height: 30, content: '#{{orderId}}', zIndex: 6, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            // المستلم
            { id: 'th2-7', type: 'shape', x: 235, y: 55, width: 320, height: 55, content: '', zIndex: 7, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 8 },
            { id: 'th2-8', type: 'text', x: 240, y: 60, width: 310, height: 22, content: '{{recipient}}', zIndex: 8, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th2-9', type: 'text', x: 240, y: 82, width: 310, height: 22, content: '{{phone}}', zIndex: 9, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // العنوان
            { id: 'th2-10', type: 'shape', x: 235, y: 120, width: 320, height: 55, content: '', zIndex: 10, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 8 },
            { id: 'th2-11', type: 'text', x: 240, y: 125, width: 310, height: 30, content: '{{address}}', zIndex: 11, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th2-12', type: 'text', x: 240, y: 155, width: 150, height: 18, content: '{{city}} • {{region}}', zIndex: 12, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            // التاجر
            { id: 'th2-13', type: 'text', x: 235, y: 185, width: 320, height: 25, content: '{{merchant}}', zIndex: 13, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
        ]
    },
    // ========== قالب حراري 100×100 مربع (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-100x100-square', name: '🏷️ حراري 100×100 مربع', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 100, height: 100 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود في الأعلى
            { id: 'th3-1', type: 'barcode', x: 50, y: 8, width: 280, height: 55, content: '{{orderId}}', zIndex: 1, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ
            { id: 'th3-2', type: 'shape', x: 10, y: 70, width: 358, height: 55, content: '', zIndex: 2, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            { id: 'th3-3', type: 'text', x: 15, y: 75, width: 348, height: 15, content: 'COD', zIndex: 3, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            { id: 'th3-4', type: 'text', x: 15, y: 90, width: 348, height: 30, content: '{{cod}} ر.س', zIndex: 4, fontSize: 24, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
            // رقم الطلب
            { id: 'th3-5', type: 'text', x: 10, y: 135, width: 358, height: 25, content: '#{{orderId}}', zIndex: 5, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
            // المستلم
            { id: 'th3-6', type: 'shape', x: 10, y: 168, width: 358, height: 55, content: '', zIndex: 6, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            { id: 'th3-7', type: 'text', x: 15, y: 173, width: 348, height: 22, content: '{{recipient}}', zIndex: 7, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th3-8', type: 'text', x: 15, y: 195, width: 348, height: 22, content: '{{phone}}', zIndex: 8, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // العنوان
            { id: 'th3-9', type: 'shape', x: 10, y: 230, width: 358, height: 65, content: '', zIndex: 9, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 6 },
            { id: 'th3-10', type: 'text', x: 15, y: 235, width: 348, height: 35, content: '{{address}}', zIndex: 10, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th3-11', type: 'text', x: 15, y: 270, width: 170, height: 20, content: '{{city}} • {{region}}', zIndex: 11, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            // التاجر والتاريخ
            { id: 'th3-12', type: 'text', x: 10, y: 305, width: 175, height: 35, content: '{{merchant}}', zIndex: 12, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
            { id: 'th3-13', type: 'text', x: 193, y: 305, width: 175, height: 35, content: '{{date}}', zIndex: 13, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
        ]
    },
    // ========== قالب حراري 75×50 عمودي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-75x50-portrait', name: '🏷️ حراري 75×50 عمودي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 50, height: 75 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود
            { id: 'th4-1', type: 'barcode', x: 30, y: 5, width: 220, height: 40, content: '{{orderId}}', zIndex: 1, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ
            { id: 'th4-2', type: 'text', x: 5, y: 50, width: 273, height: 30, content: '{{cod}} ر.س', zIndex: 2, fontSize: 20, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
            // المستلم
            { id: 'th4-3', type: 'text', x: 5, y: 85, width: 273, height: 20, content: '{{recipient}}', zIndex: 3, fontSize: 12, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th4-4', type: 'text', x: 5, y: 105, width: 273, height: 18, content: '{{phone}}', zIndex: 4, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // العنوان
            { id: 'th4-5', type: 'text', x: 5, y: 125, width: 273, height: 30, content: '{{city}} - {{region}}', zIndex: 5, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
            // التاجر
            { id: 'th4-6', type: 'text', x: 5, y: 160, width: 273, height: 20, content: '{{merchant}}', zIndex: 6, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#666666', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
        ]
    },
    // ========== قالب حراري 75×50 أفقي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-75x50-landscape', name: '🏷️ حراري 75×50 أفقي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 50 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود على اليسار
            { id: 'th5-1', type: 'barcode', x: 5, y: 5, width: 80, height: 35, content: '{{orderId}}', zIndex: 1, fontSize: 8, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ
            { id: 'th5-2', type: 'text', x: 90, y: 5, width: 95, height: 35, content: '{{cod}}', zIndex: 2, fontSize: 16, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4 },
            // المستلم
            { id: 'th5-3', type: 'text', x: 5, y: 45, width: 180, height: 18, content: '{{recipient}}', zIndex: 3, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th5-4', type: 'text', x: 5, y: 63, width: 180, height: 16, content: '{{phone}}', zIndex: 4, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // المدينة والمنطقة
            { id: 'th5-5', type: 'text', x: 5, y: 82, width: 180, height: 18, content: '{{city}} • {{region}}', zIndex: 5, fontSize: 9, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 3 },
        ]
    },
    // ========== قالب حراري 60×40 عمودي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-60x40-portrait', name: '🏷️ حراري 60×40 عمودي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 40, height: 60 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود
            { id: 'th6-1', type: 'barcode', x: 20, y: 3, width: 185, height: 35, content: '{{orderId}}', zIndex: 1, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ
            { id: 'th6-2', type: 'text', x: 3, y: 42, width: 220, height: 25, content: '{{cod}} ر.س', zIndex: 2, fontSize: 16, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 3 },
            // المستلم
            { id: 'th6-3', type: 'text', x: 3, y: 70, width: 220, height: 16, content: '{{recipient}}', zIndex: 3, fontSize: 10, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th6-4', type: 'text', x: 3, y: 86, width: 220, height: 14, content: '{{phone}}', zIndex: 4, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // المدينة
            { id: 'th6-5', type: 'text', x: 3, y: 102, width: 220, height: 16, content: '{{city}} - {{region}}', zIndex: 5, fontSize: 9, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 3 },
            // التاجر
            { id: 'th6-6', type: 'text', x: 3, y: 122, width: 220, height: 14, content: '{{merchant}}', zIndex: 6, fontSize: 8, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#666666', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0 },
        ]
    },
    // ========== قالب حراري 60×40 أفقي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-60x40-landscape', name: '🏷️ حراري 60×40 أفقي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 60, height: 40 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود
            { id: 'th7-1', type: 'barcode', x: 3, y: 3, width: 70, height: 30, content: '{{orderId}}', zIndex: 1, fontSize: 7, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ
            { id: 'th7-2', type: 'text', x: 78, y: 3, width: 70, height: 30, content: '{{cod}}', zIndex: 2, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 3 },
            // المستلم
            { id: 'th7-3', type: 'text', x: 3, y: 38, width: 145, height: 15, content: '{{recipient}}', zIndex: 3, fontSize: 9, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th7-4', type: 'text', x: 3, y: 53, width: 145, height: 13, content: '{{phone}}', zIndex: 4, fontSize: 8, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // المدينة
            { id: 'th7-5', type: 'text', x: 3, y: 68, width: 145, height: 14, content: '{{city}} • {{region}}', zIndex: 5, fontSize: 8, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 2 },
        ]
    },
    // ========== قالب حراري 50×30 عمودي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-50x30-portrait', name: '🏷️ حراري 50×30 عمودي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 30, height: 50 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود
            { id: 'th8-1', type: 'barcode', x: 15, y: 2, width: 155, height: 28, content: '{{orderId}}', zIndex: 1, fontSize: 8, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ
            { id: 'th8-2', type: 'text', x: 2, y: 33, width: 185, height: 22, content: '{{cod}} ر.س', zIndex: 2, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 2 },
            // المستلم
            { id: 'th8-3', type: 'text', x: 2, y: 58, width: 185, height: 14, content: '{{recipient}}', zIndex: 3, fontSize: 9, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th8-4', type: 'text', x: 2, y: 72, width: 185, height: 12, content: '{{phone}}', zIndex: 4, fontSize: 8, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // المدينة
            { id: 'th8-5', type: 'text', x: 2, y: 86, width: 185, height: 14, content: '{{city}}', zIndex: 5, fontSize: 8, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 2 },
        ]
    },
    // ========== قالب حراري 50×30 أفقي (من ThermalLabelOptimized) ==========
    {
        id: 'thermal-50x30-landscape', name: '🏷️ حراري 50×30 أفقي', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 50, height: 30 }, margins: { top: 0, right: 0, bottom: 0, left: 0 },
        elements: [
            // الباركود
            { id: 'th9-1', type: 'barcode', x: 2, y: 2, width: 55, height: 25, content: '{{orderId}}', zIndex: 1, fontSize: 6, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0 },
            // المبلغ
            { id: 'th9-2', type: 'text', x: 60, y: 2, width: 50, height: 25, content: '{{cod}}', zIndex: 2, fontSize: 12, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 2 },
            // المستلم
            { id: 'th9-3', type: 'text', x: 2, y: 30, width: 108, height: 13, content: '{{recipient}}', zIndex: 3, fontSize: 8, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0 },
            { id: 'th9-4', type: 'text', x: 2, y: 43, width: 108, height: 11, content: '{{phone}}', zIndex: 4, fontSize: 7, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'left', borderRadius: 0 },
            // المدينة
            { id: 'th9-5', type: 'text', x: 2, y: 56, width: 108, height: 12, content: '{{city}}', zIndex: 5, fontSize: 7, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 2 },
        ]
    },
    {
        id: 'ready-7545-1', name: 'قالب عرضي 75x45 (رسمي)', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 45 }, margins: { top: 2, right: 2, bottom: 2, left: 2 },
        elements: [
            { id: 'el-1-1', type: 'image', x: 200, y: 8, width: 75, height: 30, content: '{{company_logo}}', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-1-2', type: 'barcode', x: 8, y: 8, width: 150, height: 35, content: '{{orderId}}', zIndex: 1, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-1-3', type: 'text', x: 10, y: 50, width: 265, height: 20, content: 'التاجر: {{merchant}}', zIndex: 2, fontSize: 12, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-1-4', type: 'text', x: 10, y: 75, width: 265, height: 20, content: 'إلى: {{recipient}} - {{phone}} - {{region}}', zIndex: 3, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-1-5', type: 'text', x: 10, y: 100, width: 120, height: 40, content: 'ملاحظات:\n{{notes}}', zIndex: 4, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#dddddd', borderWidth: 1, opacity: 1, backgroundColor: '#f9f9f9', textAlign: 'right', borderRadius: 4, },
            { id: 'el-1-6', type: 'text', x: 150, y: 100, width: 125, height: 40, content: 'COD:\n{{cod}}', zIndex: 5, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#dddddd', borderWidth: 1, opacity: 1, backgroundColor: '#f9f9f9', textAlign: 'center', borderRadius: 4, },
        ]
    },
    {
        id: 'ready-7545-2', name: 'قالب عرضي 75x45 (بسيط)', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 45 }, margins: { top: 2, right: 2, bottom: 2, left: 2 },
        elements: [
            { id: 'el-2-1', type: 'image', x: 10, y: 10, width: 100, height: 30, content: '{{company_logo}}', zIndex: 4, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-2-2', type: 'barcode', x: 130, y: 10, width: 145, height: 45, content: '{{orderId}}', zIndex: 5, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-2-3', type: 'text', x: 10, y: 50, width: 150, height: 20, content: 'التاجر: {{merchant}}', zIndex: 2, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-2-4', type: 'text', x: 10, y: 70, width: 265, height: 40, content: 'المستلم: {{recipient}}\nهاتف: {{phone}} - المنطقة: {{region}}', zIndex: 3, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-2-5', type: 'text', x: 10, y: 115, width: 130, height: 25, content: 'ملاحظات: {{notes}}', zIndex: 4, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-2-6', type: 'text', x: 150, y: 115, width: 125, height: 25, content: 'المبلغ: {{cod}}', zIndex: 5, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
        ]
    },
    {
        id: 'ready-7545-3', name: 'قالب عرضي 75x45 (حديث)', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 45 }, margins: { top: 2, right: 2, bottom: 2, left: 2 },
        elements: [
            { id: 'el-3-1', type: 'shape', x: 0, y: 0, width: 283, height: 45, content: '', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#f3f4f6', textAlign: 'center', borderRadius: 0, },
            { id: 'el-3-2', type: 'image', x: 200, y: 8, width: 75, height: 30, content: '{{company_logo}}', zIndex: 1, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0, },
            { id: 'el-3-3', type: 'text', x: 10, y: 15, width: 180, height: 20, content: 'من: {{merchant}}', zIndex: 2, fontSize: 12, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#1f2937', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0, },
            { id: 'el-3-4', type: 'text', x: 10, y: 55, width: 265, height: 20, content: '{{recipient}} | {{phone}} | {{region}}', zIndex: 3, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-3-5', type: 'text', x: 10, y: 80, width: 265, height: 35, content: '{{notes}}', zIndex: 4, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-3-6', type: 'barcode', x: 10, y: 120, width: 150, height: 40, content: '{{orderId}}', zIndex: 5, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-3-7', type: 'text', x: 170, y: 125, width: 105, height: 30, content: 'COD\n{{cod}}', zIndex: 6, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 4, },
        ]
    },
    {
        id: 'ready-7575-1', name: 'قالب مربع 75x75 (مركزي)', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 75 }, margins: { top: 3, right: 3, bottom: 3, left: 3 },
        elements: [
            { id: 'el-4-1', type: 'image', x: 90, y: 10, width: 100, height: 40, content: '{{company_logo}}', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-4-2', type: 'text', x: 15, y: 55, width: 250, height: 20, content: 'التاجر: {{merchant}}', zIndex: 1, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-4-3', type: 'text', x: 15, y: 80, width: 250, height: 40, content: 'المستلم: {{recipient}}\nالهاتف: {{phone}} - {{region}}', zIndex: 2, fontSize: 11, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-4-4', type: 'barcode', x: 40, y: 125, width: 200, height: 50, content: '{{orderId}}', zIndex: 3, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-4-5', type: 'text', x: 15, y: 185, width: 120, height: 40, content: 'ملاحظات:\n{{notes}}', zIndex: 4, fontSize: 9, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-4-6', type: 'text', x: 145, y: 185, width: 120, height: 40, content: 'المبلغ:\n{{cod}}', zIndex: 5, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
        ]
    },
    {
        id: 'ready-7575-2', name: 'قالب مربع 75x75 (أعمدة)', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 75 }, margins: { top: 3, right: 3, bottom: 3, left: 3 },
        elements: [
            { id: 'el-5-1', type: 'image', x: 10, y: 10, width: 125, height: 40, content: '{{company_logo}}', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-5-2', type: 'text', x: 145, y: 15, width: 125, height: 20, content: 'التاجر: {{merchant}}', zIndex: 1, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-5-3', type: 'shape', x: 10, y: 55, width: 260, height: 1, content: '', zIndex: 2, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#cccccc', textAlign: 'center', borderRadius: 0, },
            { id: 'el-5-4', type: 'text', x: 10, y: 65, width: 260, height: 50, content: 'إلى: {{recipient}}\nهاتف: {{phone}}\nالمنطقة: {{region}}', zIndex: 3, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-5-5', type: 'barcode', x: 10, y: 120, width: 125, height: 50, content: '{{orderId}}', zIndex: 4, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-5-6', type: 'text', x: 145, y: 120, width: 125, height: 50, content: 'المبلغ:\n{{cod}}', zIndex: 5, fontSize: 16, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-5-7', type: 'text', x: 10, y: 180, width: 260, height: 40, content: 'ملاحظات: {{notes}}', zIndex: 6, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
        ]
    },
    {
        id: 'ready-7575-3', name: 'قالب مربع 75x75 (معكوس)', isReadyMade: true,
        paperSize: 'custom', customDimensions: { width: 75, height: 75 }, margins: { top: 3, right: 3, bottom: 3, left: 3 },
        elements: [
            { id: 'el-6-1', type: 'shape', x: 0, y: 0, width: 283, height: 50, content: '', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#1f2937', textAlign: 'center', borderRadius: 0, },
            { id: 'el-6-2', type: 'image', x: 10, y: 5, width: 100, height: 40, content: '{{company_logo_white}}', zIndex: 1, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'center', borderRadius: 0, },
            { id: 'el-6-3', type: 'text', x: 120, y: 15, width: 150, height: 20, content: 'التاجر: {{merchant}}', zIndex: 2, fontSize: 12, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0, },
            { id: 'el-6-4', type: 'text', x: 15, y: 60, width: 250, height: 50, content: 'المستلم: {{recipient}}\nالهاتف: {{phone}}\nالمنطقة: {{region}}', zIndex: 3, fontSize: 11, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-6-5', type: 'barcode', x: 40, y: 120, width: 200, height: 50, content: '{{orderId}}', zIndex: 4, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-6-6', type: 'text', x: 15, y: 180, width: 250, height: 20, content: 'المبلغ: {{cod}}', zIndex: 5, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-6-7', type: 'text', x: 15, y: 205, width: 250, height: 30, content: 'ملاحظات: {{notes}}', zIndex: 6, fontSize: 10, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
        ]
    },
    {
        id: 'ready-a5-1', name: 'قالب A5 ( احترافي )', isReadyMade: true,
        paperSize: 'a5', customDimensions: { width: 148, height: 210 }, margins: { top: 10, right: 10, bottom: 10, left: 10 },
        elements: [
            { id: 'el-7-1', type: 'image', x: 30, y: 30, width: 150, height: 60, content: '{{company_logo}}', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-7-2', type: 'text', x: 200, y: 40, width: 300, height: 30, content: 'بوليصة شحن', zIndex: 1, fontSize: 28, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-7-3', type: 'shape', x: 30, y: 100, width: 490, height: 2, content: '', zIndex: 2, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#eeeeee', textAlign: 'center', borderRadius: 0, },
            { id: 'el-7-4', type: 'text', x: 280, y: 120, width: 240, height: 120, content: 'من:\n{{merchant}}\n\nشركة: {{company_name}}', zIndex: 3, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#dddddd', borderWidth: 1, opacity: 1, backgroundColor: '#fafafa', textAlign: 'right', borderRadius: 8, },
            { id: 'el-7-5', type: 'text', x: 30, y: 120, width: 240, height: 120, content: 'إلى:\n{{recipient}}\n{{phone}} - {{region}}\n{{address}}', zIndex: 4, fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#dddddd', borderWidth: 1, opacity: 1, backgroundColor: '#fafafa', textAlign: 'right', borderRadius: 8, },
            { id: 'el-7-6', type: 'text', x: 30, y: 260, width: 490, height: 100, content: 'تفاصيل الطلب:\n{{items}}', zIndex: 5, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#dddddd', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 8, },
            { id: 'el-7-7', type: 'text', x: 30, y: 380, width: 490, height: 80, content: 'ملاحظات: {{notes}}', zIndex: 6, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#dddddd', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 8, },
            { id: 'el-7-8', type: 'barcode', x: 30, y: 480, width: 240, height: 80, content: '{{orderId}}', zIndex: 7, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-7-9', type: 'text', x: 280, y: 480, width: 240, height: 80, content: 'المبلغ المطلوب:\n{{cod}}', zIndex: 8, fontSize: 20, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 8, },
        ]
    },
    {
        id: 'ready-a5-2', name: 'قالب A5 (جدول)', isReadyMade: true,
        paperSize: 'a5', customDimensions: { width: 148, height: 210 }, margins: { top: 10, right: 10, bottom: 10, left: 10 },
        elements: [
            { id: 'el-8-1', type: 'text', x: 30, y: 30, width: 490, height: 30, content: 'فاتورة شحن', zIndex: 0, fontSize: 24, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-8-2', type: 'text', x: 30, y: 70, width: 240, height: 20, content: 'التاريخ: {{date}}', zIndex: 1, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-8-3', type: 'text', x: 280, y: 70, width: 240, height: 20, content: 'رقم الطلب: {{orderId}}', zIndex: 2, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#333333', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-8-4', type: 'shape', x: 30, y: 110, width: 490, height: 80, content: '', zIndex: 3, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#fafafa', textAlign: 'center', borderRadius: 8, },
            { id: 'el-8-5', type: 'text', x: 40, y: 120, width: 220, height: 60, content: 'معلومات المستلم:\n{{recipient}}\n{{phone}}\n{{region}}', zIndex: 4, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0, },
            { id: 'el-8-6', type: 'text', x: 280, y: 120, width: 220, height: 60, content: 'معلومات التاجر:\n{{merchant}}\n{{company_name}}', zIndex: 5, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: 'transparent', textAlign: 'right', borderRadius: 0, },
            { id: 'el-8-7', type: 'text', x: 30, y: 210, width: 490, height: 30, content: 'محتويات الطلب', zIndex: 6, fontSize: 14, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#f3f4f6', textAlign: 'center', borderRadius: 0, },
            { id: 'el-8-8', type: 'text', x: 30, y: 240, width: 490, height: 150, content: '{{items}}', zIndex: 7, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-8-9', type: 'text', x: 30, y: 400, width: 240, height: 60, content: 'ملاحظات:\n{{notes}}', zIndex: 8, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-8-10', type: 'text', x: 280, y: 400, width: 240, height: 60, content: 'إجمالي التحصيل: {{cod}}', zIndex: 9, fontSize: 16, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-8-11', type: 'barcode', x: 150, y: 480, width: 250, height: 60, content: '{{orderId}}', zIndex: 10, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
        ]
    },
    {
        id: 'ready-a5-3', name: 'قالب A5 (كلاسيكي)', isReadyMade: true,
        paperSize: 'a5', customDimensions: { width: 148, height: 210 }, margins: { top: 10, right: 10, bottom: 10, left: 10 },
        elements: [
            { id: 'el-9-1', type: 'image', x: 30, y: 30, width: 120, height: 50, content: '{{company_logo}}', zIndex: 0, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
            { id: 'el-9-2', type: 'text', x: 160, y: 40, width: 360, height: 30, content: 'بوليصة شحن / Shipping Label', zIndex: 1, fontSize: 18, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 0, },
            { id: 'el-9-3', type: 'text', x: 30, y: 100, width: 490, height: 60, content: 'بيانات المرسل (التاجر):\nالاسم: {{merchant}}\nالشركة: {{company_name}}', zIndex: 2, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 4, },
            { id: 'el-9-4', type: 'text', x: 30, y: 170, width: 490, height: 80, content: 'بيانات المستلم:\nالاسم: {{recipient}}\nالهاتف: {{phone}}\nالمنطقة: {{region}}\nالعنوان: {{address}}', zIndex: 3, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 4, },
            { id: 'el-9-5', type: 'text', x: 30, y: 260, width: 240, height: 100, content: 'تفاصيل الطلب:\n{{items}}', zIndex: 4, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 4, },
            { id: 'el-9-6', type: 'text', x: 280, y: 260, width: 240, height: 100, content: 'ملاحظات:\n{{notes}}', zIndex: 5, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff', textAlign: 'right', borderRadius: 4, },
            { id: 'el-9-7', type: 'text', x: 30, y: 380, width: 490, height: 40, content: 'الدفع عند الاستلام (COD): {{cod}}', zIndex: 6, fontSize: 16, fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#cccccc', borderWidth: 1, opacity: 1, backgroundColor: '#f9fafb', textAlign: 'center', borderRadius: 4, },
            { id: 'el-9-8', type: 'barcode', x: 30, y: 440, width: 490, height: 100, content: '{{orderId}}', zIndex: 7, fontSize: 12, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', borderColor: '#000000', borderWidth: 0, opacity: 1, backgroundColor: '#ffffff', textAlign: 'center', borderRadius: 0, },
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
  menuVisibility: MenuVisibilitySettings;
  aiAgent: AiAgentSettings;
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
  updateMenuVisibility: (roleId: string, permissionId: string, checked: boolean) => void;
  updateAiAgentSetting: <K extends keyof AiAgentSettings>(key: K, value: AiAgentSettings[K]) => void;
  formatCurrency: (amount: number | undefined | null) => string;
  formatDate: (date: Date | string | number, options?: { longFormat?: boolean }) => string;
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
  },
  menuVisibility: {
    merchant: ['dashboard:view', 'orders:view', 'financials:view', 'merchant-portal:use'],
    driver: ['driver-app:use'],
  },
  aiAgent: {
    enabled: true,
  },
};

const SETTINGS_KEY = 'comprehensiveAppSettings';

// 5. Create the provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ComprehensiveSettings>(defaultSettingsData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      // Try to load from API first
      const { default: api } = await import('@/lib/api');
      const apiSettings = await api.getSettings();
      
      if (apiSettings && apiSettings.data) {
        const mergedSettings = {
          ...defaultSettingsData,
          ...apiSettings.data,
          policy: {
            ...defaultSettingsData.policy,
            ...(apiSettings.data.policy || {}),
          },
          notifications: {
            ...defaultSettingsData.notifications,
            ...(apiSettings.data.notifications || {}),
          },
          orders: {
            ...defaultSettingsData.orders,
            ...(apiSettings.data.orders || {}),
          },
          login: {
            ...defaultSettingsData.login,
            ...(apiSettings.data.login || {}),
          },
          regional: {
            ...defaultSettingsData.regional,
            ...(apiSettings.data.regional || {}),
          },
          ui: {
            ...defaultSettingsData.ui,
            ...(apiSettings.data.ui || {}),
          },
          menuVisibility: {
            ...defaultSettingsData.menuVisibility,
            ...(apiSettings.data.menuVisibility || {}),
          },
          aiAgent: {
            ...defaultSettingsData.aiAgent,
            ...(apiSettings.data.aiAgent || {}),
          }
        };
        setSettings(mergedSettings);
        // Also save to localStorage as backup
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings from API, falling back to localStorage", error);
      // Fallback to localStorage
      try {
        const item = window.localStorage.getItem(SETTINGS_KEY);
        if (item) {
          const savedSettings = JSON.parse(item);
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
            menuVisibility: {
              ...defaultSettingsData.menuVisibility,
              ...(savedSettings.menuVisibility || {}),
            },
            aiAgent: {
              ...defaultSettingsData.aiAgent,
              ...(savedSettings.aiAgent || {}),
            }
          };
          setSettings(mergedSettings);
        }
      } catch (localError) {
        console.error("Failed to load settings from localStorage", localError);
      }
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings to API whenever they change (with debounce)
  useEffect(() => {
    if (!isHydrated || isSaving) return;

    const saveToApi = async () => {
      setIsSaving(true);
      try {
        const { default: api } = await import('@/lib/api');
        await api.updateSettings(settings);
        // Also save to localStorage as backup
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings to API, saved to localStorage only", error);
        // Fallback: save to localStorage only
        try {
          window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (localError) {
          console.error("Failed to save settings to localStorage", localError);
        }
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(saveToApi, 1000); // Debounce 1 second
    return () => clearTimeout(timeoutId);
  }, [settings, isHydrated, isSaving]);

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
  const updateAiAgentSetting = (key: keyof AiAgentSettings, value: any) => updateNestedSetting('aiAgent', key, value);

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

  const updateMenuVisibility = (roleId: string, permissionId: string, checked: boolean) => {
    setSettings(prev => {
        const currentVisibility = prev.menuVisibility[roleId] || [];
        const newVisibility = checked
            ? [...new Set([...currentVisibility, permissionId])]
            : currentVisibility.filter(id => id !== permissionId);
        return {
            ...prev,
            menuVisibility: {
                ...prev.menuVisibility,
                [roleId]: newVisibility
            }
        };
    });
  };
  
  const formatCurrency = useCallback((amount: number | undefined | null): string => {
    const safeAmount = amount ?? 0;
    const { currencySymbol, currencySymbolPosition, thousandsSeparator, decimalSeparator } = settings.regional;
    const fixedAmount = safeAmount.toFixed(2);
    let [integerPart, decimalPart] = fixedAmount.split('.');

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    const formattedNumber = `${integerPart}${decimalSeparator}${decimalPart}`;

    if (currencySymbolPosition === 'before') {
      return `${currencySymbol} ${formattedNumber}`;
    }
    return `${formattedNumber} ${currencySymbol}`;
  }, [settings.regional]);

  const formatDate = useCallback((date: Date | string | number, options?: { longFormat?: boolean }): string => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const { dateFormat, language } = settings.regional;
      const locale = language === 'ar' ? 'ar-SA' : 'en-US';
      
      if (options?.longFormat) {
        return d.toLocaleDateString(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      
      // تنسيق التاريخ حسب الإعداد
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      
      switch (dateFormat) {
        case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        default: return `${day}/${month}/${year}`;
      }
    } catch {
      return '';
    }
  }, [settings.regional]);

  const value = { settings, setSetting, updateOrderSetting, updateLoginSetting, updateSocialLink, updateRegionalSetting, updateUiSetting, formatCurrency, formatDate, isHydrated, updatePolicySetting, updateMenuVisibility, updateAiAgentSetting };

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
