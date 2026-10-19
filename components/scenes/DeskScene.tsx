"use client";

import { type CSSProperties } from "react";
import { Pixel } from "@/components/Pixel";
import { useNow } from "@/hooks/useNow";
import { DESK_ITEMS, type DeskItem, macbook, mug, notebook, phone, smallPlant, wallet } from "@/lib/art/desk";
import { SCENE } from "@/lib/art/room";
import type { Sprite } from "@/lib/pixel";

interface Props {
  u: number;
  day: boolean;
  gamer: boolean;
  /** Inicio del cronómetro en marcha (se muestra sobre la pantalla del Macbook). */
  startedAt: number | null;
  hints: boolean;
  onItem: (item: DeskItem) => void;
}

const SPRITES: Record<DeskItem, Sprite> = {
  macbook: macbook(),
  phone: phone(),
  notebook: notebook(),
  wallet: wallet(),
};
const MUG = mug();
const PLANT = smallPlant();

const LABELS: Record<DeskItem, string> = {
  macbook: "Macbook: metas y cronómetro",
  phone: "Teléfono: estadísticas",
  notebook: "Cuaderno: tareas",
  wallet: "Cartera: monedas y tienda",
};

function ScreenClock({ since }: { since: number }) {
  const now = useNow(1000);
  const t = Math.floor(Math.max(0, now - since) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return <>{`${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`}</>;
}

export default function DeskScene({ u, day, gamer, startedAt, hints, onItem }: Props) {
  const wall = day ? ["#f7f6f3", "#ebe9e4"] : ["#f1f0ed", "#e6e4df"];
  const wood = gamer ? ["#30333b", "#2a2d34"] : ["#cfae82", "#c4a276"];
  const wallH = 16 * u;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ width: SCENE.w * u, height: SCENE.h * u }}>
      <div className="absolute inset-x-0 top-0" style={{ height: wallH, background: `linear-gradient(${wall[0]}, ${wall[1]})` }} />
      <div className="absolute inset-x-0" style={{ top: wallH - 3 * u, height: 3 * u, background: "#fbfbf9", boxShadow: `0 ${u}px 0 rgba(0,0,0,.12)` }} />
      {/* superficie de madera con vetas */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: wallH,
          background: `repeating-linear-gradient(0deg, ${wood[0]} 0 ${11 * u}px, ${wood[1]} ${11 * u}px ${12 * u}px)`,
          boxShadow: `inset 0 ${3 * u}px 0 rgba(0,0,0,.2)`,
        }}
      />
      {gamer && <div className="absolute inset-x-0" style={{ top: wallH, height: u, background: "#86b79e", boxShadow: "0 0 12px #86b79e" }} />}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 7 * u, background: "rgba(0,0,0,.22)" }} />

      <div className="absolute" style={{ left: 4 * u, top: 26 * u }}>
        <Pixel sprite={PLANT} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.25))` }} />
      </div>
      <div className="absolute" style={{ left: 108 * u, top: 50 * u }}>
        <Pixel sprite={MUG} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.25))` }} />
      </div>

      {(Object.keys(DESK_ITEMS) as DeskItem[]).map((k) => {
        const r = DESK_ITEMS[k];
        return (
          <button
            key={k}
            aria-label={LABELS[k]}
            onClick={() => onItem(k)}
            className="group absolute cursor-pointer outline-none"
            style={{ left: r.x * u, top: r.y * u, width: r.w * u, height: r.h * u }}
          >
            <Pixel
              sprite={SPRITES[k]}
              u={u}
              className="transition-transform group-hover:-translate-y-[2px] group-focus-visible:-translate-y-[2px]"
              style={{ filter: `drop-shadow(${2 * u}px ${2 * u}px 0 rgba(0,0,0,.28))` }}
            />
            {hints && (
              <span
                className="animate-pulse-dot pointer-events-none absolute rounded-full border-2 border-white/90 bg-white/40 shadow-[0_0_8px_rgba(255,255,255,.7)]"
                style={{ left: "50%", top: -14, width: 12, height: 12, marginLeft: -6 }}
              />
            )}
          </button>
        );
      })}

      {/* hora del cronómetro sobre la pantalla */}
      {startedAt !== null && (
        <div
          className="pointer-events-none absolute flex items-center justify-center font-mono font-medium text-accent"
          style={{
            left: (DESK_ITEMS.macbook.x + 8) * u,
            top: (DESK_ITEMS.macbook.y + 11) * u,
            width: 36 * u,
            height: 10 * u,
            fontSize: Math.max(10, u * 4.4),
            background: "#10141c",
            border: `${Math.max(1, u / 2)}px solid #2e3544`,
          }}
        >
          <ScreenClock since={startedAt} />
        </div>
      )}

      {!day && <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(14,20,48,.3)" } as CSSProperties} />}
    </div>
  );
}
