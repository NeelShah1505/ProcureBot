"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Send, Bot, User, Loader2,
  TrendingUp, Search, ImageIcon, Zap, Globe, BarChart3,
  Sparkles,
} from "lucide-react";
import { GlowCard, Spinner } from "@/components/ui";
import { Receipt } from "@/components/ReceiptCard";
import { getUserApiKey } from "@/components/LocusConnect";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: string[];
  receipt?: Receipt;
  timestamp: string;
  isLoading?: boolean;
}

// ─── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: "SOL Price",
    sub: "Live price + 24h change",
    color: "text-emerald-400",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
    prompt: "Get the current Solana price with 24h analysis",
  },
  {
    icon: Search,
    label: "Research AI",
    sub: "Latest news from the web",
    color: "text-cyan-400",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.2)",
    prompt: "Research the latest AI agents news this week and summarize",
  },
  {
    icon: ImageIcon,
    label: "Gen Image",
    sub: "Create with DALL·E",
    color: "text-pink-400",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.2)",
    prompt: "Generate an image of a futuristic robot paying with crypto",
  },
  {
    icon: BarChart3,
    label: "Crypto Market",
    sub: "Global stats + dominance",
    color: "text-violet-400",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.2)",
    prompt: "Give me the overall crypto global market overview right now",
  },
  {
    icon: Globe,
    label: "Trending Coins",
    sub: "Top movers today",
    color: "text-amber-400",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.2)",
    prompt: "What are the top trending crypto coins right now?",
  },
  {
    icon: Zap,
    label: "ETH Deep Dive",
    sub: "Full market data",
    color: "text-blue-400",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
    prompt: "Get detailed Ethereum market data, ATH, and 30-day performance",
  },
];

// ─── Markdown renderer ──────────────────────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<div key={i} className="h-1.5" />);
      i++;
      continue;
    }

    // Heading
    if (line.startsWith("## ") || line.startsWith("# ")) {
      const content = line.replace(/^#{1,2}\s/, "");
      elements.push(
        <p key={i} className="text-sm font-bold text-white mt-2 mb-1">{parseBold(content)}</p>
      );
      i++;
      continue;
    }

    // List item (bullet or number)
    if (/^[-*•]\s/.test(line) || /^\d+\.\s/.test(line)) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 py-0.5">
          <div className="mt-[7px] h-1.5 w-1.5 rounded-full bg-emerald-400/50 flex-shrink-0" />
          <span className="text-sm text-white/80 leading-relaxed flex-1">
            {parseBold(line.replace(/^[-*•]\s|^\d+\.\s/, "").trim())}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Italic metadata footer
    if (line.startsWith("_") && line.endsWith("_")) {
      elements.push(
        <p key={i} className="text-[11px] text-white/30 italic mt-2">
          {line.slice(1, -1)}
        </p>
      );
      i++;
      continue;
    }

    // Image marker [IMG:url-or-data-uri]
    if (line.startsWith("[IMG:") && line.endsWith("]")) {
      const src = line.slice(5, -1);
      elements.push(
        <div key={i} className="my-3">
          <img
            src={src}
            alt="AI Generated Image"
            style={{
              maxWidth: "100%", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      );
      i++;
      continue;
    }

    // Normal line
    elements.push(
      <p key={i} className="text-sm text-white/82 leading-relaxed">
        {parseBold(line)}
      </p>
    );
    i++;
  }
  return elements;
}

function parseBold(line: string): React.ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={j} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("http")) {
      const display = part.length > 55 ? part.slice(0, 55) + "…" : part;
      return (
        <a
          key={j}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300 text-xs break-all transition-colors"
        >
          {display}
        </a>
      );
    }
    return <span key={j}>{part}</span>;
  });
}

// ─── Thinking step ─────────────────────────────────────────────────────────────
function ThinkingStep({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="slide-in flex items-center gap-2 py-0.5"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="h-[3px] w-[3px] rounded-full bg-emerald-400/60 flex-shrink-0" />
      <span className="text-[11px] text-white/40">{text}</span>
    </div>
  );
}

