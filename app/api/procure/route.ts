import { NextRequest, NextResponse } from "next/server";
import {
  getBalance,
  callWrappedEndpoint,
  groqChat,
} from "@/lib/locus";

// ─── Types ────────────────────────────────────────────────────────────────────
type ToolName =
  | "coingecko_price"
  | "coingecko_data"
  | "coingecko_trending"
  | "coingecko_global"
  | "coingecko_markets"
  | "tavily_search"
  | "openai_image"
  | "openai_chat"
  | "groq_chat";

interface RoutingDecision {
  tool: ToolName;
  coinId?: string;
  query?: string;
  reason: string;
  estCost: string;
}

// ─── Groq-powered intelligent router ─────────────────────────────────────────
async function routeWithGroq(message: string): Promise<RoutingDecision> {
  const systemPrompt = `You are a tool router for ProcureBot. Given a user message, decide which tool to use.
Available tools (respond with EXACTLY this JSON, nothing else):
- coingecko_price: for current price of a specific coin. Include coinId (e.g. "bitcoin","ethereum","solana","bnb","cardano","dogecoin","polkadot","chainlink","avalanche-2","polygon").
- coingecko_data: for detailed coin info, market cap, volume, all-time highs. Include coinId.
- coingecko_trending: for trending/hot coins right now. No extra params.
- coingecko_global: for overall crypto market stats. No extra params.
- coingecko_markets: for top coins by market cap. No extra params.
- tavily_search: for web research, news, current events, "what is X", summaries. Include query.
- openai_image: for generating/creating images, illustrations. Include query as the image prompt.
- openai_chat: for coding help, writing, analysis, calculations. Include query.
- groq_chat: for fast general questions, explanations. Include query.

Respond with valid JSON only:
{"tool":"<tool_name>","coinId":"<only if coin tool>","query":"<full user message or refined prompt>","reason":"<1 sentence why>","estCost":"<$0.001–$0.05>"}`;

  try {
    const result = await groqChat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      "llama-3.3-70b-versatile"
    );

    if (result.ok) {
      const raw = result.data as { choices?: Array<{ message: { content: string } }> };
      const text = raw.choices?.[0]?.message?.content ?? "";
      // Extract JSON from response
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as RoutingDecision;
        return parsed;
      }
    }
  } catch {
    // fall through to rule-based
  }

  // Fallback: rule-based
  return ruleBasedRoute(message);
}

function ruleBasedRoute(message: string): RoutingDecision {
  const lower = message.toLowerCase();

  // Image generation
  if (/\b(generat|creat|draw|make|design|paint|render)\b.*\b(image|img|picture|art|illustration|photo|visual)\b/i.test(message) ||
    /\b(image|picture|art)\b.*\b(of|for|showing)\b/i.test(message)) {
    return { tool: "openai_image", query: message, reason: "Image generation request", estCost: "$0.04" };
  }

  // Crypto market global
  if (/\b(market|crypto market|total market|global|overall|btc dominance)\b/i.test(message) &&
    !/\b(bitcoin|eth|sol)\b.*\bprice\b/i.test(message)) {
    return { tool: "coingecko_global", reason: "Crypto market overview", estCost: "$0.001" };
  }

  // Trending
  if (/\b(trend|hot|top coin|best coin|pumping|rising|what.*(coin|crypto))\b/i.test(message)) {
    return { tool: "coingecko_trending", reason: "Trending coins request", estCost: "$0.001" };
  }

  // Specific coin price
  const coinMap: Record<string, string> = {
    bitcoin: "bitcoin", btc: "bitcoin",
    ethereum: "ethereum", eth: "ethereum",
    solana: "solana", sol: "solana",
    bnb: "binancecoin", "binance coin": "binancecoin",
    cardano: "cardano", ada: "cardano",
    dogecoin: "dogecoin", doge: "dogecoin",
    polkadot: "polkadot", dot: "polkadot",
    chainlink: "chainlink", link: "chainlink",
    avalanche: "avalanche-2", avax: "avalanche-2",
    polygon: "matic-network", matic: "matic-network",
    xrp: "ripple", ripple: "ripple",
    shiba: "shiba-inu", shib: "shiba-inu",
  };
  for (const [kw, id] of Object.entries(coinMap)) {
    if (lower.includes(kw)) {
      const wantsDetail = /\b(detail|info|data|about|market cap|volume|all.time|history)\b/i.test(message);
      return {
        tool: wantsDetail ? "coingecko_data" : "coingecko_price",
        coinId: id,
        reason: `Fetching ${id} ${wantsDetail ? "detailed data" : "price"} from CoinGecko`,
        estCost: "$0.001",
      };
    }
  }

  // Research / web
  if (/\b(research|find|search|news|latest|summarize|what is|how does|explain|article|recent)\b/i.test(message)) {
    return { tool: "tavily_search", query: message, reason: "Web research via Tavily", estCost: "$0.01" };
  }

  // Default: Groq fast AI
  return { tool: "groq_chat", query: message, reason: "General AI via Groq (Llama 3)", estCost: "$0.002" };
}

