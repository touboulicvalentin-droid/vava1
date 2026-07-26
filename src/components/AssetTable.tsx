import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import type { AssetType, CryptoDatum, Entry, StockDatum, Suggestion } from "@/types";
import type { Theme } from "@/lib/theme";
import { computeScore, fmt, fmtUsd } from "@/lib/finance";
import { AutoComplete } from "@/components/AutoComplete";
import { ScoreBadge } from "@/components/ScoreBadge";

interface AssetFormState {
  nom: string;
  quantite: string;
  prixAchat: string;
  date: string;
}

interface AssetTableProps {
  kind: AssetType;
  T: Theme;
  themeName: "dark" | "light";
  entries: Entry[];
  form: AssetFormState;
  setForm: (f: AssetFormState) => void;
  data: Record<string, StockDatum | CryptoDatum>;
  dataLoading: boolean;
  dataUpdated: Date | null;
  refresh: () => void;
  suggestions: Suggestion[];
  unit: string;
  usdRate: number;
  onBuy: (kind: AssetType, f: AssetFormState, setF: (f: AssetFormState) => void) => Promise<void>;
  onSell: (id: string, prixVente: number) => Promise<void>;
  onShowDetail: (e: Entry) => void;
}

export function AssetTable({
  kind,
  T,
  themeName,
  entries,
  form,
  setForm,
  data,
  dataLoading,
  dataUpdated,
  refresh,
  suggestions,
  unit,
  usdRate,
  onBuy,
  onSell,
  onShowDetail,
}: AssetTableProps) {
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const open = entries.filter((e) => e.type === kind && e.statut !== "Vendu");
  const sold = entries.filter((e) => e.type === kind && e.statut === "Vendu");

  const inputClass = `w-full h-9 px-2.5 text-sm rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${T.input}`;
  const card = `glossy-hover rounded-[24px] ${T.glass} p-4`;
  const primaryBtn =
    "glossy-btn flex items-center justify-center gap-1.5 h-9 px-3 text-sm rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 text-black font-medium";
  const ghostBtn = `glossy-ghost h-8 px-2.5 text-xs rounded-xl border ${themeName === "dark" ? "border-white/10 text-neutral-300 hover:bg-white/5" : "border-black/10 text-neutral-700 hover:bg-black/5"}`;

  function toEur(usd: number): number {
    return usd * usdRate;
  }

  function confirmSell(id: string): void {
    const prixVente = parseFloat(sellPrice);
    if (isNaN(prixVente)) return;
    void onSell(id, prixVente).then(() => {
      setSellingId(null);
      setSellPrice("");
    });
  }

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className={`text-sm font-medium ${T.textMuted} mb-3`}>Acheter</div>
        <div className="grid grid-cols-5 gap-2 items-end">
          <AutoComplete
            value={form.nom}
            onChange={(v) => setForm({ ...form, nom: v })}
            suggestions={suggestions}
            placeholder="Nom / ticker"
            className={inputClass}
          />
          <input
            className={inputClass}
            type="number"
            step={kind === "Action" ? "1" : "any"}
            min={kind === "Action" ? "1" : "0"}
            placeholder="Quantité"
            value={form.quantite}
            onChange={(e) => setForm({ ...form, quantite: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            step="0.01"
            placeholder={`Prix achat ${unit}`}
            value={form.prixAchat}
            onChange={(e) => setForm({ ...form, prixAchat: e.target.value })}
          />
          <input
            className={inputClass}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <button onClick={() => onBuy(kind, form, setForm)} className={primaryBtn}>
            <Plus size={15} /> Acheter
          </button>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <div className={`text-sm font-medium ${T.textMuted}`}>Portefeuille (prix en direct)</div>
          <button
            onClick={refresh}
            disabled={dataLoading}
            className={`flex items-center gap-1 text-xs ${T.textFaint} hover:${T.text}`}
          >
            <RefreshCw size={12} className={dataLoading ? "animate-spin" : ""} />
            {dataUpdated
              ? `maj ${dataUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
              : "actualiser"}
          </button>
        </div>
        <div className={`overflow-hidden rounded-lg border ${T.rowBorder}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${T.headRow} text-xs`}>
                <th className="text-left px-3 py-2">Nom</th>
                <th className="text-right px-3 py-2">Quantité</th>
                <th className="text-right px-3 py-2">Prix moyen</th>
                <th className="text-right px-3 py-2">Prix actuel</th>
                <th className="text-right px-3 py-2">Valeur (€)</th>
                <th className="text-right px-3 py-2">Latent</th>
                {kind === "Action" && <th className="text-right px-3 py-2">Score</th>}
                <th className="text-right px-3 py-2">Vente</th>
              </tr>
            </thead>
            <tbody>
              {open.map((e) => {
                const d = data[e.nom] as StockDatum | undefined;
                const prixActuel = d?.prix ?? e.prix_achat ?? 0;
                const valeurUsd = (e.quantite ?? 0) * prixActuel;
                const latent = valeurUsd - e.montant;
                const score = kind === "Action" ? computeScore(d) : null;
                return (
                  <tr key={e.id} className={`glossy-row border-t ${T.rowBorder}`}>
                    <td className="px-3 py-2 font-medium">
                      <button onClick={() => onShowDetail(e)} className="hover:underline">
                        {e.nom}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">{e.quantite}</td>
                    <td className={`px-3 py-2 text-right ${T.textFaint}`}>
                      {fmtUsd(e.prix_achat ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right">{fmtUsd(prixActuel)}</td>
                    <td className="px-3 py-2 text-right">{fmt(toEur(valeurUsd))}</td>
                    <td className={`px-3 py-2 text-right ${latent >= 0 ? T.pos : T.neg}`}>
                      {fmtUsd(latent)}
                    </td>
                    {kind === "Action" && (
                      <td className="px-3 py-2 text-right">
                        <ScoreBadge score={score} />
                      </td>
                    )}
                    <td className="px-3 py-2 text-right">
                      {sellingId === e.id ? (
                        <div className="flex gap-1 justify-end">
                          <input
                            className={`w-24 h-8 px-2 text-sm rounded-lg ${T.input}`}
                            type="number"
                            step="0.01"
                            placeholder={`Prix vente ${unit}`}
                            value={sellPrice}
                            onChange={(ev) => setSellPrice(ev.target.value)}
                            autoFocus
                          />
                          <button onClick={() => confirmSell(e.id)} className={ghostBtn}>
                            Valider
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSellingId(e.id);
                            setSellPrice("");
                          }}
                          className={ghostBtn}
                        >
                          Vendre
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {open.length === 0 && (
                <tr>
                  <td
                    colSpan={kind === "Action" ? 8 : 7}
                    className={`px-3 py-6 text-center ${T.textFaint}`}
                  >
                    Rien en portefeuille.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className={`text-xs ${T.textFaint} mt-2`}>Prix et scores estimés via recherche web — à vérifier.</p>
      </div>

      <div className={card}>
        <div className={`text-sm font-medium ${T.textMuted} mb-3`}>Vendues</div>
        <div className={`overflow-hidden rounded-lg border ${T.rowBorder}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${T.headRow} text-xs`}>
                <th className="text-left px-3 py-2">Nom</th>
                <th className="text-right px-3 py-2">Quantité</th>
                <th className="text-right px-3 py-2">Achat</th>
                <th className="text-right px-3 py-2">Vente</th>
                <th className="text-right px-3 py-2">Gain ({unit})</th>
                <th className="text-right px-3 py-2">Gain (€)</th>
              </tr>
            </thead>
            <tbody>
              {sold.map((e) => {
                const gain = e.valeur - e.montant;
                return (
                  <tr key={e.id} className={`glossy-row border-t ${T.rowBorder}`}>
                    <td className="px-3 py-2">{e.nom}</td>
                    <td className="px-3 py-2 text-right">{e.quantite}</td>
                    <td className="px-3 py-2 text-right">{fmtUsd(e.prix_achat ?? 0)}</td>
                    <td className="px-3 py-2 text-right">{fmtUsd(e.prix_vente ?? 0)}</td>
                    <td className={`px-3 py-2 text-right ${gain >= 0 ? T.pos : T.neg}`}>{fmtUsd(gain)}</td>
                    <td className={`px-3 py-2 text-right ${gain >= 0 ? T.pos : T.neg}`}>
                      {fmt(toEur(gain))}
                    </td>
                  </tr>
                );
              })}
              {sold.length === 0 && (
                <tr>
                  <td colSpan={6} className={`px-3 py-6 text-center ${T.textFaint}`}>
                    Aucune vente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
