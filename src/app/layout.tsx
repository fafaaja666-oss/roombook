import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import BackgroundMusic from "@/components/BackgroundMusic";
import { APP_NAME, APP_TAGLINE, HOTEL_NAME } from "@/constants/data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
});

export const instant = false;

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: `${HOTEL_NAME}: reservasi kamar, check-in, dan check-out tamu dalam satu sistem terpusat.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
          <BackgroundMusic />
        </ToastProvider>
      </body>
    </html>
  );
}
