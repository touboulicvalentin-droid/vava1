import type { Theme } from "@/lib/theme";

interface MetricRowProps {
  label: string;
  value: string | null | undefined;
  T: Theme;
}

export function MetricRow({ label, value, T }: MetricRowProps) {
  return (
    <div className={`flex justify-between text-sm py-1 border-b ${T.rowBorder}`}>
      <span className={T.textMuted}>{label}</span>
      <span className={`font-medium ${T.text}`}>{value ?? "-"}</span>
    </div>
  );
}
