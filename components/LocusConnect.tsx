"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Wifi, WifiOff, RefreshCw, Key, X, Eye, EyeOff, ExternalLink } from "lucide-react";

// ─── Persist key in localStorage ────────────────────────────────────────────
const LS_KEY = "locus_api_key";
export function getUserApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_KEY);
}
function setUserApiKey(key: string) { localStorage.setItem(LS_KEY, key); }
function clearUserApiKey() { localStorage.removeItem(LS_KEY); }

// ─── Types ───────────────────────────────────────────────────────────────────
interface ConnectionState {
  status: "idle" | "checking" | "connected" | "disconnected";
  balance?: string;
  walletAddress?: string;
  error?: string;
}

interface LocusConnectProps {
  onConnectionChange: (s: { isConnected: boolean; balance?: string; walletAddress?: string }) => void;
}

// ─── Key Modal ───────────────────────────────────────────────────────────────
function KeyModal({ onSuccess, onClose }: { onSuccess: (key: string) => void; onClose: () => void }) {
  const [val, setVal] = useState(getUserApiKey() ?? "");
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const connect = async () => {
    const key = val.trim();
    if (!key) { setErr("Please paste your Locus API key."); return; }
    setTesting(true); setErr("");
    try {
      const res = await fetch("/api/procure", {
        cache: "no-store",
        headers: { "x-locus-api-key": key },
      });
      const data = await res.json();
      if (data.connected) {
        setUserApiKey(key);
        onSuccess(key);
      } else {
        setErr(data.error ?? "Invalid key — check your Locus dashboard.");
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: "rgba(10,10,28,0.98)",
          border: "1px solid rgba(16,185,129,0.25)",
          boxShadow: "0 0 80px rgba(16,185,129,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <Key className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Connect Locus Wallet</p>
              <p className="text-[11px] text-white/35">Paste your API key to begin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/8 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info */}
        <div className="rounded-xl px-4 py-3 text-[11px] text-white/50 leading-relaxed"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          Your key is stored locally in your browser and sent securely with each request. It is never logged or stored on our servers.
        </div>

        {/* Input */}
        <div>
          <label className="block text-[11px] text-white/40 mb-1.5 uppercase tracking-wider">Locus API Key</label>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <input
              ref={inputRef}
              type={show ? "text" : "password"}
              value={val}
              onChange={(e) => { setVal(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              placeholder="claw_dev_xxxxxxxxxxxx"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none font-mono"
            />
            <button onClick={() => setShow(s => !s)} className="text-white/25 hover:text-white/60 transition-colors">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {err && <p className="text-[11px] text-red-400 mt-1.5">{err}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={connect}
            disabled={testing || !val.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: val.trim() && !testing
                ? "linear-gradient(135deg, #10b981, #06b6d4)"
                : "rgba(255,255,255,0.07)",
              opacity: testing ? 0.7 : 1,
            }}
          >
            {testing ? "Verifying…" : "Connect Wallet"}
          </button>

          <a
            href="https://beta.paywithlocus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/60 hover:text-emerald-400 transition-colors py-1"
          >
            <ExternalLink className="h-3 w-3" />
            Get a free Locus API key →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function LocusConnect({ onConnectionChange }: LocusConnectProps) {
  const [state, setState] = useState<ConnectionState>({ status: "idle" });
  const [showModal, setShowModal] = useState(false);

  const check = useCallback(async (apiKey?: string) => {
    const key = apiKey ?? getUserApiKey();
    if (!key) {
      setState({ status: "disconnected" });
      onConnectionChange({ isConnected: false });
      return;
    }
    setState(s => ({ ...s, status: "checking" }));
    try {
      const res = await fetch("/api/procure", {
        cache: "no-store",
        headers: { "x-locus-api-key": key },
      });
      const data = await res.json();
      if (data.connected) {
        setState({ status: "connected", balance: data.balance, walletAddress: data.walletAddress });
        onConnectionChange({ isConnected: true, balance: data.balance, walletAddress: data.walletAddress });
      } else {
        setState({ status: "disconnected", error: data.error });
        onConnectionChange({ isConnected: false });
      }
    } catch {
      setState({ status: "disconnected" });
      onConnectionChange({ isConnected: false });
    }
  }, [onConnectionChange]);

  useEffect(() => { check(); }, [check]);

  const handleKeyConnected = (key: string) => {
    setShowModal(false);
    check(key);
  };

  const disconnect = () => {
    clearUserApiKey();
    setState({ status: "disconnected" });
    onConnectionChange({ isConnected: false });
  };

  // ── Checking ──
  if (state.status === "checking") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] text-white/35"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="pulse-dot h-1 w-1 rounded-full bg-white/40" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <span>Connecting…</span>
      </div>
    );
  }

  // ── Connected ──
  if (state.status === "connected") {
    return (
      <>
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
          <button onClick={() => check()} title="Refresh" className="p-1.5 rounded-full text-white/25 hover:text-white/60 hover:bg-white/8 transition-all">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button onClick={disconnect} title="Disconnect" className="p-1.5 rounded-full text-white/25 hover:text-red-400 hover:bg-white/8 transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </>
    );
  }

  // ── Disconnected / Idle ──
  return (
    <>
      {showModal && <KeyModal onSuccess={handleKeyConnected} onClose={() => setShowModal(false)} />}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          color: "#10b981",
          boxShadow: "0 0 20px rgba(16,185,129,0.1)",
        }}
      >
        <Key className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="whitespace-nowrap">Connect Wallet</span>
      </button>
    </>
  );
}
