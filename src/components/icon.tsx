
'use client';

import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FeatherIcons from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { useSettings } from '@/contexts/SettingsContext';

// Add all solid icons to the library, so we can use them by name
library.add(fas);

type IconName = keyof typeof LucideIcons | 'UserCog' | 'UsersCog' | 'ShieldCheck' | 'KeyRound' | 'HandCoins' | 'CalendarClock' | 'CheckCheck' | 'Repeat' | 'ThumbsDown' | 'Ban' | 'PhoneOff' | 'Archive' | 'Webhook' | 'Briefcase' | 'Code' | 'CreditCard' | 'Zap' | 'AlertCircle' | 'AlertTriangle';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const faMapping: { [key in IconName]?: import('@fortawesome/fontawesome-svg-core').IconName } = {
  LayoutDashboard: 'grip',
  ShoppingCart: 'shopping-cart',
  PackagePlus: 'box-open',
  Undo2: 'undo',
  Calculator: 'calculator',
  Settings: 'gears',
  Wand2: 'wand-magic-sparkles',
  Map: 'map-location-dot',
  MoreHorizontal: 'ellipsis',
  Bell: 'bell',
  Sun: 'sun',
  Moon: 'moon',
  User: 'user',
  LogOut: 'right-from-bracket',
  Menu: 'bars',
  Search: 'search',
  ListFilter: 'filter',
  PlusCircle: 'plus-circle',
  Trash2: 'trash',
  Printer: 'print',
  Edit: 'pencil',
  CheckCircle2: 'check-circle',
  Truck: 'truck',
  Clock: 'clock',
  Phone: 'phone',
  MapPin: 'map-pin',
  MoreVertical: 'ellipsis-vertical',
  Wallet: 'wallet',
  PackageCheck: 'box-check',
  Bot: 'robot',
  ListPlus: 'list-ol',
  Loader2: 'spinner',
  Image: 'image',
  Clipboard: 'clipboard',
  FileText: 'file-alt',
  Send: 'paper-plane',
  ArrowLeft: 'arrow-left',
  Building: 'building',
  LogIn: 'right-to-bracket',
  Palette: 'palette',
  Brush: 'brush',
  LayoutGrid: 'table-cells-large',
  Languages: 'language',
  List: 'list',
  ReceiptText: 'receipt',
  Package: 'box',
  Share2: 'share-nodes',
  MessageSquareQuote: 'message',
  SlidersHorizontal: 'sliders',
  Square: 'square',
  Circle: 'circle',
  Paintbrush: 'paintbrush',
  TextSelect: 'text-height',
  Feather: 'feather-pointed',
  Star: 'star',
  Eye: 'eye',
  EyeOff: 'eye-slash',
  Save: 'save',
  XCircle: 'times-circle',
  DollarSign: 'dollar-sign',
  TrendingUp: 'chart-line',
  Users: 'users',
  Store: 'store',
  Component: 'puzzle-piece',
  Columns2: 'table-columns',
  BarChart: 'chart-bar',
  RefreshCw: 'sync',
  Download: 'download',
  UserCog: 'user-cog',
  UsersCog: 'users-cog',
  ListChecks: 'tasks',
  Upload: 'upload',
  UserPlus: 'user-plus',
  FileUp: 'file-arrow-up',
  FileDown: 'file-arrow-down',
  X: 'times',
  Check: 'check',
  ShieldCheck: 'shield-check',
  KeyRound: 'key',
  HandCoins: 'hand-holding-dollar',
  CalendarClock: 'calendar-clock',
  CheckCheck: 'check-double',
  Repeat: 'repeat',
  ThumbsDown: 'thumbs-down',
  Ban: 'ban',
  PhoneOff: 'phone-slash',
  Archive: 'box-archive',
  Webhook: 'globe',
  Briefcase: 'briefcase',
  Code: 'code',
  CreditCard: 'credit-card',
  Zap: 'bolt',
  Globe: 'globe',
  AlertCircle: 'exclamation-circle',
};

