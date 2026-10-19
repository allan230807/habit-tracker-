"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { Pixel } from "@/components/Pixel";
import {
  BED,
  BOARD,
  BOOKS,
  CHAIR,
  CUSHION,
  DESK,
  DESK_H,
  DEPTH,
  FLOOR_H,
  RUG as RUG_BOX,
  SCENE,
  WINDOW,
} from "@/lib/art/layout";
import {
  WIN_GLASS,
  baseboard,
  bedBase,
  bedBlanket,
  board,
  bird,
  bookStack,
  cactus,
  car,
  chair,
  clock,
  cloud,
  cushion,
  desk,
  deskLamp,
  deskTrinkets,
  floor,
  goalFrame,
  laptopSide,
  monitor,
  rug,
  streetCity,
  streetSky,
  windowFrame,
  type SkyPhase,
} from "@/lib/art/room";
import { useActorFrame } from "@/lib/actor/store";
import type { StatKey } from "@/lib/types";

interface Props {
  u: number;
  phase: SkyPhase;
  hour: number;
  minute: number;
  gamer: boolean;
  heat: (number | null)[][];
  /** Categorías de las metas cumplidas (un cuadrito por cada una). */
  frames: StatKey[];
  /** Mostrar los puntos que indican qué objetos se pueden tocar. */
  hints: boolean;
  onDesk: () => void;
  onBoard: () => void;
}

// Sprites estáticos (se crean una sola vez).
const FLOOR = floor();
const BASEBOARD = baseboard();
const RUG = rug();
const CUSHION_S = cushion();
const BED_S = bedBase();
const BLANKETS = { flat: bedBlanket("flat"), legs: bedBlanket("legs"), knees: bedBlanket("knees") };
const BOOKS_3 = bookStack(3);
const BOOKS_2 = bookStack(2);
const CHAIR_S = chair();
const DESK_S = desk(false);
const DESK_GAMER = desk(true);
const MONITOR = monitor();
const LAPTOP = laptopSide();
const TRINKETS = deskTrinkets();
const LAMP = deskLamp();
const FRAME = windowFrame();
const CACTUS = cactus();
const SKIES = { dawn: streetSky("dawn"), day: streetSky("day"), dusk: streetSky("dusk"), night: streetSky("night") };
const CITIES = { dawn: streetCity("dawn"), day: streetCity("day"), dusk: streetCity("dusk"), night: streetCity("night") };
const CARS = { dawn: car("dawn"), day: car("day"), dusk: car("dusk"), night: car("night") };
const CLOUDS = {
  dawn: [cloud(0, "dawn"), cloud(1, "dawn")],
  day: [cloud(0, "day"), cloud(1, "day")],
  dusk: [cloud(0, "dusk"), cloud(1, "dusk")],
  night: [cloud(0, "night"), cloud(1, "night")],
};
const BIRD = bird();
const GOAL_FRAMES: Record<string, ReturnType<typeof goalFrame>> = {};
const frameSprite = (k: string) => (GOAL_FRAMES[k] ??= goalFrame(k));

/** Lugares de la pared para los cuadritos (esquina inferior izquierda). */
const FRAME_SLOTS: [number, number][] = [
  [2, 100], [12, 100],
  [2, 84], [12, 84],
  [2, 68], [12, 68],
  [2, 52], [12, 52],
  [92, 100], [104, 100], [116, 100],
];

interface PlaceProps {
  u: number;
  x: number;
  y: number;
  z?: number;
  style?: CSSProperties;
  children: ReactNode;
}

/** Posiciona por esquina inferior izquierda en px lógicos (y hacia arriba). */
function Place({ u, x, y, z = 1, style, children }: PlaceProps) {
  return (
    <div className="absolute" style={{ left: x * u, bottom: y * u, zIndex: z, ...style }}>
      {children}
    </div>
  );
}

const SHADOW = (u: number, a = 0.18) => ({ filter: `drop-shadow(${u}px ${u}px 0 rgba(30,28,24,${a}))` });

