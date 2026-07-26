import { Plus } from "lucide-react";
import type { Entry } from "@/types";
import type { Theme } from "@/lib/theme";
import { fmt, fmtPct } from "@/lib/finance";

interface CrowdfundingFormState {
  projet: string;
  date: string;
  montant: string;
  gains: string;
  statut: string;
}

interface CrowdfundingTabProps {
  T: Theme;
  form: CrowdfundingFormState;
  setForm: (f: CrowdfundingFormState) => void;
  crowdfunding: {
    projet: string;
    bloque: number;
    rembourse: number;
    gains: number;
    lignes: Entry[];
  }[];
  onAdd: () => void;
}

export function CrowdfundingTab({ T, form, setForm, crowdfunding, onAdd }: CrowdfundingTabProps) {
  const inputClass = `w-full h-9 px-2.5 text-sm rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${T.input}`;
  const card = `glossy-hover rounded-[24px] ${T.glass} p-4`;
  const primaryBtn =
    "glossy-btn flex items-center justify-center gap-1.5 h-9 px-3 text-sm rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 text-black font-medium";

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className={`text-sm font-medium mb-3 ${T.textMuted}`}>Ajouter un versement</div>
        <div className="grid grid-cols-6 gap-2 items-end">
          <input
            className={inputClass}
            placeholder="Projet"
            value={form.projet}
            onChange={(e) => setForm({ ...form, projet: e.target.value, statut: form.statut })}
          />
          <input
            className={inputClass}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value, statut: form.statut })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Montant €"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value, statut: form.statut })}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Gains €"
            value={form.gains}
            onChange={(e) => setForm({ ...form, gains: e.target.value, statut: form.statut })}
          />
          <select
            className={inputClass}
            value={form.statut}
            onChange={(e) => setForm({ ...form, statut: e.target.value })}
          >
            <option>En cours</option>
            <option>Remboursé</option>
          </select>
          <button onClick={onAdd} className={primaryBtn}>
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>
      {crowdfunding.length === 0 && (
        <div className={`text-sm py-6 text-center ${T.textFaint}`}>Aucun projet de crowdfunding.</div>
      )}
      {crowdfunding.map((p) => {
        const total = p.bloque + p.rembourse;
        const r = total ? (p.gains / total) * 100 : 0;
        return (
          <div key={p.projet} className={card}>
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium text-sm">{p.projet}</div>
              <div className={`text-sm ${T.pos}`}>{fmtPct(r)} sur capital</div>
            </div>
            <div className={`flex gap-4 text-xs ${T.textFaint}`}>
              <span>Bloqué: {fmt(p.bloque)}</span>
              <span>Remboursé: {fmt(p.rembourse)}</span>
              <span>Gains perçus: {fmt(p.gains)}</span>
              <span>{p.lignes.length} versement(s)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
