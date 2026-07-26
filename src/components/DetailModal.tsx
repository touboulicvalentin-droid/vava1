import { X } from "lucide-react";
import type { CryptoDatum, Entry, StockDatum } from "@/types";
import type { Theme } from "@/lib/theme";
import { computeScore, fmtCompact, fmtPct, fmtUsd } from "@/lib/finance";
import { MetricRow } from "@/components/MetricRow";
import { ScoreBadge } from "@/components/ScoreBadge";

interface DetailModalProps {
  asset: Entry | null;
  onClose: () => void;
  data: StockDatum | CryptoDatum | undefined;
  T: Theme;
}

export function DetailModal({ asset, onClose, data, T }: DetailModalProps) {
  if (!asset) return null;
  const isAction = asset.type === "Action";
  const stockData = data as StockDatum | undefined;
  const cryptoData = data as CryptoDatum | undefined;
  const score = isAction ? computeScore(stockData) : null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`${T.glass} rounded-[28px] w-full max-w-md p-5 shadow-2xl`}
        style={{ animation: "glossyPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <span className="glossy-dot w-3 h-3 rounded-full bg-red-500 text-red-500" />
            <span className="glossy-dot w-3 h-3 rounded-full bg-yellow-500 text-yellow-500" />
            <span className="glossy-dot w-3 h-3 rounded-full bg-green-500 text-green-500" />
          </div>
          <button onClick={onClose} className={`glossy-ghost ${T.textMuted}`}>
            <X size={16} />
          </button>
        </div>
        <div className={`text-lg font-semibold ${T.text}`}>{asset.nom}</div>
        <div className={`text-xs ${T.textMuted} mb-3`}>{asset.type}</div>
        {!data && <div className={`text-sm ${T.textMuted}`}>Chargement des données...</div>}
        {data && isAction && (
          <div>
            <div className="mb-3">
              <ScoreBadge score={score} large />
            </div>
            <MetricRow T={T} label="PER" value={stockData?.per?.toFixed(1)} />
            <MetricRow T={T} label="P/FCF" value={stockData?.pfcf?.toFixed(1)} />
            <MetricRow
              T={T}
              label="Marge nette"
              value={stockData?.margeNette != null ? `${stockData.margeNette.toFixed(1)}%` : null}
            />
            <MetricRow T={T} label="Dette / capitaux" value={stockData?.detteEquity?.toFixed(2)} />
            <MetricRow
              T={T}
              label="Rendement dividende"
              value={stockData?.dividendYield != null ? `${stockData.dividendYield.toFixed(2)}%` : null}
            />
            <MetricRow
              T={T}
              label="Capitalisation"
              value={stockData?.marketCap ? fmtCompact(stockData.marketCap) + " $" : null}
            />
          </div>
        )}
        {data && !isAction && cryptoData && (
          <div>
            <MetricRow T={T} label="Prix" value={fmtUsd(cryptoData.prix ?? 0)} />
            <MetricRow
              T={T}
              label="Variation 24h"
              value={cryptoData.variation24h != null ? fmtPct(cryptoData.variation24h) : null}
            />
            <MetricRow
              T={T}
              label="Capitalisation"
              value={cryptoData.marketCap ? fmtCompact(cryptoData.marketCap) + " $" : null}
            />
            <MetricRow
              T={T}
              label="Volume 24h"
              value={cryptoData.volume24h ? fmtCompact(cryptoData.volume24h) + " $" : null}
            />
          </div>
        )}
        <p className={`text-xs ${T.textFaint} mt-4`}>
          Données estimées via recherche web — à vérifier avant toute décision.
        </p>
      </div>
    </div>
  );
}