function Hotspot({
  u,
  x,
  y,
  w,
  h,
  label,
  show,
  dot,
  onClick,
}: {
  u: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  show: boolean;
  /** Posición (px lógicos relativos al área) del punto indicador. */
  dot: [number, number];
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="absolute z-40 cursor-pointer outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/10"
      style={{ left: x * u, bottom: y * u, width: w * u, height: h * u }}
    >
      {show && (
        <span
          className="animate-pulse-dot pointer-events-none absolute rounded-full border-2 border-white/90 bg-white/40 shadow-[0_0_8px_rgba(255,255,255,.7)]"
          style={{ left: dot[0] * u - 6, bottom: dot[1] * u - 6, width: 12, height: 12 }}
        />
      )}
    </button>
  );
}

/** El personaje autónomo: es el único componente que se repinta a cada fotograma. */
function Character({ u }: { u: number }) {
  const f = useActorFrame();
  if (!f) return null;
  return (
    <>
      <Place u={u} x={f.left} y={f.bottom} z={f.layer === "front" ? 20 : 4}>
        <Pixel sprite={f.sprite} u={u} />
      </Place>
      {f.sleeping && (
        <span
          className="animate-floaty pointer-events-none absolute z-30 font-medium text-slate-500"
          style={{ left: 36 * u, bottom: 40 * u, fontSize: Math.max(11, u * 3.6) }}
        >
          z z z
        </span>
      )}
      <Place u={u} x={BED.x} y={BED.y} z={f.inBed ? 6 : 2}>
        <Pixel sprite={f.sleeping ? BLANKETS.knees : f.bed === "propped" ? BLANKETS.legs : BLANKETS.flat} u={u} style={SHADOW(u, 0.1)} />
      </Place>
      <Place u={u} x={BOOKS.x} y={BOOKS.y} z={3}>
        <Pixel sprite={f.bookGap ? BOOKS_2 : BOOKS_3} u={u} />
      </Place>
    </>
  );
}

const BEAM: Record<SkyPhase, { rgb: string; a: number }> = {
  dawn: { rgb: "255,200,170", a: 0.2 },
  day: { rgb: "255,248,222", a: 0.2 },
  dusk: { rgb: "255,165,95", a: 0.22 },
  night: { rgb: "185,205,255", a: 0.1 },
};

/** Haz de luz que entra por la ventana; se desplaza con la hora del día. */
function LightBeam({ u, phase, hour, minute }: { u: number; phase: SkyPhase; hour: number; minute: number }) {
  const t = hour + minute / 60;
  // de mañana la luz cae hacia la derecha; de tarde, hacia la izquierda
  const shift = phase === "night" ? 6 : Math.max(-36, Math.min(36, (12.5 - t) * 6));
  const gx = WINDOW.x + WIN_GLASS.x;
  const top = WINDOW.y + WINDOW.h - WIN_GLASS.y - WIN_GLASS.h; // base del vidrio
  const topY = top + 0;
  const botY = 8;
  const x0 = Math.min(gx, gx + shift);
  const x1 = Math.max(gx + WIN_GLASS.w, gx + WIN_GLASS.w + shift);
  const w = x1 - x0;
  const h = topY - botY;
  const px = (x: number) => (x - x0) * u;
  const py = (y: number) => (topY - y) * u;
  const pts = [
    [gx, topY],
    [gx + WIN_GLASS.w, topY],
    [gx + WIN_GLASS.w + shift, botY],
    [gx + shift, botY],
  ]
    .map(([x, y]) => `${px(x)},${py(y)}`)
    .join(" ");
  const c = BEAM[phase];
  const motes = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const r2 = (Math.sin(i * 78.233 + 1) * 12345.678) % 1;
        const a = Math.abs(r1);
        const b = Math.abs(r2);
        return { a, b, i };
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute z-[25]" style={{ left: x0 * u, bottom: botY * u, width: w * u, height: h * u }}>
      <svg width={w * u} height={h * u} className="absolute inset-0">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`rgb(${c.rgb})`} stopOpacity={c.a} />
            <stop offset="1" stopColor={`rgb(${c.rgb})`} stopOpacity={c.a * 0.25} />
          </linearGradient>
        </defs>
        <polygon points={pts} fill="url(#beam)" />
      </svg>
      {phase !== "night" &&
        motes.map(({ a, b, i }) => {
          const yy = b * (h - 4);
          const xx = a * WIN_GLASS.w + (shift * yy) / h;
          return (
            <span
              key={i}
              className="animate-mote absolute rounded-full bg-white"
              style={{
                left: Math.max(0, xx) * u,
                top: yy * u,
                width: Math.max(2, u * 0.8),
                height: Math.max(2, u * 0.8),
                animationDelay: `${-i * 1.7}s`,
                animationDuration: `${7 + (i % 4) * 2}s`,
              }}
            />
          );
        })}
    </div>
  );
}

