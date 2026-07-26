import { useMemo } from "react";
import type { AssetType, CryptoDatum, Entry, StockDatum } from "@/types";
import { TYPES } from "@/lib/constants";
import { gainTotal, monthKey } from "@/lib/finance";

export interface MarketSnapshot {
  stock: Record<string, StockDatum>;
  crypto: Record<string, CryptoDatum>;
}

/**
 * Valeur temps réel d'une ligne, en EUR.
 * - Action / Crypto en portefeuille : quantité × cours live (converti en EUR) = valeur latente réelle.
 * - Action / Crypto vendues : valeur de revente réalisée.
 * - Crowdfunding / Immobilier / Autre : montant investi + gains (ou valeur renseignée).
 */
export function realtimeValueEUR(
  e: Entry,
  usdRate: number,
  market: MarketSnapshot,
): number {
  const isMarket = e.type === "Action" || e.type === "Crypto";
  if (e.statut === "Vendu") {
    const v = e.valeur || 0;
    return isMarket ? v * usdRate : v;
  }
  if (isMarket) {
    const live =
      e.type === "Action" ? market.stock[e.nom]?.prix : market.crypto[e.nom]?.prix;
    if (live != null && e.quantite != null) return e.quantite * live * usdRate;
    return e.montant * usdRate; // repli : montant investi converti
  }
  const marche = e.valeur > 0 ? e.valeur : e.montant;
  return marche + (e.gains || 0);
}

export interface MonthlyDatum {
  mois: string;
  investi: number;
  gains: number;
  byType: Record<string, { investi: number; gains: number }>;
}

export interface AllocationDatum {
  name: (typeof TYPES)[number];
  value: number;
  pct: number;
}

export function useEntriesEUR(entries: Entry[], usdRate: number): Entry[] {
  return useMemo(
    () =>
      entries.map((e) =>
        e.type === "Action" || e.type === "Crypto"
          ? {
              ...e,
              montant: e.montant * usdRate,
              gains: (e.gains || 0) * usdRate,
              valeur: (e.valeur || 0) * usdRate,
            }
          : e,
      ),
    [entries, usdRate],
  );
}

export function useTotals(entriesEUR: Entry[]) {
  return useMemo(() => {
    const totalInvesti = entriesEUR.reduce((s, e) => s + e.montant, 0);
    const totalGains = entriesEUR.reduce((s, e) => s + gainTotal(e), 0);
    const capitalBloque = entriesEUR
      .filter((e) => e.type === "Crowdfunding" && e.statut !== "Remboursé")
      .reduce((s, e) => s + e.montant, 0);
    return {
      totalInvesti,
      totalGains,
      capitalBloque,
      rendement: totalInvesti ? (totalGains / totalInvesti) * 100 : 0,
    };
  }, [entriesEUR]);
}

export function useAllocation(entriesEUR: Entry[]): AllocationDatum[] {
  return useMemo(() => {
    const byType: Record<string, number> = {};
    entriesEUR.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + e.montant;
    });
    const arr = TYPES.map((t) => ({ name: t, value: byType[t] || 0 })).filter((d) => d.value > 0);
    const total = arr.reduce((s, d) => s + d.value, 0);
    return arr.map((d) => ({ ...d, pct: total ? (d.value / total) * 100 : 0 }));
  }, [entriesEUR]);
}

export function useMonthly(entriesEUR: Entry[]): MonthlyDatum[] {
  return useMemo(() => {
    const byMonth: Record<string, MonthlyDatum> = {};
    entriesEUR.forEach((e) => {
      const k = monthKey(e.date);
      if (!byMonth[k]) byMonth[k] = { mois: k, investi: 0, gains: 0, byType: {} };
      byMonth[k].investi += e.montant;
      byMonth[k].gains += gainTotal(e);
      if (!byMonth[k].byType[e.type]) byMonth[k].byType[e.type] = { investi: 0, gains: 0 };
      byMonth[k].byType[e.type].investi += e.montant;
      byMonth[k].byType[e.type].gains += gainTotal(e);
    });
    return Object.values(byMonth).sort((a, b) => a.mois.localeCompare(b.mois));
  }, [entriesEUR]);
}

