import type { CSSProperties } from "react";
import type { Metadata } from "next";
import "@fontsource/inter/latin.css";
import "@fontsource/geist-sans/latin.css";
import "@fontsource/geist-mono/latin.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppLayout } from "@/components/layout/app-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SIP — Sistema de Instrução Processual",
  description: "Plataforma de gestão processual e documental",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans")}
      style={{
        "--font-sans": "'Inter', 'Geist Sans', ui-sans-serif, system-ui, sans-serif",
        "--font-geist-sans": "'Geist Sans', ui-sans-serif, system-ui, sans-serif",
        "--font-geist-mono": "'Geist Mono', ui-monospace, monospace",
      } as CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TooltipProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-[700] focus:m-2 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
            >
              Saltar para o conteúdo
            </a>
            <AppLayout>{children}</AppLayout>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
