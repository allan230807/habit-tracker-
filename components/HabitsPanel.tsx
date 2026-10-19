"use client";

import { useState } from "react";
import type { GameActions } from "@/hooks/useGameEngine";
import { STAT_LABELS, dateKey } from "@/lib/gameLogic";
import type { GameState, StatKey } from "@/lib/types";
import { useNow } from "@/hooks/useNow";
import HabitHeatmap from "./HabitHeatmap";

export default function HabitsPanel({ state, actions }: { state: GameState; actions: GameActions }) {
  const now = useNow(60_000);
  const today = dateKey(new Date(now));
  const [name, setName] = useState("");
  const [stat, setStat] = useState<StatKey>("disciplina");

  const doneToday = state.habits.filter((h) => h.history.includes(today)).length;

  return (
    <>
      <section className="panel !border-neon-lime">
        <h2 className="panel-title !text-neon-lime">Heatmap</h2>
        <HabitHeatmap habits={state.habits} today={today} />
        <div className="mt-2 flex items-center justify-end gap-1 text-sm text-zinc-500">
          menos
          {[0, 0.3, 0.55, 0.8, 1].map((o, i) => (
            <span
              key={i}
              className={`h-[11px] w-[11px] ${o === 0 ? "bg-zinc-800" : "bg-neon-lime"}`}
              style={o ? { opacity: 0.22 + 0.78 * o } : undefined}
            />
          ))}
          más
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          Hoy · {doneToday}/{state.habits.length}
        </h2>
        <ul className="space-y-2">
          {state.habits.map((h) => {
            const done = h.history.includes(today);
            return (
              <li key={h.id} className="flex items-center gap-3">
                <button
                  role="checkbox"
                  aria-checked={done}
                  aria-label={h.name}
                  onClick={() => actions.toggleHabit(h.id)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center border-4 text-2xl leading-none ${
                    done
                      ? "border-neon-lime bg-neon-lime text-black shadow-[0_0_8px_#9dff00]"
                      : "border-neon-cyan bg-black text-transparent"
                  }`}
                >
                  X
                </button>
                <span className={`flex-1 ${done ? "text-zinc-500 line-through" : ""}`}>
                  {h.name}
                  <span className="ml-2 text-sm text-zinc-600">{STAT_LABELS[h.stat].slice(0, 3)}</span>
                </span>
                <span className="text-neon-lime">+1◆</span>
                <button
                  aria-label={`Borrar ${h.name}`}
                  className="text-zinc-600 hover:text-neon-magenta"
                  onClick={() => {
                    if (confirm(`¿Borrar el hábito "${h.name}"?`)) actions.removeHabit(h.id);
                  }}
                >
                  ✕
                </button>
              </li>
            );
          })}
          {state.habits.length === 0 && <li className="text-zinc-500">Sin hábitos todavía.</li>}
        </ul>

        <form
          className="mt-4 flex flex-wrap gap-2 border-t-2 border-line pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addHabit(name, stat);
            setName("");
          }}
        >
          <input className="input flex-1" placeholder="Nuevo hábito" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="input !w-auto" value={stat} onChange={(e) => setStat(e.target.value as StatKey)}>
            {(Object.keys(STAT_LABELS) as StatKey[]).map((k) => (
              <option key={k} value={k}>
                {STAT_LABELS[k]}
              </option>
            ))}
          </select>
          <button className="btn btn-lime">+</button>
        </form>
      </section>
    </>
  );
}
