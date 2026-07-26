export function GlossyStyles() {
  return (
    <style>{`
      @keyframes glossyFadeUp { from { opacity: 0; transform: translateY(14px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes glossySheen { 0% { transform: translateX(-120%) skewX(-15deg); } 100% { transform: translateX(220%) skewX(-15deg); } }
      @keyframes glossyPop { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes glossyLive { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52,211,153,0.55); } 50% { transform: scale(1.15); box-shadow: 0 0 0 5px rgba(52,211,153,0); } }
      @keyframes glossyShine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      .glossy-enter { animation: glossyFadeUp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

      .glossy-live-dot { animation: glossyLive 2s ease-in-out infinite; }

      .glossy-chip {
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        backdrop-filter: blur(8px);
      }
      .glossy-chip:hover { transform: translateY(-1px) scale(1.04); }
      .glossy-chip:active { transform: scale(0.95); }

      .glossy-glass {
        position: relative;
        -webkit-backdrop-filter: saturate(180%);
        backdrop-filter: saturate(180%);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s ease;
        box-shadow: 0 1px 1px rgba(255,255,255,0.10) inset, 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 20px 44px -18px rgba(0,0,0,0.6), 0 4px 12px -6px rgba(0,0,0,0.35);
      }
      .glossy-glass::before {
        content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
        background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 26%, rgba(255,255,255,0) 55%);
      }
      .glossy-glass::after {
        content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
        background: radial-gradient(120% 80% at 15% -10%, rgba(255,255,255,0.14), transparent 45%);
      }
      .glossy-hover:hover {
        transform: translateY(-2px) scale(1.012);
        box-shadow: 0 2px 1px rgba(255,255,255,0.08) inset, 0 26px 50px -16px rgba(0,0,0,0.6), 0 8px 18px -8px rgba(0,0,0,0.4);
      }

      .glossy-btn {
        position: relative; overflow: hidden; isolation: isolate;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s ease;
        box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset, 0 -6px 10px rgba(0,0,0,0.12) inset, 0 8px 16px -6px rgba(16,185,129,0.45);
      }
      .glossy-btn::after {
        content: ""; position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%);
        pointer-events: none;
      }
      .glossy-btn:hover { transform: translateY(-1px) scale(1.03); filter: brightness(1.05); box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 -6px 10px rgba(0,0,0,0.12) inset, 0 12px 22px -6px rgba(16,185,129,0.55); }
      .glossy-btn:active { transform: translateY(0) scale(0.965); }

      .glossy-ghost { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, box-shadow 0.2s ease; }
      .glossy-ghost:hover { transform: translateY(-1px) scale(1.03); }
      .glossy-ghost:active { transform: scale(0.96); }

      .glossy-pill-active { box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 14px -4px rgba(0,0,0,0.35); }
      .glossy-tab { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease, background-color 0.2s ease; }
      .glossy-tab:hover { transform: translateY(-1px); }
      .glossy-tab:active { transform: scale(0.96); }

      .glossy-dot { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease; }
      .glossy-dot:hover { transform: scale(1.25); box-shadow: 0 0 8px currentColor; }

      .glossy-row { transition: background-color 0.2s ease; }
      .glossy-row:hover { background-color: rgba(255,255,255,0.035); }

      @media (prefers-reduced-motion: reduce) {
        .glossy-enter, .glossy-glass, .glossy-hover, .glossy-btn, .glossy-ghost, .glossy-tab, .glossy-dot { animation: none !important; transition: none !important; }
        .glossy-hover:hover, .glossy-btn:hover, .glossy-tab:hover, .glossy-dot:hover { transform: none !important; }
      }
    `}</style>
  );
}
