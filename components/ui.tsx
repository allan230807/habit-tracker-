type Tone = "accent" | "sand" | "rose" | "sky";

const FILL: Record<Tone, string> = {
  accent: "bg-accent",
  sand: "bg-sand",
  rose: "bg-rose",
  sky: "bg-sky",
};

interface BarProps {
  value: number;
  max: number;
  tone?: Tone;
  label?: string;
  right?: string;
}

/** Barra de progreso fina que se llena de izquierda a derecha. */
export function ProgressBar({ value, max, tone = "accent", label, right }: BarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div>
      {(label || right) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
          <span className="truncate text-fg">{label}</span>
          <span className="shrink-0 font-mono text-xs text-muted">{right}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-raised">
        <div className={`h-full rounded-full ${FILL[tone]} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
        checked ? "border-accent bg-accent text-[#10231a]" : "border-line bg-bg hover:border-muted"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3.2 3.2L13 4.8" />
        </svg>
      )}
    </button>
  );
}
