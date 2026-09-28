"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FinancialFormState, GeneratedUIPayload } from "../lib/types";
import { ComplexForm } from "./ComplexForm";
import { DynamicRenderer } from "./DynamicRenderer";
import { Sparkles, CheckCircle, ArrowLeft } from "lucide-react";

interface MorphingShellProps {
  formValues: FinancialFormState;
  onChangeField: (id: keyof FinancialFormState, value: string) => void;
  onBulkUpdateForm: (newValues: FinancialFormState) => void;
  generatedUI: GeneratedUIPayload | null;
  onSimulateSurge: (fieldId?: string) => void;
  onResetTracker: () => void;
}

export function MorphingShell({
  formValues,
  onChangeField,
  onBulkUpdateForm,
  generatedUI,
  onSimulateSurge,
  onResetTracker,
}: MorphingShellProps) {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleSubmit = (updatedValues?: FinancialFormState) => {
    if (updatedValues) {
      onBulkUpdateForm(updatedValues);
    }
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
    }, 5000);
  };

  const isWizardActive = Boolean(generatedUI);

  return (
    <div className="w-full relative">
      {/* Submission Alert Banner */}
      <AnimatePresence>
        {submissionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl shadow-xl flex items-center justify-between text-emerald-200 text-xs sm:text-sm font-semibold"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold">Prospectus Schedule Submitted Successfully!</div>
                <div className="text-emerald-400 text-xs font-normal">
                  All 12 financial variables synchronized with state engine.
                </div>
              </div>
            </div>
            <button
              onClick={() => setSubmissionSuccess(false)}
              className="text-xs text-emerald-400 hover:text-emerald-200 underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morphing Container Shell with Framer Motion AnimatePresence */}
      <AnimatePresence mode="wait">
        {!isWizardActive ? (
          <motion.div
            key="static-complex-form"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ComplexForm
              formValues={formValues}
              onChangeField={onChangeField}
              onSimulateSurge={onSimulateSurge}
            />
          </motion.div>
        ) : (
          <motion.div
            key="adaptive-wizard-shell"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="space-y-4"
          >
            {/* Header notification banner */}
            <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-teal-950/90 border border-cyan-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Self-Healing UI Active
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Zero Page Refresh
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {generatedUI?.frictionReason}
                  </p>
                </div>
              </div>

              <button
                onClick={onResetTracker}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Static Form</span>
              </button>
            </div>

            {/* Dynamic Transpiled Component Renderer */}
            {generatedUI && (
              <DynamicRenderer
                payload={generatedUI}
                formValues={formValues}
                onUpdateField={(key, val) => onChangeField(key, val)}
                onSubmit={(updated) => handleSubmit(updated || formValues)}
                onReset={onResetTracker}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