export function useRevenuMensuelMoyen(monthly: MonthlyDatum[]): number {
  return useMemo(
    () => (monthly.length ? monthly.reduce((s, m) => s + m.gains, 0) / monthly.length : 0),
    [monthly],
  );
}

export function usePatrimoine(monthly: MonthlyDatum[]) {
  return useMemo(() => {
    let c = 0;
    return monthly.map((m) => {
      c += m.investi + m.gains;
      return { mois: m.mois, valeur: c };
    });
  }, [monthly]);
}

export function useComparatif(
  patrimoine: { mois: string; valeur: number }[],
  sp500: { mois: string; valeur: number }[],
) {
  return useMemo(() => {
    if (!patrimoine.length) return [];
    const baseP = patrimoine[0]?.valeur || 1;
    const spByMonth: Record<string, number> = {};
    sp500.forEach((s) => {
      spByMonth[s.mois] = s.valeur;
    });
    const spDispo = patrimoine.map((p) => spByMonth[p.mois]).filter((v): v is number => v != null);
    const baseSP = spDispo[0] || null;
    return patrimoine.map((p) => ({
      mois: p.mois,
      Portefeuille: Math.round((p.valeur / baseP) * 100),
      "S&P 500":
        baseSP && spByMonth[p.mois] != null ? Math.round((spByMonth[p.mois] / baseSP) * 100) : null,
    }));
  }, [patrimoine, sp500]);
}

/** Total patrimoine temps réel (EUR) restreint aux types sélectionnés. */
export function useTotalRealtime(
  entries: Entry[],
  usdRate: number,
  market: MarketSnapshot,
  selectedTypes: AssetType[],
) {
  return useMemo(() => {
    const set = new Set(selectedTypes);
    let valeur = 0;
    let investi = 0;
    entries
      .filter((e) => set.has(e.type))
      .forEach((e) => {
        valeur += realtimeValueEUR(e, usdRate, market);
        const isMarket = e.type === "Action" || e.type === "Crypto";
        investi += isMarket ? e.montant * usdRate : e.montant;
      });
    return {
      valeur,
      investi,
      gains: valeur - investi,
      rendement: investi ? ((valeur - investi) / investi) * 100 : 0,
    };
  }, [entries, usdRate, market, selectedTypes]);
}

/** Évolution cumulée du patrimoine temps réel par mois d'acquisition, filtrée par type. */
export function usePatrimoineRealtime(
  entries: Entry[],
  usdRate: number,
  market: MarketSnapshot,
  selectedTypes: AssetType[],
) {
  return useMemo(() => {
    const set = new Set(selectedTypes);
    const byMonth: Record<string, number> = {};
    entries
      .filter((e) => set.has(e.type))
      .forEach((e) => {
        const k = monthKey(e.date);
        byMonth[k] = (byMonth[k] || 0) + realtimeValueEUR(e, usdRate, market);
      });
    let c = 0;
    return Object.keys(byMonth)
      .sort((a, b) => a.localeCompare(b))
      .map((m) => {
        c += byMonth[m];
        return { mois: m, valeur: c };
      });
  }, [entries, usdRate, market, selectedTypes]);
}

export function useCrowdfunding(entries: Entry[]) {
  return useMemo(() => {
    const byProject: Record<
      string,
      { projet: string; bloque: number; rembourse: number; gains: number; lignes: Entry[] }
    > = {};
    entries
      .filter((e) => e.type === "Crowdfunding")
      .forEach((e) => {
        const key = e.projet || e.nom;
        if (!byProject[key])
          byProject[key] = { projet: key, bloque: 0, rembourse: 0, gains: 0, lignes: [] };
        if (e.statut === "Remboursé") byProject[key].rembourse += e.montant;
        else byProject[key].bloque += e.montant;
        byProject[key].gains += e.gains || 0;
        byProject[key].lignes.push(e);
      });
    return Object.values(byProject);
  }, [entries]);
}
