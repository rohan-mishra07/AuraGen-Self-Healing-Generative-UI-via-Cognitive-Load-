"use client";

import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from "react";
import * as Babel from "@babel/standalone";
import { FinancialFormState, GeneratedUIPayload } from "../lib/types";
import { FallbackWizard } from "./FallbackWizard";

interface DynamicRendererProps {
  payload: GeneratedUIPayload;
  formValues: FinancialFormState;
  onUpdateField: (key: keyof FinancialFormState, val: string) => void;
  onSubmit: (vals?: FinancialFormState) => void;
  onReset: () => void;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RenderErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[DYNAMIC RENDERER] Component Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function DynamicRenderer({
  payload,
  formValues,
  onUpdateField,
  onSubmit,
  onReset,
}: DynamicRendererProps) {
  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType<any> | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    try {
      let code = payload.componentCode.trim();

      // Clean markdown code blocks if present
      if (code.startsWith("```")) {
        code = code.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
      }

      // Convert 'export default function ...' to a return statement or assigned variable
      let transformedCode = code;
      if (transformedCode.includes("export default function")) {
        transformedCode = transformedCode.replace("export default function", "function Component");
        transformedCode += "\nreturn Component;";
      } else if (transformedCode.includes("export default")) {
        transformedCode = transformedCode.replace("export default", "const Component = ");
        transformedCode += "\nreturn Component;";
      } else {
        transformedCode = `function Component() {\n${transformedCode}\n}\nreturn Component;`;
      }

      // Transpile using Babel Standalone
      const result = Babel.transform(transformedCode, {
        presets: ["react"],
        filename: "AdaptiveWizard.jsx",
      });

      const transpiledJS = result.code;

      // Safely evaluate transpiled JS with React in scope
      const factory = new Function("React", transpiledJS);
      const ComponentClass = factory(React);

      if (isMounted) {
        setCompiledComponent(() => ComponentClass);
        setCompileError(null);
      }
    } catch (err: any) {
      console.error("[DYNAMIC RENDERER] Transpilation Error:", err);
      if (isMounted) {
        setCompileError(err.message || "Failed to transpile generated component code");
      }
    }

    return () => {
      isMounted = false;
    };
  }, [payload]);

  const fallbackView = (
    <FallbackWizard
      formValues={formValues}
      onUpdateField={onUpdateField}
      onSubmit={onSubmit}
      onReset={onReset}
      targetFieldId={payload.targetFieldId}
    />
  );

  if (compileError || !compiledComponent) {
    return (
      <div className="space-y-4">
        {compileError && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            ⚠️ Dynamic Babel Transpilation Error ({compileError}). Rendering safe modular fallback wizard.
          </div>
        )}
        {fallbackView}
      </div>
    );
  }

  const CustomComponent = compiledComponent;

  return (
    <RenderErrorBoundary fallback={fallbackView}>
      <CustomComponent
        formValues={formValues}
        onUpdateField={onUpdateField}
        onSubmit={onSubmit}
        onReset={onReset}
      />
    </RenderErrorBoundary>
  );
}
