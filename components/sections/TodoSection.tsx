"use client";

import { useState } from "react";
import { Check } from "@/components/ui";
import { formatDate } from "@/lib/gameLogic";
import type { SectionProps } from "./types";

export default function TodoSection({ state, actions, today }: SectionProps) {
  const [text, setText] = useState("");
  const ready = state.tomorrowTasks.filter((t) => !t.completed && t.dueOn <= today);
  const queued = state.tomorrowTasks.filter((t) => !t.completed && t.dueOn > today);
  const done = state.tomorrowTasks.filter((t) => t.completed).slice(-8).reverse();

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="section-title">Para mañana</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addTomorrowTask(text);
            setText("");
          }}
        >
          <input className="input" placeholder="¿Qué harás mañana?" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn">Añadir</button>
        </form>
        <ul className="mt-3 space-y-2">
          {queued.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sand" />
              <span className="flex-1">{t.text}</span>
              <span className="text-xs text-muted">{formatDate(t.dueOn)}</span>
              <button aria-label="Borrar" className="text-muted hover:text-rose" onClick={() => actions.removeTask(t.id)}>
                ✕
              </button>
            </li>
          ))}
          {queued.length === 0 && <li className="text-sm text-muted">Nada programado para mañana.</li>}
        </ul>
      </section>

      <section className="card">
        <h2 className="section-title">Pendientes de hoy</h2>
        <ul className="space-y-3">
          {ready.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <Check checked={false} onChange={() => actions.completeTask(t.id)} label={t.text} />
              <span className="flex-1">{t.text}</span>
              <span className="font-mono text-xs text-sand">+1</span>
              <button aria-label="Borrar" className="text-muted hover:text-rose" onClick={() => actions.removeTask(t.id)}>
                ✕
              </button>
            </li>
          ))}
          {ready.length === 0 && <li className="text-sm text-muted">Sin pendientes. Las tareas de ayer aparecen aquí.</li>}
        </ul>
        {done.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm text-muted">
            {done.map((t) => (
              <li key={t.id} className="flex gap-2">
                <span className="text-accent">✓</span>
                <span className="line-through">{t.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
