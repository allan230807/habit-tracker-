"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNow } from "@/hooks/useNow";
import type { GameActions } from "@/hooks/useGameEngine";
import { SPRITE_LABELS, SPRITE_STATES, hasGamerDesk, isDaytime } from "@/lib/gameLogic";
import {
  BED,
  CHAIR,
  CHARACTER,
  DESK,
  GAMER_DESK,
  MACBOOK,
  WHITEBOARD,
  WINDOW_DAY,
  WINDOW_NIGHT,
} from "@/lib/sprites";
import type { GameState } from "@/lib/types";
import { PixelArt } from "./PixelArt";

const SCENE_W = 116;
const SCENE_H = 76;
const FLOOR_H = 20;

interface LayerProps {
  rows: readonly string[];
  x: number;
  y: number;
  px: number;
  z?: number;
  className?: string;
  style?: CSSProperties;
}

function Layer({ rows, x, y, px, z = 0, className, style }: LayerProps) {
  return (
    <div className="absolute" style={{ left: x * px, bottom: y * px, zIndex: z, ...style }}>
      <div className={className}>
        <PixelArt rows={rows} px={px} />
      </div>
    </div>
  );
}

export default function Room({ state, actions }: { state: GameState; actions: GameActions }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState(3);
  const now = useNow(60_000);

  // Escala entera: el arte se ve nítido y sin costuras en Safari/iPhone.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setPx(Math.max(2, Math.floor(entry.contentRect.width / SCENE_W)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const date = new Date(now);
  const day = now === 0 ? true : isDaytime(date);
  const gamer = hasGamerDesk(state);
  const sprite = CHARACTER[state.currentState];
  const locked = state.timer !== null;
  const clock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return (
    <section className="border-4 border-neon-magenta bg-black shadow-[4px_4px_0_#000]">
      <div ref={wrapRef} className="w-full">
        <div
          className="relative mx-auto overflow-hidden"
          style={{ width: SCENE_W * px, height: SCENE_H * px, background: day ? "#34344a" : "#08080f" }}
        >
          {/* piso */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: FLOOR_H * px,
              borderTop: `${px}px solid ${day ? "#5a5a72" : "#1c1c2a"}`,
              background: `repeating-linear-gradient(90deg, ${day ? "#22222e" : "#101018"} 0 ${8 * px}px, ${
                day ? "#2a2a38" : "#14141e"
              } ${8 * px}px ${16 * px}px)`,
            }}
          />

          <Layer rows={day ? WINDOW_DAY : WINDOW_NIGHT} x={10} y={48} px={px} z={1} />
          <Layer rows={WHITEBOARD} x={48} y={8} px={px} z={1} />
          <Layer rows={BED} x={1} y={8} px={px} z={1} />
          <Layer rows={CHAIR} x={68} y={7} px={px} z={2} />
          {gamer ? (
            <Layer rows={GAMER_DESK} x={80} y={6} px={px} z={3} />
          ) : (
            <Layer rows={DESK} x={80} y={6} px={px} z={3} />
          )}
          <Layer rows={MACBOOK} x={82} y={16} px={px} z={4} />

          {/* personaje */}
          <Layer
            rows={sprite.rows}
            x={sprite.x}
            y={sprite.y}
            px={px}
            z={5}
            className="animate-bob"
            style={{
              transition: "left .5s steps(6), bottom .5s steps(6)",
              "--px": `${px}px`,
            } as CSSProperties}
          />

          {state.currentState === "durmiendo" && (
            <div
              className="animate-floaty absolute z-10 text-neon-cyan"
              style={{ left: 10 * px, bottom: 24 * px, fontSize: Math.max(14, px * 5) }}
            >
              z Z z
            </div>
          )}

          {/* HUD */}
          <div className="absolute right-1 top-1 z-20 bg-black/70 px-2 text-neon-lime">
            {clock} · {day ? "DÍA" : "NOCHE"}
          </div>
          {gamer && (
            <div className="animate-blink absolute left-1 top-1 z-20 bg-black/70 px-2 text-neon-magenta">
              ★ GAMER DESK
            </div>
          )}
        </div>
      </div>

      <div className="border-t-4 border-neon-magenta p-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="uppercase text-neon-magenta">&gt; estado: {SPRITE_LABELS[state.currentState]}</span>
          {locked && <span className="animate-blink text-neon-lime">DEEP WORK ●</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SPRITE_STATES.map((s) => (
            <button
              key={s}
              disabled={locked}
              onClick={() => actions.setSprite(s)}
              className={`btn !px-1 !py-1 text-base ${state.currentState === s ? "!bg-neon-cyan !text-black" : ""}`}
            >
              {SPRITE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
