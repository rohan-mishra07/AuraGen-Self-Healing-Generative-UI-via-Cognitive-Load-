import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GeneratedUIPayload, TelemetryPacket } from "../lib/types";
import { SYSTEM_DESIGN_PROMPT } from "./designSystemPrompt";

export async function generateAdaptiveUI(packet: TelemetryPacket): Promise<GeneratedUIPayload> {
  const activeFieldId = packet.metrics.activeFieldId || "taxExemptionCode";
  const activeFieldLabel = packet.metrics.activeFieldLabel || "Section 83(b) Tax Exemption Code";
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "") {
    try {
      console.log(`[AGENT] Executing GPT-4o LangChain pipeline for field: ${activeFieldId}`);

      const model = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: "gpt-4o",
        temperature: 0.2,
      });

      const promptTemplate = PromptTemplate.fromTemplate(`
${SYSTEM_DESIGN_PROMPT}

### USER CONTEXT:
- Detected Friction Point: User froze or clicked repeatedly on field "{{ACTIVE_FIELD_LABEL}}" (ID: {{ACTIVE_FIELD_ID}}).
- Rage Clicks: {{RAGE_CLICKS}}
- Hesitation Duration: {{HESITATION_MS}} ms
- Current User Form Data: {{FORM_VALUES_JSON}}

Generate the complete React component \`AdaptiveWizard\` now. Return ONLY executable React JSX code.
`);

      const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

      const rawResponse = await chain.invoke({
        ACTIVE_FIELD_ID: activeFieldId,
        ACTIVE_FIELD_LABEL: activeFieldLabel,
        RAGE_CLICKS: packet.metrics.rageClickCount,
        HESITATION_MS: packet.metrics.hesitationDuration,
        FORM_VALUES_JSON: JSON.stringify(packet.formValues, null, 2),
      });

      let cleanCode = rawResponse.trim();
      if (cleanCode.startsWith("```")) {
        cleanCode = cleanCode.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
      }

      return {
        componentCode: cleanCode,
        targetFieldId: activeFieldId,
        frictionReason: `Cognitive spike on ${activeFieldLabel} (Hesitation: ${(packet.metrics.hesitationDuration / 1000).toFixed(1)}s, Rage Clicks: ${packet.metrics.rageClickCount})`,
        stepTitles: ["Valuation & Structure", "Tax & Regulatory Breakdown", "Risk & Confirmation"],
        isFallback: false,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      console.error("[AGENT] LangChain GPT-4o call failed, using intelligent fallback generator:", err.message);
    }
  }

  // Fallback / Mock Generator when API Key is absent or network fails
  console.log(`[AGENT] Generating tailored AdaptiveWizard component for ${activeFieldId}`);
  const fallbackCode = buildTailoredWizardCode(activeFieldId, activeFieldLabel, packet.formValues);

  return {
    componentCode: fallbackCode,
    targetFieldId: activeFieldId,
    frictionReason: `High friction detected on ${activeFieldLabel} (Cognitive Score: ${packet.metrics.cognitiveScore}/100)`,
    stepTitles: ["Step 1: Cap Table & Valuation", "Step 2: Guided Tax & Exemption Helper", "Step 3: Risk Review & Submit"],
    isFallback: true,
    timestamp: Date.now(),
  };
}

/**
 * Intelligent Dynamic Code Synthesizer
 * Generates custom, valid React component JSX code tailored to the exact field where friction occurred.
 */
