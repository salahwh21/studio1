import { useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '@/lib/socket';

export const useSocket = () => {
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  return socket;
};

export default useSocket;
