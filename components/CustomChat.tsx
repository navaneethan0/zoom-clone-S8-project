'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Paperclip, Send, Download, File as FileIcon, X } from 'lucide-react';
import { useSocket } from '@/providers/SocketProvider';
import { useToast } from './ui/use-toast';
import { cn } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';

interface Message {
    id: string;
    userId: string;
    userName: string;
    text?: string;
    file?: {
        url: string;
        name: string;
        size: number;
        type: string;
    };
    timestamp: number;
}

const CustomChat = ({ roomId }: { roomId: string }) => {
    const { user } = useUser();
    const { socket, isConnected } = useSocket();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload, isUploading } = useUploadThing("meetingFile", {
        onClientUploadComplete: (res) => {
            if (res && res[0] && user && socket) {
                const data = res[0];
                const newMessage: Message = {
                    id: Math.random().toString(36).substring(7),
                    userId: user.id,
                    userName: user.fullName || user.username || 'Anonymous',
                    file: {
                        url: data.url,
                        name: data.name,
                        size: data.size,
                        type: data.type,
                    },
                    timestamp: Date.now(),
                };

                console.log('Sending file message:', { roomId, message: newMessage });
                socket.emit('send-message', { roomId, message: newMessage });

                // Optimistic update
                setMessages((prev) => [...prev, newMessage]);
                toast({
                    title: "Upload complete",
                    description: "Your file has been sent.",
                });
            }
        },
        onUploadError: (error) => {
            toast({
                title: "Upload failed",
                description: error.message || "Something went wrong while uploading the file.",
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        if (!socket || !roomId) return;

        console.log(`Joining room: ${roomId}`);
        socket.emit('join-room', roomId);

        socket.on('joined-room', (confirmedRoomId: string) => {
            console.log(`Successfully joined room on server: ${confirmedRoomId}`);
            toast({
                title: "Chat connected",
                description: `Joined meeting room ${confirmedRoomId}`,
            });
        });

        socket.on('receive-message', (message: Message) => {
            console.log('Message received on client:', message);
            setMessages((prev) => {
                // Prevent duplicate messages (optimistic updates)
                if (prev.find((m) => m.id === message.id)) return prev;
                return [...prev, message];
            });
        });

        return () => {
            console.log(`Cleaning up listeners for room: ${roomId}`);
            socket.off('joined-room');
            socket.off('receive-message');
        };
    }, [socket, roomId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || !socket || !user) {
            console.log('Cannot send message:', {
                hasInput: !!inputValue.trim(),
                hasSocket: !!socket,
                hasUser: !!user,
                isConnected
            });
            return;
        }

        const newMessage: Message = {
            id: Math.random().toString(36).substring(7),
            userId: user.id,
            userName: user.fullName || user.username || 'Anonymous',
            text: inputValue,
            timestamp: Date.now(),
        };

        console.log('Sending message:', { roomId, message: newMessage });
        socket.emit('send-message', { roomId, message: newMessage });

        // Optimistic update - show it immediately
        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !socket) return;

        await startUpload([file]);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex h-full w-[350px] flex-col border-l border-dark-3 bg-dark-1 text-white shadow-xl animate-in slide-in-from-right duration-300 relative z-50 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-dark-3 p-4">
                <h2 className="text-xl font-bold">Chat</h2>
                <div className={cn("size-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} title={isConnected ? "Connected" : "Disconnected"} />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col gap-1", msg.userId === user?.id ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{msg.userName}</span>
                            <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {msg.text && (
                            <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", msg.userId === user?.id ? "bg-blue-1 text-white" : "bg-dark-3 text-white")}>
                                {msg.text}
                            </div>
                        )}

                        {msg.file && (
                            <div className="flex max-w-[80%] flex-col gap-2 rounded-lg bg-dark-4 p-3 border border-dark-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded bg-dark-3">
                                        <FileIcon size={20} className="text-blue-1" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate text-sm font-medium">{msg.file.name}</span>
                                        <span className="text-[10px] text-gray-400">{formatFileSize(msg.file.size)}</span>
                                    </div>
                                </div>
                                <a
                                    href={msg.file.url}
                                    download={msg.file.name}
                                    className="flex items-center justify-center gap-2 rounded bg-blue-1 py-1 text-xs font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <Download size={14} />
                                    Download
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="border-t border-dark-3 p-4">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dark-3 hover:bg-dark-4 transition-colors disabled:opacity-50"
                    >
                        <Paperclip size={20} className={cn("text-gray-400", isUploading && "animate-pulse")} />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full bg-dark-3 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-1"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-1 hover:bg-blue-700 transition-colors disabled:bg-gray-600"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomChat;
