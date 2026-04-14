# 🤖 ProcureBot — AI Procurement Agent

> Your AI procurement agent that autonomously buys digital services & APIs — with your money, your rules.

**Built for Locus Paygentic Hackathon #1** | [Live Demo](#deployment) | [GitHub](https://github.com/NeelShah1505/ProcureBot)

---

## ✨ What is ProcureBot?

ProcureBot is a fully autonomous AI agent that can **buy data, research, and media** on your behalf — paying micro-amounts of **USDC automatically** via [PayWithLocus](https://paywithlocus.com).

Just type what you need in plain English:
- _"Get the current SOL price and analyze the trend"_ → CoinGecko data, ~$0.001 USDC
- _"Research the latest AI agents news and summarize"_ → Tavily web search, ~$0.01 USDC  
- _"Generate an image of a futuristic crypto wallet"_ → OpenAI DALL·E, ~$0.05 USDC

The agent selects the best wrapped API, pays autonomously, and shows you a **live receipt** with the USDC cost.

---

## 🚀 One-Click Setup

```bash
git clone https://github.com/NeelShah1505/ProcureBot.git
cd ProcureBot
npm install
```

Add your Locus API key to `.env.local`:
```bash
cp .env.example .env.local
# Edit .env.local and add: LOCUS_API_KEY=claw_dev_YOUR_KEY_HERE
```

Run:
```bash
npm run dev
# → http://localhost:3000
```

---

## 🔑 How to Get Your Locus API Key

1. Sign up at [app.paywithlocus.com](https://app.paywithlocus.com)
2. Create a wallet and fund it with USDC
3. Generate an API key (starts with `claw_dev_`)
4. Paste it into `.env.local`

For the hackathon, use the $15 credit grant. Docs: [docs.paywithlocus.com](https://docs.paywithlocus.com)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + custom glassmorphism |
| UI Components | Aceternity UI-inspired components |
| Background | Custom canvas animation (React Bits inspired) |
| AI/Data APIs | CoinGecko, Tavily, OpenAI, Groq (via Locus) |
| Payments | USDC on Base via PayWithLocus wrapped APIs |
| Deployment | Vercel |

---

## 🌐 Locus Wrapped APIs Used

| Provider | Endpoint | Used For | Est. Cost |
|----------|----------|----------|-----------|
| CoinGecko | `simple-price` | Crypto price data | ~$0.001 USDC |
| Tavily | `search` | Web research & news | ~$0.01 USDC |
| OpenAI | `image-generate` | Image generation | ~$0.05 USDC |
| Groq | `chat` | Fast AI inference (Llama 3) | ~$0.002 USDC |
| Perplexity | `chat` | AI-powered research | ~$0.015 USDC |

All paid automatically via: `https://api.paywithlocus.com/api/wrapped/<provider>/<endpoint>`

---

## 🏗️ Project Structure

```
procurebot/
├── app/
│   ├── layout.tsx          # Root layout + Inter font + SEO
│   ├── page.tsx            # Main 3-column dashboard
│   ├── globals.css         # Dark theme + glassmorphism CSS
│   └── api/
│       └── procure/
│           └── route.ts    # Main procurement endpoint (GET + POST)
├── components/
│   ├── ui/
│   │   ├── index.tsx       # GlowCard, Badge, MovingBorderButton
│   │   └── AnimatedBackground.tsx  # Canvas particles + Spotlight
│   ├── ProcureChat.tsx     # Chat interface with thinking steps
│   ├── PolicyPanel.tsx     # Left sidebar with spending policies
│   ├── ReceiptCard.tsx     # Right sidebar live receipt feed
│   └── LocusConnect.tsx    # Agent connection status
└── lib/
    ├── locus.ts            # All Locus API helpers
    └── utils.ts            # cn() utility
```

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel deploy
# Add LOCUS_API_KEY environment variable in Vercel dashboard
```

Or click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NeelShah1505/ProcureBot)

---

## 🎬 Demo Script (60-second Loom)

1. **[0-5s]** Show landing page — dark UI, animated particle background, ProcureBot header
2. **[5-15s]** Point out connection banner showing "Connected as ProcureBot Agent" + wallet balance
3. **[15-30s]** Type "Get the current SOL price" — show thinking steps animating, then result with price data + green receipt badge
4. **[30-45s]** Click "Research AI" quick button — show Tavily search completing with source links + receipt feed updating
5. **[45-60s]** Show receipt panel on the right — highlight USDC costs, timestamps, provider names. End with: "ProcureBot — autonomous procurement, real payments, zero friction."

---

## 📸 Screenshots

_[Add screenshots after deployment]_

---

## 🏆 Hackathon Submission

- **Event**: Locus Paygentic Hackathon #1
- **Built in**: <12 hours
- **Prize target**: $600

---

*Built with ❤️ using [PayWithLocus](https://paywithlocus.com) — payment infrastructure for AI agents.*
