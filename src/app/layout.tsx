import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DatabaseProvider } from "@/context/DatabaseContext";
import AppShell from "@/components/AppShell";
import PWARegistration from "@/components/PWARegistration";
import { Toaster } from "sonner";
import { siteConfig } from "@/lib/siteConfig";

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
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: "Mihir Nagda", url: siteConfig.socialLinks.website }],
    creator: "Mihir Nagda",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon.ico" },
        ],
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: siteConfig.name,
    },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: siteConfig.url,
        title: siteConfig.title,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.images.og,
                width: 1200,
                height: 630,
                alt: "Next Chapter | ARC Tracker",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.title,
        description: siteConfig.description,
        creator: "@kyayaar_mihir",
        images: [siteConfig.images.og],
    },
    robots: {
        index: true,
        follow: true,
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
                        <AppShell>{children}</AppShell>
                    </DatabaseProvider>
                </AuthProvider>
                <PWARegistration />
                <Toaster theme="dark" position="top-center" closeButton />
            </body>
        </html>
    );
}
