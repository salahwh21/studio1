
'use client';

import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FeatherIcons from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(fas);

type IconName = keyof typeof LucideIcons | keyof typeof FeatherIcons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const faMapping: { [key in keyof typeof LucideIcons]?: import('@fortawesome/fontawesome-svg-core').IconName } = {
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
};

const iconMapping: { [key in keyof typeof LucideIcons]?: { feather?: keyof typeof FeatherIcons } } = {
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
};


const Icon = ({ name, ...props }: IconProps) => {
  const [library, setLibrary] = useState('lucide');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
      const updateSettings = () => {
        const savedLibrary = localStorage.getItem('ui-icon-library') || 'lucide';
        const savedStroke = localStorage.getItem('ui-icon-stroke') || '2';
        setLibrary(savedLibrary);
        setStrokeWidth(parseFloat(savedStroke));
      };

      updateSettings();
      setIsMounted(true);

      const handleStorageChange = (event: StorageEvent) => {
          if (event.key === 'ui-icon-library' || event.key === 'ui-icon-stroke') {
              updateSettings();
          }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
  }, []);

  if (!isMounted) {
      const LucideIcon = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
      if (!LucideIcon) return <LucideIcons.HelpCircle {...props} />;
      return <LucideIcon strokeWidth={strokeWidth} {...props} />;
  }

  let IconComponent: React.ElementType | null = null;
  const lucideName = name as keyof typeof LucideIcons;

  const featherName = iconMapping[lucideName]?.feather;
  const faName = faMapping[lucideName];

  switch (library) {
    case 'feather':
      IconComponent = featherName ? FeatherIcons[featherName] : LucideIcons[lucideName];
      break;
    case 'fontawesome':
      if (faName) {
        return <FontAwesomeIcon icon={faName} className={props.className} />;
      }
      IconComponent = LucideIcons[lucideName];
      break;
    case 'lucide':
    default:
      IconComponent = LucideIcons[lucideName];
      break;
  }
  
  if (!IconComponent) {
    const FallbackIcon = LucideIcons.HelpCircle;
    return <FallbackIcon strokeWidth={strokeWidth} {...props} />;
  }

  return <IconComponent strokeWidth={strokeWidth} {...props} />;
};

export default Icon;
