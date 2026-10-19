"use client";

import { useState } from "react";
import Heatmap from "@/components/Heatmap";
import { Check } from "@/components/ui";
import { STAT_LABELS } from "@/lib/gameLogic";
import type { StatKey } from "@/lib/types";
import type { SectionProps } from "./types";

export default function HabitsSection({ state, actions, today }: SectionProps) {
  const [name, setName] = useState("");
  const [stat, setStat] = useState<StatKey>("disciplina");
  const doneToday = state.habits.filter((h) => h.history.includes(today)).length;
  const days = new Set(state.habits.flatMap((h) => h.history)).size;

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="section-title !mb-0">Actividad del año</h2>
          <span className="text-xs text-muted">{days} {days === 1 ? "día" : "días"} con registro</span>
        </div>
        <Heatmap habits={state.habits} today={today} />
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
          menos
          {[0, 0.25, 0.5, 0.75, 1].map((o) => (
            <span key={o} className={`h-3 w-3 rounded-[3px] ${o === 0 ? "bg-raised" : "bg-accent"}`} style={o ? { opacity: 0.25 + 0.75 * o } : undefined} />
          ))}
          más
        </div>
      </section>

      <section className="card">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="section-title !mb-0">Hoy</h2>
          <span className="font-mono text-xs text-muted">
            {doneToday}/{state.habits.length}
          </span>
        </div>
        <ul className="space-y-3">
          {state.habits.map((h) => {
            const done = h.history.includes(today);
            return (
              <li key={h.id} className="flex items-center gap-3">
                <Check checked={done} onChange={() => actions.toggleHabit(h.id)} label={h.name} />
                <span className={`flex-1 ${done ? "text-muted line-through" : ""}`}>
                  {h.name}
                  <span className="ml-2 text-[11px] text-muted/70">{STAT_LABELS[h.stat]}</span>
                </span>
                <span className="font-mono text-xs text-sand">+1</span>
                <button
                  aria-label={`Borrar ${h.name}`}
                  className="text-muted hover:text-rose"
                  onClick={() => {
                    if (confirm(`¿Borrar el hábito «${h.name}»?`)) actions.removeHabit(h.id);
                  }}
                >
                  ✕
                </button>
              </li>
            );
          })}
          {state.habits.length === 0 && <li className="text-sm text-muted">Sin hábitos todavía.</li>}
        </ul>

        <form
          className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addHabit(name, stat);
            setName("");
          }}
        >
          <input className="input flex-1 basis-40" placeholder="Nuevo hábito" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="input !w-auto" value={stat} onChange={(e) => setStat(e.target.value as StatKey)} aria-label="Estadística">
            {(Object.keys(STAT_LABELS) as StatKey[]).map((k) => (
              <option key={k} value={k}>
                {STAT_LABELS[k]}
              </option>
            ))}
          </select>
          <button className="btn">Añadir</button>
        </form>
      </section>
    </div>
  );
}
