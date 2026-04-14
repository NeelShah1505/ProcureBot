"use client";
import React from "react";
import { cn } from "@/lib/utils";

// ─── GlowCard ────────────────────────────────────────────────────────────────
interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "emerald" | "cyan" | "violet" | "none";
  hover?: boolean;
}

const glowMap = {
  emerald: "hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/20",
  cyan:    "hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]  hover:border-cyan-500/20",
  violet:  "hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] hover:border-violet-500/20",
  none:    "",
};

export function GlowCard({ children, className, glowColor = "emerald", hover = true }: GlowCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-xl overflow-hidden",
        "transition-all duration-300",
        hover && glowMap[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
}

const badgeVariants = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/15  text-amber-400  border-amber-500/25",
  error:   "bg-red-500/15    text-red-400    border-red-500/25",
  info:    "bg-cyan-500/15   text-cyan-400   border-cyan-500/25",
  neutral: "bg-white/8       text-white/60   border-white/10",
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        "border tracking-wide uppercase",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── GlowButton ──────────────────────────────────────────────────────────────
interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "emerald" | "violet" | "ghost";
  className?: string;
  type?: "button" | "submit";
}

export function GlowButton({
  children, onClick, disabled, variant = "emerald", className, type = "button"
}: GlowButtonProps) {
  const variants = {
    emerald: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25",
    violet:  "bg-violet-600  hover:bg-violet-500  text-white shadow-lg shadow-violet-500/25",
    ghost:   "bg-white/8     hover:bg-white/12    text-white/80 border border-white/10",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl",
        "text-sm font-semibold transition-all duration-200 btn-lift",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

// ─── MovingBorderButton ───────────────────────────────────────────────────────
export function MovingBorderButton({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-2.5 rounded-xl",
        "text-sm font-semibold text-white",
        "bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20",
        "border border-emerald-500/30 hover:border-emerald-500/60",
        "transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20",
        className
      )}
    >
      {children}
    </button>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}
