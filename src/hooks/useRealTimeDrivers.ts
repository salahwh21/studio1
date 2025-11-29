import { useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket';

interface DriverLocation {
  driver_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const useRealTimeDrivers = () => {
  const handleDriverLocationUpdate = useCallback((data: DriverLocation) => {
    console.log('📍 Driver location updated:', data);
    // Store location in state or pass to parent
    return data;
  }, []);

  const handleDriverStatusUpdate = useCallback((data: any) => {
    console.log('🚗 Driver status updated:', data);
    // Handle driver online/offline status
    return data;
  }, []);

  useEffect(() => {
    socket.on('driver_status_update', handleDriverStatusUpdate);

    return () => {
      socket.off('driver_status_update', handleDriverStatusUpdate);
    };
  }, [handleDriverStatusUpdate]);

  // Generic location listener - attach to specific order
  const trackOrderLocation = useCallback((orderId: string, callback: (data: DriverLocation) => void) => {
    const handler = (data: DriverLocation) => {
      console.log(`📍 Tracking order ${orderId}:`, data);
      callback(data);
    };
    socket.on(`order_tracking_${orderId}`, handler);
    return () => socket.off(`order_tracking_${orderId}`, handler);
  }, []);

  return { trackOrderLocation, handleDriverLocationUpdate, handleDriverStatusUpdate };
};

export default useRealTimeDrivers;
