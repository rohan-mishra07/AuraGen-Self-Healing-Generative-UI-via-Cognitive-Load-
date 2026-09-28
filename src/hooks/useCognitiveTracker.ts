"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { FinancialFormState, FrictionMetrics, GeneratedUIPayload, TelemetryPacket } from "../lib/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

interface UseCognitiveTrackerProps {
  formValues: FinancialFormState;
}

export function useCognitiveTracker({ formValues }: UseCognitiveTrackerProps) {
  const [metrics, setMetrics] = useState<FrictionMetrics>({
    mouseVelocity: 0,
    hesitationDuration: 0,
    rageClickCount: 0,
    cognitiveScore: 0,
    activeFieldId: null,
    activeFieldLabel: null,
    lastUpdated: Date.now(),
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUI, setGeneratedUI] = useState<GeneratedUIPayload | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const formValuesRef = useRef(formValues);
  formValuesRef.current = formValues;

  // Tracking state refs
  const mousePosRef = useRef({ x: 0, y: 0, time: Date.now() });
  const velocityHistoryRef = useRef<number[]>([]);
  const clickHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const focusStartRef = useRef<number | null>(null);
  const activeInputRef = useRef<{ id: string | null; label: string | null }>({ id: null, label: null });
  const hesitationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const keystrokeCountRef = useRef(0);

  // Helper log function
  const addLog = useCallback((msg: string) => {
    setTelemetryLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 49),
    ]);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on("connect", () => {
      setIsConnected(true);
      addLog("WebSocket Connected to Orchestration Server (http://localhost:4000)");
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      addLog(`WebSocket Connect Error: ${err.message}`);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      addLog(`WebSocket Disconnected: ${reason}`);
    });

    socket.on("UI_GENERATION_STARTED", (data: { fieldId: string; reason: string }) => {
      setIsGenerating(true);
      addLog(`AI Code-Gen Agent triggered for field: ${data.fieldId} (${data.reason})`);
    });

    socket.on("GENERATED_UI", (payload: GeneratedUIPayload) => {
      setIsGenerating(false);
      setGeneratedUI(payload);
      addLog(
        `Received validated UI component! (AST Validated: ${!payload.isFallback ? "PASS" : "FALLBACK"})`
      );
    });

    socket.on("GENERATION_FAILED", (err: { message: string }) => {
      setIsGenerating(false);
      addLog(`AI Code-Gen Error: ${err.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [addLog]);

  // Compute Cognitive Score from current friction signals
  const calculateScore = useCallback(
    (velocity: number, hesitationMs: number, rageClicks: number): number => {
      const rageComponent = Math.min(45, rageClicks * 15);
      const hesitationComponent = Math.min(35, Math.floor(hesitationMs / 1000) * 8);
      const erraticVelocityComponent = Math.min(20, Math.floor(velocity * 10));

      const rawScore = rageComponent + hesitationComponent + erraticVelocityComponent;
      return Math.min(100, Math.max(0, rawScore));
    },
    []
  );

  // Emit Telemetry Packet over WebSocket
  const broadcastTelemetry = useCallback(
    (updatedMetrics: FrictionMetrics) => {
      if (!socketRef.current || !socketRef.current.connected) return;

      const completedFields = Object.values(formValuesRef.current).filter((val) => val && val.trim() !== "").length;
      const totalFields = Object.keys(formValuesRef.current).length;
      const formCompletionPercentage = Math.round((completedFields / totalFields) * 100);

      const packet: TelemetryPacket = {
        timestamp: Date.now(),
        metrics: updatedMetrics,
        formValues: formValuesRef.current,
        domContext: {
          focusedInput: updatedMetrics.activeFieldId,
          focusedLabel: updatedMetrics.activeFieldLabel,
          fieldType: "financial_input",
          formCompletionPercentage,
        },
      };

      socketRef.current.emit("telemetry_update", packet);
    },
    []
  );

  // Mouse Movement & Velocity Tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - mousePosRef.current.time;

      if (dt > 30) {
        const dx = e.clientX - mousePosRef.current.x;
        const dy = e.clientY - mousePosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const velocity = dist / dt; // px/ms

        mousePosRef.current = { x: e.clientX, y: e.clientY, time: now };

        // Keep rolling average of last 10 velocity samples
        const history = [...velocityHistoryRef.current.slice(-9), velocity];
        velocityHistoryRef.current = history;
        const avgVelocity = history.reduce((a, b) => a + b, 0) / history.length;

        // Update score if mouse jitter is high (> 1.5 px/ms)
        if (avgVelocity > 1.2) {
          setMetrics((prev) => {
            const newScore = calculateScore(avgVelocity, prev.hesitationDuration, prev.rageClickCount);
            const updated = { ...prev, mouseVelocity: avgVelocity, cognitiveScore: newScore, lastUpdated: now };
            if (newScore >= 75) broadcastTelemetry(updated);
            return updated;
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [calculateScore, broadcastTelemetry]);

  // Click & Rage Click Tracker
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const newClick = { x: e.clientX, y: e.clientY, time: now };

      // Filter clicks within last 800ms and within 40px radius
      const recentClicks = clickHistoryRef.current.filter((c) => {
        const timeDiff = now - c.time;
        const dist = Math.sqrt(Math.pow(e.clientX - c.x, 2) + Math.pow(e.clientY - c.y, 2));
        return timeDiff < 800 && dist < 40;
      });

      recentClicks.push(newClick);
      clickHistoryRef.current = recentClicks;

      if (recentClicks.length >= 3) {
        addLog(`Rage Click detected! (${recentClicks.length} clicks in close radius)`);
        setMetrics((prev) => {
          const newRageCount = prev.rageClickCount + 1;
          const newScore = calculateScore(prev.mouseVelocity, prev.hesitationDuration, newRageCount);
          const updated = {
            ...prev,
            rageClickCount: newRageCount,
            cognitiveScore: newScore,
            lastUpdated: now,
          };
          broadcastTelemetry(updated);
          return updated;
        });
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [addLog, calculateScore, broadcastTelemetry]);

  // Input Focus, Keystrokes, and Hesitation Timer Tracker (>2s threshold)
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA")) {
        const fieldId = target.getAttribute("id") || target.getAttribute("name") || null;
        const labelEl = target.id ? document.querySelector(`label[for="${target.id}"]`) : null;
        const fieldLabel = labelEl ? labelEl.textContent || fieldId : fieldId;

        activeInputRef.current = { id: fieldId, label: fieldLabel };
        focusStartRef.current = Date.now();
        keystrokeCountRef.current = 0;

        setMetrics((prev) => ({
          ...prev,
          activeFieldId: fieldId,
          activeFieldLabel: fieldLabel,
          hesitationDuration: 0,
        }));
      }
    };

    const handleKeyDown = () => {
      keystrokeCountRef.current += 1;
      // Typing reduces current hesitation friction
      setMetrics((prev) => {
        const reducedHesitation = Math.max(0, prev.hesitationDuration - 500);
        return { ...prev, hesitationDuration: reducedHesitation };
      });
    };

    const handleFocusOut = () => {
      if (hesitationTimerRef.current) clearInterval(hesitationTimerRef.current);
      focusStartRef.current = null;
      activeInputRef.current = { id: null, label: null };
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("focusout", handleFocusOut);

    // Continuous Hesitation Checker interval (runs every 500ms when focused)
    const interval = setInterval(() => {
      if (focusStartRef.current && activeInputRef.current.id) {
        const duration = Date.now() - focusStartRef.current;
        // Low keystrokes + time > 2000ms = Hesitation Friction
        if (duration > 2000 && keystrokeCountRef.current < Math.floor(duration / 1500)) {
          setMetrics((prev) => {
            const newScore = calculateScore(prev.mouseVelocity, duration, prev.rageClickCount);
            const updated = {
              ...prev,
              hesitationDuration: duration,
              cognitiveScore: newScore,
              lastUpdated: Date.now(),
            };

            // Broadcast whenever score spikes to high threshold
            if (newScore >= 70) {
              broadcastTelemetry(updated);
            }
            return updated;
          });
        }
      }
    }, 500);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focusout", handleFocusOut);
      clearInterval(interval);
    };
  }, [calculateScore, broadcastTelemetry]);

  // Periodic heart-beat broadcast to keep telemetry server synced
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        broadcastTelemetry(prev);
        return prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [broadcastTelemetry]);

  // Manual Trigger for Friction Surge Simulation
  const simulateFrictionSurge = useCallback(
    (targetFieldId?: string) => {
      const fieldId = targetFieldId || activeInputRef.current.id || "taxExemptionCode";
      const fieldLabel = activeInputRef.current.label || "Section 83(b) Tax Exemption Code";

      addLog(`[SIMULATION] Triggering Cognitive Friction Surge on field: ${fieldId}`);

      const surgeMetrics: FrictionMetrics = {
        mouseVelocity: 2.8,
        hesitationDuration: 4500,
        rageClickCount: 4,
        cognitiveScore: 88,
        activeFieldId: fieldId,
        activeFieldLabel: fieldLabel,
        lastUpdated: Date.now(),
      };

      setMetrics(surgeMetrics);
      broadcastTelemetry(surgeMetrics);
    },
    [addLog, broadcastTelemetry]
  );

  const resetTracker = useCallback(() => {
    setMetrics({
      mouseVelocity: 0,
      hesitationDuration: 0,
      rageClickCount: 0,
      cognitiveScore: 0,
      activeFieldId: null,
      activeFieldLabel: null,
      lastUpdated: Date.now(),
    });
    setGeneratedUI(null);
    clickHistoryRef.current = [];
    addLog("Cognitive tracker reset to baseline");
  }, [addLog]);

  return {
    metrics,
    isConnected,
    isGenerating,
    generatedUI,
    telemetryLogs,
    simulateFrictionSurge,
    resetTracker,
  };
}
