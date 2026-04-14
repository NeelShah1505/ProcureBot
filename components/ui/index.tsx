"use client";
import React from "react";
import { cn } from "@/lib/utils";

// Aceternity-style Moving Border Button
export function MovingBorderButton({
  children,
  className,
  containerClassName,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <div className={cn("relative inline-flex", containerClassName)}>
      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-violet-500 opacity-75 blur-sm animate-pulse" />
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3",
          "bg-[#0a0a1a] text-sm font-semibold text-white",
          "border border-white/10 transition-all duration-200",
          "hover:bg-[#0f0f2a] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {children}
      </button>
    </div>
  );
}

// Aceternity-style Glowing Button (secondary)
export function GlowButton({
  children,
  className,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400",
    secondary: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400",
    ghost: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5",
        "border text-sm font-medium transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

// Badge component
export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) {
  const variants = {
    default: "bg-white/10 text-white/70 border-white/10",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    error: "bg-red-500/15 text-red-400 border-red-500/30",
    info: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Aceternity-style Card with hover glow
export function GlowCard({
  children,
  className,
  glowColor = "emerald",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "emerald" | "cyan" | "violet";
}) {
  const glows = {
    emerald: "hover:shadow-emerald-500/10",
    cyan: "hover:shadow-cyan-500/10",
    violet: "hover:shadow-violet-500/10",
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm",
        "transition-all duration-300 hover:border-white/20 hover:shadow-lg",
        glows[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}