// ─── Welcome screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ onPrompt, isConnected }: { onPrompt: (p: string) => void; isConnected: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-8">

      {/* Hero */}
      <div className="text-center space-y-4 max-w-lg">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mx-auto"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))",
            border: "1px solid rgba(16,185,129,0.3)",
            boxShadow: "0 0 60px rgba(16,185,129,0.15)",
          }}
        >
          <Bot className="h-10 w-10 text-emerald-400" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            What shall I procure for you?
          </h2>
          <p className="text-sm text-white/40 mt-2 leading-relaxed">
            I autonomously buy live data, AI research & media — paying micro-amounts of USDC on each request.
            Your wallet, your rules.
          </p>
        </div>

        {!isConnected && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-amber-400"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Add your Locus API key to .env.local to begin
          </div>
        )}
      </div>

      {/* Prompt grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl">
        {QUICK_PROMPTS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              onClick={() => onPrompt(p.prompt)}
              disabled={!isConnected}
              className="text-left group transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "transparent" }}
            >
              <div
                className="h-full p-4 rounded-2xl flex flex-col gap-3 transition-all duration-200 group-hover:scale-[1.02]"
                style={{
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${p.bg}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                >
                  <Icon className={cn("h-4.5 w-4.5", p.color)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{p.label}</p>
                  <p className="text-[11px] text-white/40 mt-0.5 leading-tight">{p.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chat message bubble ───────────────────────────────────────────────────────
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (message.isLoading) {
    return (
      <div className="msg-in flex items-start gap-4 px-6 py-1">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <Bot className="h-4 w-4 text-emerald-400" />
        </div>
        <div
          className="flex-1 max-w-[80%] p-4 rounded-2xl rounded-tl-sm"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Spinner />
            <span className="text-xs text-emerald-400 font-medium">ProcureBot is working…</span>
          </div>
          <div className="space-y-0.5">
            {message.steps?.map((step, i) => (
              <ThinkingStep key={i} text={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("msg-in flex items-end gap-4 px-6 py-1", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mb-6"
        style={
          isUser
            ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }
            : { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }
        }
      >
        {isUser ? (
          <User className="h-4 w-4 text-violet-400" />
        ) : (
          <Bot className="h-4 w-4 text-emerald-400" />
        )}
      </div>

      <div className={cn("flex flex-col gap-1.5 max-w-[78%]", isUser && "items-end")}>
        {/* Thinking steps (shown above response) */}
        {!isUser && message.steps && message.steps.length > 0 && (
          <div className="space-y-0.5 px-1 mb-1">
            {message.steps.map((step, i) => (
              <ThinkingStep key={i} text={step} index={i} />
            ))}
          </div>
        )}

        {/* Bubble */}
        <div
          className="p-4 rounded-2xl"
          style={
            isUser
              ? {
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderBottomRightRadius: "4px",
                }
              : {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderBottomLeftRadius: "4px",
                }
          }
        >
          <div className="space-y-0.5">
            {renderMarkdown(message.content)}
          </div>

          {/* Receipt inline badge */}
          {message.receipt && (
            <div
              className="mt-3 pt-3 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-medium">
                  via {message.receipt.provider}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">
                −{message.receipt.cost} USDC
              </span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span
          suppressHydrationWarning
          style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", padding: "0 4px" }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ─── Main ProcureChat ──────────────────────────────────────────────────────────
interface ProcureChatProps {
  onReceiptAdded: (receipt: Receipt) => void;
  isConnected: boolean;
}

export default function ProcureChat({ onReceiptAdded, isConnected }: ProcureChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      const loadingId = crypto.randomUUID();
      const loadingMsg: Message = {
        id: loadingId,
        role: "assistant",
        content: "",
        isLoading: true,
        steps: ["Analyzing your request…"],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInput("");
      setIsLoading(true);

      // Progressive steps
      const stepTexts = [
        "Analyzing your request…",
        "Selecting best Locus provider…",
        "Authorizing USDC payment…",
        "Calling wrapped API…",
        "Processing response…",
      ];
      const timers: ReturnType<typeof setTimeout>[] = [];
      stepTexts.forEach((step, i) => {
        timers.push(
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === loadingId ? { ...m, steps: stepTexts.slice(0, i + 1) } : m
              )
            );
          }, i * 600)
        );
      });

      try {
        const res = await fetch("/api/procure", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(getUserApiKey() ? { "x-locus-api-key": getUserApiKey()! } : {}),
          },
          body: JSON.stringify({ message: text.trim() }),
        });
        const data = await res.json();
        timers.forEach(clearTimeout);

        if (data.receipt) onReceiptAdded(data.receipt);

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response || "Sorry, something went wrong.",
          steps: data.steps || [],
          receipt: data.receipt,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) =>
          prev.filter((m) => m.id !== loadingId).concat(assistantMsg)
        );
      } catch {
        timers.forEach(clearTimeout);
        setMessages((prev) =>
          prev.filter((m) => m.id !== loadingId).concat({
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "⚠️ Connection failed. Make sure the dev server is running at localhost:3000.",
            timestamp: new Date().toISOString(),
          })
        );
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [isLoading, onReceiptAdded]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Top bar inside chat panel (tabs row) ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">Chat</span>
        </div>
        {!showWelcome && (
          <div className="flex gap-1.5 flex-wrap">
            {[
              { icon: TrendingUp, label: "SOL", prompt: "Get the current Solana price with 24h analysis", color: "text-emerald-400" },
              { icon: Search, label: "Research", prompt: "Research the latest AI agents news this week", color: "text-cyan-400" },
              { icon: BarChart3, label: "Market", prompt: "Global crypto market overview right now", color: "text-violet-400" },
              { icon: Globe, label: "Trending", prompt: "What are the top trending crypto coins?", color: "text-amber-400" },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.prompt)}
                  disabled={isLoading || !isConnected}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
                    "transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  )}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
                  }}
                >
                  <Icon className={cn("h-3 w-3", p.color)} />
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {showWelcome ? (
          <WelcomeScreen onPrompt={sendMessage} isConnected={isConnected} />
        ) : (
          <div className="space-y-3 pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div
        className="flex-shrink-0 p-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 0 0 transparent",
            transition: "box-shadow 0.2s",
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 0 0 2px rgba(16,185,129,0.2), 0 0 20px rgba(16,185,129,0.08)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(16,185,129,0.25)";
          }}
          onBlurCapture={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              isConnected
                ? 'Ask anything… e.g. "Get Bitcoin price" or "Research AI agents"'
                : "Connect your Locus API key to begin…"
            }
            disabled={!isConnected || isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none leading-relaxed disabled:cursor-not-allowed"
            style={{ maxHeight: "140px", overflowY: "auto" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || !isConnected}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 btn-lift"
            style={{
              background: input.trim() && !isLoading && isConnected
                ? "linear-gradient(135deg, #10b981, #06b6d4)"
                : "rgba(255,255,255,0.07)",
              boxShadow: input.trim() && !isLoading && isConnected
                ? "0 4px 16px rgba(16,185,129,0.3)"
                : "none",
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
