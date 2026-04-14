"use client";
import React from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Bot, DollarSign,
  TrendingUp, Search, Zap, ShieldCheck, Eye, Cpu,
} from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

/* ─── Types ─────────────────────────────────────────────────────── */
type RGB = string; // e.g. "16,185,129"



/* ─── Shared section container ──────────────────────────────────── */
function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ padding: "80px 0", ...style }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>
        {children}
      </div>
    </section>
  );
}

/* ─── Feature card ──────────────────────────────────────────────── */
function Feature({ icon: Icon, title, desc, rgb }: {
  icon: React.ElementType; title: string; desc: string; rgb: RGB;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: 24,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `rgba(${rgb},0.12)`,
        border: `1px solid rgba(${rgb},0.25)`,
      }}>
        <Icon style={{ width: 20, height: 20, color: `rgb(${rgb})` }} />
      </div>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>{title}</h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Steps ─────────────────────────────────────────────────────── */
function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div style={{
        width: 40, height: 40, borderRadius: 999, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)",
        fontSize: 14, fontWeight: 700, color: "#10b981",
      }}>{num}</div>
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{title}</h4>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Provider pill ─────────────────────────────────────────────── */
function Pill({ name, rgb }: { name: string; rgb: RGB }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
      background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.22)`,
      color: `rgb(${rgb})`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: `rgb(${rgb})`, display: "inline-block" }} />
      {name}
    </span>
  );
}

/* ─── Fake browser chrome for dashboard preview ─────────────────── */
function PreviewCard({ label, sub, rgb }: { label: string; sub: string; rgb: RGB }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 16, textAlign: "center",
      background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.2)`,
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: 11, color: `rgba(${rgb},0.6)`, margin: 0 }}>{sub}</p>
    </div>
  );
}

