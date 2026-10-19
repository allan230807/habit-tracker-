"use client";

import { useMemo } from "react";
import { useNow } from "@/hooks/useNow";
import {
  addDays,
  computeProgress,
  dateKey,
  dayNumber,
  habitSuccess,
} from "@/lib/gameLogic";
import type { GameState } from "@/lib/types";
import PixelBar from "./PixelBar";

interface BarProps {
  pct: number;
  color: string;
  label: string;
  title: string;
}

function Bar({ pct, color, label, title }: BarProps) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={title}>
      <div className="flex w-full flex-1 items-end">
        <div
          className={`w-full ${pct > 0 ? color : "bg-zinc-800"}`}
          style={{ height: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="text-sm leading-none text-zinc-500">{label}</span>
    </div>
  );
}

export default function StatsPanel({ state }: { state: GameState }) {
  const now = useNow(60_000);
  const today = dateKey(new Date(now));
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

  const rpg = [
    { key: "FUE", name: "Fuerza", value: p.fuerza, tone: "magenta" as const },
    { key: "INT", name: "Inteligencia", value: p.inteligencia, tone: "cyan" as const },
    { key: "ESP", name: "Espíritu", value: p.espiritu, tone: "lime" as const },
    { key: "DIS", name: "Disciplina", value: p.discipline, tone: "magenta" as const },
    { key: "ENF", name: "Enfoque (h)", value: p.focus, tone: "cyan" as const },
  ];
  const rpgMax = Math.max(10, ...rpg.map((r) => r.value));

  return (
    <>
      <section className="panel !border-neon-magenta">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="panel-title !mb-0 !text-neon-magenta">Personaje</h2>
          <span className="glitch text-4xl text-neon-lime">DÍA {day}</span>
        </div>
        <div className="mb-1 text-4xl text-neon-cyan">NIVEL {p.level}</div>
        <PixelBar
          value={p.xp - p.levelStartXp}
          max={p.nextLevelXp - p.levelStartXp}
          tone="cyan"
          label="XP"
          right={`${p.xp} / ${p.nextLevelXp}`}
        />
        <div className="mt-4 space-y-3">
          {rpg.map((r) => (
            <PixelBar key={r.key} value={r.value} max={rpgMax} tone={r.tone} label={`${r.key} · ${r.name}`} right={String(r.value)} />
          ))}
        </div>
        <p className="mt-3 text-sm text-zinc-600">
          XP = horas×20 + hábitos×5 + tareas×3 + trotes×5. Las stats suben con tus hábitos y horas de deep work.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">Hábitos · últimos 14 días</h2>
        <div className="flex h-36 items-end gap-[3px] border-b-2 border-l-2 border-line px-1">
          {last14.map((d) => (
            <Bar
              key={d.key}
              pct={d.pct}
              color="bg-neon-lime shadow-[0_0_6px_#9dff00]"
              label={d.key.slice(8)}
              title={`${d.key}: ${d.count}/${state.habits.length}`}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Horas por meta</h2>
        {state.goals.length === 0 ? (
          <p className="text-zinc-600">Sin metas.</p>
        ) : (
          <div className="flex h-36 items-end gap-2 border-b-2 border-l-2 border-line px-1">
            {state.goals.map((g) => (
              <Bar
                key={g.id}
                pct={Math.min(100, (g.currentHours / g.targetHours) * 100)}
                color="bg-neon-cyan shadow-[0_0_6px_#00f0ff]"
                label={g.name.slice(0, 6)}
                title={`${g.name}: ${g.currentHours.toFixed(2)}/${g.targetHours}h`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">Monedas · 7 días</h2>
        <div className="flex h-36 items-end gap-2 border-b-2 border-l-2 border-line px-1">
          {last7.map((d) => (
            <div key={d.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${d.key}: +${d.gain} / -${d.spent}`}>
              <div className="flex w-full flex-1 items-end gap-[2px]">
                <div className="w-1/2 bg-neon-lime" style={{ height: `${Math.max(d.gainPct, 2)}%`, opacity: d.gain ? 1 : 0.2 }} />
                <div className="w-1/2 bg-neon-magenta" style={{ height: `${Math.max(d.spentPct, 2)}%`, opacity: d.spent ? 1 : 0.2 }} />
              </div>
              <span className="text-sm leading-none text-zinc-500">{d.key.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          <span className="text-neon-lime">■</span> ganado <span className="ml-2 text-neon-magenta">■</span> gastado
        </p>
      </section>

      <section className="panel !border-neon-lime">
        <h2 className="panel-title !text-neon-lime">Éxito histórico</h2>
        <p className="mb-3 text-sm text-zinc-500">días completados / días desde el Día 1 ({day})</p>
        <div className="space-y-3">
          {state.habits.map((h) => {
            const pct = habitSuccess(state, h, today);
            return (
              <PixelBar
                key={h.id}
                value={pct}
                max={100}
                tone={pct >= 70 ? "lime" : pct >= 40 ? "cyan" : "magenta"}
                label={h.name}
                right={`${pct.toFixed(0)}%`}
              />
            );
          })}
          {state.habits.length === 0 && <p className="text-zinc-600">Sin hábitos.</p>}
        </div>
      </section>
    </>
  );
}
