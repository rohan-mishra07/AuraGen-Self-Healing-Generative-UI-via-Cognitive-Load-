export interface FinancialFormState {
  enterpriseValuation: string;
  ebitdaMargin: string;
  debtToEquity: string;
  optionRatio: string;
  capitalGainsTier: string;
  taxExemptionCode: string;
  foreignAssetTranche: string;
  liquidityMultiple: string;
  discountRate: string;
  deferredTax: string;
  amortizationYears: string;
  complianceId: string;
}

export interface FrictionMetrics {
  mouseVelocity: number;       // px/ms
  hesitationDuration: number;  // ms spent focused without typing (>2000ms triggers)
  rageClickCount: number;      // count of rapid click bursts (<600ms apart within radius)
  cognitiveScore: number;      // 0 to 100
  activeFieldId: string | null;
  activeFieldLabel: string | null;
  lastUpdated: number;
}

export interface TelemetryPacket {
  socketId?: string;
  timestamp: number;
  metrics: FrictionMetrics;
  formValues: FinancialFormState;
  domContext: {
    focusedInput: string | null;
    focusedLabel: string | null;
    fieldType: string | null;
    formCompletionPercentage: number;
  };
}

export interface GeneratedUIPayload {
  componentCode: string;
  targetFieldId: string;
  frictionReason: string;
  stepTitles: string[];
  isFallback: boolean;
  timestamp: number;
}

export interface ASTValidationResult {
  isValid: boolean;
  syntaxValid: boolean;
  errors: string[];
  blockedSymbols: string[];
}
