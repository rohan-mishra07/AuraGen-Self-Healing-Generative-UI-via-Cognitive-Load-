import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { TelemetryPacket } from "../lib/types";
import { generateAdaptiveUI } from "./agent";
import { validateAST } from "./astValidator";

dotenv.config();
dotenv.config({ path: ".env.local" });

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({ origin: ["http://localhost:3000", "http://127.0.0.1:3000", "*"] }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Cooldown tracking per socket to prevent duplicate LLM trigger spikes
const activeGenerations = new Set<string>();
const lastGenerationTime = new Map<string, number>();

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AuraGen Telemetry & Code-Gen Server",
    activeConnections: io.sockets.sockets.size,
    timestamp: new Date().toISOString(),
  });
});

io.on("connection", (socket: Socket) => {
  console.log(`[SERVER] Client connected: ${socket.id}`);

  socket.on("telemetry_update", async (packet: TelemetryPacket) => {
    const score = packet.metrics.cognitiveScore;
    const activeField = packet.metrics.activeFieldId || "general";
    const now = Date.now();
    const lastTime = lastGenerationTime.get(socket.id) || 0;

    // Check high friction threshold (> 75 score) & cooldown interval (> 4000ms)
    if (score >= 75 && !activeGenerations.has(socket.id) && now - lastTime > 4000) {
      console.log(`[SERVER] ⚠️ Cognitive Load Spike (${score}/100) on field '${activeField}' from client ${socket.id}`);

      activeGenerations.add(socket.id);
      lastGenerationTime.set(socket.id, now);

      socket.emit("UI_GENERATION_STARTED", {
        fieldId: activeField,
        reason: `Cognitive Score ${score}/100 (Hesitation: ${(packet.metrics.hesitationDuration / 1000).toFixed(1)}s, Rage Clicks: ${packet.metrics.rageClickCount})`,
      });

      try {
        // Step 1: LLM / Code-Gen Agent execution
        const payload = await generateAdaptiveUI(packet);

        // Step 2: AST Safety & Verification Layer (Babel)
        const astResult = validateAST(payload.componentCode);
        console.log(`[SERVER] 🛡️ AST Verification Result for field '${activeField}':`, {
          isValid: astResult.isValid,
          syntaxValid: astResult.syntaxValid,
          blockedCount: astResult.blockedSymbols.length,
        });

        if (!astResult.isValid) {
          console.warn(`[SERVER] 🚨 AST Security / Syntax Validation FAILED:`, astResult.errors);
          payload.isFallback = true;
          payload.frictionReason += " (AST Security Fallback Applied)";
        }

        // Step 3: Emit validated component payload over WebSocket
        socket.emit("GENERATED_UI", payload);
      } catch (err: any) {
        console.error("[SERVER] Error during agent generation:", err);
        socket.emit("GENERATION_FAILED", { message: err.message || "Failed to generate adaptive UI" });
      } finally {
        activeGenerations.delete(socket.id);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`[SERVER] Client disconnected: ${socket.id}`);
    activeGenerations.delete(socket.id);
    lastGenerationTime.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`
=====================================================
⚡ AuraGen Telemetry & Code-Gen Server Running
📍 WebSocket / HTTP Endpoint: http://localhost:${PORT}
🛡️ Babel AST Security Validator: ACTIVE
🤖 LangChain + GPT-4o Agent Pipeline: READY
=====================================================
  `);
});