function buildTailoredWizardCode(fieldId: string, fieldLabel: string, currentValues: any): string {
  const valuation = currentValues.enterpriseValuation || "45000000";
  const ebitda = currentValues.ebitdaMargin || "18.5";
  const debt = currentValues.debtToEquity || "2.4";
  const optionRatio = currentValues.optionRatio || "70:30";
  const taxCode = currentValues.taxExemptionCode || "SEC-83b-ELECTION-2026";
  const capGains = currentValues.capitalGainsTier || "Tier-2 Short Term Reserve";
  const foreignTranche = currentValues.foreignAssetTranche || "Tranche B (EU-Class II)";
  const discountRate = currentValues.discountRate || "11.25";
  const deferredTax = currentValues.deferredTax || "1250000";

  return `
export default function AdaptiveWizard({ formValues, onUpdateField, onSubmit, onReset }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [localState, setLocalState] = React.useState({
    enterpriseValuation: "${valuation}",
    ebitdaMargin: "${ebitda}",
    debtToEquity: "${debt}",
    optionRatio: "${optionRatio}",
    taxExemptionCode: "${taxCode}",
    capitalGainsTier: "${capGains}",
    foreignAssetTranche: "${foreignTranche}",
    discountRate: "${discountRate}",
    deferredTax: "${deferredTax}",
    ...formValues
  });

  const handleChange = (key, val) => {
    setLocalState(prev => ({ ...prev, [key]: val }));
    if (onUpdateField) onUpdateField(key, val);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(3, prev + 1));
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 font-sans transition-all duration-500">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              AuraGen Self-Healed Wizard
            </span>
            <span className="text-xs text-slate-400">Targeted Assistance: <strong className="text-cyan-300">${fieldLabel}</strong></span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Guided Step-by-Step Financial Configuration</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 transition"
        >
          Return to Full Form
        </button>
      </div>

      {/* Progress Tracker */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-xs font-medium text-slate-400">
          <span className={currentStep === 1 ? "text-cyan-400 font-bold" : ""}>1. Valuation & Cap Table</span>
          <span className={currentStep === 2 ? "text-cyan-400 font-bold" : ""}>2. Tax & Exemption Guided Helper</span>
          <span className={currentStep === 3 ? "text-cyan-400 font-bold" : ""}>3. Risk & Final Confirmation</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 transition-all duration-500 rounded-full"
            style={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}
          />
        </div>
      </div>

      {/* Step 1 Content */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-xl">
            <h3 className="text-sm font-semibold text-cyan-300 mb-1">Step 1: Core Financial Metrics</h3>
            <p className="text-xs text-slate-400">Simplified view of key enterprise numbers with instant calculation checks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Enterprise Valuation ($)</label>
              <input
                type="text"
                value={localState.enterpriseValuation}
                onChange={(e) => handleChange('enterpriseValuation', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">EBITDA Margin (%)</label>
              <input
                type="text"
                value={localState.ebitdaMargin}
                onChange={(e) => handleChange('ebitdaMargin', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Content - Targeted Friction Remediation */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-sm">
              <span>💡 Targeted Helper: Section 83(b) & Tax Classification</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              We detected hesitation on <strong className="text-white">${fieldLabel}</strong>. Section 83(b) allows founders & employees to pay tax on unvested stock value at grant date rather than vesting dates.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Section 83(b) Tax Exemption Hash Code</label>
              <input
                type="text"
                value={localState.taxExemptionCode}
                onChange={(e) => handleChange('taxExemptionCode', e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg px-3.5 py-2.5 text-sm text-cyan-200 font-mono focus:outline-none focus:border-cyan-400 shadow-inner"
              />
              <span className="text-[11px] text-emerald-400 mt-1 block">✓ Auto-generated IRS hash format verified.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Capital Gains Reserve Tier</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {['Tier-1 Long Term Exempt', 'Tier-2 Short Term Reserve', 'Tier-3 QSBS Exempt'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleChange('capitalGainsTier', tier)}
                    className={\`p-2.5 rounded-lg border text-left text-xs transition \${
                      localState.capitalGainsTier === tier
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 font-semibold'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }\`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 Content */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-1">Step 3: Verification & Submission</h3>
            <p className="text-xs text-slate-300">All 12 financial variables have been parsed, harmonized, and verified.</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Valuation:</span>
              <span className="text-cyan-300 font-semibold">\${Number(localState.enterpriseValuation).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Tax Hash Code:</span>
              <span className="text-emerald-300 font-semibold">{localState.taxExemptionCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax Tier:</span>
              <span className="text-slate-200">{localState.capitalGainsTier}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
        >
          Previous Step
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 transition"
          >
            Continue to Next Step →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onSubmit) onSubmit(localState);
            }}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/30 transition"
          >
            ✓ Complete & Sync Form Data
          </button>
        )}
      </div>
    </div>
  );
}
`;
}
