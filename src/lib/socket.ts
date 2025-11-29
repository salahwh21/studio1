import { io } from 'socket.io-client';

// Get socket URL from environment or use localhost
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  
  const socketUrl = (globalThis as any).VITE_SOCKET_IO_URL;
  if (socketUrl) return socketUrl;
  
  const apiUrl = (globalThis as any).VITE_API_URL;
  if (apiUrl) return apiUrl.replace('/api', '');
  
  return 'http://localhost:3001';
};

const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Subscribe to new orders
export const subscribeToNewOrders = (callback: (data: any) => void) => {
  socket.on('new_order_created', callback);
  return () => socket.off('new_order_created', callback);
};

// Track driver location in real-time
export const trackDriverLocation = (orderId: string, callback: (data: any) => void) => {
  socket.on(`order_tracking_${orderId}`, callback);
  return () => socket.off(`order_tracking_${orderId}`, callback);
};

// Subscribe to order status changes
export const subscribeToOrderStatus = (orderId: string, callback: (data: any) => void) => {
  socket.on(`order_status_${orderId}`, callback);
  return () => socket.off(`order_status_${orderId}`, callback);
};

// Subscribe to driver status updates
export const subscribeToDriverStatus = (callback: (data: any) => void) => {
  socket.on('driver_status_update', callback);
  return () => socket.off('driver_status_update', callback);
};

// Emit driver location
export const emitDriverLocation = (driverId: string, orderId: string, latitude: number, longitude: number) => {
  socket.emit('driver_location', { driver_id: driverId, order_id: orderId, latitude, longitude });
};

// Emit driver status change
export const emitDriverStatusChange = (driverId: string, is_online: boolean) => {
  socket.emit('driver_status_changed', { driver_id: driverId, is_online });
};

// Emit order status change
export const emitOrderStatusChange = (orderId: string, status: string) => {
  socket.emit('order_status_changed', { order_id: orderId, status });
};

// Socket connection management
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log('🔌 Socket connected');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('🔌 Socket disconnected');
  }
};

// Socket event listeners
socket.on('connect', () => {
  console.log('✅ Socket.IO connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket.IO disconnected');
});

socket.on('connect_error', (error) => {
  console.error('⚠️ Socket connection error:', error);
});

export default socket;
