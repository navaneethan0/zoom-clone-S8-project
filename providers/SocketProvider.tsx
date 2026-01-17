'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io as ClientIO } from 'socket.io-client';

type SocketContextType = {
    socket: any | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        console.log('Connecting to socket at:', siteUrl);
        let socketInstance: any;

        const socketInitializer = async () => {
            try {
                // Kickstart the socket server with cache-busting
                await fetch('/api/socket?t=' + Date.now());

                socketInstance = (ClientIO as any)(siteUrl, {
                    path: '/api/socket',
                    addTrailingSlash: false,
                    transports: ['polling', 'websocket'], // Allow both for better compatibility
                });

                socketInstance.on('connect', () => {
                    console.log('Socket connected successfully! ID:', socketInstance.id);
                    setIsConnected(true);
                });

                socketInstance.on('connect_error', (err: any) => {
                    console.error('Socket connection error:', err);
                    // Fallback to polling if websocket fails
                    if (socketInstance.io.opts.transports.includes('websocket')) {
                        console.log('Attempting fallback to polling...');
                        socketInstance.io.opts.transports = ['polling'];
                    }
                });

                socketInstance.on('disconnect', (reason: string) => {
                    console.log('Socket disconnected:', reason);
                    setIsConnected(false);
                });

                setSocket(socketInstance);
            } catch (error) {
                console.error('Socket initialization failed:', error);
            }
        };

        socketInitializer();

        return () => {
            if (socketInstance) {
                console.log('Cleaning up socket connection...');
                socketInstance.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
