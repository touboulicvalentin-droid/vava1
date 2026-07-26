import type { AssetType, Suggestion } from "@/types";

export const TYPES: AssetType[] = ["Action", "Crypto", "Crowdfunding", "Immobilier", "Autre"];

export const COLORS: Record<AssetType, string> = {
  Action: "#3B82F6",
  Crypto: "#F59E0B",
  Crowdfunding: "#A78BFA",
  Immobilier: "#10B981",
  Autre: "#94A3B8",
};

export const STORAGE_KEY = "portfolio_entries_v2";

export const STOCKS: Suggestion[] = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "BRK-B", name: "Berkshire Hathaway" },
  { symbol: "LLY", name: "Eli Lilly" },
  { symbol: "AVGO", name: "Broadcom" },
  { symbol: "JPM", name: "JPMorgan Chase" },
  { symbol: "V", name: "Visa" },
  { symbol: "MA", name: "Mastercard" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "MC.PA", name: "LVMH" },
  { symbol: "OR.PA", name: "L'Oréal" },
  { symbol: "AIR.PA", name: "Airbus" },
  { symbol: "SAP", name: "SAP" },
  { symbol: "ASML", name: "ASML" },
  { symbol: "TTE.PA", name: "TotalEnergies" },
];

export const CRYPTOS: Suggestion[] = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "TON", name: "Toncoin" },
  { symbol: "SUI", name: "Sui" },
  { symbol: "NEAR", name: "NEAR Protocol" },
];
