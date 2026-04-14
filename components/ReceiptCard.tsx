"use client";
import React from "react";
import { CheckCircle2, Clock, DollarSign, Zap, ImageIcon, Search, TrendingUp, Copy, ExternalLink } from "lucide-react";

export interface Receipt {
  id: string;
  timestamp: string;
  provider: string;
  endpoint: string;
  cost: string;
  status: "success" | "pending" | "approval_required";
  txHash?: string;
  approvalUrl?: string;
  summary: string;
}

const PROVIDER_META: Record<string, { color: string; icon: React.ElementType }> = {
  coingecko:  { color: "#10b981", icon: TrendingUp },
  tavily:     { color: "#06b6d4", icon: Search },
  perplexity: { color: "#8b5cf6", icon: Search },
  openai:     { color: "#3b82f6", icon: Zap },
  replicate:  { color: "#ec4899", icon: ImageIcon },
  groq:       { color: "#f59e0b", icon: Zap },
};

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const meta = PROVIDER_META[receipt.provider.toLowerCase()] ?? { color: "#ffffff60", icon: Zap };
  const Icon = meta.icon;
  const time = typeof window !== "undefined"
    ? new Date(receipt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      className="slide-up p-3.5 rounded-2xl transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Row 1: icon + name + status */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
          <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{receipt.provider}</p>
          <p className="text-[10px] text-white/35 font-mono truncate">{receipt.endpoint}</p>
        </div>
        <div
          className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={
            receipt.status === "success"
              ? { background: "rgba(16,185,129,0.12)", color: "#10b981" }
              : { background: "rgba(245,158,11,0.12)", color: "#f59e0b" }
          }
        >
          {receipt.status === "success"
            ? <CheckCircle2 className="h-2.5 w-2.5" />
            : <Clock className="h-2.5 w-2.5" />
          }
          {receipt.status === "success" ? "Paid" : receipt.status === "pending" ? "Pending" : "Approval"}
        </div>
      </div>

      {/* Row 2: summary */}
      <p className="text-[11px] text-white/45 mb-2.5 leading-relaxed line-clamp-2">{receipt.summary}</p>

      {/* Row 3: time + cost */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/25 flex items-center gap-1" suppressHydrationWarning>
          <Clock className="h-3 w-3" />{time}
        </span>
        <span className="text-xs font-bold" style={{ color: "#10b981" }}>
          ${receipt.cost} USDC
        </span>
      </div>

      {/* Approval URL */}
      {receipt.approvalUrl && (
        <a href={receipt.approvalUrl} target="_blank" rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Approve →</span>
        </a>
      )}
    </div>
  );
}

interface ReceiptFeedProps {
  receipts: Receipt[];
}

export default function ReceiptFeed({ receipts }: ReceiptFeedProps) {
  const total = receipts.filter(r => r.status === "success").reduce((s, r) => s + parseFloat(r.cost || "0"), 0);

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">

      {/* Session spend */}
      <div className="flex-shrink-0 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Session Spend</p>
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-3xl font-bold transition-all duration-500"
            style={total > 0
              ? { background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }
              : { color: "rgba(255,255,255,0.15)" }
            }
          >
            {total.toFixed(4)}
          </span>
          <span className="text-sm text-white/35">USDC</span>
        </div>
        <p className="text-[10px] text-white/25 mt-1">
          {receipts.length} transaction{receipts.length !== 1 ? "s" : ""}
          {receipts.length > 0 && (
            <span className="ml-1.5 text-emerald-400/50">· {receipts.filter(r => r.status === "success").length} ok</span>
          )}
        </p>
      </div>

      {/* Live receipts list */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 flex-shrink-0">Live Receipts</p>
        <div className="flex-1 overflow-y-auto space-y-2" style={{ scrollbarWidth: "thin" }}>
          {receipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <DollarSign className="h-5 w-5 text-white/15" />
              </div>
              <p className="text-xs text-white/20 text-center">No transactions yet</p>
            </div>
          ) : (
            [...receipts].reverse().map((r) => <ReceiptCard key={r.id} receipt={r} />)
          )}
        </div>
      </div>

    </div>
  );
}
