"use client";

import { useState } from "react";
import type { GameActions } from "@/hooks/useGameEngine";
import type { GameState } from "@/lib/types";
import PixelBar from "./PixelBar";

const hours = (n: number) => (Math.round(n * 100) / 100).toString();

export default function GoalsPanel({ state, actions }: { state: GameState; actions: GameActions }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("100");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.addGoal(name, Number(target));
    setName("");
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Metas</h2>

      <ul className="space-y-4">
        {state.goals.map((g) => {
          const done = g.currentHours >= g.targetHours;
          return (
            <li key={g.id}>
              <PixelBar
                value={g.currentHours}
                max={g.targetHours}
                tone={done ? "magenta" : "cyan"}
                label={`${g.name}${done ? " ✔ COMPLETA" : ""}`}
                right={`${hours(g.currentHours)}/${hours(g.targetHours)}h · ${Math.min(
                  100,
                  Math.round((g.currentHours / g.targetHours) * 100),
                )}%`}
              />
              <button
                className="mt-1 text-sm uppercase text-zinc-600 hover:text-neon-magenta"
                onClick={() => {
                  if (confirm(`¿Borrar la meta "${g.name}"?`)) actions.removeGoal(g.id);
                }}
              >
                [borrar]
              </button>
            </li>
          );
        })}
        {state.goals.length === 0 && <li className="text-zinc-500">Sin metas todavía.</li>}
      </ul>

      <form onSubmit={submit} className="mt-4 flex gap-2 border-t-2 border-line pt-3">
        <input className="input" placeholder="Nueva meta" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className="input !w-24"
          inputMode="decimal"
          aria-label="Horas objetivo"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button className="btn btn-lime">+</button>
      </form>
      <p className="mt-1 text-sm text-zinc-600">Horas objetivo a la derecha. Al completar una meta, tu mesa se vuelve gamer.</p>
    </section>
  );
}