const iconMapping: { [key in IconName]?: { feather?: keyof typeof FeatherIcons } } = {
  LayoutDashboard: { feather: 'Grid' },
  ShoppingCart: { feather: 'ShoppingCart' },
  PackagePlus: { feather: 'Package' },
  Undo2: { feather: 'CornerUpLeft' },
  Calculator: { feather: 'Code' },
  Settings: { feather: 'Settings' },
  Wand2: { feather: 'Star' },
  Map: { feather: 'Map' },
  MoreHorizontal: { feather: 'MoreHorizontal' },
  Bell: { feather: 'Bell' },
  Sun: { feather: 'Sun' },
  Moon: { feather: 'Moon' },
  User: { feather: 'User' },
  LogOut: { feather: 'LogOut' },
  Menu: { feather: 'Menu' },
  Search: { feather: 'Search' },
  ListFilter: { feather: 'Filter' },
  PlusCircle: { feather: 'PlusCircle' },
  Trash2: { feather: 'Trash2' },
  Printer: { feather: 'Printer' },
  Edit: { feather: 'Edit' },
  CheckCircle2: { feather: 'CheckCircle' },
  Truck: { feather: 'Truck' },
  Clock: { feather: 'Clock' },
  Phone: { feather: 'Phone' },
  MapPin: { feather: 'MapPin' },
  MoreVertical: { feather: 'MoreVertical' },
  Wallet: { feather: 'CreditCard' },
  PackageCheck: { feather: 'Package' },
  Bot: { feather: 'Frown' },
  ListPlus: { feather: 'List' },
  Loader2: { feather: 'Loader' },
  Image: { feather: 'Image' },
  Clipboard: { feather: 'Clipboard' },
  FileText: { feather: 'FileText' },
  Send: { feather: 'Send' },
  ArrowLeft: { feather: 'ArrowLeft' },
  Building: { feather: 'Briefcase' },
  LogIn: { feather: 'LogIn' },
  Palette: { feather: 'Droplet' },
  Brush: { feather: 'Edit3' },
  LayoutGrid: { feather: 'Layout' },
  Languages: { feather: 'Globe' },
  List: { feather: 'List' },
  ReceiptText: { feather: 'FileText' },
  Package: { feather: 'Package' },
  Share2: { feather: 'Share2' },
  MessageSquareQuote: { feather: 'MessageSquare' },
  SlidersHorizontal: { feather: 'Sliders' },
  Square: { feather: 'Square' },
  Circle: { feather: 'Circle' },
  Paintbrush: { feather: 'PenTool' },
  TextSelect: { feather: 'Type' },
  Feather: { feather: 'Feather' },
  Star: { feather: 'Star' },
  Eye: { feather: 'Eye'},
  EyeOff: { feather: 'EyeOff'},
  Save: { feather: 'Save' },
  XCircle: { feather: 'XCircle' },
  DollarSign: { feather: 'DollarSign' },
  TrendingUp: { feather: 'TrendingUp' },
  Users: { feather: 'Users' },
  Store: { feather: 'ShoppingBag' },
  Component: { feather: 'Box' },
  Columns2: { feather: 'Columns' },
  BarChart: { feather: 'BarChart2' },
  RefreshCw: { feather: 'RefreshCw'},
  Download: { feather: 'Download'},
  UserCog: { feather: 'UserCog' },
  UsersCog: { feather: 'Users' },
  ListChecks: { feather: 'CheckSquare' },
  Upload: { feather: 'Upload' },
  UserPlus: { feather: 'UserPlus' },
  FileUp: { feather: 'FileUp' },
  FileDown: { feather: 'FileDown' },
  X: { feather: 'X' },
  Check: { feather: 'Check' },
  ShieldCheck: { feather: 'Shield' },
  KeyRound: { feather: 'Key' },
  HandCoins: { feather: 'DollarSign' },
  CalendarClock: { feather: 'Calendar' },
  CheckCheck: { feather: 'CheckSquare' },
  Repeat: { feather: 'Repeat' },
  ThumbsDown: { feather: 'ThumbsDown' },
  Ban: { feather: 'Slash' },
  PhoneOff: { feather: 'PhoneOff' },
  Archive: { feather: 'Archive' },
  Webhook: { feather: 'GitMerge' },
  Briefcase: { feather: 'Briefcase' },
  Code: { feather: 'Code' },
  CreditCard: { feather: 'CreditCard' },
  Zap: { feather: 'Zap' },
  Globe: { feather: 'Globe' },
  Copy: { feather: 'Copy' },
  AlertCircle: { feather: 'AlertCircle'},
};


const Icon = ({ name, ...props }: IconProps) => {
  const context = useSettings();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
      setIsMounted(true);
  }, []);

  const { iconLibrary, iconStrokeWidth } = context?.settings.ui || {};

  if (!isMounted || !context?.isHydrated) {
      const LucideIcon = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
      if (!LucideIcon) return <LucideIcons.HelpCircle {...props} />;
      return <LucideIcon {...props} />;
  }


  let IconComponent: React.ElementType | null = null;
  const lucideName = name as keyof typeof LucideIcons;

  const featherName = iconMapping[lucideName]?.feather;
  const faName = faMapping[lucideName];

  switch (iconLibrary) {
    case 'feather':
      IconComponent = featherName ? FeatherIcons[featherName] : LucideIcons[lucideName];
      break;
    case 'fontawesome':
      if (faName) {
        // FontAwesomeIcon is a component, not an SVG element directly
        return <FontAwesomeIcon icon={faName} className={props.className} />;
      }
      // Fallback to Lucide if no FontAwesome mapping exists
      IconComponent = LucideIcons[lucideName];
      break;
    case 'lucide':
    default:
      IconComponent = LucideIcons[lucideName];
      break;
  }
  
  if (!IconComponent) {
    const FallbackIcon = LucideIcons.HelpCircle;
    return <FallbackIcon strokeWidth={iconStrokeWidth} {...props} />;
  }

  return <IconComponent strokeWidth={iconStrokeWidth} {...props} />;
};

export default Icon;
