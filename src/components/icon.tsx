
'use client';

import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FeatherIcons from 'react-feather';
import * as HeroIcons from '@heroicons/react/24/outline';

type IconName = keyof typeof LucideIcons | keyof typeof FeatherIcons | keyof typeof HeroIcons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const iconMapping: { [key in keyof typeof LucideIcons]?: { feather?: keyof typeof FeatherIcons, hero?: keyof typeof HeroIcons } } = {
  LayoutDashboard: { feather: 'Grid', hero: 'Squares2X2Icon' },
  ShoppingCart: { feather: 'ShoppingCart', hero: 'ShoppingCartIcon' },
  PackagePlus: { feather: 'Package', hero: 'PlusCircleIcon' },
  Undo2: { feather: 'CornerUpLeft', hero: 'ArrowUturnLeftIcon' },
  Calculator: { feather: 'Code', hero: 'CalculatorIcon' },
  Settings: { feather: 'Settings', hero: 'Cog6ToothIcon' },
  Wand2: { feather: 'Star', hero: 'SparklesIcon' },
  Map: { feather: 'Map', hero: 'MapIcon' },
  MoreHorizontal: { feather: 'MoreHorizontal', hero: 'EllipsisHorizontalIcon' },
  Bell: { feather: 'Bell', hero: 'BellIcon' },
  Sun: { feather: 'Sun', hero: 'SunIcon' },
  Moon: { feather: 'Moon', hero: 'MoonIcon' },
  User: { feather: 'User', hero: 'UserIcon' },
  LogOut: { feather: 'LogOut', hero: 'ArrowLeftOnRectangleIcon' },
  Menu: { feather: 'Menu', hero: 'Bars3Icon' },
  Search: { feather: 'Search', hero: 'MagnifyingGlassIcon' },
  ListFilter: { feather: 'Filter', hero: 'FunnelIcon' },
  PlusCircle: { feather: 'PlusCircle', hero: 'PlusCircleIcon' },
  Trash2: { feather: 'Trash2', hero: 'TrashIcon' },
  Printer: { feather: 'Printer', hero: 'PrinterIcon' },
  Edit: { feather: 'Edit', hero: 'PencilSquareIcon' },
  CheckCircle2: { feather: 'CheckCircle', hero: 'CheckCircleIcon' },
  Truck: { feather: 'Truck', hero: 'TruckIcon' },
  Clock: { feather: 'Clock', hero: 'ClockIcon' },
  Phone: { feather: 'Phone', hero: 'PhoneIcon' },
  MapPin: { feather: 'MapPin', hero: 'MapPinIcon' },
  MoreVertical: { feather: 'MoreVertical', hero: 'EllipsisVerticalIcon' },
  Wallet: { feather: 'CreditCard', hero: 'WalletIcon' },
  PackageCheck: { feather: 'Package', hero: 'CheckBadgeIcon' },
  Bot: { feather: 'Frown', hero: 'CpuChipIcon' },
  ListPlus: { feather: 'List', hero: 'ListBulletIcon' },
  Loader2: { feather: 'Loader', hero: 'ArrowPathIcon' },
  Image: { feather: 'Image', hero: 'PhotoIcon' },
  Clipboard: { feather: 'Clipboard', hero: 'ClipboardDocumentIcon' },
  FileText: { feather: 'FileText', hero: 'DocumentTextIcon' },
  Send: { feather: 'Send', hero: 'PaperAirplaneIcon' },
  ArrowLeft: { feather: 'ArrowLeft', hero: 'ArrowLeftIcon' },
  Building: { feather: 'Briefcase', hero: 'BuildingOfficeIcon' },
  LogIn: { feather: 'LogIn', hero: 'ArrowRightOnRectangleIcon' },
  Palette: { feather: 'Droplet', hero: 'PaintBrushIcon' },
  Brush: { feather: 'Edit3', hero: 'PaintBrushIcon' },
  LayoutGrid: { feather: 'Layout', hero: 'Squares2X2Icon' },
  Languages: { feather: 'Globe', hero: 'LanguageIcon' },
  List: { feather: 'List', hero: 'ListBulletIcon' },
  ReceiptText: { feather: 'FileText', hero: 'ReceiptPercentIcon' },
  Package: { feather: 'Package', hero: 'CubeIcon' },
  Share2: { feather: 'Share2', hero: 'ShareIcon' },
  MessageSquareQuote: { feather: 'MessageSquare', hero: 'ChatBubbleLeftRightIcon' },
  SlidersHorizontal: { feather: 'Sliders', hero: 'AdjustmentsHorizontalIcon' },
  Square: { feather: 'Square', hero: 'StopIcon' },
  Circle: { feather: 'Circle', hero: 'CheckCircleIcon' },
  Paintbrush: { feather: 'PenTool', hero: 'PaintBrushIcon' },
  TextSelect: { feather: 'Type', hero: 'BarsArrowUpIcon' },
  Feather: { feather: 'Feather', hero: 'PencilIcon' },
  Star: { feather: 'Star', hero: 'StarIcon' },
  Eye: { feather: 'Eye', hero: 'EyeIcon'},
  Save: { feather: 'Save', hero: 'ArrowDownTrayIcon' },
  XCircle: { feather: 'XCircle', hero: 'XCircleIcon' },
  DollarSign: { feather: 'DollarSign', hero: 'CurrencyDollarIcon' },
  TrendingUp: { feather: 'TrendingUp', hero: 'ArrowTrendingUpIcon' },
  Users: { feather: 'Users', hero: 'UsersIcon' },
  Store: { feather: 'ShoppingBag', hero: 'BuildingStorefrontIcon' },
  Component: { feather: 'Box', hero: 'CubeTransparentIcon' },
  Columns2: { feather: 'Columns', hero: 'RectangleGroupIcon' },
  BarChart: { feather: 'BarChart2', hero: 'ChartBarIcon' },
  RefreshCw: { feather: 'RefreshCw', hero: 'ArrowPathIcon'},
  Download: { feather: 'Download', hero: 'ArrowDownTrayIcon'},
  HomeIcon: { feather: 'Home', hero: 'HomeIcon'},
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
  const heroName = iconMapping[lucideName]?.hero;

  switch (library) {
    case 'feather':
      IconComponent = featherName ? FeatherIcons[featherName] : LucideIcons[lucideName];
      break;
    case 'heroicons':
      IconComponent = heroName ? HeroIcons[heroName] : LucideIcons[lucideName];
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