// ─── Response formatters ──────────────────────────────────────────────────────

function fmtPrice(data: unknown, coinId: string): string {
  try {
    const d = data as Record<string, Record<string, number>>;
    const coin = d[coinId];
    if (!coin) return `No price data found for ${coinId}.`;
    const price = coin.usd;
    const change = coin.usd_24h_change;
    const cap = coin.usd_market_cap;
    const vol = coin.usd_24h_vol;
    const name = coinId.charAt(0).toUpperCase() + coinId.slice(1);
    const arrow = change >= 0 ? "📈" : "📉";
    const changeSign = change >= 0 ? "+" : "";
    return [
      `${arrow} **${name} Price Update**`,
      ``,
      `💰 Price: **$${price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}**`,
      change !== undefined ? `📊 24h Change: **${changeSign}${change.toFixed(2)}%**` : null,
      cap ? `🏦 Market Cap: **$${(cap / 1e9).toFixed(2)}B**` : null,
      vol ? `📉 24h Volume: **$${(vol / 1e9).toFixed(2)}B**` : null,
      ``,
      `_Data from CoinGecko via Locus · Updated just now_`,
    ].filter(Boolean).join("\n");
  } catch { return `Received price data: ${JSON.stringify(data).slice(0, 300)}`; }
}

function fmtCoinData(data: unknown, coinId: string): string {
  try {
    type CoinData = {
      name?: string; symbol?: string;
      market_data?: {
        current_price?: Record<string, number>;
        market_cap?: Record<string, number>;
        total_volume?: Record<string, number>;
        price_change_percentage_24h?: number;
        price_change_percentage_7d?: number;
        price_change_percentage_30d?: number;
        ath?: Record<string, number>;
        ath_change_percentage?: Record<string, number>;
        circulating_supply?: number;
      };
      description?: { en?: string };
    };
    const d = data as CoinData;
    const md = d.market_data;
    const name = d.name ?? coinId;
    const symbol = (d.symbol ?? "").toUpperCase();
    const price = md?.current_price?.usd;
    const ch24 = md?.price_change_percentage_24h;
    const ch7 = md?.price_change_percentage_7d;
    const ch30 = md?.price_change_percentage_30d;
    const cap = md?.market_cap?.usd;
    const vol = md?.total_volume?.usd;
    const ath = md?.ath?.usd;
    const athChg = md?.ath_change_percentage?.usd;
    const supply = md?.circulating_supply;
    const desc = d.description?.en?.replace(/<[^>]+>/g, "").slice(0, 200);
    const fmt = (n?: number) => n !== undefined ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : "N/A";
    const fmtPct = (n?: number) => n !== undefined ? `${n >= 0 ? "+" : ""}${n.toFixed(2)}%` : "N/A";

    return [
      `🔎 **${name} (${symbol}) — Full Market Data**`,
      ``,
      `💰 Price: **${fmt(price)}**`,
      ch24 !== undefined ? `📊 24h: **${fmtPct(ch24)}** · 7d: **${fmtPct(ch7)}** · 30d: **${fmtPct(ch30)}**` : null,
      cap ? `🏦 Market Cap: **$${(cap / 1e9).toFixed(2)}B**` : null,
      vol ? `📉 Volume (24h): **$${(vol / 1e9).toFixed(2)}B**` : null,
      ath ? `🏆 All-Time High: **${fmt(ath)}** (${fmtPct(athChg)} from ATH)` : null,
      supply ? `🔄 Circulating Supply: **${(supply / 1e6).toFixed(2)}M ${symbol}**` : null,
      desc ? `\n📝 _${desc}..._` : null,
      `\n_Data from CoinGecko via Locus_`,
    ].filter(Boolean).join("\n");
  } catch { return `Coin data received: ${JSON.stringify(data).slice(0, 400)}`; }
}

