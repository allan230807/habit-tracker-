"use client";

import { SPRITE_LABELS, SPRITE_STATES } from "@/lib/gameLogic";
import type { SectionProps } from "./types";

export default function ActivitySection({ state, actions }: SectionProps) {
  const locked = state.stopwatch !== null;
  return (
    <section className="card">
      <h2 className="section-title">¿Qué está haciendo?</h2>
      <div className="grid grid-cols-2 gap-2">
        {SPRITE_STATES.map((s) => (
          <button
            key={s}
            disabled={locked}
            onClick={() => actions.setSprite(s)}
            className={`btn !justify-start ${state.currentState === s ? "!border-accent !text-accent" : ""}`}
          >
            {SPRITE_LABELS[s]}
          </button>
        ))}
      </div>
      {locked && <p className="mt-3 text-sm text-muted">El cronómetro está en marcha: el personaje trabaja en el escritorio hasta que lo detengas.</p>}
    </section>
  );
}