/* ─── Landing Page ──────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <AnimatedBackground />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

        {/* ── Nav ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 60,
          background: "rgba(5,5,16,0.82)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)",
            }}>
              <Sparkles style={{ width: 16, height: 16, color: "#10b981" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>ProcureBot</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a
              href="https://github.com/NeelShah1505/ProcureBot"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
            >GitHub</a>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 20px", borderRadius: 12,
                fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none",
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              }}
            >Launch App <ArrowRight style={{ width: 15, height: 15 }} /></Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: "100px 24px 60px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "5px 14px", borderRadius: 999, marginBottom: 28,
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              fontSize: 12, color: "rgba(16,185,129,0.8)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
              Built for Locus Paygentic Hackathon
            </div>

            <h1 style={{
              fontSize: "clamp(38px, 6vw, 60px)", fontWeight: 800,
              color: "#fff", lineHeight: 1.1, margin: "0 0 20px",
              letterSpacing: "-0.02em",
            }}>
              Your AI agent that<br />
              <span style={{
                background: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>buys what it needs</span>
            </h1>

            <p style={{
              fontSize: 17, color: "rgba(255,255,255,0.42)",
              lineHeight: 1.6, margin: "0 0 36px", maxWidth: 520, marginLeft: "auto", marginRight: "auto",
            }}>
              ProcureBot autonomously purchases real-time data, AI research &amp; generated media —
              paying micro-amounts of USDC per request. Your wallet, your rules.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 28px", borderRadius: 16,
                  fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 6px 30px rgba(16,185,129,0.35)",
                }}
              >
                Try ProcureBot <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Dashboard preview ── */}
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{
              borderRadius: 20, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.07)",
            }}>
              {/* Browser chrome */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                {["#ff5f56","#ffbd2e","#27c93f"].map((c) => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: 999, background: c, opacity: 0.6 }} />
                ))}
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8, fontFamily: "monospace" }}>
                  localhost:3000/dashboard
                </span>
              </div>
              {/* Preview content */}
              <div style={{
                background: "rgba(6,6,20,0.95)", padding: "40px 32px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
              }}>
                <Bot style={{ width: 52, height: 52, color: "rgba(16,185,129,0.6)" }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                    What shall I procure for you?
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    Ask about crypto prices, research topics, or generate images
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, width: "100%", maxWidth: 520 }}>
                  <PreviewCard label="SOL Price" sub="Live data" rgb="16,185,129" />
                  <PreviewCard label="Research AI" sub="Web search" rgb="6,182,212" />
                  <PreviewCard label="Gen Image" sub="DALL·E" rgb="236,72,153" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Providers ── */}
        <Section style={{ paddingTop: 0, paddingBottom: 72 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>
              9+ APIs. One wallet.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
              ProcureBot routes your requests to the best provider and pays via Locus automatically.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 24 }}>
            <Pill name="CoinGecko"   rgb="16,185,129" />
            <Pill name="Tavily"      rgb="6,182,212" />
            <Pill name="OpenAI"      rgb="59,130,246" />
            <Pill name="Groq"        rgb="245,158,11" />
            <Pill name="Perplexity"  rgb="139,92,246" />
            <Pill name="Replicate"   rgb="236,72,153" />
            <Pill name="Brave Search" rgb="249,115,22" />
          </div>
        </Section>

        {/* ── Features ── */}
        <Section>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>
              Everything you need.<br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>Nothing you don&apos;t.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <Feature icon={Cpu}        title="AI-Powered Routing"     desc="Groq LLM intelligently selects the right API for each request — no manual configuration needed." rgb="16,185,129" />
            <Feature icon={DollarSign} title="USDC Micro-Payments"     desc="Each API call costs fractions of a cent. Real USDC on Base chain, fully transparent receipts." rgb="6,182,212" />
            <Feature icon={ShieldCheck} title="Your Rules, Always"    desc="Set spending caps, per-transaction limits, and allowed providers. The agent never exceeds your policies." rgb="139,92,246" />
            <Feature icon={Eye}        title="Real-Time Receipts"      desc="Every transaction logged with provider, endpoint, cost, and timestamp. Full audit trail in your sidebar." rgb="245,158,11" />
            <Feature icon={Bot}        title="Natural Language"        desc="Just ask in plain English. ProcureBot understands 'Get SOL price' or 'Research the latest AI news'." rgb="236,72,153" />
            <Feature icon={Zap}        title="Blazing Fast"            desc="Groq inference for routing + cached providers. Most responses arrive in under 3 seconds." rgb="249,115,22" />
          </div>
        </Section>

        {/* ── How it works ── */}
        <Section style={{ paddingTop: 60 }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#fff", textAlign: "center", margin: "0 0 48px" }}>
            How it works
          </h2>
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
            <Step num="1" title="You ask a question"                 desc="Type any query — crypto prices, AI research, image generation, web search, or market analysis." />
            <Step num="2" title="ProcureBot routes intelligently"    desc="The Groq LLM analyzes your request and selects the optimal Locus-wrapped API endpoint automatically." />
            <Step num="3" title="USDC is paid automatically"         desc="A micro-payment of $0.005–$0.025 USDC is authorized and sent via the Locus Machine Payments Protocol on Base." />
            <Step num="4" title="You get your answer"                desc="Formatted results appear in the chat with a full receipt — provider, cost, and transaction ID." />
          </div>
        </Section>

        {/* ── CTA ── */}
        <Section style={{ paddingBottom: 100 }}>
          <div style={{
            maxWidth: 680, margin: "0 auto", textAlign: "center",
            padding: "56px 40px", borderRadius: 28,
            background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))",
            border: "1px solid rgba(16,185,129,0.2)",
          }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>
              Ready to see autonomous procurement?
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: "0 0 32px" }}>
              Launch the dashboard and try a query. Each request uses real USDC —
              start with a funded Locus wallet on Base.
            </p>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 16,
                fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none",
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 6px 30px rgba(16,185,129,0.35)",
              }}
            >
              Launch ProcureBot <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
          </div>
        </Section>

        {/* ── Footer ── */}
        <footer style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles style={{ width: 14, height: 14, color: "rgba(16,185,129,0.5)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>ProcureBot</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "PayWithLocus", href: "https://paywithlocus.com" },
              { label: "GitHub", href: "https://github.com/NeelShah1505/ProcureBot" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}
