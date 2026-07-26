import { RefreshCw } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Theme } from "@/lib/theme";
import { COLORS, TYPES } from "@/lib/constants";
import { fmt, fmtEurCompact, fmtPct } from "@/lib/finance";
import type { MonthlyDatum, AllocationDatum } from "@/hooks/computations";
import type { AssetType } from "@/types";

interface OverviewTabProps {
  T: Theme;
  patrimoine: { mois: string; valeur: number }[];
  chartTypes: AssetType[];
  onToggleChartType: (t: AssetType) => void;
  allocation: AllocationDatum[];
  monthly: MonthlyDatum[];
  comparatif: { mois: string; Portefeuille: number; "S&P 500": number | null }[];
  selectedMonth: string | null;
  setSelectedMonth: (m: string | null) => void;
  sp500Loading: boolean;
  onRefreshSp500: () => void;
}

const tooltipStyle = (T: Theme) => ({
  background: T.tooltipBg,
  border: `1px solid ${T.tooltipBorder}`,
  borderRadius: 8,
  fontSize: 12,
});

export function OverviewTab({
  T,
  patrimoine,
  chartTypes,
  onToggleChartType,
  allocation,
  monthly,
  comparatif,
  selectedMonth,
  setSelectedMonth,
  sp500Loading,
  onRefreshSp500,
}: OverviewTabProps) {
  const selectedMonthData = selectedMonth ? monthly.find((m) => m.mois === selectedMonth) : null;
  const card = `glossy-hover rounded-[24px] ${T.glass} p-4`;

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className={`text-sm font-medium ${T.textMuted}`}>Évolution du patrimoine</div>
          <div className="flex flex-wrap items-center gap-2">
            {TYPES.map((t) => {
              const active = chartTypes.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => onToggleChartType(t)}
                  className={`glossy-chip flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1 text-xs border ${
                    active ? T.chipOn : T.chipOff
                  }`}
                  aria-pressed={active}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-opacity"
                    style={{ background: COLORS[t], opacity: active ? 1 : 0.3 }}
                  />
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={patrimoine}>
            <defs>
              <linearGradient id="patrimoineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} vertical={false} />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 11, fill: T.chartText }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: T.chartText }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtEurCompact}
              width={70}
            />
            <Tooltip
              formatter={(v) => fmt(Number(v))}
              contentStyle={tooltipStyle(T)}
            />
            <Area
              type="monotone"
              dataKey="valeur"
              name="Patrimoine"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#patrimoineGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={card}>
          <div className={`text-sm font-medium mb-3 ${T.textMuted}`}>Répartition par type</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {allocation.map((d) => (
                    <Cell key={d.name} fill={COLORS[d.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle(T)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {allocation.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1.5 ${T.textMuted}`}>
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[d.name] }} /> {d.name}
                  </span>
                  <span className={T.textFaint}>{d.pct.toFixed(0)}%</span>
                </div>
              ))}
              {allocation.length === 0 && <div className={`text-xs ${T.textFaint}`}>Aucune donnée.</div>}
            </div>
          </div>
        </div>

        <div className={card}>
          <div className={`text-sm font-medium mb-1 ${T.textMuted}`}>Investi vs gains par mois</div>
          <p className={`text-xs mb-1 ${T.textFaint}`}>Clique une barre pour le détail par type.</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={monthly}
              onClick={(s) => {
                if (s && s.activeLabel) setSelectedMonth(s.activeLabel as string);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} vertical={false} />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 11, fill: T.chartText }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: T.chartText }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={fmtEurCompact}
              />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle(T)} />
              <Bar dataKey="investi" fill="#3B82F6" name="Investi" cursor="pointer" radius={[3, 3, 0, 0]} />
              <Bar dataKey="gains" fill="#10B981" name="Gains" cursor="pointer" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {selectedMonthData && (
            <div className={`mt-2 border-t pt-2 space-y-1 ${T.rowBorder}`}>
              <div className={`text-xs font-medium mb-1 ${T.textMuted}`}>
                Détail {selectedMonthData.mois}
              </div>
              {Object.entries(selectedMonthData.byType).map(([type, v]) => (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1.5 ${T.textFaint}`}>
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[type as keyof typeof COLORS] }} /> {type}
                  </span>
                  <span className={T.textFaint}>
                    Investi {fmt(v.investi)} · Gains {fmt(v.gains)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-2">
          <div className={`text-sm font-medium ${T.textMuted}`}>
            Portefeuille vs S&P 500 (base 100)
          </div>
          <button
            onClick={onRefreshSp500}
            disabled={sp500Loading}
            className={`flex items-center gap-1 text-xs ${T.textFaint}`}
          >
            <RefreshCw size={12} className={sp500Loading ? "animate-spin" : ""} /> actualiser
          </button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={comparatif}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} vertical={false} />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 11, fill: T.chartText }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: T.chartText }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip contentStyle={tooltipStyle(T)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Portefeuille" stroke={T.posLine} strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="S&P 500" stroke={T.spLine} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className={`text-xs mt-2 ${T.textFaint}`}>
          Indice S&P 500 estimé via recherche web, à titre indicatif.
        </p>
      </div>
    </div>
  );
}
