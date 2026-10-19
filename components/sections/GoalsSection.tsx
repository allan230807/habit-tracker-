"use client";

import { useState } from "react";
import { useNow } from "@/hooks/useNow";
import { ProgressBar } from "@/components/ui";
import type { SectionProps } from "./types";

const hours = (n: number) => (Math.round(n * 100) / 100).toString();

function clock(ms: number) {
  const t = Math.floor(Math.max(0, ms) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`;
}

export default function GoalsSection({ state, actions }: SectionProps) {
  const now = useNow(1000);
  const sw = state.stopwatch;
  const [goalId, setGoalId] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("100");

  const selected = state.goals.some((g) => g.id === goalId) ? goalId : (state.goals[0]?.id ?? "");
  const running = sw ? state.goals.find((g) => g.id === sw.goalId) : null;
  const elapsed = sw ? now - sw.startedAt : 0;

  const stop = () => {
    if (!sw) return;
    const h = elapsed / 3_600_000;
    setLast(`+${hours(h)} h para «${running?.name}»`);
    actions.stopStopwatch();
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="section-title">Cronómetro</h2>
        <div className="mb-4 text-center font-mono text-5xl font-medium tracking-tight tabular-nums">{clock(elapsed)}</div>

        {sw ? (
          <>
            <p className="mb-3 text-center text-sm text-muted">
              Sumando a <span className="text-fg">{running?.name}</span>
            </p>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={stop}>
                ■ Detener y guardar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirm("¿Descartar esta sesión? No se sumará tiempo.")) actions.cancelStopwatch();
                }}
              >
                Descartar
              </button>
            </div>
          </>
        ) : state.goals.length === 0 ? (
          <p className="text-center text-sm text-muted">Crea una meta para empezar a medir tu tiempo.</p>
        ) : (
          <div className="space-y-3">
            <select className="input" value={selected} onChange={(e) => setGoalId(e.target.value)} aria-label="Meta">
              {state.goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                setLast(null);
                actions.startStopwatch(selected);
              }}
            >
              ▶ Iniciar
            </button>
            {last && <p className="text-center text-sm text-accent">{last}</p>}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Metas</h2>
        <ul className="space-y-4">
          {state.goals.map((g) => {
            const done = g.currentHours >= g.targetHours;
            return (
              <li key={g.id}>
                <ProgressBar
                  value={g.currentHours}
                  max={g.targetHours}
                  tone={done ? "sand" : "accent"}
                  label={`${g.name}${done ? " · completa" : ""}`}
                  right={`${hours(g.currentHours)} / ${hours(g.targetHours)} h · ${Math.min(
                    100,
                    Math.round((g.currentHours / g.targetHours) * 100),
                  )}%`}
                />
                <button
                  className="mt-1 text-xs text-muted hover:text-rose"
                  onClick={() => {
                    if (confirm(`¿Borrar la meta «${g.name}»?`)) actions.removeGoal(g.id);
                  }}
                >
                  Borrar
                </button>
              </li>
            );
          })}
          {state.goals.length === 0 && <li className="text-sm text-muted">Sin metas todavía.</li>}
        </ul>

        <form
          className="mt-4 flex gap-2 border-t border-line pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addGoal(name, Number(target));
            setName("");
          }}
        >
          <input className="input" placeholder="Nueva meta" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            className="input !w-20 text-center"
            inputMode="decimal"
            aria-label="Horas objetivo"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <button className="btn">Añadir</button>
        </form>
        <p className="mt-2 text-xs text-muted">Horas objetivo a la derecha. Al completar una meta tu escritorio sube de nivel.</p>
      </section>
    </div>
  );
}
