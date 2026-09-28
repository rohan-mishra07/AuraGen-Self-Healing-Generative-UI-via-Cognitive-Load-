import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GeneratedUIPayload, TelemetryPacket } from "../src/lib/types";

const SYSTEM_PROMPT = `
You are an expert React UI engineer specializing in Self-Healing Generative UI.
Generate a valid React functional component named \`AdaptiveWizard\` that simplifies a complex financial/loan form into a 3-step progressive wizard.

### REQUIREMENTS:
1. **Address Friction**: Target field friction point: "{{ACTIVE_FIELD_LABEL}}". Provide interactive step guidance and breakdown notes.
2. **Preserve State**: The component MUST receive \`formValues\` as props and pre-fill all inputs. Call \`onUpdateField(name, value)\` on change.
3. **Step Navigation**: Implement multi-step navigation using \`useState\` for \`currentStep\`. Include a working "Previous Step" button (disabled on step 1), a working "Next Step" button, and a final "Complete & Sync" button calling \`onSubmit()\`.
4. **Styling**: Tailwind CSS exclusively (dark glassmorphic theme with cyan/teal glowing borders).
5. **Formatting**: Return ONLY runnable React component JSX code without markdown blocks (\`\`\` wrappers).
`;

export async function runAgentPipeline(packet: TelemetryPacket): Promise<GeneratedUIPayload> {
  const activeFieldId = packet.metrics.activeFieldId || "taxExemptionCode";
  const activeFieldLabel = packet.metrics.activeFieldLabel || "Section 83(b) Tax Exemption Code";
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "") {
    try {
      console.log(`[AGENT PIPELINE] Triggering GPT-4o LangChain chain for field: ${activeFieldId}`);
      const model = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: "gpt-4o",
        temperature: 0.2,
      });

      const template = PromptTemplate.fromTemplate(`
${SYSTEM_PROMPT}

USER FRICTION CONTEXT:
- Active Field: {{ACTIVE_FIELD_LABEL}} (ID: {{ACTIVE_FIELD_ID}})
- Rage Clicks: {{RAGE_CLICKS}}
- Hesitation: {{HESITATION_MS}} ms
- User Form Data: {{FORM_VALUES_JSON}}

Output ONLY the React component JSX code for AdaptiveWizard.
`);

      const chain = template.pipe(model).pipe(new StringOutputParser());
      const rawCode = await chain.invoke({
        ACTIVE_FIELD_ID: activeFieldId,
        ACTIVE_FIELD_LABEL: activeFieldLabel,
        RAGE_CLICKS: packet.metrics.rageClickCount,
        HESITATION_MS: packet.metrics.hesitationDuration,
        FORM_VALUES_JSON: JSON.stringify(packet.formValues, null, 2),
      });

      let cleanCode = rawCode.trim();
      if (cleanCode.startsWith("```")) {
        cleanCode = cleanCode.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
      }

      return {
        componentCode: cleanCode,
        targetFieldId: activeFieldId,
        frictionReason: `Cognitive load spike on ${activeFieldLabel} (Hesitation: ${(packet.metrics.hesitationDuration / 1000).toFixed(1)}s, Rage Clicks: ${packet.metrics.rageClickCount})`,
        stepTitles: ["Cap Table & Valuation", "Tax & Exemption Helper", "Final Verification"],
        isFallback: false,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      console.error("[AGENT PIPELINE] OpenAI execution error, using dynamic fallback:", err.message);
    }
  }

  // Dynamic fallback generator when OpenAI key is missing or fails
  console.log(`[AGENT PIPELINE] Generating dynamic AdaptiveWizard fallback for field: ${activeFieldId}`);
  const fallbackCode = generateFallbackWizardJSX(activeFieldId, activeFieldLabel, packet.formValues);

  return {
    componentCode: fallbackCode,
    targetFieldId: activeFieldId,
    frictionReason: `Friction trigger on ${activeFieldLabel} (Score: ${packet.metrics.cognitiveScore}/100)`,
    stepTitles: ["Step 1: Financial Structure", "Step 2: Guided Tax & Exemption", "Step 3: Submit & Sync"],
    isFallback: true,
    timestamp: Date.now(),
  };
}

function generateFallbackWizardJSX(fieldId: string, fieldLabel: string, values: any): string {
  const valuation = values.enterpriseValuation || "45000000";
  const ebitda = values.ebitdaMargin || "18.5";
  const debt = values.debtToEquity || "2.4";
  const taxCode = values.taxExemptionCode || "SEC-83b-ELECTION-2026";
  const capGains = values.capitalGainsTier || "Tier-2 Short Term Reserve";

  return `
export default function AdaptiveWizard({ formValues, onUpdateField, onSubmit, onReset }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [localVals, setLocalVals] = React.useState({
    enterpriseValuation: "${valuation}",
    ebitdaMargin: "${ebitda}",
    debtToEquity: "${debt}",
    taxExemptionCode: "${taxCode}",
    capitalGainsTier: "${capGains}",
    ...formValues
  });

  const handleChange = (key, val) => {
    setLocalVals(prev => ({ ...prev, [key]: val }));
    if (onUpdateField) onUpdateField(key, val);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            AuraGen Adaptive Wizard
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Guided Step-by-Step Financial Configuration</h2>
          <p className="text-xs text-cyan-400">Targeted Friction Remediation: <strong>${fieldLabel}</strong></p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800"
        >
          Return to Form
        </button>
      </div>

      <div className="mb-6 flex justify-between text-xs text-slate-400 border-b border-slate-800 pb-3 font-medium">
        <span className={currentStep === 1 ? "text-cyan-400 font-bold" : ""}>1. Cap Table & Valuation</span>
        <span className={currentStep === 2 ? "text-cyan-400 font-bold" : ""}>2. Guided Tax Exemption</span>
        <span className={currentStep === 3 ? "text-cyan-400 font-bold" : ""}>3. Review & Submit</span>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-300">
            Step 1: Simplify key valuation metrics with real-time feedback.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enterprise Valuation ($)</label>
              <input
                type="text"
                value={localVals.enterpriseValuation}
                onChange={(e) => handleChange('enterpriseValuation', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">EBITDA Margin (%)</label>
              <input
                type="text"
                value={localVals.ebitdaMargin}
                onChange={(e) => handleChange('ebitdaMargin', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            💡 Guided Helper: Section 83(b) Tax Exemption Hash Code & Reserve Tier.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">IRS Section 83(b) Hash Code</label>
            <input
              type="text"
              value={localVals.taxExemptionCode}
              onChange={(e) => handleChange('taxExemptionCode', e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-sm text-cyan-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Capital Gains Reserve Tier</label>
            <select
              value={localVals.capitalGainsTier}
              onChange={(e) => handleChange('capitalGainsTier', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
            >
              <option value="Tier-1 Long Term Exempt">Tier-1 Long Term Exempt</option>
              <option value="Tier-2 Short Term Reserve">Tier-2 Short Term Reserve</option>
              <option value="Tier-3 QSBS Exempt">Tier-3 QSBS Exempt</option>
            </select>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono space-y-2 text-slate-300">
          <div>Enterprise Valuation: \${Number(localVals.enterpriseValuation).toLocaleString()}</div>
          <div>Tax Exemption Hash: {localVals.taxExemptionCode}</div>
          <div>Capital Gains Tier: {localVals.capitalGainsTier}</div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous Step
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(s => Math.min(3, s + 1))}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
          >
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubmit && onSubmit(localVals)}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition"
          >
            ✓ Complete & Sync Form
          </button>
        )}
      </div>
    </div>
  );
}
`;
}
