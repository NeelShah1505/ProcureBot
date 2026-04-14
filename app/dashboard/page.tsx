"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import LocusConnect from "@/components/LocusConnect";
import PolicyPanel from "@/components/PolicyPanel";
import ProcureChat from "@/components/ProcureChat";
import ReceiptFeed, { Receipt } from "@/components/ReceiptCard";

export default function Dashboard() {
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    balance: undefined as string | undefined,
    walletAddress: undefined as string | undefined,
  });
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const handleConnectionChange = useCallback(
    (state: { isConnected: boolean; balance?: string; walletAddress?: string }) => {
      setConnectionState({
        isConnected: state.isConnected,
        balance: state.balance,
        walletAddress: state.walletAddress,
      });
    },
    []
  );

  const handleReceiptAdded = useCallback(
    (receipt: Receipt) => {
      setReceipts((prev) => [...prev, receipt]);
      if (connectionState.balance && receipt.cost) {
        const newBal = (
          parseFloat(connectionState.balance) - parseFloat(receipt.cost)
        ).toFixed(4);
        setConnectionState((prev) => ({ ...prev, balance: newBal }));
      }
    },
    [connectionState.balance]
  );

  return (
    <>
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col page-locked">

        {/* ── Header ── */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 h-14"
          style={{
            background: "rgba(5,5,18,0.8)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
          }}
        >
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(6,182,212,0.15))",
                border: "1px solid rgba(16,185,129,0.35)",
              }}
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">ProcureBot</span>
          </Link>

          <LocusConnect onConnectionChange={handleConnectionChange} />
        </header>

        {/* ── 3-column layout ── */}
        <main className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">

          {/* Left sidebar */}
          <aside className="w-[240px] flex-shrink-0 hidden lg:flex flex-col min-h-0 overflow-hidden py-0.5">
            <PolicyPanel
              isConnected={connectionState.isConnected}
              walletAddress={connectionState.walletAddress}
              balance={connectionState.balance}
            />
          </aside>

          {/* Center chat */}
          <section className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              style={{
                background: "rgba(6,6,20,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                backdropFilter: "blur(20px)",
              }}
            >
              <ProcureChat
                onReceiptAdded={handleReceiptAdded}
                isConnected={connectionState.isConnected}
              />
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="w-[260px] flex-shrink-0 hidden md:flex flex-col min-h-0 overflow-hidden py-0.5">
            <ReceiptFeed receipts={receipts} />
          </aside>

        </main>

      </div>
    </>
  );
}
