declare module "@babel/standalone" {
  export function transform(
    code: string,
    options: Record<string, any>
  ): { code: string; ast?: any; map?: any };
  export const presets: Record<string, any>;
  export const plugins: Record<string, any>;
}