export default function RoomScene({ u, phase, hour, minute, gamer, heat, frames, hints, onDesk, onBoard }: Props) {
  const boardSprite = useMemo(() => board(heat), [heat]);
  const clockSprite = useMemo(() => clock(hour, minute), [hour, minute]);
  const night = phase === "night";
  const wallTop = night ? "#f1f0ed" : "#f7f6f3";
  const wallBot = night ? "#e6e4df" : "#ebe9e4";
  const deskTop = DEPTH + DESK_H;
  const clouds = CLOUDS[phase];

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ width: SCENE.w * u, height: SCENE.h * u }}>
      {/* pared blanca con luz suave arriba */}
      <div className="absolute inset-x-0 top-0" style={{ bottom: (FLOOR_H - 2) * u, background: `linear-gradient(${wallTop}, ${wallBot})` }} />
      <div className="absolute inset-x-0 top-0" style={{ height: 14 * u, background: "linear-gradient(rgba(0,0,0,.07), rgba(0,0,0,0))" }} />
      <Place u={u} x={0} y={0} z={0}>
        <Pixel sprite={FLOOR} u={u} />
      </Place>
      <Place u={u} x={0} y={FLOOR_H - 2} z={1}>
        <Pixel sprite={BASEBOARD} u={u} />
      </Place>
      <Place u={u} x={RUG_BOX.x} y={RUG_BOX.y} z={1}>
        <Pixel sprite={RUG} u={u} />
      </Place>

      {/* pared: reloj, tablero y un cuadrito por cada meta cumplida */}
      <Place u={u} x={BOARD.x} y={BOARD.y} z={1}>
        <Pixel sprite={boardSprite} u={u} style={SHADOW(u, 0.22)} />
      </Place>
      <Place u={u} x={72} y={96} z={1}>
        <Pixel sprite={clockSprite} u={u} />
      </Place>
      {frames.slice(0, FRAME_SLOTS.length).map((stat, i) => (
        <Place key={`${stat}-${i}`} u={u} x={FRAME_SLOTS[i][0]} y={FRAME_SLOTS[i][1]} z={1}>
          <div className="animate-pop" style={{ transformOrigin: "50% 100%" }}>
            <Pixel sprite={frameSprite(stat)} u={u} style={SHADOW(u, 0.2)} />
          </div>
        </Place>
      ))}

      {/* muebles */}
      <Place u={u} x={BED.x} y={BED.y} z={2}>
        <Pixel sprite={BED_S} u={u} style={SHADOW(u)} />
      </Place>
      <Place u={u} x={CUSHION.x} y={CUSHION.y} z={3}>
        <Pixel sprite={CUSHION_S} u={u} />
      </Place>
      <Place u={u} x={CHAIR.x} y={CHAIR.y} z={3}>
        <Pixel sprite={CHAIR_S} u={u} />
      </Place>
      <Place u={u} x={DESK.x} y={DESK.y} z={5}>
        <Pixel sprite={gamer ? DESK_GAMER : DESK_S} u={u} style={SHADOW(u)} />
      </Place>
      {gamer && (
        <Place u={u} x={118} y={deskTop} z={6}>
          <Pixel sprite={MONITOR} u={u} />
        </Place>
      )}
      <Place u={u} x={101} y={deskTop - 1} z={6}>
        <Pixel sprite={LAPTOP} u={u} />
      </Place>
      <Place u={u} x={116} y={deskTop - 1} z={6}>
        <Pixel sprite={TRINKETS} u={u} />
      </Place>
      {!gamer && (
        <Place u={u} x={DESK.x + DESK.w - 11} y={deskTop - 1} z={6}>
          <Pixel sprite={LAMP} u={u} />
        </Place>
      )}

      <Character u={u} />

      {/* haz de luz de la ventana */}
      <LightBeam u={u} phase={phase} hour={hour} minute={minute} />

      {/* ambiente: noche oscura, amanecer y atardecer con luz cálida */}
      {night && <div className="pointer-events-none absolute inset-0 z-[30]" style={{ background: "rgba(14,20,48,.46)" }} />}
      {phase === "dawn" && <div className="pointer-events-none absolute inset-0 z-[29]" style={{ background: "rgba(255,190,150,.10)" }} />}
      {phase === "dusk" && <div className="pointer-events-none absolute inset-0 z-[29]" style={{ background: "rgba(255,140,80,.15)" }} />}

      {/* ventana grande con la calle (un solo vidrio) */}
      <Place u={u} x={WINDOW.x + WIN_GLASS.x} y={WINDOW.y + WINDOW.h - WIN_GLASS.y - WIN_GLASS.h} z={31}>
        <div className="relative overflow-hidden" style={{ width: WIN_GLASS.w * u, height: WIN_GLASS.h * u, "--u": `${u}px` } as CSSProperties}>
          <Pixel sprite={SKIES[phase]} u={u} />
          {!night && (
            <>
              <div className="animate-cloud-a absolute" style={{ top: 3 * u, left: 0 }}>
                <Pixel sprite={clouds[0]} u={u} />
              </div>
              <div className="animate-cloud-b absolute" style={{ top: 12 * u, left: 0 }}>
                <Pixel sprite={clouds[1]} u={u} />
              </div>
            </>
          )}
          <div className="absolute inset-0">
            <Pixel sprite={CITIES[phase]} u={u} />
          </div>
          {!night && (
            <div className="animate-bird absolute" style={{ top: 9 * u, left: 0 }}>
              <Pixel sprite={BIRD} u={u} />
            </div>
          )}
          <div className="animate-drive absolute" style={{ top: 33 * u, left: 0 }}>
            <Pixel sprite={CARS[phase]} u={u} />
          </div>
        </div>
      </Place>
      <Place u={u} x={WINDOW.x} y={WINDOW.y} z={32}>
        <Pixel sprite={FRAME} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(30,28,24,.16))` }} />
      </Place>
      <Place u={u} x={WINDOW.x + 7} y={WINDOW.y + 4} z={33}>
        <Pixel sprite={CACTUS} u={u} />
      </Place>

      {/* luces nocturnas */}
      {night && (
        <>
          <div
            className="pointer-events-none absolute z-[34]"
            style={{
              left: 100 * u,
              bottom: (deskTop - 6) * u,
              width: 40 * u,
              height: 40 * u,
              background: "radial-gradient(circle, rgba(255,214,140,.42), rgba(255,214,140,0) 66%)",
            }}
          />
          <div
            className="pointer-events-none absolute z-[34]"
            style={{
              left: 90 * u,
              bottom: (deskTop - 4) * u,
              width: 30 * u,
              height: 22 * u,
              background: "radial-gradient(circle, rgba(170,215,255,.26), rgba(170,215,255,0) 68%)",
            }}
          />
        </>
      )}

      {/* zonas interactivas (sin nombres, solo puntos que invitan a tocar) */}
      <Hotspot u={u} x={DESK.x - 18} y={DEPTH - 2} w={SCENE.w - DESK.x + 18} h={DESK_H + 14} label="Escritorio" show={hints} dot={[40, DESK_H + 8]} onClick={onDesk} />
      <Hotspot u={u} x={BOARD.x} y={BOARD.y} w={BOARD.w} h={BOARD.h} label="Tablero de hábitos" show={hints} dot={[BOARD.w / 2, BOARD.h - 4]} onClick={onBoard} />
    </div>
  );
}
