export type AssetType = "Action" | "Crypto" | "Crowdfunding" | "Immobilier" | "Autre";

export type AssetStatus = "En cours" | "Remboursé" | "En portefeuille" | "Vendu";

export interface Entry {
  id: string;
  nom: string;
  type: AssetType;
  projet: string;
  date: string | null;
  montant: number;
  gains: number;
  valeur: number;
  statut: AssetStatus;
  quantite: number | null;
  prix_achat: number | null;
  prix_vente: number | null;
  created_at: string;
}

export interface NewEntry {
  nom: string;
  type: AssetType;
  projet?: string;
  date?: string | null;
  montant?: number;
  gains?: number;
  valeur?: number;
  statut?: AssetStatus;
  quantite?: number | null;
  prix_achat?: number | null;
  prix_vente?: number | null;
}

export interface StockDatum {
  prix: number | null;
  per: number | null;
  pfcf: number | null;
  margeNette: number | null;
  detteEquity: number | null;
  dividendYield: number | null;
  marketCap: number | null;
}

export interface CryptoDatum {
  prix: number | null;
  variation24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
}

export interface Suggestion {
  symbol: string;
  name: string;
}
