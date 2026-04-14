/**
 * lib/locus.ts
 * All Locus PayWithLocus API helpers.
 * Base URL: https://api.paywithlocus.com/api
 * Auth: Authorization: Bearer <LOCUS_API_KEY>
 */

const LOCUS_BASE = "https://api.paywithlocus.com/api";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.LOCUS_API_KEY}`,
    "Content-Type": "application/json",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocusResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  approval_url?: string;
  error?: string;
}

export interface LocusBalance {
  balance: string;
  token: string;
  wallet_address: string;
}

export interface WrappedCallResult {
  ok: boolean;
  data?: unknown;
  cost?: string;
  txHash?: string;
  approvalUrl?: string;
  error?: string;
  status: number;
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export async function getBalance(): Promise<LocusBalance | null> {
  try {
    const res = await fetch(`${LOCUS_BASE}/pay/balance`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: { success: boolean; data: LocusBalance } = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ─── Wrapped Catalog ──────────────────────────────────────────────────────────

export async function getWrappedCatalog(): Promise<string> {
  try {
    const res = await fetch(`${LOCUS_BASE}/wrapped/md`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return "Failed to fetch catalog.";
    return res.text();
  } catch {
    return "Failed to fetch catalog.";
  }
}

// ─── Call Any Wrapped Endpoint ────────────────────────────────────────────────

export async function callWrappedEndpoint(
  provider: string,
  endpoint: string,
  body: Record<string, unknown>
): Promise<WrappedCallResult> {
  try {
    const res = await fetch(
      `${LOCUS_BASE}/wrapped/${provider}/${endpoint}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      }
    );

    const status = res.status;

    // 202 = Approval Required
    if (status === 202) {
      const json = await res.json();
      return {
        ok: false,
        status,
        approvalUrl: json.approval_url || json.approvalUrl || json.data?.approval_url,
        error: "Transaction requires manual approval. Click the link to approve.",
      };
    }

    // 403 = Provider disabled / insufficient funds
    if (status === 403) {
      const json = await res.json();
      return {
        ok: false,
        status,
        error: json.message || "Provider disabled or insufficient USDC balance.",
      };
    }

    // 401 = Invalid API key
    if (status === 401) {
      return {
        ok: false,
        status,
        error: "Invalid Locus API key. Check your LOCUS_API_KEY in .env.local",
      };
    }

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, status, error: `API error ${status}: ${text.slice(0, 200)}` };
    }

    const json = await res.json();

    return {
      ok: true,
      status,
      data: json.data ?? json,
      cost: json.cost ?? json.charge ?? json.amount ?? undefined,
      txHash: json.txHash ?? json.tx_hash ?? json.transaction_hash ?? undefined,
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: `Network error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ─── Provider-specific helpers ────────────────────────────────────────────────

/** CoinGecko: get price for a coin */
export async function getCoinPrice(coinId: string, vsCurrency = "usd") {
  return callWrappedEndpoint("coingecko", "simple-price", {
    ids: coinId,
    vs_currencies: vsCurrency,
  });
}

/** Tavily: web search & research */
export async function tavilySearch(query: string, searchDepth: "basic" | "advanced" = "basic") {
  return callWrappedEndpoint("tavily", "search", {
    query,
    search_depth: searchDepth,
    max_results: 5,
  });
}

/** Perplexity: AI-powered research */
export async function perplexitySearch(query: string) {
  return callWrappedEndpoint("perplexity", "chat", {
    model: "sonar",
    messages: [{ role: "user", content: query }],
  });
}

/** OpenAI: chat completion (for tool routing decisions) */
export async function openaiChat(
  messages: Array<{ role: string; content: string }>,
  model = "gpt-4o-mini"
) {
  return callWrappedEndpoint("openai", "chat", {
    model,
    messages,
    max_tokens: 1000,
  });
}

/** OpenAI: generate image */
export async function generateImage(prompt: string) {
  return callWrappedEndpoint("openai", "image-generate", {
    prompt,
    model: "gpt-image-1",
    quality: "low",
    size: "1024x1024",
  });
}

/** Groq: fast inference for routing */
export async function groqChat(
  messages: Array<{ role: string; content: string }>,
  model = "llama-3.3-70b-versatile"
) {
  return callWrappedEndpoint("groq", "chat", {
    model,
    messages,
    max_tokens: 800,
  });
}

/** Brave Search */
export async function braveSearch(query: string) {
  return callWrappedEndpoint("brave-search", "web-search", {
    q: query,
    count: 5,
  });
}
