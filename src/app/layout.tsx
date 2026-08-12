import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
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
