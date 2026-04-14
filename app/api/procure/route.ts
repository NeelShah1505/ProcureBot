import { NextRequest, NextResponse } from "next/server";
import {
  getBalance,
  getCoinPrice,
  tavilySearch,
  perplexitySearch,
  generateImage,
  groqChat,
  openaiChat,
  callWrappedEndpoint,
} from "@/lib/locus";

// ─── Tool routing ─────────────────────────────────────────────────────────────

type ToolName = "coingecko" | "tavily" | "perplexity" | "image" | "groq" | "openai";

interface RoutingDecision {
  tool: ToolName;
  params: Record<string, string>;
  reason: string;
}

/**
 * Simple rule-based routing + optional LLM routing.
 * Hardcoded keywords for speed; falls back to Groq for ambiguous requests.
 */
async function routeToTool(message: string): Promise<RoutingDecision> {
  const lower = message.toLowerCase();

  // Price / crypto data — CoinGecko
  const cryptoKeywords = ["price", "sol", "solana", "btc", "bitcoin", "eth", "ethereum", "crypto", "coin", "market cap", "token"];
  if (cryptoKeywords.some((k) => lower.includes(k))) {
    // Extract coin name
    let coinId = "solana";
    if (lower.includes("bitcoin") || lower.includes("btc")) coinId = "bitcoin";
    else if (lower.includes("ethereum") || lower.includes("eth")) coinId = "ethereum";
    else if (lower.includes("sol") || lower.includes("solana")) coinId = "solana";
    else if (lower.includes("bnb")) coinId = "binancecoin";
    else if (lower.includes("avax") || lower.includes("avalanche")) coinId = "avalanche-2";
    return { tool: "coingecko", params: { coinId }, reason: `Fetching ${coinId} price data from CoinGecko` };
  }

  // Image generation
  const imageKeywords = ["generate", "image", "picture", "draw", "create", "illustration", "art", "photo", "visual"];
  if (imageKeywords.some((k) => lower.includes(k))) {
    return { tool: "image", params: { prompt: message }, reason: "Generating image with OpenAI DALL·E" };
  }

  // Research / search — Tavily or Perplexity
  const researchKeywords = ["research", "find", "search", "news", "latest", "summarize", "what is", "how does", "explain", "tell me about"];
  if (researchKeywords.some((k) => lower.includes(k))) {
    return { tool: "tavily", params: { query: message }, reason: "Researching with Tavily web search" };
  }

  // General AI — Groq (fast) or OpenAI
  const aiKeywords = ["analyze", "write", "draft", "compare", "help me", "calculate", "translate", "code"];
  if (aiKeywords.some((k) => lower.includes(k))) {
    return { tool: "groq", params: { prompt: message }, reason: "Processing with Groq (Llama 3)" };
  }

  // Fallback: use Groq to decide
  return { tool: "groq", params: { prompt: message }, reason: "Routing via Groq (default AI processing)" };
}

// ─── Format results into readable response ────────────────────────────────────

function formatCoinResult(data: unknown, coinId: string): string {
  try {
    const d = data as Record<string, Record<string, number>>;
    const coin = d[coinId];
    if (!coin) return `No data found for ${coinId}.`;

    const price = coin.usd?.toLocaleString("en-US", { style: "currency", currency: "USD" }) ?? "N/A";
    const change24h = coin.usd_24h_change;
    const cap = coin.usd_market_cap;
    const vol = coin.usd_24h_vol;

    return [
      `📊 **${coinId.charAt(0).toUpperCase() + coinId.slice(1)} (${coinId.toUpperCase()}) Price Data**`,
      ``,
      `💰 Current Price: **${price}**`,
      change24h !== undefined ? `📈 24h Change: **${change24h > 0 ? "+" : ""}${change24h?.toFixed(2)}%**` : "",
      cap ? `🏦 Market Cap: **$${(cap / 1e9).toFixed(2)}B**` : "",
      vol ? `📉 24h Volume: **$${(vol / 1e9).toFixed(2)}B**` : "",
      ``,
      `_Data sourced from CoinGecko via Locus wrapped API_`,
    ].filter(Boolean).join("\n");
  } catch {
    return `Price data received: ${JSON.stringify(data, null, 2).slice(0, 500)}`;
  }
}

function formatTavilyResult(data: unknown): string {
  try {
    const d = data as {
      results?: Array<{ title: string; url: string; content: string }>;
      answer?: string;
    };

    let response = "";
    if (d.answer) {
      response += `🔍 **Research Summary**\n\n${d.answer}\n\n`;
    }
    if (d.results && d.results.length > 0) {
      response += `**Top Sources:**\n`;
      d.results.slice(0, 3).forEach((r, i) => {
        response += `${i + 1}. **${r.title}**\n   ${r.content?.slice(0, 150)}…\n   🔗 ${r.url}\n\n`;
      });
    }

    return response || "Research completed but no structured results returned.";
  } catch {
    return `Research data: ${JSON.stringify(data, null, 2).slice(0, 500)}`;
  }
}

