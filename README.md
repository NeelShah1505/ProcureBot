# ProcureBot 🤖💸

[![Live Demo](https://img.shields.io/badge/Live_Demo-procure--bot--one.vercel.app-10b981?style=for-the-badge)](https://procure-bot-one.vercel.app)

> **The first AI agent that autonomously buys what it needs — paying with real USDC.**

Built for the **Locus Paygentic Hackathon**, ProcureBot demonstrates the future of machine-to-machine payments. Ask it anything in natural language; it routes to the best API provider, authorizes a micro-USDC payment via the Locus Machine Payments Protocol, and delivers the result — all in seconds.

---

## ✨ What it does

ProcureBot lets a simple text prompt trigger a full AI procurement cycle:

```
"Get the current Solana price"
  → Groq LLM routes to CoinGecko
  → $0.01 USDC authorized & paid via Locus
  → Live price data rendered in chat
  → Receipt logged with txHash
```

No manual API key management. No manual payments. One wallet, your rules.

---

## 🖥️ App Pages

| Route | Page |
|---|---|
| `/` | Landing Page — animated particle background, feature grid, CTA |
| `/dashboard` | 3-column procurement dashboard — Policy Panel · Chat · Receipt Feed |

---

## 🏗️ Architecture

```
User prompt
    │
    ▼
┌──────────────────────────────┐
│  Groq LLM Router             │  ← llama-3.3-70b-versatile
│  "Which tool should I use?"  │
└──────────────┬───────────────┘
               │
       ┌───────▼────────┐
       │  Tool Selected  │
       └───────┬────────┘
               │
┌──────────────▼───────────────────────────────┐
│   Locus Machine Payments Protocol             │
│   callWrappedEndpoint(provider, endpoint, {}) │
│   → USDC micro-payment authorized             │
│   → API call executed                         │
│   → txHash returned                           │
└──────────────┬───────────────────────────────┘
               │
       ┌───────▼────────┐
       │  Formatted      │
       │  Response +     │
       │  Receipt        │
       └────────────────┘
```

---

## 🔌 Supported Providers

| Provider | What it does | Est. Cost |
|---|---|---|
| **CoinGecko** | Live crypto prices, market data, trending coins | $0.005–0.01 |
| **Tavily** | Real-time web research & news search | $0.01 |
| **OpenAI DALL·E** | Image generation from prompts (rendered inline) | $0.025 |
| **OpenAI Chat** | GPT-4o-mini for analysis & writing | $0.01 |
| **Groq** | Llama 3.3 for routing + fast answers | Free |
| **Replicate** | Open source image/media models | $0.01+ |
| **Perplexity** | AI-powered web search | $0.01 |

---

## ⚡ Quick Start

### 1. Clone & install

```bash
git clone https://github.com/NeelShah1505/ProcureBot.git
cd ProcureBot/procurebot
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required — get at https://beta.paywithlocus.com
LOCUS_API_KEY=claw_dev_YOUR_KEY_HERE

# Required for AI routing
GROQ_API_KEY=gsk_YOUR_GROQ_KEY

# Required for image generation
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY

# Required for web research
TAVILY_API_KEY=tvly-YOUR_TAVILY_KEY
```

### 3. Run

```bash
npm run dev
```

Open **http://localhost:3000** 🚀

---

## 🔑 Getting API Keys

| Key | Where | Free tier? |
|---|---|---|
| `LOCUS_API_KEY` | [beta.paywithlocus.com](https://beta.paywithlocus.com) | Yes — hackathon credits |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Yes |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) | Paid |
| `TAVILY_API_KEY` | [tavily.com](https://tavily.com) | Yes — 1000 free/mo |

> **Fund your Locus wallet**: After creating your account, send USDC on Base to your agent wallet address. The balance reflects live in the dashboard left panel.

---

## 🧪 Demo Walkthrough

### Step 1 — Landing Page
Visit `localhost:3000`. Scroll through the marketing page (animated particle background). Click **"Try ProcureBot →"**.

### Step 2 — Verify connection
Top-right pill shows: `✦ Agent Connected · 4.374 USDC` ✅

### Step 3 — Try a crypto price query
Click **"SOL Price"** card or type:
```
Get the current Solana price with 24h analysis
```
Watch the live thinking steps:
- `🧠 Groq selected: coingecko_price — real-time market data needed`
- `💳 Requesting $0.01 USDC spend authorization…`
- `🌐 Calling CoinGecko API…`
- `✅ Success — formatting results…`
- `💸 Paid $0.01 USDC`

### Step 4 — Verify the receipt
Right panel: **Session Spend +$0.01** · receipt card shows provider, endpoint, cost & timestamp.

### Step 5 — Generate an image
Click **"Gen Image"** or type:
```
Generate an image of a futuristic robot paying with crypto on the blockchain
```
The actual rendered image appears inline in the chat bubble — not just a link.

### Step 6 — Edit spending policies
In the left panel, **click any policy value** (e.g. `$0.50 USDC` next to Max/tx). An inline editor appears. Change it, press **Enter** to save or **Escape** to cancel.

### Step 7 — Research query
Click **"Research AI"** or type:
```
What is the latest news about AI agents this week?
```
Tavily performs live web research and returns a structured summary with source links.

---

## 📁 Project Structure

```
procurebot/
├── app/
│   ├── page.tsx                 # Landing page (scrollable)
│   ├── dashboard/page.tsx       # 3-column dashboard (viewport-locked)
│   ├── layout.tsx               # Root layout + Google Fonts
│   ├── globals.css              # Design tokens, animations, scrollbar
│   └── api/procure/route.ts     # Core procurement API route
│       ├── routeWithGroq()      # LLM-powered tool selection
│       ├── ruleBasedRoute()     # Fallback regex router
│       └── fmtPrice/fmtImage/fmtTavily… formatters
├── components/
│   ├── ProcureChat.tsx          # Chat UI, markdown renderer, image handler
│   ├── PolicyPanel.tsx          # Left sidebar with inline-editable policies
│   ├── ReceiptCard.tsx          # Transaction receipt feed
│   ├── LocusConnect.tsx         # Live connection + balance pill
│   └── ui/
│       ├── AnimatedBackground.tsx   # Canvas: particles + glowing orbs
│       ├── GlowCard.tsx
│       └── index.tsx
└── lib/
    └── locus.ts                 # Locus SDK: getBalance, callWrappedEndpoint, groqChat
```

---

## 🔐 Spending Controls

All spending is governed by policies enforced by the Locus platform:

| Policy | Default | Description |
|---|---|---|
| **Max per tx** | $0.50 USDC | Hard cap per single API call |
| **Daily cap** | $15.00 USDC | Maximum total spend per day |
| **Auto-approve** | < $0.10 USDC | Instant transactions under threshold |
| **Providers** | 6 enabled | CoinGecko, Tavily, OpenAI, Groq, Perplexity, Replicate |

> Transactions above the auto-approve threshold return an `approvalUrl` — a manual confirmation link shown directly in the chat.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.3 (Turbopack) |
| Language | TypeScript |
| Styling | Vanilla CSS + Tailwind v4 |
| Animations | CSS keyframes + HTML Canvas API |
| AI Routing | Groq — llama-3.3-70b-versatile |
| Payments | Locus Machine Payments Protocol (USDC on Base) |
| Icons | Lucide React |

---

## 🌐 How Locus Works

The Locus Machine Payments Protocol wraps external APIs with an on-chain payment layer on **Base (Ethereum L2)**. When ProcureBot calls:

```ts
await callWrappedEndpoint("coingecko", "simple-price", { ids: "solana", vs_currencies: "usd" })
```

1. Locus checks your agent wallet's USDC balance on Base
2. If sufficient and within policy → spend is authorized
3. The wrapped API call executes server-side
4. A `txHash` and `cost` are returned alongside the data
5. Your balance decreases by the exact fractional USDC cost

Every purchase is **transparent**, **on-chain verifiable**, and **policy-governed**.

---

## 🏆 Built For

**Locus Paygentic Hackathon** — Showcasing the power of machine-initiated micro-payments for AI agents.

> *"What if AI agents could pay for what they need, when they need it — just like a human with a credit card, but fully autonomous and on-chain?"*

---

<div align="center">
  <strong>ProcureBot</strong> · Built with ❤️ on <a href="https://paywithlocus.com">Locus</a>
</div>
