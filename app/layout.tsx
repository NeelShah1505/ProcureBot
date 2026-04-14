import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProcureBot — AI Procurement Agent | PayWithLocus",
  description:
    "Your AI procurement agent that autonomously buys digital services & APIs — with your money, your rules. Powered by Locus USDC micro-payments.",
  keywords: ["AI agent", "procurement", "Locus", "USDC", "micro-payments", "CoinGecko", "Tavily"],
  openGraph: {
    title: "ProcureBot — AI Procurement Agent",
    description: "Autonomous AI procurement agent using Locus PayWithLocus APIs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#050510] font-sans">
        {children}
      </body>
    </html>
  );
}
