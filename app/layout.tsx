import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { ToastProvider } from "./components/toast";
import { getSiteSettings } from "./lib/content";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Judith Aiyesan | Music Artiste",
  description:
    "Official website for Judith Aiyesan, featuring music, lyrics, events, and contact information.",
  icons: {
    icon: "/images/core-img/logoj.png",
    shortcut: "/images/core-img/logoj.png",
    apple: "/images/core-img/logoj.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <Header settings={settings} />
          <main>{children}</main>
          <Footer settings={settings} />
        </ToastProvider>
      </body>
    </html>
  );
}
