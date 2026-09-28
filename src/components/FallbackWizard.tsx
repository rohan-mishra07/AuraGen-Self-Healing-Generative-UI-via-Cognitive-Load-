"use client";

import React, { useState } from "react";
import { FinancialFormState } from "../lib/types";
import { CheckCircle2, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

interface FallbackWizardProps {
  formValues: FinancialFormState;
  onUpdateField: (key: keyof FinancialFormState, val: string) => void;
  onSubmit: (vals?: FinancialFormState) => void;
  onReset: () => void;
  targetFieldId?: string;
}

export function FallbackWizard({
  formValues,
  onUpdateField,
  onSubmit,
  onReset,
  targetFieldId,
}: FallbackWizardProps) {
  const [step, setStep] = useState(1);
  const [localVals, setLocalVals] = useState<FinancialFormState>({ ...formValues });

  const handleChange = (key: keyof FinancialFormState, val: string) => {
    setLocalVals((prev) => ({ ...prev, [key]: val }));
    onUpdateField(key, val);
  };

  return (
    <div className="w-full bg-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Fallback Modular Wizard Active
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Guided Form Simplification</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit Wizard</span>
        </button>
      </div>

      <div className="mb-6 flex justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span className={step === 1 ? "text-teal-400 font-bold" : ""}>Step 1: Valuation</span>
        <span className={step === 2 ? "text-teal-400 font-bold" : ""}>Step 2: Tax Exemptions</span>
        <span className={step === 3 ? "text-teal-400 font-bold" : ""}>Step 3: Submit</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Enterprise Valuation ($)</label>
            <input
              type="text"
              value={localVals.enterpriseValuation}
              onChange={(e) => handleChange("enterpriseValuation", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">EBITDA Margin (%)</label>
            <input
              type="text"
              value={localVals.ebitdaMargin}
              onChange={(e) => handleChange("ebitdaMargin", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-xs text-teal-300">
            Guided helper for tax classification ({targetFieldId || "taxExemptionCode"}).
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Section 83(b) Tax Hash</label>
            <input
              type="text"
              value={localVals.taxExemptionCode}
              onChange={(e) => handleChange("taxExemptionCode", e.target.value)}
              className="w-full bg-slate-950 border border-teal-500/40 rounded-xl px-3 py-2 text-sm text-teal-200 font-mono"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300 font-mono">
          <div>Valuation: ${localVals.enterpriseValuation}</div>
          <div>Tax Exemption Hash: {localVals.taxExemptionCode}</div>
          <div>Status: Verified and ready for synchronization</div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center space-x-1 px-4 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            className="flex items-center space-x-1 px-5 py-2 text-xs font-bold rounded-xl bg-teal-500 text-slate-950"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onSubmit(localVals)}
            className="flex items-center space-x-1 px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-400 text-slate-950"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Sync</span>
          </button>
        )}
      </div>
    </div>
  );
}
