"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface ConnectionState {
  status: "checking" | "connected" | "disconnected";
  balance?: string;
  walletAddress?: string;
}

interface LocusConnectProps {
  onConnectionChange: (s: { isConnected: boolean; balance?: string; walletAddress?: string }) => void;
}

export default function LocusConnect({ onConnectionChange }: LocusConnectProps) {
  const [state, setState] = useState<ConnectionState>({ status: "checking" });

  const check = useCallback(async () => {
    setState(s => s.status !== "checking" ? { ...s, status: "checking" } : s);
    try {
      const res = await fetch("/api/procure", { cache: "no-store" });
      const data = await res.json();
      if (data.connected) {
        setState({ status: "connected", balance: data.balance, walletAddress: data.walletAddress });
        onConnectionChange({ isConnected: true, balance: data.balance, walletAddress: data.walletAddress });
      } else {
        setState({ status: "disconnected" });
        onConnectionChange({ isConnected: false });
      }
    } catch {
      setState({ status: "disconnected" });
      onConnectionChange({ isConnected: false });
    }
  }, [onConnectionChange]);

  useEffect(() => { check(); }, [check]);

  if (state.status === "checking") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] text-white/35"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-0.5">
          {[0,1,2].map(i => (
            <span key={i} className="pulse-dot h-1 w-1 rounded-full bg-white/40" style={{ animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
        <span>Connecting</span>
      </div>
    );
  }

  if (state.status === "connected") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold text-emerald-400"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)" }}>
          <Wifi className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="whitespace-nowrap">Agent Connected</span>
          {state.balance && (
            <>
              <div className="w-px h-3 bg-emerald-500/30" />
              <span className="font-mono whitespace-nowrap">{state.balance} USDC</span>
            </>
          )}
        </div>
        <button onClick={check} className="p-1.5 rounded-full text-white/25 hover:text-white/60 hover:bg-white/8 transition-all">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold text-red-400"
      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
      <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="whitespace-nowrap">Not connected</span>
    </div>
  );
}
