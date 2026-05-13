import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "GhostNet | Marine Safety & Recovery",
    template: "%s | GhostNet"
  },
  description: "Advanced ghost net reporting and retrieval platform for fishing communities. Protect our oceans with verified GPS tracking and specialist recovery.",
  keywords: ["marine protection", "ghost nets", "ocean cleanup", "sustainable fishing", "maritime safety", "GPS tracking"],
  authors: [{ name: "GhostNet Team" }],
  creator: "GhostNet",
  publisher: "GhostNet Maritime",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ghostnet.org",
    siteName: "GhostNet",
    title: "GhostNet | Marine Safety & Recovery",
    description: "Protecting our oceans through verified ghost net retrieval and reporting.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostNet Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostNet | Marine Safety & Recovery",
    description: "Protecting our oceans through verified ghost net retrieval and reporting.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}
