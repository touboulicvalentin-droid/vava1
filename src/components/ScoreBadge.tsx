interface ScoreBadgeProps {
  score: number | null;
  large?: boolean;
}

export function ScoreBadge({ score, large }: ScoreBadgeProps) {
  if (score == null) return <span className="text-xs text-neutral-400">-</span>;
  const color =
    score >= 14
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : score >= 10
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-red-500/15 text-red-400 border-red-500/30";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold shadow-[0_1px_0_rgba(255,255,255,0.35)_inset] ${color} ${large ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5"}`}
      style={{ animation: "glossyPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      {score.toFixed(1)}/20
    </span>
  );
}
