import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { CapacitorInit } from "@/components/CapacitorInit";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SignNest — Close Deals. Collect Signatures. Build Trust.",
  description:
    "Secure transaction rooms for real estate. Create deals, share documents, collect e-signatures, and produce executed PDFs with full audit trail.",
  applicationName: "SignNest",
  manifest: "/manifest.json",
  themeColor: "#1B2838",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SignNest",
  },
  icons: {
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <CapacitorInit />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
        {children}
      </body>
    </html>
  );
}
