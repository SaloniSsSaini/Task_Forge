import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";
import { notificationsRouter } from "./routes/notifications.js";
import { analyticsRouter } from "./routes/analytics.js";
import { usersRouter } from "./routes/users.js";
import { attachSocketIO } from "./socket.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
const devLocalhostOrigin = (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) {
    cb(null, true);
    return;
  }
  if (origin === env.WEB_ORIGIN) {
    cb(null, true);
    return;
  }
  if (env.NODE_ENV === "development") {
    try {
      const u = new URL(origin);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        cb(null, true);
        return;
      }
    } catch {
      /* ignore */
    }
  }
  cb(null, false);
};
app.use(
  cors({
    origin: devLocalhostOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }) as any
);

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/projects", projectsRouter);
app.use("/tasks", tasksRouter);
app.use("/notifications", notificationsRouter);
app.use("/analytics", analyticsRouter);
app.use("/users", usersRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const httpServer = createServer(app);
attachSocketIO(httpServer, devLocalhostOrigin);

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API + Socket.IO on http://localhost:${env.PORT}`);
});
