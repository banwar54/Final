import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  Close_SOCKET: () => {}
});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // If we already have a socket that's connected, don't create a new one
    if (socket && socket.connected) {
      console.log("Socket already connected with ID:", socket.id);
      setIsConnected(true);
      return;
    }
    
    // If we have a socket that's disconnected, try to reconnect it instead of creating a new one
    if (socket && !socket.connected) {
      console.log("Reconnecting existing socket...");
      socket.connect();
      return;
    }

    // Otherwise create a new socket
    console.log("Creating new socket connection...");
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
      // Don't use Socket.IO's reconnection to avoid getting new socket IDs
      reconnection: false
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setSocketId(newSocket.id ?? null);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setIsConnected(false);
    });

    setSocket(newSocket);
  };

  // Manual ping to keep connection alive
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    const pingInterval = setInterval(() => {
      if (socket && socket.connected) {
        // Send a custom ping to keep connection alive
        socket.emit('ping');
        console.log('Ping sent to maintain connection');
      }
    }, 25000); // Every 25 seconds to stay under most timeout limits
    
    return () => clearInterval(pingInterval);
  }, [socket, isConnected]);

  const disconnect = () => {
    if (socket) {
      // Just disconnect temporally, keeping the socket instance
      socket.disconnect();
      setIsConnected(false);
    }
  };
  
  const Close_SOCKET = () => {
    if (socket) {
      console.log("Completely closing socket connection");
      socket.disconnect();
      socket.removeAllListeners();
      setSocket(null);
      setSocketId(null);
      setIsConnected(false);
    }
  };

  // This handles cleanup on component unmount
  useEffect(() => {
    return () => {
      // Don't disconnect the socket on unmount - this is key for persistence
      // Just clean up listeners that might be specific to this component
      if (socket) {
        console.log("Component unmounting, keeping socket alive");
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      connect, 
      disconnect,
      Close_SOCKET 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);