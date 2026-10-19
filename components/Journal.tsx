"use client";

import { useState } from "react";
import type { GameActions } from "@/hooks/useGameEngine";
import { useNow } from "@/hooks/useNow";
import { dateKey, formatDate } from "@/lib/gameLogic";
import type { GameState } from "@/lib/types";

export default function Journal({ state, actions }: { state: GameState; actions: GameActions }) {
  const now = useNow(60_000);
  const today = dateKey(new Date(now));
  const [text, setText] = useState("");

  const ready = state.tomorrowTasks.filter((t) => !t.completed && t.dueOn <= today);
  const queued = state.tomorrowTasks.filter((t) => !t.completed && t.dueOn > today);
  const done = state.tomorrowTasks.filter((t) => t.completed).slice(-8).reverse();

  return (
    <>
      <section className="panel !border-neon-magenta">
        <h2 className="panel-title !text-neon-magenta">Journal · para mañana</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addTomorrowTask(text);
            setText("");
          }}
        >
          <input className="input" placeholder="¿Qué harás mañana?" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-magenta">+</button>
        </form>

        <ul className="mt-3 space-y-2">
          {queued.map((t) => (
            <li key={t.id} className="flex items-center gap-3 text-zinc-300">
              <span className="text-neon-magenta">▸</span>
              <span className="flex-1">{t.text}</span>
              <span className="text-sm text-zinc-600">{formatDate(t.dueOn)}</span>
              <button aria-label="Borrar" className="text-zinc-600 hover:text-neon-magenta" onClick={() => actions.removeTask(t.id)}>
                ✕
              </button>
            </li>
          ))}
          {queued.length === 0 && <li className="text-zinc-600">Nada programado para mañana.</li>}
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel-title">Pendientes de hoy</h2>
        <ul className="space-y-2">
          {ready.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <button
                role="checkbox"
                aria-checked={false}
                aria-label={t.text}
                onClick={() => actions.completeTask(t.id)}
                className="h-9 w-9 shrink-0 border-4 border-neon-cyan bg-black"
              />
              <span className="flex-1">{t.text}</span>
              <span className="text-neon-lime">+1◆</span>
              <button aria-label="Borrar" className="text-zinc-600 hover:text-neon-magenta" onClick={() => actions.removeTask(t.id)}>
                ✕
              </button>
            </li>
          ))}
          {ready.length === 0 && <li className="text-zinc-600">Sin pendientes. Las tareas de ayer aparecen aquí.</li>}
        </ul>

        {done.length > 0 && (
          <ul className="mt-4 space-y-1 border-t-2 border-line pt-3 text-zinc-600">
            {done.map((t) => (
              <li key={t.id} className="flex gap-2 line-through">
                <span className="text-neon-lime no-underline">✔</span>
                {t.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
