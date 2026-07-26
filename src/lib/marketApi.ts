import type { CryptoDatum, StockDatum } from "@/types";
import { supabase } from "@/lib/supabase";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-data`;
const HEADERS = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

async function call<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ action, ...payload }),
    });
  } catch (e) {
    throw new Error(`Réseau injoignable (${action})`);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const d = await res.json();
      detail = d?.error ? `: ${d.error}` : "";
    } catch {
      /* ignore parse error */
    }
    throw new Error(`${action} échoué (${res.status}${detail})`);
  }
  return (await res.json()) as T;
}

export async function fetchRate(): Promise<number> {
  const d = await call<{ eur_per_usd: number }>("rate");
  if (typeof d.eur_per_usd !== "number") throw new Error("taux indisponible");
  return d.eur_per_usd;
}

export async function fetchStockData(tickers: string[]): Promise<Record<string, StockDatum>> {
  if (!tickers.length) return {};
  return call<Record<string, StockDatum>>("stocks", { tickers });
}

export async function fetchCryptoData(tickers: string[]): Promise<Record<string, CryptoDatum>> {
  if (!tickers.length) return {};
  return call<Record<string, CryptoDatum>>("crypto", { tickers });
}

export async function fetchSp500(): Promise<{ mois: string; valeur: number }[]> {
  const d = await call<{ mois: string; valeur: number }[]>("sp500");
  return Array.isArray(d) ? d : [];
}

// Keep the supabase import live for bundlers that tree-shake aggressively.
export const _supabase = supabase;
