import type { Metadata, Viewport } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import "./globals.css";
import { StructuredData, generateOrganizationStructuredData, generateWebSiteStructuredData } from "@/components/seo/StructuredData";

const notoSerif = Noto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// P12: PWA metadata
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7a5646",
};

export const metadata: Metadata = {
  title: "LUXE BEAUTÉ | Premium Beauty & Skincare",
  description: "Discover luxury beauty products curated for the discerning clientele. Radiance reimagined.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LUXE BEAUTÉ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <StructuredData data={generateOrganizationStructuredData()} />
        <StructuredData data={generateWebSiteStructuredData()} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--primary)] text-[var(--on-primary)] px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-container)]"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
