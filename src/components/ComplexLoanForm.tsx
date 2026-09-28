"use client";

import React, { useState } from "react";
import { FinancialFormState } from "../lib/types";
import { fieldMetadataList } from "../lib/defaultFormState";
import { HelpCircle, AlertTriangle, ShieldCheck, DollarSign, Calculator, Lock, CheckCircle2 } from "lucide-react";

interface ComplexLoanFormProps {
  formValues: FinancialFormState;
  onChangeField: (id: keyof FinancialFormState, value: string) => void;
  onSubmit?: (values: FinancialFormState) => void;
  onSimulateSurge?: (fieldId: string) => void;
}

export function ComplexLoanForm({ formValues, onChangeField, onSubmit, onSimulateSurge }: ComplexLoanFormProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const valuationNum = parseFloat(formValues.enterpriseValuation.replace(/[^0-9.]/g, "")) || 0;
  const ebitdaNum = parseFloat(formValues.ebitdaMargin) || 0;
  const ebitdaDollars = ((valuationNum * ebitdaNum) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const debtRatioNum = parseFloat(formValues.debtToEquity) || 0;
  const estimatedDebt = (valuationNum * (debtRatioNum / (1 + debtRatioNum))).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Loan Prospectus:", formValues);

    setSubmittedSuccess(true);
    if (onSubmit) {
      onSubmit(formValues);
    }

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 5000);
  };

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 font-sans backdrop-blur-xl relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Submission Success Toast */}
      {submittedSuccess && (
        <div className="mb-6 p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl shadow-xl flex items-center justify-between text-emerald-200 text-xs sm:text-sm font-semibold animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold">Commercial Loan Prospectus Submitted!</div>
              <div className="text-emerald-400 text-xs font-normal">
                All 12 financial variables logged &amp; synchronized with state engine.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedSuccess(false)}
            className="text-xs text-emerald-400 hover:text-emerald-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Institutional Terminal v4.2
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit Encrypted
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Commercial Loan &amp; Tax Exemption Prospectus
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Complete all 12 mandatory regulatory, tax tier, and debt schedule parameters to submit your fund prospectus.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-right flex flex-col justify-center min-w-[200px]">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Est. Implied EBITDA</span>
          <span className="text-lg font-bold text-cyan-400 font-mono">{ebitdaDollars}</span>
          <span className="text-[10px] text-slate-400">Debt Pool: <strong className="text-slate-300">{estimatedDebt}</strong></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-cyan-400 uppercase tracking-wider border-l-2 border-cyan-400 pl-3">
            <DollarSign className="w-4 h-4" />
            <span>Section I: Valuation &amp; Capital Structure</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fieldMetadataList
              .filter((f) => f.category === "Valuation & Cap Table")
              .map((field) => (
                <div key={field.id} className="relative group">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={field.id} className="text-xs font-semibold text-slate-300">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveTooltip(field.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => onSimulateSurge && onSimulateSurge(field.id)}
                      className="text-slate-500 hover:text-cyan-400 transition"
                      title="Click to simulate friction surge on this field"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {activeTooltip === field.id && (
                    <div className="absolute z-30 bottom-full mb-2 left-0 right-0 p-3 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-xl text-[11px] text-slate-200 animate-fadeIn">
                      <div className="font-semibold text-cyan-300 mb-0.5">Parameter Guidance:</div>
                      {field.tooltip}
                    </div>
                  )}

                  {field.options ? (
                    <select
                      id={field.id}
                      name={field.id}
                      value={formValues[field.id]}
                      onChange={(e) => onChangeField(field.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        id={field.id}
                        name={field.id}
                        value={formValues[field.id]}
                        onChange={(e) => onChangeField(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                      />
                      {field.unit && (
                        <span className="absolute right-3 top-2.5 text-[11px] text-slate-500 font-mono">
                          {field.unit}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="flex items-center space-x-2 text-sm font-bold text-teal-400 uppercase tracking-wider border-l-2 border-teal-400 pl-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Section II: Tax Tier &amp; IRS Regulatory Exemptions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fieldMetadataList
              .filter((f) => f.category === "Tax & Regulatory Compliance")
              .map((field) => (
                <div key={field.id} className="relative group">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={field.id} className="text-xs font-semibold text-slate-300">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveTooltip(field.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => onSimulateSurge && onSimulateSurge(field.id)}
                      className="text-slate-500 hover:text-teal-400 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {activeTooltip === field.id && (
                    <div className="absolute z-30 bottom-full mb-2 left-0 right-0 p-3 bg-slate-950 border border-teal-500/40 rounded-xl shadow-xl text-[11px] text-slate-200 animate-fadeIn">
                      <div className="font-semibold text-teal-300 mb-0.5">IRS Rule Definition:</div>
                      {field.tooltip}
                    </div>
                  )}

                  {field.options ? (
                    <select
                      id={field.id}
                      name={field.id}
                      value={formValues[field.id]}
                      onChange={(e) => onChangeField(field.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition font-mono"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id={field.id}
                      name={field.id}
                      value={formValues[field.id]}
                      onChange={(e) => onChangeField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition font-mono"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="flex items-center space-x-2 text-sm font-bold text-amber-400 uppercase tracking-wider border-l-2 border-amber-400 pl-3">
            <Calculator className="w-4 h-4" />
            <span>Section III: WACC &amp; Amortization Horizon</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fieldMetadataList
              .filter((f) => f.category === "Risk & Amortization")
              .map((field) => (
                <div key={field.id} className="relative group">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={field.id} className="text-xs font-semibold text-slate-300">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveTooltip(field.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => onSimulateSurge && onSimulateSurge(field.id)}
                      className="text-slate-500 hover:text-amber-400 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {activeTooltip === field.id && (
                    <div className="absolute z-30 bottom-full mb-2 left-0 right-0 p-3 bg-slate-950 border border-amber-500/40 rounded-xl shadow-xl text-[11px] text-slate-200 animate-fadeIn">
                      <div className="font-semibold text-amber-300 mb-0.5">Amortization Note:</div>
                      {field.tooltip}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      id={field.id}
                      name={field.id}
                      value={formValues[field.id]}
                      onChange={(e) => onChangeField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition font-mono"
                    />
                    {field.unit && (
                      <span className="absolute right-3 top-2.5 text-[11px] text-slate-500 font-mono">
                        {field.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-800 gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Friction Engine is active. Pause &gt;2s or click rapidly to trigger Cognitive Healing.</span>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-teal-400 transition cursor-pointer"
          >
            Submit Commercial Loan Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
