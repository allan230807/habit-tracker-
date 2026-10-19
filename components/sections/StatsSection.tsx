"use client";

import { useMemo } from "react";
import { ProgressBar } from "@/components/ui";
import { STAT_KEYS, STAT_LABELS, addDays, computeProgress, dayNumber, habitSuccess } from "@/lib/gameLogic";
import type { SectionProps } from "./types";

function Bar({ pct, color, label, title }: { pct: number; color: string; label: string; title: string }) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={title}>
      <div className="flex w-full flex-1 items-end">
        <div className={`w-full rounded-t-[3px] ${pct > 0 ? color : "bg-raised"}`} style={{ height: `${Math.max(pct, 3)}%` }} />
      </div>
      <span className="text-[10px] leading-none text-muted">{label}</span>
    </div>
  );
}

export default function StatsSection({ state, today }: SectionProps) {
  const p = computeProgress(state);
  const day = dayNumber(state, today);

  const last14 = useMemo(() => {
    const total = state.habits.length || 1;
    return Array.from({ length: 14 }, (_, i) => {
      const key = addDays(today, i - 13);
      const count = state.habits.filter((h) => h.history.includes(key)).length;
      return { key, count, pct: (count / total) * 100 };
    });
  }, [state.habits, today]);

  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const key = addDays(today, i - 6);
      let gain = 0;
      let spent = 0;
      for (const t of state.transactions) {
        if (t.date !== key) continue;
        if (t.amount > 0) gain += t.amount;
        else spent -= t.amount;
      }
      return { key, gain, spent };
    });
    const max = Math.max(1, ...days.flatMap((d) => [d.gain, d.spent]));
    return days.map((d) => ({ ...d, gainPct: (d.gain / max) * 100, spentPct: (d.spent / max) * 100 }));
  }, [state.transactions, today]);

  const tones = ["sky", "sand", "rose", "accent", "sand"] as const;
  const rpg = [
    ...STAT_KEYS.map((k, i) => ({ name: STAT_LABELS[k], value: p.stats[k], tone: tones[i % tones.length] })),
    { name: "Enfoque (h)", value: p.focus, tone: "sky" as const },
  ];
  const rpgMax = Math.max(10, ...rpg.map((r) => r.value));

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="section-title !mb-1">Personaje</p>
            <p className="text-3xl font-semibold tracking-tight">Nivel {p.level}</p>
          </div>
          <div className="text-right">
            <p className="section-title !mb-1">Hoy es el</p>
            <p className="font-mono text-3xl font-medium text-accent">Día {day}</p>
          </div>
        </div>
        <ProgressBar value={p.xp - p.levelStartXp} max={p.nextLevelXp - p.levelStartXp} label="Experiencia" right={`${p.xp} / ${p.nextLevelXp} XP`} />
        <div className="mt-5 space-y-3.5">
          {rpg.map((r) => (
            <ProgressBar key={r.name} value={r.value} max={rpgMax} tone={r.tone} label={r.name} right={String(r.value)} />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Cada meta que cumples suma puntos a su categoría y XP. También suben con tus hábitos de esa categoría y tus horas de trabajo.</p>
      </section>

      <section className="card">
        <h2 className="section-title">Hábitos · últimos 14 días</h2>
        <div className="flex h-32 items-end gap-1 border-b border-line">
          {last14.map((d) => (
            <Bar key={d.key} pct={d.pct} color="bg-accent" label={d.key.slice(8)} title={`${d.key}: ${d.count}/${state.habits.length}`} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Horas por meta</h2>
        {state.goals.length === 0 ? (
          <p className="text-sm text-muted">Sin metas.</p>
        ) : (
          <div className="flex h-32 items-end gap-3 border-b border-line">
            {state.goals.map((g) => (
              <Bar
                key={g.id}
                pct={Math.min(100, (g.currentHours / g.targetHours) * 100)}
                color="bg-sky"
                label={g.name.slice(0, 8)}
                title={`${g.name}: ${g.currentHours.toFixed(2)}/${g.targetHours}h`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Monedas · 7 días</h2>
        <div className="flex h-32 items-end gap-2 border-b border-line">
          {last7.map((d) => (
            <div key={d.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${d.key}: +${d.gain} / -${d.spent}`}>
              <div className="flex w-full flex-1 items-end gap-[2px]">
                <div className="w-1/2 rounded-t-[3px] bg-accent" style={{ height: `${Math.max(d.gainPct, 3)}%`, opacity: d.gain ? 1 : 0.2 }} />
                <div className="w-1/2 rounded-t-[3px] bg-rose" style={{ height: `${Math.max(d.spentPct, 3)}%`, opacity: d.spent ? 1 : 0.2 }} />
              </div>
              <span className="text-[10px] leading-none text-muted">{d.key.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          <span className="text-accent">■</span> ganado <span className="ml-3 text-rose">■</span> gastado
        </p>
      </section>

      <section className="card">
        <h2 className="section-title">Éxito histórico</h2>
        <p className="mb-3 text-xs text-muted">Días completados ÷ días desde el Día 1 ({day}).</p>
        <div className="space-y-3.5">
          {state.habits.map((h) => {
            const pct = habitSuccess(state, h, today);
            return <ProgressBar key={h.id} value={pct} max={100} tone={pct >= 70 ? "accent" : pct >= 40 ? "sand" : "rose"} label={h.name} right={`${pct.toFixed(0)}%`} />;
          })}
          {state.habits.length === 0 && <p className="text-sm text-muted">Sin hábitos.</p>}
        </div>
      </section>
    </div>
  );
}
