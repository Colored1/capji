import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo, Tajawal } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import RevealObserver from "@/components/RevealObserver";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0e",
};

// يطبّق الوضع المحفوظ قبل الرسم لمنع الوميض
const themeScript = `try{if(localStorage.getItem('capji-theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <SmoothScroll />
        <RevealObserver />
        <Nav />
        {children}
      </body>
    </html>
  );
}
