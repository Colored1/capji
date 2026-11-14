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

const siteTitle = `${site.ownerName} | ${site.brand}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: siteTitle,
    template: `%s | ${site.brand}`,
  },
  description: `${site.ownerTitle}. مطور ومصمم من اليمن (إب) يقدم حلول البرمجة والتطبيقات والشبكات والتصميم والمونتاج.`,
  keywords: [
    "أحمد نعمان حسان",
    "كابجي",
    "CAPJI",
    "مهندس برمجيات",
    "تطوير مواقع",
    "تطوير تطبيقات أندرويد",
    "صيانة حواسيب",
    "إدارة الشبكات",
    "الأمن السيبراني",
    "تصميم جرافيك",
    "مونتاج فيديو",
    "مطور يمني",
    "إب",
  ],
  authors: [{ name: site.ownerName, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_YE",
    url: site.url,
    siteName: site.brand,
    title: siteTitle,
    description: site.ownerTitle,
    images: [{ url: "/brand/logo.png", width: 1254, height: 1254, alt: site.brand }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: site.ownerTitle,
    images: ["/brand/logo.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
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
