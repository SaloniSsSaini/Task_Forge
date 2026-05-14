import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { prisma } from "./lib/prisma.js";
import { verifyAccessToken } from "./utils/jwt.js";

type ChatMsg = { userId: string; name: string; text: string; at: number };
const chatHistory = new Map<string, ChatMsg[]>();
const MAX = 100;

function pushHistory(orgId: string, msg: ChatMsg) {
  const list = chatHistory.get(orgId) ?? [];
  list.push(msg);
  if (list.length > MAX) list.splice(0, list.length - MAX);
  chatHistory.set(orgId, list);
}

export function attachSocketIO(httpServer: HttpServer, corsOk: (origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) => void) {
  const io = new Server(httpServer, {
    path: "/socket.io/",
    cors: {
      origin: (origin, callback) => corsOk(origin, callback),
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }
    try {
      const p = verifyAccessToken(token);
      socket.data.userId = p.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, name: true },
    });
    const orgId = user?.organizationId;
    if (orgId) {
      const room = `org:${orgId}`;
      await socket.join(room);
      const history = chatHistory.get(orgId) ?? [];
      socket.emit("chat:history", history);
    }

    socket.on("chat:message", (payload: unknown) => {
      if (!orgId) return;
      const text =
        typeof payload === "object" && payload !== null && "text" in payload
          ? String((payload as { text: unknown }).text ?? "")
          : typeof payload === "string"
            ? payload
            : "";
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed) return;
      const msg: ChatMsg = {
        userId,
        name: user?.name ?? "User",
        text: trimmed,
        at: Date.now(),
      };
      pushHistory(orgId, msg);
      io.to(`org:${orgId}`).emit("chat:message", msg);
    });
  });

  return io;
}
