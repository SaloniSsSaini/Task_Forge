"use client";

import { useEffect, useState } from "react";
import { disconnectChatSocket, getChatSocket } from "@/lib/chat-socket";

type Msg = { userId: string; name: string; text: string; at: number };

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let socket: ReturnType<typeof getChatSocket> | null = null;
    try {
      socket = getChatSocket();
    } catch {
      setErr("You need to be logged in.");
      return;
    }
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onHist = (h: Msg[]) => setMsgs(Array.isArray(h) ? h : []);
    const onMsg = (m: Msg) => setMsgs((prev) => [...prev, m]);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat:history", onHist);
    socket.on("chat:message", onMsg);
    if (socket.connected) setConnected(true);
    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("chat:history", onHist);
      socket?.off("chat:message", onMsg);
      disconnectChatSocket();
    };
  }, []);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    try {
      getChatSocket().emit("chat:message", { text: t });
      setInput("");
    } catch {
      setErr("Could not send");
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4" style={{ height: "calc(100vh - 8rem)" }}>
      <div>
        <h1 className="text-2xl font-semibold text-white">Team chat</h1>
        <p className="text-sm text-slate-400">
          Socket.IO · same org room · in-memory history (demo).{" "}
          <span className={connected ? "text-emerald-400" : "text-amber-400"}>{connected ? "Connected" : "Connecting…"}</span>
        </p>
      </div>
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-slate-900/50">
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {msgs.length === 0 ? <p className="text-sm text-slate-500">No messages yet. Say hi below.</p> : null}
          {msgs.map((m, i) => (
            <div key={`${m.at}-${i}`} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm">
              <span className="font-medium text-indigo-300">{m.name}</span>
              <span className="text-slate-500"> · {new Date(m.at).toLocaleTimeString()}</span>
              <p className="mt-1 text-slate-200">{m.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="border-t border-white/10 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your org…"
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
            />
            <button type="submit" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
