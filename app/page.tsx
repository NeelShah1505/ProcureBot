"use client";
import React, { useState } from "react";
import { AnimatedBackground, Spotlight } from "@/components/ui/AnimatedBackground";
import LocusConnect from "@/components/LocusConnect";
import PolicyPanel from "@/components/PolicyPanel";
import ProcureChat from "@/components/ProcureChat";
import ReceiptFeed, { Receipt } from "@/components/ReceiptCard";
import { Bot, GitBranch, Zap } from "lucide-react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [balance, setBalance] = useState<string | undefined>();
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const handleConnect = (data: { walletAddress?: string; balance?: string }) => {
    setIsConnected(true);
    setWalletAddress(data.walletAddress);
    setBalance(data.balance);
  };

  const handleReceiptAdded = (receipt: Receipt) => {
    setReceipts((prev) => [...prev, receipt]);
    // Update balance estimate
    if (receipt.status === "success" && balance) {
      const newBal = (parseFloat(balance) - parseFloat(receipt.cost)).toFixed(4);
      setBalance(newBal);
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden">
      {/* Animated dark background */}
      <AnimatedBackground />

      {/* Gradient spotlights */}
      <Spotlight className="top-0 left-1/4 w-[800px] h-[600px] -translate-y-1/2" fill="#00ff88" />
      <Spotlight className="top-1/2 right-0 w-[600px] h-[600px]" fill="#7c3aed" />

      {/* Top noise overlay for depth */}
      <div className="fixed inset-0 -z-5 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 opacity-20 blur-sm" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="h-4.5 w-4.5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">ProcureBot</h1>
              <p className="text-[10px] text-white/40 leading-none">
                AI Procurement Agent · Powered by Locus
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">
              Locus Paygentic Hackathon #1
            </span>
            <a
              href="https://github.com/NeelShah1505/ProcureBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors border border-white/10 rounded-full px-3 py-1"
            >
              <GitBranch className="h-3 w-3" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-4" style={{ height: "calc(100vh - 65px)" }}>

        {/* Connection Banner */}
        <LocusConnect onConnect={handleConnect} isConnected={isConnected} />

        {/* 3-Column Layout */}
        <div className="flex gap-4 flex-1 min-h-0">

          {/* Left: Policy Panel */}
          <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col overflow-y-auto">
            <PolicyPanel
              isConnected={isConnected}
              walletAddress={walletAddress}
              balance={balance}
            />
          </aside>

          {/* Center: Chat */}
          <section className="flex-1 flex flex-col min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm p-4">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-white">ProcureBot Chat</span>
                <span className="text-xs text-white/30">· Autonomous AI Procurement</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Zap className="h-3 w-3 text-emerald-400" />
                Pay-per-use · USDC on Base
              </div>
            </div>

            <ProcureChat
              onReceiptAdded={handleReceiptAdded}
              isConnected={isConnected}
            />
          </section>

          {/* Right: Receipt Feed */}
          <aside className="w-72 flex-shrink-0 hidden xl:flex flex-col overflow-y-auto">
            <ReceiptFeed receipts={receipts} />
          </aside>
        </div>

        {/* ── Footer ── */}
        <footer className="text-center text-[10px] text-white/20 pb-1">
          Built for{" "}
          <a href="https://paywithlocus.com" className="text-emerald-400/60 hover:text-emerald-400 transition-colors">
            Locus Paygentic Hackathon #1
          </a>{" "}
          in &lt;12 hours · ProcureBot uses real USDC micro-payments via{" "}
          <a href="https://docs.paywithlocus.com" className="text-cyan-400/60 hover:text-cyan-400 transition-colors">
            PayWithLocus
          </a>
        </footer>
      </main>
    </div>
  );
}
