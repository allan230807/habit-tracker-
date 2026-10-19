"use client";

import { useMemo, type CSSProperties } from "react";
import { Pixel } from "@/components/Pixel";
import { poseFor } from "@/lib/art/character";
import {
  FLOOR_H,
  SCENE,
  GLASS,
  bedBase,
  bedBlanket,
  board,
  cactus,
  car,
  chair,
  clock,
  desk,
  deskLamp,
  deskTrinkets,
  laptopSide,
  monitor,
  rug,
  shelf,
  streetGlass,
  windowFrame,
} from "@/lib/art/room";
import type { SpriteState } from "@/lib/types";

interface Props {
  u: number;
  day: boolean;
  hour: number;
  minute: number;
  sprite: SpriteState;
  gamer: boolean;
  heat: (number | null)[][];
  /** Mostrar las etiquetas de los puntos interactivos. */
  labels: boolean;
  onDesk: () => void;
  onBoard: () => void;
  onBed: () => void;
}

// Sprites estáticos (se crean una sola vez).
const BED = bedBase();
const BLANKET = bedBlanket();
const CHAIR = chair();
const LAPTOP = laptopSide();
const TRINKETS = deskTrinkets();
const LAMP = deskLamp();
const SHELF = shelf();
const RUG = rug();
const CACTUS = cactus();
const FRAME = windowFrame();
const MONITOR = monitor();
const DESK = desk(false);
const DESK_GAMER = desk(true);
const GLASS_DAY = streetGlass(true);
const GLASS_NIGHT = streetGlass(false);
const CAR_DAY = car(true);
const CAR_NIGHT = car(false);

const BED_STATES: SpriteState[] = ["durmiendo", "reading_bed", "scrolling_phone"];

interface PlaceProps {
  u: number;
  x: number;
  y: number;
  z?: number;
  style?: CSSProperties;
  children: React.ReactNode;
}

/** Posiciona por esquina inferior izquierda en px lógicos (y hacia arriba). */
function Place({ u, x, y, z = 1, style, children }: PlaceProps) {
  return (
    <div className="absolute" style={{ left: x * u, bottom: y * u, zIndex: z, ...style }}>
      {children}
    </div>
  );
}

function Hotspot({
  u,
  x,
  y,
  w,
  h,
  label,
  tag,
  show,
  onClick,
}: {
  u: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tag: string;
  show: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="group absolute z-20 cursor-pointer rounded-sm outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/10"
      style={{ left: x * u, bottom: y * u, width: w * u, height: h * u }}
    >
      <span
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm transition-opacity"
        style={{ opacity: show ? 1 : 0 }}
      >
        {tag}
      </span>
    </button>
  );
}

