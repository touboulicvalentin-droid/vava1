export interface Theme {
  pageBg: string;
  pageMesh: string;
  wallpaper: string;
  glass: string;
  glassStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  input: string;
  headRow: string;
  rowBorder: string;
  chartGrid: string;
  chartText: string;
  tooltipBg: string;
  tooltipBorder: string;
  pos: string;
  neg: string;
  pillActive: string;
  pillInactive: string;
  chipOn: string;
  chipOff: string;
  posLine: string;
  negLine: string;
  spLine: string;
}

export type ThemeName = "dark" | "light";

export function getTheme(theme: ThemeName): Theme {
  return theme === "dark"
    ? {
        pageBg: "bg-[#0a0d18]",
        pageMesh:
          "radial-gradient(ellipse 900px 500px at 12% -8%, rgba(99,102,241,0.28), transparent 60%)," +
          "radial-gradient(ellipse 800px 600px at 100% 10%, rgba(16,185,129,0.18), transparent 55%)," +
          "radial-gradient(ellipse 900px 700px at 50% 110%, rgba(59,130,246,0.16), transparent 55%)," +
          "linear-gradient(160deg, rgba(11,15,26,0.72) 0%, rgba(13,18,36,0.68) 45%, rgba(19,26,46,0.74) 100%)",
        wallpaper: "url('/wallpaper-dark.png')",
        glass:
          "glossy-glass backdrop-blur-2xl bg-white/[0.07] border border-white/[0.14]",
        glassStrong:
          "glossy-glass backdrop-blur-3xl bg-white/[0.10] border border-white/[0.18]",
        text: "text-neutral-100",
        textMuted: "text-neutral-400",
        textFaint: "text-neutral-500",
        input:
          "bg-black/25 border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:border-white/25",
        headRow: "bg-white/[0.03] text-neutral-500",
        rowBorder: "border-white/[0.07]",
        chartGrid: "rgba(255,255,255,0.08)",
        chartText: "#94A3B8",
        tooltipBg: "#161b2e",
        tooltipBorder: "rgba(255,255,255,0.12)",
        pos: "text-emerald-400",
        neg: "text-red-400",
        pillActive: "glossy-pill-active bg-white text-black",
        pillInactive: "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06]",
        chipOn: "bg-white/[0.14] border-white/25 text-neutral-100",
        chipOff: "bg-transparent border-white/10 text-neutral-500 hover:text-neutral-300",
        posLine: "#34D399",
        negLine: "#F87171",
        spLine: "#60A5FA",
      }
    : {
        pageBg: "bg-[#eef1f6]",
        pageMesh:
          "radial-gradient(ellipse 900px 500px at 12% -8%, rgba(99,102,241,0.10), transparent 60%)," +
          "radial-gradient(ellipse 800px 600px at 100% 10%, rgba(16,185,129,0.10), transparent 55%)," +
          "radial-gradient(ellipse 900px 700px at 50% 110%, rgba(59,130,246,0.08), transparent 55%)," +
          "linear-gradient(160deg, rgba(242,244,249,0.55) 0%, rgba(232,236,243,0.5) 45%, rgba(226,231,240,0.55) 100%)",
        wallpaper: "url('/wallpaper-light.png')",
        glass: "glossy-glass backdrop-blur-2xl bg-white/60 border border-white/70",
        glassStrong: "glossy-glass backdrop-blur-3xl bg-white/75 border border-white/85",
        text: "text-neutral-900",
        textMuted: "text-neutral-600",
        textFaint: "text-neutral-500",
        input:
          "bg-white/80 border border-black/10 text-neutral-900 placeholder:text-neutral-400 focus:border-black/20",
        headRow: "bg-black/[0.03] text-neutral-500",
        rowBorder: "border-black/[0.06]",
        chartGrid: "rgba(0,0,0,0.08)",
        chartText: "#475569",
        tooltipBg: "#ffffff",
        tooltipBorder: "rgba(0,0,0,0.1)",
        pos: "text-emerald-600",
        neg: "text-red-600",
        pillActive: "glossy-pill-active bg-neutral-900 text-white",
        pillInactive: "text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]",
        chipOn: "bg-black/[0.06] border-black/20 text-neutral-900",
        chipOff: "bg-transparent border-black/10 text-neutral-400 hover:text-neutral-700",
        posLine: "#059669",
        negLine: "#DC2626",
        spLine: "#2563EB",
      };
}
