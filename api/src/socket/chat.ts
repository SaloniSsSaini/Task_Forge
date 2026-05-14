import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

type ChatMsg = { id: string; userId: string; name: string; text: string; at: string };

const history = new Map<string, ChatMsg[]>();
const MAX = 80;

function pushMessage(orgId: string, msg: ChatMsg) {
  const list = history.get(orgId) ?? [];
  list.push(msg);
  while (list.length > MAX) list.shift();
  history.set(orgId, list);
}

export function registerChatHandlers(io: Server): void {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }
      const payload = verifyAccessToken(token);
      (socket.data as { userId?: string }).userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const userId = (socket.data as { userId?: string }).userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, organizationId: true },
    });
    if (!user?.organizationId) {
      socket.emit("chat:error", { message: "No workspace assigned" });
      socket.disconnect(true);
      return;
    }
    const orgId = user.organizationId;
    const room = `org:${orgId}`;
    await socket.join(room);

    socket.emit("chat:history", history.get(orgId) ?? []);

    socket.on("chat:message", (raw: unknown) => {
      const text = typeof raw === "string" ? raw.trim() : typeof raw === "object" && raw && "text" in raw ? String((raw as { text: unknown }).text).trim() : "";
      if (!text || text.length > 2000) return;
      const msg: ChatMsg = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        userId,
        name: user.name,
        text,
        at: new Date().toISOString(),
      };
      pushMessage(orgId, msg);
      io.to(room).emit("chat:message", msg);
    });
  });
}
