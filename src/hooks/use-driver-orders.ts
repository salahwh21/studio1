'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Order } from '@/store/orders-store';

function mapApiOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber || o.order_number || 0,
    referenceNumber: o.referenceNumber || o.reference_number || '',
    source: o.source || 'Manual',
    date: o.date || o.createdAt?.split('T')[0] || o.created_at?.split('T')[0] || '',
    recipient: o.recipient || '',
    phone: o.phone || '',
    whatsapp: o.whatsapp || '',
    city: o.city || '',
    region: o.region || '',
    address: o.address || '',
    lat: o.lat ? parseFloat(o.lat) : undefined,
    lng: o.lng ? parseFloat(o.lng) : undefined,
    status: o.status || 'بالانتظار',
    previousStatus: o.previousStatus || o.previous_status || '',
    merchant: o.merchant || '',
    merchantPhone: o.merchantPhone || o.merchant_phone || '',
    driver: o.driver || null,
    previousDriver: o.previousDriver || o.previous_driver || undefined,
    cod: parseFloat(o.cod) || 0,
    deliveryFee: parseFloat(o.deliveryFee ?? o.delivery_fee) || 0,
    driverFee: parseFloat(o.driverFee ?? o.driver_fee) || 0,
    itemPrice: parseFloat(o.itemPrice ?? o.item_price) || 0,
    additionalCost: parseFloat(o.additionalCost ?? o.additional_cost) || 0,
    driverAdditionalFare: parseFloat(o.driverAdditionalFare ?? o.driver_additional_fare) || 0,
    notes: o.notes || '',
    settlementStatus: o.settlementStatus || o.settlement_status || undefined,
  } as Order;
}

interface UseDriverOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDriverOrders(): UseDriverOrdersReturn {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    if (!user?.name) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getOrders({
        driver: user.name,
        limit: 500,
        page: 0,
        sortKey: 'created_at',
        sortDir: 'desc',
      });
      if (mountedRef.current) {
        const mapped = (result.orders || result.data || []).map(mapApiOrder);
        setOrders(mapped);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to load orders');
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [user?.name]);

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    return () => { mountedRef.current = false; };
  }, [fetchOrders]);

  return { orders, isLoading, error, refresh: fetchOrders };
}
