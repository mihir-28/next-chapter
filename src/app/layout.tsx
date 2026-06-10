import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DatabaseProvider } from "@/context/DatabaseContext";
import AppShell from "@/components/AppShell";
import PWARegistration from "@/components/PWARegistration";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Next Chapter | ARC Tracker",
  description: "Advance Reader Copy (ARC) tracker for book reviewers to manage reading progress and review deadlines.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Next Chapter",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f121d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-slate-300 overflow-x-hidden selection:bg-[#0a84ff]/25 selection:text-white">
        <AuthProvider>
          <DatabaseProvider>
            <AppShell>
              {children}
            </AppShell>
          </DatabaseProvider>
        </AuthProvider>
        <PWARegistration />
        <Toaster theme="dark" position="top-right" closeButton />
      </body>
    </html>
  );
}
