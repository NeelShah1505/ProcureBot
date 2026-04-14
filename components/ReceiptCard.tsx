"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  DollarSign,
  Hash,
  Zap,
  Image as ImageIcon,
  Search,
  TrendingUp,
} from "lucide-react";
import { Badge, GlowCard } from "@/components/ui";

export interface Receipt {
  id: string;
  timestamp: string;
  provider: string;
  endpoint: string;
  cost: string; // e.g. "0.02"
  status: "success" | "pending" | "approval_required";
  txHash?: string;
  approvalUrl?: string;
  summary: string;
}

const PROVIDER_ICONS: Record<string, React.ElementType> = {
  coingecko: TrendingUp,
  tavily: Search,
  perplexity: Search,
  openai: Zap,
  replicate: ImageIcon,
  groq: Zap,
};

const PROVIDER_COLORS: Record<string, string> = {
  coingecko: "text-emerald-400",
  tavily: "text-cyan-400",
  perplexity: "text-violet-400",
  openai: "text-blue-400",
  replicate: "text-pink-400",
  groq: "text-amber-400",
};

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const Icon = PROVIDER_ICONS[receipt.provider.toLowerCase()] ?? Zap;
  const iconColor = PROVIDER_COLORS[receipt.provider.toLowerCase()] ?? "text-white/60";

  return (
    <GlowCard className="p-3.5" glowColor="emerald">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-md bg-white/5", iconColor)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">
              {receipt.provider}
            </p>
            <p className="text-[10px] text-white/40">{receipt.endpoint}</p>
          </div>
        </div>
        <Badge
          variant={
            receipt.status === "success"
              ? "success"
              : receipt.status === "pending"
              ? "warning"
              : "info"
          }
          className="text-[10px] flex-shrink-0"
        >
          {receipt.status === "success" && <CheckCircle2 className="h-2.5 w-2.5" />}
          {receipt.status === "pending" && <Clock className="h-2.5 w-2.5" />}
          {receipt.status === "approval_required" ? "Needs Approval" : receipt.status}
        </Badge>
      </div>

      <p className="text-xs text-white/60 mb-2 line-clamp-2">{receipt.summary}</p>

      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2 text-white/40">
          <Clock className="h-3 w-3" />
          <span>{new Date(receipt.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-1 font-bold text-emerald-400">
          <DollarSign className="h-3 w-3" />
          <span>{receipt.cost} USDC</span>
        </div>
      </div>

      {receipt.txHash && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-[10px] text-white/30">
          <Hash className="h-3 w-3" />
          <span className="font-mono truncate">{receipt.txHash.slice(0, 20)}…</span>
          <button
            onClick={() => navigator.clipboard.writeText(receipt.txHash!)}
            className="ml-auto text-white/40 hover:text-white/70 transition-colors"
          >
            Copy
          </button>
        </div>
      )}

      {receipt.approvalUrl && (
        <a
          href={receipt.approvalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Approve transaction →
        </a>
      )}
    </GlowCard>
  );
}

interface ReceiptFeedProps {
  receipts: Receipt[];
}

export default function ReceiptFeed({ receipts }: ReceiptFeedProps) {
  const totalSpent = receipts
    .filter((r) => r.status === "success")
    .reduce((sum, r) => sum + parseFloat(r.cost), 0);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Summary */}
      <GlowCard className="p-4" glowColor="emerald">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
          Session Spend
        </p>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-emerald-400">
            {totalSpent.toFixed(4)}
          </span>
          <span className="text-sm text-white/40 mb-1">USDC</span>
        </div>
        <p className="text-xs text-white/30 mt-1">
          {receipts.length} transaction{receipts.length !== 1 ? "s" : ""}
        </p>
      </GlowCard>

      {/* Receipts List */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Live Receipts
        </p>
        {receipts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8">
              <DollarSign className="h-8 w-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No transactions yet</p>
              <p className="text-[10px] text-white/20 mt-1">
                Send a message to start procuring
              </p>
            </div>
          </div>
        ) : (
          [...receipts].reverse().map((r) => (
            <ReceiptCard key={r.id} receipt={r} />
          ))
        )}
      </div>
    </div>
  );
}
