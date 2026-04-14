"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Power, Wallet, Shield, Zap } from "lucide-react";
import { Badge, GlowCard } from "@/components/ui";

const SAMPLE_POLICIES = [
  {
    icon: Wallet,
    label: "Max per transaction",
    value: "$0.50 USDC",
    status: "active",
  },
  {
    icon: Shield,
    label: "Daily spending cap",
    value: "$15.00 USDC",
    status: "active",
  },
  {
    icon: Zap,
    label: "Auto-approve under",
    value: "$0.10 USDC",
    status: "active",
  },
  {
    icon: CheckCircle2,
    label: "Allowed providers",
    value: "CoinGecko, Tavily, OpenAI",
    status: "active",
  },
];

interface PolicyPanelProps {
  isConnected: boolean;
  walletAddress?: string;
  balance?: string;
}

export default function PolicyPanel({
  isConnected,
  walletAddress,
  balance,
}: PolicyPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Agent Status */}
      <GlowCard className="p-4" glowColor="emerald">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Agent Status
          </span>
          <Badge variant={isConnected ? "success" : "error"}>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              )}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-white/40 mb-0.5">Agent Name</p>
            <p className="text-sm font-semibold text-white">ProcureBot Agent</p>
          </div>
          {walletAddress && (
            <div>
              <p className="text-xs text-white/40 mb-0.5">Wallet</p>
              <p className="text-xs font-mono text-emerald-400 truncate">
                {walletAddress}
              </p>
            </div>
          )}
          {balance && (
            <div>
              <p className="text-xs text-white/40 mb-0.5">Balance</p>
              <p className="text-base font-bold text-emerald-400">
                {balance} <span className="text-xs text-white/40">USDC</span>
              </p>
            </div>
          )}
        </div>
      </GlowCard>

      {/* Spending Policies */}
      <GlowCard className="p-4 flex-1" glowColor="cyan">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Spending Policies
          </span>
          <a
            href="https://app.paywithlocus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Edit →
          </a>
        </div>

        <div className="space-y-3">
          {SAMPLE_POLICIES.map((policy, i) => {
            const Icon = policy.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/3 border border-white/5"
              >
                <div className="mt-0.5 p-1.5 rounded-md bg-cyan-500/10">
                  <Icon className="h-3 w-3 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50">{policy.label}</p>
                  <p className="text-xs font-semibold text-white truncate">
                    {policy.value}
                  </p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </GlowCard>

      {/* Provider Badges */}
      <GlowCard className="p-4" glowColor="violet">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
          Enabled Providers
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            "CoinGecko",
            "Tavily",
            "OpenAI",
            "Perplexity",
            "Replicate",
            "Groq",
          ].map((provider) => (
            <Badge key={provider} variant="info" className="text-[10px]">
              <Power className="h-2 w-2" />
              {provider}
            </Badge>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
