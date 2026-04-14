"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
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

  const modal = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%", maxWidth: 440,
          borderRadius: 20, padding: 24,
          display: "flex", flexDirection: "column", gap: 20,
          background: "rgba(10,10,28,0.99)",
          border: "1px solid rgba(16,185,129,0.25)",
          boxShadow: "0 0 80px rgba(16,185,129,0.12), 0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
            }}>
              <Key style={{ width: 16, height: 16, color: "#10b981" }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>Connect Locus Wallet</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>Paste your API key to begin</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.3)", padding: 6, borderRadius: 8,
          }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Security note */}
        <div style={{
          padding: "10px 14px", borderRadius: 12, fontSize: 11,
          color: "rgba(255,255,255,0.45)", lineHeight: 1.6,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        }}>
          Your key is stored locally in your browser and sent securely with each request. It is never logged or stored on our servers.
        </div>

        {/* Input */}
        <div>
          <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Locus API Key</label>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            borderRadius: 12, padding: "10px 12px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <input
              ref={inputRef}
              type={show ? "text" : "password"}
              value={val}
              onChange={(e) => { setVal(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              placeholder="claw_dev_xxxxxxxxxxxx"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: 13, color: "#fff", fontFamily: "monospace",
              }}
            />
            <button onClick={() => setShow(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
              {show ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {err && <p style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>{err}</p>}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={connect}
            disabled={testing || !val.trim()}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
              fontSize: 14, fontWeight: 600, color: "#fff", cursor: testing || !val.trim() ? "not-allowed" : "pointer",
              background: val.trim() && !testing ? "linear-gradient(135deg, #10b981, #06b6d4)" : "rgba(255,255,255,0.07)",
              opacity: testing ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            {testing ? "Verifying…" : "Connect Wallet"}
          </button>
          <a
            href="https://beta.paywithlocus.com"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 11, color: "rgba(16,185,129,0.6)", textDecoration: "none", padding: "4px 0",
            }}
          >
            <ExternalLink style={{ width: 12, height: 12 }} />
            Get a free Locus API key →
          </a>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(modal, document.body);
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
