import { Plus, Trash2 } from "lucide-react";
import type { AssetType, Entry } from "@/types";
import { TYPES } from "@/lib/constants";
import type { Theme } from "@/lib/theme";
import { fmt, fmtPct, rendement } from "@/lib/finance";

interface DetailFormState {
  nom: string;
  type: AssetType;
  projet: string;
  date: string;
  montant: string;
  gains: string;
  valeur: string;
  statut: string;
}

interface DetailTabProps {
  T: Theme;
  form: DetailFormState;
  setForm: (f: DetailFormState) => void;
  entries: Entry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function DetailTab({ T, form, setForm, entries, onAdd, onRemove }: DetailTabProps) {
  const inputClass = `w-full h-9 px-2.5 text-sm rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${T.input}`;
  const card = `glossy-hover rounded-[24px] ${T.glass} p-4`;
  const primaryBtn =
    "glossy-btn flex items-center justify-center gap-1.5 h-9 px-3 text-sm rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 text-black font-medium";

  const sorted = entries.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className={`text-sm font-medium mb-3 ${T.textMuted}`}>Ajouter une ligne</div>
        <div className="grid grid-cols-4 gap-2 items-end mb-2">
          <input
            className={inputClass}
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Projet (crowdfunding)"
            value={form.projet}
            onChange={(e) => setForm({ ...form, projet: e.target.value })}
          />
          <input
            className={inputClass}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-4 gap-2 items-end">
          <input
            className={inputClass}
            type="number"
            placeholder="Montant €"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Gains €"
            value={form.gains}
            onChange={(e) => setForm({ ...form, gains: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Valeur €"
            value={form.valeur}
            onChange={(e) => setForm({ ...form, valeur: e.target.value })}
          />
          <select
            className={inputClass}
            value={form.statut}
            onChange={(e) => setForm({ ...form, statut: e.target.value })}
          >
            <option>En cours</option>
            <option>Remboursé</option>
          </select>
        </div>
        <button onClick={onAdd} className={`${primaryBtn} mt-2`}>
          <Plus size={15} /> Ajouter
        </button>
      </div>
      <div className={card}>
        <div className={`overflow-hidden rounded-lg border ${T.rowBorder}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${T.headRow} text-xs`}>
                <th className="text-left px-3 py-2">Nom</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Projet</th>
                <th className="text-right px-3 py-2">Investi</th>
                <th className="text-right px-3 py-2">Rendement</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => {
                const r = rendement(e);
                return (
                  <tr key={e.id} className={`glossy-row border-t ${T.rowBorder}`}>
                    <td className="px-3 py-2">{e.nom}</td>
                    <td className={`px-3 py-2 ${T.textFaint}`}>{e.type}</td>
                    <td className={`px-3 py-2 ${T.textFaint}`}>{e.projet}</td>
                    <td className="px-3 py-2 text-right">{fmt(e.montant)}</td>
                    <td className={`px-3 py-2 text-right ${r >= 0 ? T.pos : T.neg}`}>{fmtPct(r)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => onRemove(e.id)}
                        className={`${T.textFaint} hover:text-red-400`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className={`px-3 py-6 text-center ${T.textFaint}`}>
                    Aucun investissement.
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
