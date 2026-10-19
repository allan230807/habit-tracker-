"use client";

import { useMemo, type CSSProperties } from "react";
import { Pixel } from "@/components/Pixel";
import { DESK_ITEMS, type DeskItem, macbook, mug, notebook, phone, smallPlant, wallet } from "@/lib/art/desk";
import { SCENE } from "@/lib/art/room";
import { Sprite } from "@/lib/pixel";
import { useNow } from "@/hooks/useNow";

interface Props {
  u: number;
  day: boolean;
  gamer: boolean;
  /** Inicio del cronómetro en marcha (se muestra sobre la pantalla del Macbook). */
  startedAt: number | null;
  coins: number;
  labels: boolean;
  onItem: (item: DeskItem) => void;
}

const MACBOOK = macbook();
const PHONE = phone();
const NOTEBOOK = notebook();
const WALLET = wallet();
const MUG = mug();
const PLANT = smallPlant();

const TAGS: Record<DeskItem, string> = {
  macbook: "Metas",
  phone: "Stats",
  notebook: "To-do",
  wallet: "Cartera",
};

function ScreenClock({ since }: { since: number }) {
  const now = useNow(1000);
  const t = Math.floor(Math.max(0, now - since) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return <>{`${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`}</>;
}

export default function DeskScene({ u, day, gamer, startedAt, coins, labels, onItem }: Props) {
  const sprites = useMemo<Record<DeskItem, Sprite>>(
    () => ({ macbook: MACBOOK, phone: PHONE, notebook: NOTEBOOK, wallet: WALLET }),
    [],
  );
  const wall = day ? ["#ddd6c9", "#cfc8ba"] : ["#2b2f38", "#262a32"];
  const wood = gamer ? ["#30333b", "#2a2d34"] : day ? ["#9a7351", "#8f6a4a"] : ["#6b4f38", "#634932"];
  const wallH = 14 * u;

  return (
    <div className="absolute inset-0" style={{ width: SCENE.w * u, height: SCENE.h * u }}>
      <div className="absolute inset-x-0 top-0" style={{ height: wallH, background: `linear-gradient(${wall[0]}, ${wall[1]})` }} />
      <div className="absolute inset-x-0" style={{ top: wallH - 2 * u, height: 2 * u, background: day ? "#f1ede4" : "#555a66" }} />
      {/* superficie de madera */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: wallH,
          background: `repeating-linear-gradient(0deg, ${wood[0]} 0 ${9 * u}px, ${wood[1]} ${9 * u}px ${10 * u}px)`,
          boxShadow: `inset 0 ${3 * u}px 0 rgba(0,0,0,.25)`,
        }}
      />
      {gamer && <div className="absolute inset-x-0" style={{ top: wallH, height: u, background: "#86b79e", boxShadow: "0 0 12px #86b79e" }} />}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 6 * u, background: "rgba(0,0,0,.28)" }} />

      <div className="absolute" style={{ left: 3 * u, top: 17 * u }}>
        <Pixel sprite={PLANT} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.25))` }} />
      </div>
      <div className="absolute" style={{ left: 96 * u, top: 36 * u }}>
        <Pixel sprite={MUG} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.25))` }} />
      </div>

      {(Object.keys(DESK_ITEMS) as DeskItem[]).map((k) => {
        const r = DESK_ITEMS[k];
        return (
          <button
            key={k}
            aria-label={TAGS[k]}
            onClick={() => onItem(k)}
            className="group absolute cursor-pointer outline-none"
            style={{ left: r.x * u, top: r.y * u, width: r.w * u, height: r.h * u }}
          >
            <Pixel
              sprite={sprites[k]}
              u={u}
              className="transition-transform group-hover:-translate-y-[2px] group-focus-visible:-translate-y-[2px]"
              style={{ filter: `drop-shadow(${2 * u}px ${2 * u}px 0 rgba(0,0,0,.3))` }}
            />
            <span
              className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm transition-opacity"
              style={{ opacity: labels ? 1 : 0 }}
            >
              {k === "wallet" ? `${TAGS[k]} · ${coins}` : TAGS[k]}
            </span>
          </button>
        );
      })}

      {/* hora del cronómetro sobre la pantalla */}
      {startedAt !== null && (
        <div
          className="pointer-events-none absolute flex items-center justify-center font-mono font-medium text-accent"
          style={{
            left: (DESK_ITEMS.macbook.x + 6) * u,
            top: (DESK_ITEMS.macbook.y + 9) * u,
            width: 32 * u,
            height: 9 * u,
            fontSize: Math.max(10, u * 4.2),
            background: "#10141c",
            border: `${Math.max(1, u / 2)}px solid #2e3544`,
          }}
        >
          <ScreenClock since={startedAt} />
        </div>
      )}

      {!day && (
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(7,10,28,.34)" } as CSSProperties} />
      )}
    </div>
  );
}
