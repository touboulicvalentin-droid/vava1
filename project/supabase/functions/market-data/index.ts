import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

interface StockDatum {
  prix: number | null;
  per: number | null;
  pfcf: number | null;
  margeNette: number | null;
  detteEquity: number | null;
  dividendYield: number | null;
  marketCap: number | null;
}

interface CryptoDatum {
  prix: number | null;
  variation24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
}

const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  DOT: "polkadot",
  MATIC: "matic-network",
  LTC: "litecoin",
  TON: "the-open-network",
  SUI: "sui",
  NEAR: "near",
};

// Coinbase fallback symbol map (uses base asset codes).
const COINBASE_SYM: Record<string, string> = {
  BTC: "BTC", ETH: "ETH", SOL: "SOL", BNB: "BNB", XRP: "XRP", ADA: "ADA",
  DOGE: "DOGE", AVAX: "AVAX", LINK: "LINK", DOT: "DOT", MATIC: "MATIC",
  LTC: "LTC", TON: "TON", SUI: "SUI", NEAR: "NEAR",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ----------------------------- USD -> EUR rate ---------------------------- */

async function fetchRate(): Promise<{ eur_per_usd: number }> {
  // Primary: frankfurter.app (ECB-backed, no key). Domain is .app, not .dev.
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR", {
      headers: { Accept: "application/json" },
    });
    if (r.ok) {
      const d = await r.json();
      if (typeof d?.rates?.EUR === "number") return { eur_per_usd: d.rates.EUR };
    }
  } catch {
    /* fall through */
  }
  // Fallback: open.er-api.com (free, no key).
  const r2 = await fetch("https://open.er-api.com/v6/latest/USD", {
    headers: { Accept: "application/json" },
  });
  if (!r2.ok) throw new Error("rate unavailable");
  const d2 = await r2.json();
  const rate = d2?.rates?.EUR;
  if (typeof rate !== "number") throw new Error("no rate in payload");
  return { eur_per_usd: rate };
}

/* --------------------------------- Crypto -------------------------------- */

async function fetchCrypto(tickers: string[]): Promise<Record<string, CryptoDatum>> {
  const out: Record<string, CryptoDatum> = {};
  if (!tickers.length) return out;

  // Primary: CoinGecko simple/price (batch, includes 24h change + cap + vol).
  const idToSymbol: Record<string, string> = {};
  const ids: string[] = [];
  for (const t of tickers) {
    const id = COIN_IDS[t.toUpperCase()];
    if (id) {
      ids.push(id);
      idToSymbol[id] = t;
    }
  }
  if (ids.length) {
    try {
      const url =
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}` +
        `&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (r.ok) {
        const d = await r.json();
        for (const id of ids) {
          const sym = idToSymbol[id];
          const p = d[id];
          if (p) {
            out[sym] = {
              prix: typeof p.usd === "number" ? p.usd : null,
              variation24h: typeof p.usd_24h_change === "number" ? p.usd_24h_change : null,
              marketCap: typeof p.usd_market_cap === "number" ? p.usd_market_cap : null,
              volume24h: typeof p.usd_24h_vol === "number" ? p.usd_24h_vol : null,
            };
          }
        }
      }
    } catch (e) {
      console.error("coingecko failed", e);
    }
  }

  // Fallback: Coinbase spot price for any ticker still missing.
  const missing = tickers.filter((t) => !out[t]);
  await Promise.all(
    missing.map(async (t) => {
      const cbSym = COINBASE_SYM[t.toUpperCase()];
      if (!cbSym) return;
      try {
        const r = await fetch(`https://api.coinbase.com/v2/prices/${cbSym}-USD/spot`, {
          headers: { Accept: "application/json" },
        });
        if (!r.ok) return;
        const d = await r.json();
        const prix = parseFloat(d?.data?.amount);
        if (!isNaN(prix)) out[t] = { prix, variation24h: null, marketCap: null, volume24h: null };
      } catch {
        /* skip */
      }
    }),
  );
  return out;
}

/* --------------------------------- Stocks -------------------------------- */

/** Yahoo uses dashes in tickers like BRK-B instead of BRK.B. */
function toYahooTicker(ticker: string): string {
  return ticker.replace(/\./g, "-");
}

/** Stooq symbol mapping. US tickers get .us suffix; European exchanges map to ccTLD. */
function toStooqSymbol(ticker: string): string {
  const t = ticker.toLowerCase();
  if (t.endsWith(".pa")) return t.replace(".pa", ".fr");
  if (t.endsWith(".br")) return t.replace(".br", ".be");
  if (t.endsWith(".as")) return t.replace(".as", ".nl");
  if (t.endsWith(".l")) return t.replace(".l", ".uk");
  if (t.endsWith(".sw")) return t.replace(".sw", ".ch");
  if (t.endsWith(".de")) return t;
  // Yahoo-style dashed ticker (e.g. brk-b) -> stooq brk.b.us? stooq uses brk.b for berkshire.
  if (t.includes("-")) return t.replace("-", ".") + ".us";
  if (!t.includes(".")) return t + ".us";
  return t;
}

