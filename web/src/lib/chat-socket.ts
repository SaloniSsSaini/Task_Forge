"use client";

import { getAccessToken } from "./auth-storage";
import { getApiUrl } from "./config";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getChatSocket(): Socket {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");
  if (socket?.connected) return socket;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = io(getApiUrl(), {
    path: "/socket.io/",
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
  return socket;
}

export function disconnectChatSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}
