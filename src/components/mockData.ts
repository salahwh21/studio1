/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Driver } from './types';

export const AMMAN_REGIONS = [
  'عبدون',
  'الصويفية',
  'خلدا',
  'الشميساني',
  'الجبيهة',
  'تلاع العلي',
  'الدوار السابع',
  'مرج الحمام',
  'جبل عمان',
  'المرج'
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2024-005',
    customerName: 'سارة خالد',
    customerPhone: '+962 79 123 4567',
    region: 'عبدون',
    status: 'delivering',
    price: 3.5,
    createdAt: '08:15 ص',
    driverId: 'drv-01'
  },
  {
    id: 'ORD-2024-006',
    customerName: 'محمد العتوم',
    customerPhone: '+962 78 987 6543',
    region: 'الصويفية',
    status: 'delivered',
    price: 4.0,
    createdAt: '07:30 ص',
    driverId: 'drv-01',
    pickupTime: '08:00 ص',
    deliveryTime: '08:30 ص'
  },
  {
    id: 'ORD-2024-007',
    customerName: 'رانيا المصري',
    customerPhone: '+962 77 456 7890',
    region: 'خلدا',
    status: 'waiting',
    price: 5.0,
    createdAt: '09:00 ص'
  },
  {
    id: 'ORD-2024-008',
    customerName: 'يزن الحوسني',
    customerPhone: '+962 79 999 8888',
    region: 'الشميساني',
    status: 'pending',
    price: 3.0,
    createdAt: '09:12 ص'
  },
  {
    id: 'ORD-2024-009',
    customerName: 'ليلى حداد',
    customerPhone: '+962 78 555 4444',
    region: 'الجبيهة',
    status: 'delivered',
    price: 4.5,
    createdAt: 'Yesterday',
    driverId: 'drv-02'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'أحمد م.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1IhU6KxnSLrQJP6UCM2LPSQf3GIHnMTwXRyshNiZYR0iG6bD5MrCCt2o2J-mXdB2M_FBEwwxifzpWYfPLXLnuGGxDTxLPcARsTDbbsNT33YRIRinrEfn4lYhPE-bCYDuite0tSKTWQ_dLaupK3Kwo3kbSmtlVVPDvg0F4iMxruQHpxNc5bml5bRk2W86MhUV9vrf5kFGuHzcYTEw6Frv-A_cwNQ7RRqhmzwKV7OE4ANIuNo5RE4gdZfh932_MxMNcSqhOo0L52h69',
    rating: 4.9,
    vehicleType: 'سيارة هيونداي أيونك',
    status: 'online',
    activeOrderCount: 1,
    phone: '+962 79 111 2222'
  },
  {
    id: 'drv-02',
    name: 'طارق عبد الله',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    vehicleType: 'سكوتر كهربائي زوم',
    status: 'online',
    activeOrderCount: 0,
    phone: '+962 78 222 3333'
  },
  {
    id: 'drv-03',
    name: 'سليمان حسن',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    vehicleType: 'فان تويوتا هايس',
    status: 'offline',
    activeOrderCount: 0,
    phone: '+962 77 333 4444'
  }
];

export const GENERAL_STATS = {
  dailyShipments: 15420,
  localMerchants: 824,
  customerSatisfaction: 98
};
