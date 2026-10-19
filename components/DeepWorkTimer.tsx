"use client";

import { useEffect, useState } from "react";
import { useNow } from "@/hooks/useNow";
import type { GameActions } from "@/hooks/useGameEngine";
import type { GameState } from "@/lib/types";
import PixelBar from "./PixelBar";

const PRESETS = [
  { min: 1, label: "1 (test)" },
  { min: 25, label: "25" },
  { min: 50, label: "50" },
  { min: 90, label: "90" },
];

const mmss = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function DeepWorkTimer({ state, actions }: { state: GameState; actions: GameActions }) {
  const now = useNow(1000);
  const timer = state.timer;
  const [goalId, setGoalId] = useState("");
  const [minutes, setMinutes] = useState(25);

  const selected = state.goals.some((g) => g.id === goalId) ? goalId : (state.goals[0]?.id ?? "");
  const activeGoal = timer ? state.goals.find((g) => g.id === timer.goalId) : null;
  const finished = timer !== null && now > 0 && now >= timer.endsAt;

  // Al terminar (o al reabrir la app pasado el tiempo) se acredita la sesión.
  useEffect(() => {
    if (finished) {
      actions.completeTimer();
      navigator.vibrate?.([200, 100, 200]);
    }
  }, [finished, actions]);

  const remaining = timer ? timer.endsAt - now : minutes * 60_000;
  const total = (timer ? timer.durationMin : minutes) * 60_000;

  return (
    <section className="panel !border-neon-lime">
      <h2 className="panel-title !text-neon-lime">Deep Work</h2>

      <div className="mb-3 text-center text-7xl tracking-widest text-neon-lime drop-shadow-[0_0_8px_#9dff00]">
        {mmss(remaining)}
      </div>
      <PixelBar value={total - remaining} max={total} tone="lime" />

      {timer ? (
        <div className="mt-3">
          <p className="mb-2 text-center text-zinc-400">
            Sumando a: <span className="text-neon-cyan">{activeGoal?.name}</span>
          </p>
          <button className="btn btn-magenta w-full" onClick={actions.cancelTimer}>
            Abortar (no suma horas)
          </button>
        </div>
      ) : state.goals.length === 0 ? (
        <p className="mt-3 text-center text-zinc-500">Crea una meta para empezar.</p>
      ) : (
        <div className="mt-3 space-y-3">
          <select className="input" value={selected} onChange={(e) => setGoalId(e.target.value)}>
            {state.goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.min}
                onClick={() => setMinutes(p.min)}
                className={`btn !px-1 ${minutes === p.min ? "!bg-neon-cyan !text-black" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn btn-lime w-full text-2xl" onClick={() => actions.startTimer(selected, minutes)}>
            ▶ Start
          </button>
        </div>
      )}
    </section>
  );
}
