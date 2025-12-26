import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;
  
  // Disable Socket.IO if backend is not available
  if (!SOCKET_URL || SOCKET_URL.includes('localhost')) {
    console.warn('⚠️ Socket.IO disabled - backend server not available');
    return null;
  }
  
  socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected');
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Socket.IO disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const connectSocket = () => {
  const sock = getSocket();
  if (sock && !sock.connected) {
    sock.connect();
  }
  return sock;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// Real-time event listeners
export const onNewOrder = (callback: (data: any) => void) => {
  const sock = getSocket();
  if (!sock) return () => {};
  sock.on('new_order_created', callback);
  return () => sock.off('new_order_created', callback);
};

export const onOrderStatusChanged = (orderId: string, callback: (data: any) => void) => {
  const sock = getSocket();
  if (!sock) return () => {};
  sock.on(`order_status_${orderId}`, callback);
  return () => sock.off(`order_status_${orderId}`, callback);
};

export const onDriverLocationUpdate = (orderId: string, callback: (data: any) => void) => {
  const sock = getSocket();
  if (!sock) return () => {};
  sock.on(`order_tracking_${orderId}`, callback);
  return () => sock.off(`order_tracking_${orderId}`, callback);
};

export const onDriverStatusUpdate = (callback: (data: any) => void) => {
  const sock = getSocket();
  if (!sock) return () => {};
  sock.on('driver_status_update', callback);
  return () => sock.off('driver_status_update', callback);
};

// Emit events
export const emitNewOrder = (orderData: any) => {
  const sock = getSocket();
  if (!sock) return;
  sock.emit('new_order', orderData);
};

export const emitOrderStatusChange = (data: { order_id: string; status: string }) => {
  const sock = getSocket();
  if (!sock) return;
  sock.emit('order_status_changed', data);
};

export const emitDriverLocation = (data: {
  driver_id: string;
  order_id: string;
  latitude: number;
  longitude: number;
}) => {
  const sock = getSocket();
  if (!sock) return;
  sock.emit('driver_location', data);
};

export const emitDriverStatus = (data: { driver_id: string; is_online: boolean }) => {
  const sock = getSocket();
  if (!sock) return;
  sock.emit('driver_status_changed', data);
};
