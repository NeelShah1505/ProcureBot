"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Wallet, Shield, Zap, CheckCircle2, Copy, ExternalLink, Edit2, Check, X } from "lucide-react";

// ─── Editable policy row ────────────────────────────────────────────────────
function PolicyRow({
  icon: Icon, label, value, color, bg, unit,
  onSave,
}: {
  icon: React.ElementType; label: string; value: string;
  color: string; bg: string; unit?: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: bg }}>
        <Icon className="h-3 w-3" style={{ color }} />
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
        <span className="text-[10px] text-white/40 truncate flex-shrink-0">{label}</span>

        {editing ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
              className="w-20 bg-transparent text-[10px] font-semibold text-white text-right focus:outline-none border-b border-emerald-400/50"
            />
            <button onClick={commit} className="text-emerald-400 hover:text-emerald-300 transition-colors">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={cancel} className="text-white/30 hover:text-white/60 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 group flex-shrink-0"
          >
            <span className="text-[10px] font-semibold text-white">{value}</span>
            <Edit2 className="h-2.5 w-2.5 text-white/0 group-hover:text-white/30 transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}

const PROVIDERS = [
  { name: "CoinGecko", color: "#10b981" },
  { name: "Tavily",    color: "#06b6d4" },
  { name: "OpenAI",    color: "#3b82f6" },
  { name: "Groq",      color: "#f59e0b" },
  { name: "Perplexity",color: "#8b5cf6" },
  { name: "Replicate", color: "#ec4899" },
];

interface PolicyPanelProps {
  isConnected: boolean;
  walletAddress?: string;
  balance?: string;
}

export default function PolicyPanel({ isConnected, walletAddress, balance }: PolicyPanelProps) {
  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  const [policies, setPolicies] = useState([
    { icon: Wallet,       label: "Max / tx",     value: "$0.50 USDC",  color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { icon: Shield,       label: "Daily cap",    value: "$15.00 USDC", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { icon: Zap,          label: "Auto-approve", value: "< $0.10 USDC",color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: CheckCircle2, label: "Providers",    value: "6 enabled",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  ]);

  const updatePolicy = (i: number, v: string) => {
    setPolicies((prev) => prev.map((p, idx) => idx === i ? { ...p, value: v } : p));
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

      {/* ── Agent card ── */}
      <div className="rounded-2xl p-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Status row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Agent</span>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold",
            isConnected ? "text-emerald-400" : "text-red-400"
          )} style={{
            background: isConnected ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: isConnected ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
          }}>
            <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
            {isConnected ? "Live" : "Offline"}
          </div>
        </div>

        {/* Bot icon + name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <span className="text-lg leading-none">🤖</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">ProcureBot</p>
            <p className="text-[10px] text-white/35 truncate">USDC on Base</p>
          </div>
        </div>

        {/* Wallet */}
        {shortAddr && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="min-w-0">
              <p className="text-[9px] text-white/30 mb-0.5 uppercase tracking-wider">Wallet</p>
              <p className="text-xs font-mono text-emerald-400 truncate">{shortAddr}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(walletAddress!)} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Copy className="h-3 w-3 text-white/30 hover:text-white/60" />
            </button>
          </div>
        )}

        {/* Balance */}
        {balance && (
          <div className="px-3 py-3 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))", border: "1px solid rgba(16,185,129,0.18)" }}>
            <p className="text-[9px] text-white/35 uppercase tracking-wider mb-1">Balance</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {balance}
              </span>
              <span className="text-xs text-white/40">USDC</span>
            </div>
            <a href="https://beta.paywithlocus.com" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400/60 hover:text-emerald-400 transition-colors">
              <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
              <span>Fund wallet</span>
            </a>
          </div>
        )}
      </div>

      {/* ── Spending Policies (editable) ── */}
      <div className="rounded-2xl p-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Policies</span>
          <span className="text-[10px] text-white/20">click to edit</span>
        </div>
        <div className="space-y-1.5">
          {policies.map((p, i) => (
            <PolicyRow
              key={i}
              icon={p.icon}
              label={p.label}
              value={p.value}
              color={p.color}
              bg={p.bg}
              onSave={(v) => updatePolicy(i, v)}
            />
          ))}
        </div>
      </div>

      {/* ── Providers ── */}
      <div className="rounded-2xl p-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-3">Providers</span>
        <div className="grid grid-cols-2 gap-1.5">
          {PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 px-2.5 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-[10px] font-medium text-white/60 truncate">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