function fmtTrending(data: unknown): string {
  try {
    type TrendingCoin = { item: { name: string; symbol: string; market_cap_rank?: number; data?: { price?: number; price_change_percentage_24h?: Record<string, number> } } };
    const d = data as { coins?: TrendingCoin[] };
    const coins = d.coins?.slice(0, 7) ?? [];
    const lines = [`🔥 **Trending Coins on CoinGecko**\n`];
    coins.forEach((c, i) => {
      const item = c.item;
      const rank = item.market_cap_rank ? ` (#${item.market_cap_rank})` : "";
      const price = item.data?.price;
      const ch = item.data?.price_change_percentage_24h?.usd;
      const arrow = ch !== undefined ? (ch >= 0 ? " 📈" : " 📉") : "";
      lines.push(`${i + 1}. **${item.name}** (${item.symbol})${rank}${price ? ` — $${price.toLocaleString("en-US", { maximumFractionDigits: 6 })}` : ""}${ch !== undefined ? ` · ${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%${arrow}` : ""}`);
    });
    lines.push(`\n_Data from CoinGecko via Locus_`);
    return lines.join("\n");
  } catch { return `Trending data: ${JSON.stringify(data).slice(0, 400)}`; }
}

function fmtGlobal(data: unknown): string {
  try {
    type GlobalData = { data?: { total_market_cap?: Record<string, number>; total_volume?: Record<string, number>; market_cap_percentage?: Record<string, number>; market_cap_change_percentage_24h_usd?: number; active_cryptocurrencies?: number } };
    const d = data as GlobalData;
    const gd = d.data;
    const cap = gd?.total_market_cap?.usd;
    const vol = gd?.total_volume?.usd;
    const btcDom = gd?.market_cap_percentage?.btc;
    const ethDom = gd?.market_cap_percentage?.eth;
    const chg = gd?.market_cap_change_percentage_24h_usd;
    const active = gd?.active_cryptocurrencies;
    return [
      `🌍 **Global Crypto Market Overview**`,
      ``,
      cap ? `💰 Total Market Cap: **$${(cap / 1e12).toFixed(3)}T**` : null,
      vol ? `📉 24h Volume: **$${(vol / 1e9).toFixed(2)}B**` : null,
      chg !== undefined ? `📊 24h Change: **${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%**` : null,
      btcDom ? `₿ BTC Dominance: **${btcDom.toFixed(1)}%**` : null,
      ethDom ? `Ξ ETH Dominance: **${ethDom.toFixed(1)}%**` : null,
      active ? `🪙 Active Cryptos: **${active.toLocaleString()}**` : null,
      `\n_Data from CoinGecko via Locus_`,
    ].filter(Boolean).join("\n");
  } catch { return `Global data: ${JSON.stringify(data).slice(0, 400)}`; }
}

function fmtMarkets(data: unknown): string {
  try {
    type CoinMarket = { name: string; symbol: string; current_price: number; price_change_percentage_24h: number; market_cap: number };
    const coins = (data as CoinMarket[]).slice(0, 8);
    const lines = [`📊 **Top Coins by Market Cap**\n`];
    coins.forEach((c, i) => {
      const arrow = c.price_change_percentage_24h >= 0 ? "📈" : "📉";
      const chg = `${c.price_change_percentage_24h >= 0 ? "+" : ""}${c.price_change_percentage_24h?.toFixed(2)}%`;
      lines.push(`${i + 1}. **${c.name}** (${c.symbol.toUpperCase()}) — $${c.current_price?.toLocaleString()} · ${chg} ${arrow}`);
    });
    lines.push(`\n_Data from CoinGecko via Locus_`);
    return lines.join("\n");
  } catch { return `Markets data: ${JSON.stringify(data).slice(0, 400)}`; }
}

function fmtTavily(data: unknown): string {
  try {
    type TavilyResult = { title: string; url: string; content: string; score?: number };
    const d = data as { results?: TavilyResult[]; answer?: string };
    const parts: string[] = [];
    if (d.answer) {
      parts.push(`🔍 **Research Summary**\n\n${d.answer}`);
    }
    if (d.results?.length) {
      parts.push(`\n**Top Sources:**`);
      d.results.slice(0, 4).forEach((r, i) => {
        const snippet = r.content?.replace(/\s+/g, " ").trim().slice(0, 180);
        parts.push(`\n${i + 1}. **${r.title}**\n   ${snippet}…\n   🔗 ${r.url}`);
      });
    }
    parts.push(`\n_Research via Tavily via Locus_`);
    return parts.join("\n") || "Research completed.";
  } catch { return `Research data: ${JSON.stringify(data).slice(0, 500)}`; }
}

function fmtGroq(data: unknown): string {
  try {
    const d = data as { choices?: Array<{ message: { content: string } }> };
    return d.choices?.[0]?.message?.content ?? JSON.stringify(data).slice(0, 500);
  } catch { return String(data).slice(0, 500); }
}

function fmtImage(data: unknown): string {
  try {
    const d = data as { data?: Array<{ url?: string; b64_json?: string }> };
    const img = d.data?.[0];
    if (img?.url) {
      return `🎨 **Image Generated!**\n\n[IMG:${img.url}]\n\n_Generated by OpenAI DALL·E via Locus_`;
    }
    if (img?.b64_json) {
      const dataUrl = `data:image/png;base64,${img.b64_json}`;
      return `🎨 **Image Generated!**\n\n[IMG:${dataUrl}]\n\n_Generated by OpenAI DALL·E via Locus_`;
    }
    return `Image generation response: ${JSON.stringify(data).slice(0, 300)}`;
  } catch { return "Image generated but couldn't parse response."; }
}

// ─── GET — health/balance check ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-locus-api-key") ?? process.env.LOCUS_API_KEY;
  try {
    const balance = await getBalance(apiKey ?? undefined);
    if (!balance) {
      return NextResponse.json({
        connected: false,
        error: "Could not connect. Check your Locus API key.",
      });
    }
    return NextResponse.json({
      connected: true,
      balance: balance.balance,
      walletAddress: balance.wallet_address,
      token: balance.token,
    });
  } catch {
    return NextResponse.json({ connected: false, error: "Server error" }, { status: 500 });
  }
}

