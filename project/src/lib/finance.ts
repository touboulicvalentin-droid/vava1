import type { Entry, StockDatum } from "@/types";

export function fmt(n: number): string {
  return (n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function fmtUsd(n: number): string {
  return (n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $";
}

export function fmtCompact(n: number): string {
  if (!n) return "-";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " Md";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " M";
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

export function fmtEurCompact(n: number): string {
  return (n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

export function fmtPct(n: number): string {
  if (!isFinite(n)) return "0.0 %";
  return (n >= 0 ? "+" : "") + n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function capitalGain(e: Entry): number {
  return e.valeur > 0 ? e.valeur - e.montant : 0;
}

export function gainTotal(e: Entry): number {
  return (e.gains || 0) + capitalGain(e);
}

export function rendement(e: Entry): number {
  if (!e.montant) return 0;
  return (gainTotal(e) / e.montant) * 100;
}

export function monthKey(dateStr: string | null): string {
  return dateStr ? dateStr.slice(0, 7) : "Sans date";
}

export function computeScore(f: StockDatum | undefined | null): number | null {
  if (!f) return null;
  const valoPer = f.per && f.per > 0 ? clamp(5 - (f.per - 15) / 6, 0, 5) : 2.5;
  const valoPfcf = f.pfcf && f.pfcf > 0 ? clamp(5 - (f.pfcf - 15) / 6, 0, 5) : 2.5;
  const valorisation = (valoPer + valoPfcf) / 2;
  const rentabilite = clamp(((f.margeNette || 0) / 30) * 5, 0, 5);
  const sante = clamp(5 - (f.detteEquity || 0) * 2.5, 0, 5);
  const rendement = clamp(((f.dividendYield || 0) / 6) * 5, 0, 5);
  return Math.round((valorisation + rentabilite + sante + rendement) * 10) / 10;
}
