import { FinancialFormState } from "./types";

export const initialFormState: FinancialFormState = {
  enterpriseValuation: "45000000",
  ebitdaMargin: "18.5",
  debtToEquity: "2.4",
  optionRatio: "70:30",
  capitalGainsTier: "Tier-2 Short Term Reserve",
  taxExemptionCode: "SEC-83b-ELECTION-2026",
  foreignAssetTranche: "Tranche B (EU-Class II)",
  liquidityMultiple: "1.75x",
  discountRate: "11.25",
  deferredTax: "1250000",
  amortizationYears: "7",
  complianceId: "FIN-REG-88942-X",
};

export interface FieldMeta {
  id: keyof FinancialFormState;
  label: string;
  category: "Valuation & Cap Table" | "Tax & Regulatory Compliance" | "Risk & Amortization";
  tooltip: string;
  complexity: "Medium" | "High" | "Extreme";
  placeholder: string;
  unit?: string;
  options?: string[];
}

export const fieldMetadataList: FieldMeta[] = [
  {
    id: "enterpriseValuation",
    label: "Enterprise Valuation ($)",
    category: "Valuation & Cap Table",
    tooltip: "Fully diluted post-money valuation incorporating preference shares, warrants, and debt conversions.",
    complexity: "High",
    placeholder: "e.g. 45000000",
    unit: "USD",
  },
  {
    id: "ebitdaMargin",
    label: "EBITDA Margin (%)",
    category: "Valuation & Cap Table",
    tooltip: "Earnings before interest, taxes, depreciation, and amortization as percentage of gross revenue.",
    complexity: "Medium",
    placeholder: "e.g. 18.5",
    unit: "%",
  },
  {
    id: "debtToEquity",
    label: "Debt-to-Equity Leverage Ratio",
    category: "Valuation & Cap Table",
    tooltip: "Ratio of senior secured debt plus mezzanine financing over common equity pool.",
    complexity: "High",
    placeholder: "e.g. 2.4",
  },
  {
    id: "optionRatio",
    label: "ISO / NSO Option Allocation Ratio",
    category: "Valuation & Cap Table",
    tooltip: "Incentive Stock Options (ISO) vs Non-Qualified Stock Options (NSO) pool split allocation.",
    complexity: "Extreme",
    placeholder: "e.g. 70:30",
    options: ["80:20 (ISO Primary)", "70:30 (Balanced Pool)", "50:50 (Equal Split)", "100:0 (Pure ISO)"],
  },
  {
    id: "capitalGainsTier",
    label: "Capital Gains Tax Reserve Tier",
    category: "Tax & Regulatory Compliance",
    tooltip: "Tax withholding classification tier based on expected holding period and asset tranche.",
    complexity: "Extreme",
    placeholder: "Select Tier",
    options: ["Tier-1 Long Term Exempt", "Tier-2 Short Term Reserve", "Tier-3 Qualified Small Business (QSBS)"],
  },
  {
    id: "taxExemptionCode",
    label: "Section 83(b) Tax Exemption Code",
    category: "Tax & Regulatory Compliance",
    tooltip: "IRS filing reference hash code for early exercise unvested equity elections under IRC Sec 83(b).",
    complexity: "Extreme",
    placeholder: "e.g. SEC-83b-ELECTION-2026",
  },
  {
    id: "foreignAssetTranche",
    label: "Foreign Asset Tranche Classification",
    category: "Tax & Regulatory Compliance",
    tooltip: "FATCA / CRS regulatory classification for offshore subsidiaries and cross-border IP holding entities.",
    complexity: "Extreme",
    placeholder: "Select Tranche",
    options: ["Tranche A (US Domestic)", "Tranche B (EU-Class II)", "Tranche C (APAC Qualified)", "Tranche D (Offshore Tax Haven)"],
  },
  {
    id: "liquidityMultiple",
    label: "Liquidity Preference Multiple",
    category: "Valuation & Cap Table",
    tooltip: "Seniority liquidation multiplier for Series A/B preferred stock before common distribution.",
    complexity: "High",
    placeholder: "e.g. 1.75x",
    options: ["1.0x Non-Participating", "1.5x Participating", "1.75x Capped", "2.0x Senior Preferred"],
  },
  {
    id: "discountRate",
    label: "Risk-Adjusted Discount Rate (WACC %)",
    category: "Risk & Amortization",
    tooltip: "Weighted Average Cost of Capital used in discounted cash flow valuation modeling.",
    complexity: "High",
    placeholder: "e.g. 11.25",
    unit: "%",
  },
  {
    id: "deferredTax",
    label: "Deferred Tax Liability Provision ($)",
    category: "Risk & Amortization",
    tooltip: "Accrued tax obligations resulting from temporary timing differences in GAAP vs statutory tax reporting.",
    complexity: "High",
    placeholder: "e.g. 1250000",
    unit: "USD",
  },
  {
    id: "amortizationYears",
    label: "Intangible Amortization Schedule (Years)",
    category: "Risk & Amortization",
    tooltip: "Straight-line schedule for amortizing acquired goodwill, trademarks, and capitalized R&D.",
    complexity: "Medium",
    placeholder: "e.g. 7",
    unit: "Years",
  },
  {
    id: "complianceId",
    label: "SEC Compliance Accreditation ID",
    category: "Tax & Regulatory Compliance",
    tooltip: "Regulatory ID code issued under Reg D Rule 506(c) accredited investor verification audit.",
    complexity: "Extreme",
    placeholder: "e.g. FIN-REG-88942-X",
  },
];
