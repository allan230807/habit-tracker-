type Tone = "lime" | "cyan" | "magenta";

const TONES: Record<Tone, { bar: string; border: string; text: string }> = {
  lime: { bar: "bg-neon-lime shadow-[0_0_10px_#9dff00]", border: "border-neon-lime", text: "text-neon-lime" },
  cyan: { bar: "bg-neon-cyan shadow-[0_0_10px_#00f0ff]", border: "border-neon-cyan", text: "text-neon-cyan" },
  magenta: {
    bar: "bg-neon-magenta shadow-[0_0_10px_#ff2bd6]",
    border: "border-neon-magenta",
    text: "text-neon-magenta",
  },
};

interface Props {
  value: number;
  max: number;
  tone?: Tone;
  label?: string;
  right?: string;
}

/** Barra estilo HP/XP retro: se llena de izquierda a derecha. */
export default function PixelBar({ value, max, tone = "lime", label, right }: Props) {
  const t = TONES[tone];
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div>
      {(label || right) && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className={`truncate uppercase ${t.text}`}>{label}</span>
          <span className="shrink-0 text-zinc-400">{right}</span>
        </div>
      )}
      <div className={`relative h-6 border-4 ${t.border} bg-black p-[2px]`}>
        <div className={`h-full ${t.bar} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
        <div
          className="pointer-events-none absolute inset-[2px]"
          style={{ background: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,.75) 6px 8px)" }}
        />
      </div>
    </div>
  );
}