function formatGroqResult(data: unknown): string {
  try {
    const d = data as { choices?: Array<{ message: { content: string } }> };
    return d.choices?.[0]?.message?.content ?? JSON.stringify(data).slice(0, 500);
  } catch {
    return String(data).slice(0, 500);
  }
}

function formatImageResult(data: unknown, _prompt: string): string {
  try {
    const d = data as { data?: Array<{ url?: string; b64_json?: string }> };
    const img = d.data?.[0];
    if (img?.url) {
      return `🎨 **Image Generated!**\n\n[View Image](${img.url})\n\n_Generated via OpenAI DALL·E via Locus_`;
    }
    if (img?.b64_json) {
      return `🎨 **Image Generated** (base64 data received — ${img.b64_json.length} chars)\n\n_Generated via OpenAI DALL·E via Locus_`;
    }
    return `Image generation response: ${JSON.stringify(data, null, 2).slice(0, 300)}`;
  } catch {
    return "Image generated but could not parse the response.";
  }
}

// ─── GET — status/health check ────────────────────────────────────────────────

export async function GET() {
  try {
    const balance = await getBalance();
    if (!balance) {
      return NextResponse.json({
        connected: false,
        error: "Could not connect. Verify LOCUS_API_KEY in .env.local",
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

// ─── POST — main procurement endpoint ────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    if (!process.env.LOCUS_API_KEY || process.env.LOCUS_API_KEY === "claw_dev_your_key_here") {
      return NextResponse.json({
        response: "⚠️ No Locus API key configured. Please add your `claw_dev_*` key to `.env.local` and restart the server.",
        steps: ["No API key found"],
        error: "Missing LOCUS_API_KEY",
      });
    }

    // Step 1: Route
    const routing = await routeToTool(message);
    const steps: string[] = [routing.reason];

    // Step 2: Execute
    let result;
    const estCost = "0.01"; // placeholder, updated per provider
    let provider = "";
    let endpoint = "";

    switch (routing.tool) {
      case "coingecko": {
        const { coinId } = routing.params;
        steps.push(`Calling CoinGecko /simple/price for ${coinId}…`);
        provider = "CoinGecko";
        endpoint = "simple-price";
        result = await getCoinPrice(coinId, "usd");
        break;
      }
      case "tavily": {
        steps.push("Calling Tavily web search…");
        provider = "Tavily";
        endpoint = "search";
        result = await tavilySearch(routing.params.query ?? message, "basic");
        break;
      }
      case "perplexity": {
        steps.push("Calling Perplexity AI research…");
        provider = "Perplexity";
        endpoint = "chat";
        result = await perplexitySearch(routing.params.query ?? message);
        break;
      }
      case "image": {
        steps.push("Calling OpenAI image generation…");
        provider = "OpenAI";
        endpoint = "image-generate";
        result = await generateImage(routing.params.prompt ?? message);
        break;
      }
      case "groq": {
        steps.push("Calling Groq (Llama 3)…");
        provider = "Groq";
        endpoint = "chat";
        result = await groqChat([{ role: "user", content: routing.params.prompt ?? message }]);
        break;
      }
      case "openai":
      default: {
        steps.push("Calling OpenAI GPT-4o-mini…");
        provider = "OpenAI";
        endpoint = "chat";
        result = await openaiChat([{ role: "user", content: message }]);
        break;
      }
    }

    // Step 3: Handle result
    if (!result.ok) {
      // Approval required
      if (result.approvalUrl) {
        steps.push("Transaction requires approval!");
        return NextResponse.json({
          response: `⚠️ **Approval Required**\n\nThis transaction needs your manual approval.\n\n[Approve Now →](${result.approvalUrl})`,
          steps,
          receipt: {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            provider,
            endpoint,
            cost: "0.00",
            status: "approval_required",
            approvalUrl: result.approvalUrl,
            summary: message.slice(0, 80),
          },
        });
      }

      return NextResponse.json({
        response: `❌ **Procurement Failed**\n\n${result.error}`,
        steps,
        error: result.error,
      });
    }

    // Step 4: Format response
    steps.push("Formatting results…");
    let responseText = "";

    switch (routing.tool) {
      case "coingecko":
        responseText = formatCoinResult(result.data, routing.params.coinId ?? "solana");
        break;
      case "tavily":
      case "perplexity":
        responseText = formatTavilyResult(result.data);
        break;
      case "image":
        responseText = formatImageResult(result.data, routing.params.prompt ?? message);
        break;
      case "groq":
      case "openai":
      default:
        responseText = formatGroqResult(result.data);
        break;
    }

    steps.push("✓ Done — USDC debited");

    return NextResponse.json({
      response: responseText,
      steps,
      receipt: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        provider,
        endpoint,
        cost: result.cost ?? estCost,
        status: "success",
        txHash: result.txHash,
        summary: message.slice(0, 80),
      },
    });
  } catch (e) {
    console.error("[procure]", e);
    return NextResponse.json(
      { response: "Internal server error.", error: String(e) },
      { status: 500 }
    );
  }
}
