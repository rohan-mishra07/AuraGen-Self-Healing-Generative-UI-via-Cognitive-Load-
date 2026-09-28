"use client";

import React, { useState } from "react";
import { FrictionMetrics } from "../lib/types";
import { Activity, Zap, MousePointer, Clock, AlertCircle, RefreshCw, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface CognitiveHUDProps {
  metrics: FrictionMetrics;
  isConnected: boolean;
  isGenerating: boolean;
  telemetryLogs: string[];
  onSimulateSurge: (fieldId?: string) => void;
  onResetTracker: () => void;
}

export function CognitiveHUD({
  metrics,
  isConnected,
  isGenerating,
  telemetryLogs,
  onSimulateSurge,
  onResetTracker,
}: CognitiveHUDProps) {
  const [showLogs, setShowLogs] = useState(false);

  const score = metrics.cognitiveScore;
  const getScoreColor = (s: number) => {
    if (s >= 75) return { text: "text-rose-400", bg: "bg-rose-500", border: "border-rose-500/50", glow: "shadow-rose-500/30" };
    if (s >= 45) return { text: "text-amber-400", bg: "bg-amber-500", border: "border-amber-500/50", glow: "shadow-amber-500/30" };
    return { text: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-500/50", glow: "shadow-emerald-500/30" };
  };

  const colors = getScoreColor(score);

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 text-slate-100 shadow-2xl backdrop-blur-md mb-8">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-wide">Friction Engine Telemetry HUD</h2>
              <span
                className={`flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isConnected
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
                <span>{isConnected ? "WS CONNECTED (4000)" : "DISCONNECTED"}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time cognitive metrics streaming to LangChain + AST backend.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSimulateSurge("taxExemptionCode")}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:brightness-110 shadow-lg shadow-rose-500/20 disabled:opacity-50 transition"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Friction Surge (Score 88)</span>
          </button>

          <button
            onClick={onResetTracker}
            className="p-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Reset telemetry baseline"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {/* Cognitive Load Score Gauge */}
        <div className={`p-4 rounded-xl border ${colors.border} bg-slate-900/60 shadow-lg ${colors.glow} flex flex-col justify-between`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Cognitive Load Score</span>
            <AlertCircle className={`w-4 h-4 ${colors.text}`} />
          </div>

          <div className="my-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-black font-mono tracking-tight ${colors.text}`}>{score}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>

          {/* Progress Gauge */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-2 transition-all duration-300 ${colors.bg}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-right font-medium text-slate-400">
            {score >= 75 ? "⚠️ Triggering AI Self-Healing..." : score >= 45 ? "Hesitation Detected" : "Baseline State"}
          </div>
        </div>

        {/* Mouse Velocity Meter */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Cursor Velocity</span>
            <MousePointer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">{metrics.mouseVelocity.toFixed(2)}</span>
            <span className="text-xs text-slate-500">px/ms</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Erratic Jitter Threshold: <strong className="text-slate-300">&gt; 1.2 px/ms</strong>
          </div>
        </div>

        {/* Input Hesitation Duration */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Input Hesitation</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="my-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-teal-300">
              {(metrics.hesitationDuration / 1000).toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">seconds</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Pause Threshold: <strong className="text-slate-300">&gt; 2.0s without typing</strong>
          </div>
        </div>

        {/* Rage Click Count & Active Field */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Rage Clicks</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{metrics.rageClickCount}</span>
            <span className="text-xs text-slate-500">bursts</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Active Focus: <strong className="text-cyan-300">{metrics.activeFieldId || "None"}</strong>
          </div>
        </div>
      </div>

      {/* Generation Spinner Banner */}
      {isGenerating && (
        <div className="mt-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-between text-xs text-cyan-200 animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>GPT-4o LangChain Agent is generating simplified React step-wizard code...</span>
          </div>
          <span className="font-mono text-[10px] text-cyan-400 font-bold">Babel AST Parse Pending</span>
        </div>
      )}

      {/* Logs Drawer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Telemetry Stream Logs ({telemetryLogs.length} events)</span>
          </div>
          {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLogs && (
          <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto space-y-1">
            {telemetryLogs.length === 0 ? (
              <span className="text-slate-600">No events logged yet. Move mouse or focus inputs.</span>
            ) : (
              telemetryLogs.map((log, idx) => <div key={idx}>{log}</div>)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
