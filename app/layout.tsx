import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo, Tajawal } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import { site } from "@/lib/site";
import "./tailwind.css";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "600", "700"],
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: `${site.ownerName} | ${site.brand}`,
  description: site.ownerTitle,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="font-sans antialiased">
        <SmoothScroll />
        <Nav />
        {children}
      </body>
    </html>
  );
}
