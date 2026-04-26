import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Signal — Daily intelligence for startup CTOs",
  description: "The 3 AI moves that matter today, scored and filtered through a CTO decision lens. Action templates included.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="antialiased bg-[#0A0812] text-[#F5F0E8]"
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
      >
        <Providers>
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
