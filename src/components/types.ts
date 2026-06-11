/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'driver' | 'merchant' | 'admin';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  region: string;
  status: 'pending' | 'delivering' | 'delivered' | 'waiting';
  price: number;
  createdAt: string;
  pickupTime?: string;
  deliveryTime?: string;
  driverId?: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  vehicleType: string;
  status: 'online' | 'offline' | 'busy';
  activeOrderCount: number;
  phone: string;
}

export interface Stats {
  dailyShipments: number;
  localMerchants: number;
  customerSatisfaction: number;
}
