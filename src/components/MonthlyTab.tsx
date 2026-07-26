import type { Theme } from "@/lib/theme";
import { fmt } from "@/lib/finance";
import type { MonthlyDatum } from "@/hooks/computations";

interface MonthlyTabProps {
  T: Theme;
  monthly: MonthlyDatum[];
}

export function MonthlyTab({ T, monthly }: MonthlyTabProps) {
  const card = `glossy-hover rounded-[24px] ${T.glass} p-4`;
  return (
    <div className={card}>
      <div className={`overflow-hidden rounded-lg border ${T.rowBorder}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`${T.headRow} text-xs`}>
              <th className="text-left px-3 py-2">Mois</th>
              <th className="text-right px-3 py-2">Investi</th>
              <th className="text-right px-3 py-2">Gains</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.mois} className={`glossy-row border-t ${T.rowBorder}`}>
                <td className="px-3 py-2">{m.mois}</td>
                <td className="px-3 py-2 text-right">{fmt(m.investi)}</td>
                <td className={`px-3 py-2 text-right ${m.gains >= 0 ? T.pos : T.neg}`}>
                  {fmt(m.gains)}
                </td>
              </tr>
            ))}
            {monthly.length === 0 && (
              <tr>
                <td colSpan={3} className={`px-3 py-6 text-center ${T.textFaint}`}>
                  Aucune donnée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
