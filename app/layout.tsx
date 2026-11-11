import type { Metadata } from "next";
import type { ReactNode } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAPJI | كابجي",
  description: "Creative • Media • Technology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar">
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
