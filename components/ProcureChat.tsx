"use client";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  Bot,
  User,
  Loader2,
  TrendingUp,
  Search,
  Image as ImageIcon,
  Zap,
  Sparkles,
} from "lucide-react";
import { Badge, GlowCard } from "@/components/ui";
import { Receipt } from "@/components/ReceiptCard";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: string[];
  receipt?: Receipt;
  timestamp: string;
  isLoading?: boolean;
}

// Quick-action prompt examples
const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "SOL Price", prompt: "Get the current SOL price and analyze the trend" },
  { icon: Search, label: "Research AI", prompt: "Research the latest news about AI agents and summarize" },
  { icon: ImageIcon, label: "Gen Image", prompt: "Generate an image of a futuristic crypto wallet" },
  { icon: Zap, label: "ETH Data", prompt: "Fetch ETH price data and compare with BTC" },
];

function ThinkingStep({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/40 py-0.5">
      <div className="h-1 w-1 rounded-full bg-emerald-400/60 animate-pulse flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (message.isLoading) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <GlowCard className="flex-1 p-3.5 max-w-[85%]" glowColor="emerald">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            <span className="text-xs text-emerald-400 font-medium">ProcureBot is thinking…</span>
          </div>
          {message.steps && message.steps.map((step, i) => (
            <ThinkingStep key={i} text={step} />
          ))}
        </GlowCard>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border",
          isUser
            ? "bg-violet-500/20 border-violet-500/30"
            : "bg-emerald-500/20 border-emerald-500/30"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-violet-400" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-emerald-400" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", isUser && "items-end")}>
        {/* Steps (reasoning) */}
        {!isUser && message.steps && message.steps.length > 0 && (
          <div className="w-full space-y-0.5 px-1">
            {message.steps.map((step, i) => (
              <ThinkingStep key={i} text={step} />
            ))}
          </div>
        )}

        {/* Message */}
        <GlowCard
          className={cn("p-3.5", isUser ? "bg-violet-500/10 border-violet-500/20" : "")}
          glowColor={isUser ? "violet" : "emerald"}
        >
          <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          {message.receipt && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px]">
                <Badge variant="success">
                  <Sparkles className="h-2.5 w-2.5" />
                  Procured via {message.receipt.provider}
                </Badge>
                <span className="text-emerald-400 font-bold">
                  −{message.receipt.cost} USDC
                </span>
              </div>
            </div>
          )}
        </GlowCard>

        <span suppressHydrationWarning className="text-[10px] text-white/25 px-1">
          {typeof window !== "undefined" ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </span>
      </div>
    </div>
  );
}

interface ProcureChatProps {
  onReceiptAdded: (receipt: Receipt) => void;
  isConnected: boolean;
}

export default function ProcureChat({ onReceiptAdded, isConnected }: ProcureChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hello! I'm ProcureBot — your autonomous AI procurement agent.\n\nI can buy real-time data, research, images, and more — paying micro-amounts of USDC automatically via Locus.\n\nTry: \"Get the current SOL price\" or \"Research AI agents\". What shall I procure?",
      timestamp: "2026-04-14T00:00:00.000Z",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
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
      steps: ["Analyzing request…"],
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate progressive steps
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    const steps = [
      "Analyzing request…",
      "Selecting best Locus provider…",
      "Authorizing USDC spend…",
      "Calling wrapped API…",
    ];

    steps.forEach((step, i) => {
      stepTimers.push(
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loadingId
                ? { ...m, steps: steps.slice(0, i + 1) }
                : m
            )
          );
        }, i * 700)
      );
    });

    try {
      const res = await fetch("/api/procure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();
      stepTimers.forEach(clearTimeout);

      if (data.receipt) {
        onReceiptAdded(data.receipt);
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || data.error || "An error occurred.",
        steps: data.steps || [],
        receipt: data.receipt,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => prev.filter((m) => m.id !== loadingId).concat(assistantMsg));
    } catch {
      stepTimers.forEach(clearTimeout);
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "⚠️ Failed to connect to the procurement backend. Make sure the server is running.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => prev.filter((m) => m.id !== loadingId).concat(errMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK_PROMPTS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              onClick={() => sendMessage(p.prompt)}
              disabled={isLoading || !isConnected}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                "border border-white/10 bg-white/5 text-white/60",
                "hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <Icon className="h-3 w-3" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 blur-sm" />
        <div className="relative flex items-end gap-2 rounded-xl border border-white/10 bg-[#08081a]/90 p-3 backdrop-blur-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected
                ? 'Type a request… e.g. "Get SOL price and analyze"'
                : "Connect your Locus API key to start…"
            }
            disabled={!isConnected || isLoading}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30",
              "focus:outline-none leading-relaxed max-h-32 overflow-y-auto",
              "disabled:cursor-not-allowed"
            )}
            style={{ fieldSizing: "content" } as React.CSSProperties & { fieldSizing?: string }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || !isConnected}
            className={cn(
              "flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
              "bg-emerald-500 text-white hover:bg-emerald-400",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/10"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-1.5 text-center">
          Enter to send · Shift+Enter for newline · Each message may spend tiny USDC
        </p>
      </div>
    </div>
  );
}
