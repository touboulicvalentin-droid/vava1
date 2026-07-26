import { useState } from "react";
import type { Suggestion } from "@/types";

interface AutoCompleteProps {
  value: string;
  onChange: (v: string) => void;
  suggestions: Suggestion[];
  placeholder: string;
  className: string;
}

export function AutoComplete({ value, onChange, suggestions, placeholder, className }: AutoCompleteProps) {
  const [open, setOpen] = useState(false);
  const q = value.toLowerCase();
  const filtered = q
    ? suggestions
        .filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
        .slice(0, 6)
    : [];
  return (
    <div className="relative">
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <div
          className="glossy-glass absolute z-30 mt-1 w-56 rounded-2xl border border-white/10 bg-[#12172A]/95 backdrop-blur-2xl shadow-xl overflow-hidden"
          style={{ animation: "glossyPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          {filtered.map((s) => (
            <button
              key={s.symbol}
              onMouseDown={() => {
                onChange(s.symbol);
                setOpen(false);
              }}
              className="glossy-row w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex justify-between text-neutral-100 transition-colors"
            >
              <span className="font-medium">{s.symbol}</span>
              <span className="text-neutral-400 truncate ml-2">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
