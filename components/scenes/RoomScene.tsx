"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { Pixel } from "@/components/Pixel";
import {
  BED,
  BOARD,
  BOOKCASE,
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
  bookcase,
  cactus,
  car,
  chair,
  clock,
  cushion,
  desk,
  deskLamp,
  deskTrinkets,
  floor,
  frame,
  laptopSide,
  monitor,
  rug,
  streetGlass,
  topPlant,
  windowFrame,
} from "@/lib/art/room";
import { useActorFrame } from "@/lib/actor/store";

interface Props {
  u: number;
  day: boolean;
  hour: number;
  minute: number;
  gamer: boolean;
  heat: (number | null)[][];
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
const CASE = bookcase(false);
const CASE_GAP = bookcase(true);
const CHAIR_S = chair();
const DESK_S = desk(false);
const DESK_GAMER = desk(true);
const MONITOR = monitor();
const LAPTOP = laptopSide();
const TRINKETS = deskTrinkets();
const LAMP = deskLamp();
const PLANT = topPlant();
const FRAME = windowFrame();
const CACTUS = cactus();
const GLASS_DAY = streetGlass(true);
const GLASS_NIGHT = streetGlass(false);
const CAR_DAY = car(true);
const CAR_NIGHT = car(false);
const FRAMES = [frame(0), frame(1)];

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
      <Place u={u} x={BOOKCASE.x} y={BOOKCASE.y} z={2}>
        <Pixel sprite={f.bookGap ? CASE_GAP : CASE} u={u} style={SHADOW(u)} />
      </Place>
    </>
  );
}

export default function RoomScene({ u, day, hour, minute, gamer, heat, hints, onDesk, onBoard }: Props) {
  const boardSprite = useMemo(() => board(heat), [heat]);
  const clockSprite = useMemo(() => clock(hour, minute), [hour, minute]);
  const wallTop = day ? "#f7f6f3" : "#f1f0ed";
  const wallBot = day ? "#ebe9e4" : "#e6e4df";
  const deskTop = DEPTH + DESK_H;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ width: SCENE.w * u, height: SCENE.h * u }}>
      {/* pared blanca con luz suave arriba */}
      <div className="absolute inset-x-0 top-0" style={{ bottom: (FLOOR_H - 2) * u, background: `linear-gradient(${wallTop}, ${wallBot})` }} />
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: 14 * u, background: "linear-gradient(rgba(0,0,0,.07), rgba(0,0,0,0))" }}
      />
      <Place u={u} x={0} y={0} z={0}>
        <Pixel sprite={FLOOR} u={u} />
      </Place>
      <Place u={u} x={0} y={FLOOR_H - 2} z={1}>
        <Pixel sprite={BASEBOARD} u={u} />
      </Place>
      <Place u={u} x={RUG_BOX.x} y={RUG_BOX.y} z={1}>
        <Pixel sprite={RUG} u={u} />
      </Place>

      {/* decoración de pared */}
      <Place u={u} x={BOARD.x} y={BOARD.y} z={1}>
        <Pixel sprite={boardSprite} u={u} style={SHADOW(u, 0.22)} />
      </Place>
      <Place u={u} x={96} y={92} z={1}>
        <Pixel sprite={FRAMES[0]} u={u} style={SHADOW(u)} />
      </Place>
      <Place u={u} x={114} y={90} z={1}>
        <Pixel sprite={FRAMES[1]} u={u} style={SHADOW(u)} />
      </Place>
      <Place u={u} x={72} y={96} z={1}>
        <Pixel sprite={clockSprite} u={u} />
      </Place>
      <Place u={u} x={BOOKCASE.x + 2} y={BOOKCASE.y + BOOKCASE.h} z={2}>
        <Pixel sprite={PLANT} u={u} />
      </Place>

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

      {/* noche: sombra general (la ventana y las luces quedan por encima) */}
      {!day && <div className="pointer-events-none absolute inset-0 z-[30]" style={{ background: "rgba(14,20,48,.46)" }} />}

      {/* ventana grande con la calle (un solo vidrio) */}
      <Place u={u} x={WINDOW.x + WIN_GLASS.x} y={WINDOW.y + WINDOW.h - WIN_GLASS.y - WIN_GLASS.h} z={31}>
        <div className="relative overflow-hidden" style={{ width: WIN_GLASS.w * u, height: WIN_GLASS.h * u }}>
          <Pixel sprite={day ? GLASS_DAY : GLASS_NIGHT} u={u} />
          <div className="animate-drive absolute" style={{ top: 33 * u, left: 0, "--u": `${u}px` } as CSSProperties}>
            <Pixel sprite={day ? CAR_DAY : CAR_NIGHT} u={u} />
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
      {!day && (
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
          <div
            className="pointer-events-none absolute z-[34]"
            style={{
              left: 18 * u,
              bottom: 14 * u,
              width: 56 * u,
              height: 52 * u,
              background: "radial-gradient(ellipse, rgba(190,210,255,.22), rgba(190,210,255,0) 70%)",
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