// ─── POST — main procurement ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Resolve API key: user-supplied header takes priority over env var
    const apiKey = req.headers.get("x-locus-api-key") ?? process.env.LOCUS_API_KEY;

    // No key guard
    if (!apiKey || apiKey === "claw_dev_your_key_here") {
      return NextResponse.json({
        response: `⚠️ **No Locus API key found.**\n\nClick **"Connect Wallet"** in the top-right and paste your Locus API key to get started.\n\nGet a free key at [beta.paywithlocus.com](https://beta.paywithlocus.com)`,
        steps: ["❌ No API key found"],
      });
    }

    // Step 1: Route (try Groq, fallback to rule-based)
    const steps: string[] = [];
    let routing: RoutingDecision;
    
    try {
      routing = await routeWithGroq(message);
      steps.push(`🧠 Groq selected: ${routing.tool} — ${routing.reason}`);
    } catch {
      routing = ruleBasedRoute(message);
      steps.push(`🔀 Routed: ${routing.tool} — ${routing.reason}`);
    }

    // Step 2: Execute
    steps.push(`💳 Requesting ${routing.estCost} USDC spend authorization…`);
    steps.push(`🌐 Calling ${routing.tool.split("_")[0].charAt(0).toUpperCase() + routing.tool.split("_")[0].slice(1)} API…`);

    let result;
    let provider = "";
    let endpoint = "";

    switch (routing.tool) {
      case "coingecko_price":
        provider = "CoinGecko"; endpoint = "simple-price";
        result = await callWrappedEndpoint("coingecko", "simple-price", {
          ids: routing.coinId ?? "bitcoin",
          vs_currencies: "usd",
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
        });
        break;

      case "coingecko_data":
        provider = "CoinGecko"; endpoint = "coin-data";
        result = await callWrappedEndpoint("coingecko", "coin-data", {
          id: routing.coinId ?? "bitcoin",
        });
        break;

      case "coingecko_trending":
        provider = "CoinGecko"; endpoint = "trending";
        result = await callWrappedEndpoint("coingecko", "trending", {});
        break;

      case "coingecko_global":
        provider = "CoinGecko"; endpoint = "global";
        result = await callWrappedEndpoint("coingecko", "global", {});
        break;

      case "coingecko_markets":
        provider = "CoinGecko"; endpoint = "coins-markets";
        result = await callWrappedEndpoint("coingecko", "coins-markets", {
          vs_currency: "usd",
        });
        break;

      case "tavily_search":
        provider = "Tavily"; endpoint = "search";
        result = await callWrappedEndpoint("tavily", "search", {
          query: routing.query ?? message,
        });
        break;

      case "openai_image":
        provider = "OpenAI"; endpoint = "image-generate";
        result = await callWrappedEndpoint("openai", "image-generate", {
          prompt: routing.query ?? message,
          model: "gpt-image-1",
          quality: "low",
          size: "1024x1024",
        });
        break;

      case "openai_chat":
        provider = "OpenAI"; endpoint = "chat";
        result = await callWrappedEndpoint("openai", "chat", {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: routing.query ?? message }],
          max_tokens: 1000,
        });
        break;

      case "groq_chat":
      default:
        provider = "Groq"; endpoint = "chat";
        result = await groqChat([
          { role: "system", content: "You are ProcureBot, a helpful AI procurement assistant. Be concise, informative, and professional." },
          { role: "user", content: routing.query ?? message },
        ]);
        break;
    }

    // Step 3: Handle non-OK
    if (!result.ok) {
      if (result.approvalUrl) {
        steps.push("⚠️ Approval required for this transaction");
        return NextResponse.json({
          response: `⚠️ **Approval Required**\n\nThis transaction needs manual approval (above your auto-approve threshold).\n\n[👉 Approve Transaction](${result.approvalUrl})\n\n_After approving, try your request again._`,
          steps,
          receipt: {
            id: crypto.randomUUID(), timestamp: new Date().toISOString(),
            provider, endpoint, cost: "0.00", status: "approval_required",
            approvalUrl: result.approvalUrl, summary: message.slice(0, 80),
          },
        });
      }
      return NextResponse.json({
        response: `❌ **Procurement Failed**\n\n${result.error}`,
        steps, error: result.error,
      });
    }

    // Step 4: Format
    steps.push("✅ Success — formatting results…");
    let responseText = "";
    switch (routing.tool) {
      case "coingecko_price": responseText = fmtPrice(result.data, routing.coinId ?? "bitcoin"); break;
      case "coingecko_data": responseText = fmtCoinData(result.data, routing.coinId ?? "bitcoin"); break;
      case "coingecko_trending": responseText = fmtTrending(result.data); break;
      case "coingecko_global": responseText = fmtGlobal(result.data); break;
      case "coingecko_markets": responseText = fmtMarkets(result.data); break;
      case "tavily_search": responseText = fmtTavily(result.data); break;
      case "openai_image": responseText = fmtImage(result.data); break;
      case "openai_chat": responseText = fmtGroq(result.data); break;
      case "groq_chat": default: responseText = fmtGroq(result.data); break;
    }

    const cost = result.cost ?? routing.estCost.replace("$", "");
    steps.push(`💸 Paid ${result.cost ? `$${result.cost}` : routing.estCost} USDC`);

    return NextResponse.json({
      response: responseText,
      steps,
      receipt: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        provider, endpoint,
        cost,
        status: "success",
        txHash: result.txHash,
        summary: message.slice(0, 80),
      },
    });
  } catch (e) {
    console.error("[procure]", e);
    return NextResponse.json({ response: `⚠️ Internal error: ${String(e).slice(0, 200)}` }, { status: 500 });
  }
}
