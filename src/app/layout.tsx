import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAWK Brand System",
  description: "A personal technology identity system — 轻奢 · 现代 · 智能",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem("hawk-theme") || "system";
                var resolved = theme === "system"
                  ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                  : theme;
                document.documentElement.setAttribute("data-theme", resolved);
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