export default function RoomScene({ u, day, hour, minute, sprite, gamer, heat, labels, onDesk, onBoard, onBed }: Props) {
  const pose = poseFor(sprite);
  const inBed = BED_STATES.includes(sprite);
  const boardSprite = useMemo(() => board(heat), [heat]);
  const clockSprite = useMemo(() => clock(hour, minute), [hour, minute]);
  const dim = (c: string) => c; // (los colores nocturnos se aplican con la capa de sombra)

  const wall = day ? ["#ddd6c9", "#cfc8ba"] : ["#2b2f38", "#262a32"];
  const floorA = day ? "#b48f69" : "#40362d";
  const floorB = day ? "#a98560" : "#3a312a";
  const trim = day ? "#f1ede4" : "#555a66";

  return (
    <div className="absolute inset-0" style={{ width: SCENE.w * u, height: SCENE.h * u }}>
      {/* pared y piso */}
      <div className="absolute inset-x-0 top-0" style={{ bottom: FLOOR_H * u, background: `linear-gradient(${wall[0]}, ${wall[1]})` }} />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: FLOOR_H * u,
          background: `repeating-linear-gradient(90deg, ${floorA} 0 ${14 * u}px, ${floorB} ${14 * u}px ${15 * u}px)`,
          boxShadow: `inset 0 ${u * 3}px 0 rgba(0,0,0,.18)`,
        }}
      />
      <div className="absolute inset-x-0" style={{ bottom: (FLOOR_H - 1) * u, height: 2 * u, background: trim, boxShadow: `0 ${u}px 0 rgba(0,0,0,.2)` }} />

      <Place u={u} x={30} y={1} z={1}>
        <Pixel sprite={RUG} u={u} />
      </Place>

      {/* decoración de pared */}
      <Place u={u} x={42} y={40} z={1}>
        <Pixel sprite={boardSprite} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.22))` }} />
      </Place>
      <Place u={u} x={80} y={56} z={1}>
        <Pixel sprite={SHELF} u={u} />
      </Place>
      <Place u={u} x={92} y={72} z={1}>
        <Pixel sprite={clockSprite} u={u} />
      </Place>

      {/* cama + personaje */}
      <Place u={u} x={2} y={3} z={2}>
        <Pixel sprite={BED} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.2))` }} />
      </Place>
      <Place u={u} x={65} y={3} z={3}>
        <Pixel sprite={CHAIR} u={u} />
      </Place>
      <Place u={u} x={pose.x} y={pose.y} z={4} style={{ transition: "left .5s steps(8), bottom .5s steps(8)" }}>
        <div className="animate-breathe" style={{ "--u": `${u}px` } as CSSProperties}>
          <Pixel sprite={pose.sprite} u={u} />
        </div>
      </Place>
      <Place u={u} x={2} y={3} z={inBed ? 5 : 2}>
        <Pixel sprite={BLANKET} u={u} />
      </Place>
      {sprite === "durmiendo" && (
        <span
          className="animate-floaty pointer-events-none absolute z-10 font-medium text-white/80"
          style={{ left: 16 * u, bottom: 30 * u, fontSize: Math.max(11, u * 4) }}
        >
          z z z
        </span>
      )}

      {/* escritorio */}
      <Place u={u} x={77} y={3} z={5}>
        <Pixel sprite={gamer ? DESK_GAMER : DESK} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.2))` }} />
      </Place>
      {gamer && (
        <Place u={u} x={94} y={23} z={6}>
          <Pixel sprite={MONITOR} u={u} />
        </Place>
      )}
      <Place u={u} x={80} y={23} z={6}>
        <Pixel sprite={LAPTOP} u={u} />
      </Place>
      <Place u={u} x={93} y={23} z={6}>
        <Pixel sprite={TRINKETS} u={u} />
      </Place>
      <Place u={u} x={102} y={23} z={6}>
        <Pixel sprite={LAMP} u={u} />
      </Place>

      {/* noche: sombra general (la ventana y las luces quedan por encima) */}
      {!day && <div className="pointer-events-none absolute inset-0 z-[8]" style={{ background: "rgba(10,14,34,.38)" }} />}

      {/* ventana con la calle */}
      <Place u={u} x={10 + GLASS.x} y={46 + 36 - GLASS.y - GLASS.h} z={9}>
        <div className="relative overflow-hidden" style={{ width: GLASS.w * u, height: GLASS.h * u }}>
          <Pixel sprite={day ? GLASS_DAY : GLASS_NIGHT} u={u} />
          <div className="animate-drive absolute" style={{ top: 22 * u, left: 0, "--u": `${u}px` } as CSSProperties}>
            <Pixel sprite={day ? CAR_DAY : CAR_NIGHT} u={u} />
          </div>
        </div>
      </Place>
      <Place u={u} x={10} y={46} z={10}>
        <Pixel sprite={FRAME} u={u} style={{ filter: `drop-shadow(${u}px ${u}px 0 rgba(0,0,0,.18))` }} />
      </Place>
      <Place u={u} x={26} y={46 + 3} z={11}>
        <Pixel sprite={CACTUS} u={u} />
      </Place>

      {/* luces nocturnas */}
      {!day && (
        <>
          <div
            className="pointer-events-none absolute z-[12]"
            style={{
              left: 86 * u,
              bottom: 14 * u,
              width: 30 * u,
              height: 30 * u,
              background: "radial-gradient(circle, rgba(255,214,140,.38), rgba(255,214,140,0) 68%)",
            }}
          />
          <div
            className="pointer-events-none absolute z-[12]"
            style={{
              left: 70 * u,
              bottom: 22 * u,
              width: 24 * u,
              height: 20 * u,
              background: "radial-gradient(circle, rgba(170,215,255,.28), rgba(170,215,255,0) 68%)",
            }}
          />
        </>
      )}
      {void dim}

      {/* zonas interactivas */}
      <Hotspot u={u} x={62} y={3} w={50} h={37} label="Escritorio" tag="Escritorio" show={labels} onClick={onDesk} />
      <Hotspot u={u} x={42} y={40} w={32} h={31} label="Tablero de hábitos" tag="Hábitos" show={labels} onClick={onBoard} />
      <Hotspot u={u} x={2} y={3} w={44} h={30} label="Cama" tag="Cama" show={labels} onClick={onBed} />
    </div>
  );
}
