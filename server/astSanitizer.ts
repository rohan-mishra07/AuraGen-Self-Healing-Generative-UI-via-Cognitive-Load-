import * as babelParser from "@babel/parser";
import traverseModule from "@babel/traverse";
import { ASTValidationResult } from "../src/lib/types";

const traverse = (traverseModule as any).default || traverseModule;

const FORBIDDEN_IDENTIFIERS = new Set([
  "eval",
  "Function",
  "fetch",
  "XMLHttpRequest",
  "localStorage",
  "sessionStorage",
  "cookie",
  "document",
  "window",
  "process",
  "require",
  "globalThis",
  "WebSocket",
  "Worker",
]);

const FORBIDDEN_PROPERTIES = new Set([
  "cookie",
  "localStorage",
  "sessionStorage",
  "location",
  "innerHTML",
]);

export function sanitizeAST(codeString: string): ASTValidationResult {
  const errors: string[] = [];
  const blockedSymbols: string[] = [];

  let cleanedCode = codeString.trim();
  if (cleanedCode.startsWith("```")) {
    cleanedCode = cleanedCode.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
  }

  let ast: any;
  try {
    ast = babelParser.parse(cleanedCode, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch (err: any) {
    return {
      isValid: false,
      syntaxValid: false,
      errors: [`Babel Syntax Error: ${err.message || String(err)}`],
      blockedSymbols: [],
    };
  }

  try {
    traverse(ast, {
      Identifier(path: any) {
        const name = path.node.name;
        if (FORBIDDEN_IDENTIFIERS.has(name)) {
          const parent = path.parent;
          if (
            (parent.type === "CallExpression" && parent.callee === path.node) ||
            (parent.type === "MemberExpression" && parent.object === path.node) ||
            name === "eval" ||
            name === "Function" ||
            name === "fetch" ||
            name === "XMLHttpRequest"
          ) {
            blockedSymbols.push(name);
            errors.push(`Forbidden global identifier detected: '${name}'`);
          }
        }
      },

      MemberExpression(path: any) {
        if (path.node.property && path.node.property.name) {
          const propName = path.node.property.name;
          if (FORBIDDEN_PROPERTIES.has(propName)) {
            const objName = path.node.object ? path.node.object.name || "target" : "";
            if (objName === "document" || objName === "window" || objName === "navigator" || propName === "cookie") {
              blockedSymbols.push(`${objName}.${propName}`);
              errors.push(`Forbidden property access detected: '${objName}.${propName}'`);
            }
          }
        }
      },

      CallExpression(path: any) {
        if (path.node.callee && path.node.callee.name) {
          const calleeName = path.node.callee.name;
          if (calleeName === "eval" || calleeName === "Function") {
            blockedSymbols.push(calleeName);
            errors.push(`Forbidden execution attempt via '${calleeName}()'`);
          }
        }
      },
    });
  } catch (traverseErr: any) {
    errors.push(`AST Traversal Error: ${traverseErr.message || String(traverseErr)}`);
  }

  return {
    isValid: errors.length === 0,
    syntaxValid: true,
    errors,
    blockedSymbols,
  };
}
