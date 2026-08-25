import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createApp } from "./app";
import { config } from "./config";
import { store } from "./data/store";

const app = createApp();
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

interface ClientMeta {
  playerId?: string;
  subscribed: boolean;
}

const clients = new Map<WebSocket, ClientMeta>();

wss.on("connection", (socket) => {
  clients.set(socket, { subscribed: false });

  socket.send(
    JSON.stringify({
      type: "welcome",
      payload: {
        version: config.version,
        tickCount: store.tickCount,
        serverTime: new Date().toISOString(),
      },
    })
  );

  socket.on("message", (raw) => {
    try {
      const msg = JSON.parse(String(raw));
      const meta = clients.get(socket);
      if (!meta) return;

      if (msg.type === "auth" && msg.token) {
        const session = store.getSessionByToken(msg.token);
        if (session) {
          meta.playerId = session.playerId;
          socket.send(
            JSON.stringify({ type: "auth_ok", payload: { playerId: session.playerId } })
          );
        } else {
          socket.send(JSON.stringify({ type: "auth_fail", payload: { message: "Invalid token" } }));
        }
      }

      if (msg.type === "subscribe") {
        meta.subscribed = true;
        socket.send(JSON.stringify({ type: "subscribed", payload: { ok: true } }));
      }

      if (msg.type === "ping") {
        socket.send(
          JSON.stringify({
            type: "pong",
            payload: { serverTime: new Date().toISOString(), tickCount: store.tickCount },
          })
        );
      }
    } catch {
      // ignore malformed
    }
  });

  socket.on("close", () => {
    clients.delete(socket);
  });
});

function broadcast(type: string, payload: unknown) {
  const data = JSON.stringify({ type, payload });
  for (const [socket, meta] of clients) {
    if (socket.readyState === WebSocket.OPEN && meta.subscribed) {
      socket.send(data);
    }
  }
}

// World economy tick
setInterval(() => {
  store.advanceEconomyTick();
  broadcast("tick", {
    tickCount: store.tickCount,
    serverTime: new Date().toISOString(),
    market: store.market,
  });
}, config.tickIntervalMs);

server.listen(config.port, config.host, () => {
  console.log(`
╔══════════════════════════════════════════╗
║     GLOBAL DOMINION API SERVER           ║
╠══════════════════════════════════════════╣
║  HTTP  http://${config.host}:${config.port}/api
║  WS    ws://${config.host}:${config.port}/ws
║  Health http://localhost:${config.port}/health
╚══════════════════════════════════════════╝
`);
});
