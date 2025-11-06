"use client";

import { ThemeProvider } from "./ThemeProvider";
import CursorGlow from "./CursorGlow";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <CursorGlow />
      {children}
    </ThemeProvider>
  );
}
