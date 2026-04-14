"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Key, CheckCircle2, AlertCircle, Loader2, ExternalLink, Wallet2 } from "lucide-react";
import { GlowCard, MovingBorderButton } from "@/components/ui";

interface LocusConnectProps {
  onConnect: (data: { walletAddress?: string; balance?: string }) => void;
  isConnected: boolean;
}

export default function LocusConnect({ onConnect, isConnected }: LocusConnectProps) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-check connection on mount
  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/procure", {
        method: "GET",
      });
      const data = await res.json();
      if (data.connected) {
        onConnect({
          walletAddress: data.walletAddress,
          balance: data.balance,
        });
      } else {
        setError(data.error || "Not connected. Check your LOCUS_API_KEY in .env.local");
      }
    } catch {
      setError("Failed to reach backend. Is the server running?");
    } finally {
      setChecking(false);
    }
  };

  return (
    <GlowCard
      className={cn(
        "p-5 transition-all duration-500",
        isConnected ? "border-emerald-500/30" : "border-white/10"
      )}
      glowColor={isConnected ? "emerald" : "cyan"}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border",
            isConnected
              ? "bg-emerald-500/15 border-emerald-500/30"
              : "bg-white/5 border-white/10"
          )}
        >
          {checking ? (
            <Loader2 className="h-5 w-5 text-white/60 animate-spin" />
          ) : isConnected ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <Key className="h-5 w-5 text-white/40" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">
              {isConnected ? "Locus Agent Connected" : "Connect Locus Agent"}
            </h3>
            {isConnected && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
              </span>
            )}
          </div>

          {isConnected ? (
            <p className="text-xs text-white/50 mt-0.5">
              Connected as <span className="text-emerald-400 font-medium">ProcureBot Agent</span> — ready to spend USDC
            </p>
          ) : (
            <p className="text-xs text-white/50 mt-0.5">
              Add your <code className="text-cyan-400 bg-white/5 px-1 py-0.5 rounded text-[10px]">claw_dev_*</code> key to{" "}
              <code className="text-cyan-400 bg-white/5 px-1 py-0.5 rounded text-[10px]">.env.local</code>
            </p>
          )}

          {error && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={checkConnection}
            disabled={checking}
            className="text-xs text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
          >
            {checking ? "Checking…" : isConnected ? "Refresh" : "Connect"}
          </button>
        </div>
      </div>

      {/* Fund Agent Row */}
      {isConnected && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet2 className="h-4 w-4 text-white/30" />
            <span className="text-xs text-white/40">Need more USDC?</span>
          </div>
          <a
            href="https://app.paywithlocus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Fund Agent via Locus
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </GlowCard>
  );
}
