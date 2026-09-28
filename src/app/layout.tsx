import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraGen | Self-Healing Generative UI via Cognitive Load",
  description:
    "Real-time closed-loop adaptive UI system detecting user confusion, streaming telemetry over WebSockets, generating simplified React wizards via LangChain GPT-4o, validating code AST, and morphing the DOM effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