async function fetchYahooPrice(ticker: string): Promise<{ prix: number; shares: number | null } | null> {
  const yt = toYahooTicker(ticker);
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yt)}?interval=1mo&range=1y`,
      { headers: { "User-Agent": UA } },
    );
    if (!r.ok) return null;
    const d = await r.json();
    const meta = d?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const prix = meta.regularMarketPrice;
    if (prix == null) return null;
    return { prix, shares: meta.sharesOutstanding ?? null };
  } catch {
    return null;
  }
}

async function fetchStooqPrice(ticker: string): Promise<number | null> {
  const sym = toStooqSymbol(ticker);
  try {
    const r = await fetch(
      `https://stooq.com/q/l/?s=${encodeURIComponent(sym)}&f=sd2t2c&h&e=csv`,
      { headers: { "User-Agent": UA } },
    );
    if (!r.ok) return null;
    const text = await r.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return null;
    const parts = lines[1].split(",");
    const close = parseFloat(parts[3]);
    return isNaN(close) || close <= 0 ? null : close;
  } catch {
    return null;
  }
}

async function fetchStock(tickers: string[]): Promise<Record<string, StockDatum>> {
  const out: Record<string, StockDatum> = {};
  await Promise.all(
    tickers.map(async (t) => {
      // 1) Yahoo chart API for price + market cap.
      let prix: number | null = null;
      let shares: number | null = null;
      const y = await fetchYahooPrice(t);
      if (y) {
        prix = y.prix;
        shares = y.shares;
      }
      // 2) Fallback to Stooq CSV if Yahoo failed.
      if (prix == null) prix = await fetchStooqPrice(t);
      if (prix == null) return;
      out[t] = {
        prix,
        per: null,
        pfcf: null,
        margeNette: null,
        detteEquity: null,
        dividendYield: null,
        marketCap: shares ? prix * shares : null,
      };
      // 3) Best-effort fundamentals from Yahoo (often blocked; non-critical).
      try {
        const fr = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(toYahooTicker(t))}?modules=defaultKeyStatistics,summaryDetail,financialData`,
          { headers: { "User-Agent": UA } },
        );
        if (fr.ok) {
          const fd = await fr.json();
          const qs = fd?.quoteSummary?.result?.[0];
          if (qs) {
            const dk = qs.defaultKeyStatistics;
            const sd = qs.summaryDetail;
            const fin = qs.financialData;
            const perRaw = sd?.trailingPE?.raw ?? dk?.forwardPE?.raw ?? null;
            const pfcfRaw = dk?.priceToFreeCashflowsOverride ?? dk?.enterpriseToCashflowRatio ?? null;
            const marginRaw = fin?.profitMargins?.raw ?? null;
            const debtRaw = fin?.debtToEquity?.raw ?? null;
            const divRaw = sd?.dividendYield?.raw ?? null;
            out[t].per = perRaw != null ? Number(perRaw) : null;
            out[t].pfcf = pfcfRaw != null ? Number(pfcfRaw) : null;
            out[t].margeNette = marginRaw != null ? marginRaw * 100 : null;
            out[t].detteEquity = debtRaw != null ? debtRaw / 100 : null;
            out[t].dividendYield = divRaw != null ? divRaw * 100 : null;
          }
        }
      } catch {
        /* fundamentals unavailable; keep price-only */
      }
    }),
  );
  return out;
}

/* --------------------------------- S&P 500 ------------------------------- */

async function fetchSp500(): Promise<{ mois: string; valeur: number }[]> {
  // Primary: Stooq monthly history for ^spx (the S&P 500 proxy on Stooq).
  const now = new Date();
  const d2 = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const yearAgo = new Date(now);
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1);
  const d1 = `${yearAgo.getUTCFullYear()}${String(yearAgo.getUTCMonth() + 1).padStart(2, "0")}${String(yearAgo.getUTCDate()).padStart(2, "0")}`;
  try {
    const url = `https://stooq.com/q/d/l/?s=^spx&d1=${d1}&d2=${d2}&i=m`;
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.ok) {
      const text = await r.text();
      const lines = text.trim().split("\n");
      const result: { mois: string; valeur: number }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        const date = parts[0];
        const close = parseFloat(parts[4]);
        if (date && !isNaN(close)) result.push({ mois: date.slice(0, 7), valeur: close });
      }
      if (result.length) return result.slice(-12);
    }
  } catch (e) {
    console.error("stooq sp500 failed", e);
  }
  // Fallback: Yahoo chart for ^GSPC (monthly closes over the last year).
  try {
    const r = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1mo&range=1y",
      { headers: { "User-Agent": UA } },
    );
    if (r.ok) {
      const d = await r.json();
      const res = d?.chart?.result?.[0];
      const ts: number[] = res?.timestamp ?? [];
      const closes: (number | null)[] = res?.indicators?.quote?.[0]?.close ?? [];
      const byMonth: Record<string, number> = {};
      for (let i = 0; i < ts.length; i++) {
        const c = closes[i];
        if (c == null) continue;
        const dt = new Date(ts[i] * 1000);
        const mois = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
        byMonth[mois] = c;
      }
      const arr = Object.entries(byMonth).map(([mois, valeur]) => ({ mois, valeur }));
      if (arr.length) return arr.slice(-12);
    }
  } catch (e) {
    console.error("yahoo sp500 failed", e);
  }
  return [];
}

/* ---------------------------------- Serve -------------------------------- */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    if (action === "rate") return json(await fetchRate());
    if (action === "stocks") {
      const tickers: string[] = Array.isArray(body?.tickers) ? body.tickers : [];
      return json(await fetchStock(tickers));
    }
    if (action === "crypto") {
      const tickers: string[] = Array.isArray(body?.tickers) ? body.tickers : [];
      return json(await fetchCrypto(tickers));
    }
    if (action === "sp500") return json(await fetchSp500());
    return json({ error: "unknown action" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "internal error";
    return json({ error: msg }, 500);
  }
});
