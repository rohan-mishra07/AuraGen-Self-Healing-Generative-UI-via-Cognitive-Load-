"use client";

import React, { useState } from "react";
import { initialFormState } from "../lib/defaultFormState";
import { FinancialFormState } from "../lib/types";
import { useCognitiveTracker } from "../hooks/useCognitiveTracker";
import { CognitiveHUD } from "../components/CognitiveHUD";
import { MorphTransition } from "../components/MorphTransition";
import { Cpu, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  const [formValues, setFormValues] = useState<FinancialFormState>(initialFormState);

  const {
    metrics,
    isConnected,
    isGenerating,
    generatedUI,
    telemetryLogs,
    simulateFrictionSurge,
    resetTracker,
  } = useCognitiveTracker({ formValues });

  const handleUpdateField = (id: keyof FinancialFormState, val: string) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleBulkUpdateForm = (newValues: FinancialFormState) => {
    setFormValues(newValues);
  };

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.15),rgba(255,255,255,0))] text-slate-100 p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-white">AuraGen</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-wider">
                  Self-Healing UI Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cognitive Load Telemetry &bull; LangChain GPT-4o &bull; Babel AST Security Guard &bull; Framer Motion
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AST Guard: Active</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sanitization: Enabled</span>
            </div>
          </div>
        </header>

        <section>
          <CognitiveHUD
            metrics={metrics}
            isConnected={isConnected}
            isGenerating={isGenerating}
            telemetryLogs={telemetryLogs}
            onSimulateSurge={simulateFrictionSurge}
            onResetTracker={resetTracker}
          />
        </section>

        <section>
          <MorphTransition
            formValues={formValues}
            onChangeField={handleUpdateField}
            onBulkUpdateForm={handleBulkUpdateForm}
            generatedUI={generatedUI}
            onSimulateSurge={simulateFrictionSurge}
            onResetTracker={resetTracker}
          />
        </section>
      </div>
    </main>
  );
}
