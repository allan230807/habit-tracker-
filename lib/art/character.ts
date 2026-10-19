import { Sprite } from "../pixel";
import type { SpriteState } from "../types";
import { C } from "./palette";

/*
 * Personaje: pelo rizado, piel morena clara, suéter negro y shorts blancos.
 * Todas las poses miran a la derecha (perfil) salvo la de dormir.
 */

type Look = { eyesClosed?: boolean; bow?: number };

/** Cabeza de perfil mirando a la derecha. (cx, cy) = centro del cráneo. */
function head(s: Sprite, cx: number, cy: number, look: Look = {}) {
  cx += look.bow ?? 0;
  // masa de pelo + rulos
  s.ellipse(cx - 0.4, cy - 1, 4.3, 4.2, C.hair);
  const curls: [number, number, number][] = [
    [-4, -2, 1.7],
    [-3.5, -4.2, 1.7],
    [-1.5, -5.4, 1.8],
    [0.8, -5.8, 1.7],
    [3, -5, 1.6],
    [4.3, -3, 1.4],
    [-4.8, 0.5, 1.6],
    [-4.4, 2.6, 1.5],
    [-2.8, 4, 1.2],
  ];
  for (const [dx, dy, r] of curls) s.ellipse(cx + dx, cy + dy, r, r, C.hair);
  for (const [dx, dy] of curls) {
    s.set(cx + dx - 0.5, cy + dy - 0.8, C.hairH);
    s.set(cx + dx - 0.8, cy + dy + 0.8, C.hairL);
  }
  // cara
  s.rect(cx, cy - 1, 4, 6, C.skin);
  s.set(cx + 3, cy + 5, null);
  s.set(cx + 4, cy + 1, C.skin); // nariz
  s.set(cx + 4, cy + 2, C.skin);
  s.set(cx + 3, cy + 3, C.skinS);
  s.set(cx + 1, cy + 3, C.skinS); // pómulo
  s.set(cx + 1, cy + 4, C.skinS);
  // flequillo rizado
  s.ellipse(cx + 1.8, cy - 2, 1.9, 1.3, C.hair);
  s.ellipse(cx + 3.6, cy - 1.6, 1.1, 1, C.hair);
  s.set(cx + 1, cy - 2.6, C.hairH);
  // oreja
  s.set(cx, cy + 1, C.skinS);
  s.set(cx, cy + 2, C.skinD);
  // ojo, ceja y boca
  if (look.eyesClosed) s.rect(cx + 2, cy + 1, 2, 1, C.hairL);
  else s.set(cx + 3, cy + 1, C.eye);
  s.set(cx + 3, cy, C.hairL);
  s.set(cx + 2, cy, C.hairL);
  s.set(cx + 3, cy + 4, C.skinD);
  // cuello
  s.rect(cx, cy + 5, 3, 3, C.skinS);
  s.rect(cx + 1, cy + 5, 2, 2, C.skin);
}

interface Joints {
  head: [number, number];
  look?: Look;
  shoulder: [number, number];
  hip: [number, number];
  /** [codo, mano] */
  armF: [[number, number], [number, number]];
  armB: [[number, number], [number, number]];
  /** [rodilla, tobillo] */
  legF: [[number, number], [number, number]];
  legB: [[number, number], [number, number]];
  footDir?: 1 | -1;
  torsoW?: number;
}

function foot(s: Sprite, x: number, y: number, dir: 1 | -1, back = false) {
  const x0 = dir === 1 ? x - 1 : x - 6;
  s.rect(x0, y, 7, 3, back ? C.shoeS : C.shoe);
  s.rect(x0, y + 3, 7, 1, C.sole);
  s.rect(dir === 1 ? x0 + 5 : x0, y, 2, 2, back ? C.sole : C.shoeS); // puntera
  s.set(dir === 1 ? x0 + 1 : x0 + 5, y, C.shoeS);
}

function arm(s: Sprite, sh: [number, number], elbow: [number, number], hand: [number, number], back: boolean) {
  const body = back ? C.sweaterL : C.sweater;
  s.limb(sh[0], sh[1], elbow[0], elbow[1], 3, body);
  s.limb(elbow[0], elbow[1], hand[0], hand[1], 3, body);
  // pliegue y puño
  s.set(elbow[0] - 1, elbow[1], back ? C.sweaterL : C.sweaterH);
  s.set(elbow[0], elbow[1] - 1, back ? C.sweaterL : C.sweaterH);
  const dx = hand[0] - elbow[0];
  const dy = hand[1] - elbow[1];
  const len = Math.hypot(dx, dy) || 1;
  const wx = hand[0] - (dx / len) * 1.5;
  const wy = hand[1] - (dy / len) * 1.5;
  s.limb(wx, wy, wx, wy, 3, C.sweaterH);
  s.ellipse(hand[0] + (dx / len) * 1.2, hand[1] + (dy / len) * 1.2, 1.7, 1.7, back ? C.skinS : C.skin);
}

function leg(s: Sprite, hip: [number, number], knee: [number, number], ankle: [number, number], dir: 1 | -1, back: boolean) {
  // muslo (shorts) y pantorrilla (piel)
  s.limb(hip[0], hip[1], knee[0], knee[1], 5, back ? C.shortsS : C.shorts);
  s.limb(knee[0], knee[1], ankle[0], ankle[1], 3, back ? C.skinD : C.skinS);
  s.set(knee[0] + (dir === 1 ? 1 : -1), knee[1] + 1, C.skin);
  foot(s, ankle[0], Math.round(ankle[1]), dir, back);
}

function body(s: Sprite, j: Joints) {
  const dir = j.footDir ?? 1;
  const tw = j.torsoW ?? 8;
  arm(s, j.shoulder, ...j.armB, true);
  leg(s, j.hip, ...j.legB, dir, true);
  // torso (suéter negro) con cuello redondo y dobladillo
  s.limb(j.shoulder[0], j.shoulder[1] + 1, j.hip[0], j.hip[1] - 1, tw, C.sweater);
  const [hx, hy] = j.hip;
  s.rect(Math.round(hx - tw / 2), Math.round(hy - 2), tw, 2, C.sweaterH); // dobladillo
  // pliegues y luz
  s.line(j.shoulder[0] - 1, j.shoulder[1] + 4, hx - 2, hy - 4, C.sweaterL);
  s.line(j.shoulder[0] + 2, j.shoulder[1] + 3, hx + 1, hy - 5, C.sweaterH);
  s.line(j.shoulder[0] + Math.floor(tw / 2) - 1, j.shoulder[1] + 2, hx + Math.floor(tw / 2) - 1, hy - 3, C.sweaterL);
  // short: cintura
  s.limb(hx, hy, hx, hy + 1, tw, C.shorts);
  s.rect(Math.round(hx - tw / 2), Math.round(hy), tw, 1, C.shortsS);
  leg(s, j.hip, ...j.legF, dir, false);
  arm(s, [j.shoulder[0] + 1, j.shoulder[1] + 1], ...j.armF, false);
  head(s, j.head[0], j.head[1], j.look);
}

function finish(s: Sprite) {
  return s.outline(C.line);
}

// ---------------------------------------------------------------------------

/** Sentado frente al escritorio (perfil derecho). Lienzo 36x50. */
function sitting() {
  const s = new Sprite(36, 50);
  body(s, {
    head: [10, 8],
    shoulder: [10, 15],
    hip: [9, 33],
    armF: [
      [14, 27],
      [22, 25],
    ],
    armB: [
      [14, 28],
      [21, 26],
    ],
    legF: [
      [22, 34],
      [23, 44],
    ],
    legB: [
      [21, 35],
      [22, 44],
    ],
  });
  return finish(s);
}

/** De pie, escribiendo en el tablero con el brazo en alto. Lienzo 34x54. */
function writing() {
  const s = new Sprite(34, 54);
  body(s, {
    head: [10, 8],
    shoulder: [10, 15],
    hip: [10, 34],
    armF: [
      [17, 15],
      [23, 8],
    ],
    armB: [
      [10, 26],
      [10, 33],
    ],
    legF: [
      [13, 42],
      [14, 48],
    ],
    legB: [
      [10, 42],
      [8, 48],
    ],
  });
  // marcador en la mano
  s.line(23, 8, 26, 5, C.blanket);
  s.set(26, 5, C.line);
  return finish(s);
}

/** De rodillas, orando. Lienzo 36x48. */
function praying() {
  const s = new Sprite(36, 48);
  body(s, {
    head: [13, 11],
    look: { eyesClosed: true, bow: 1 },
    shoulder: [12, 18],
    hip: [10, 33],
        armF: [
      [14, 28],
      [20, 24],
    ],
    armB: [
      [14, 29],
      [19, 25],
    ],
    legF: [
      [12, 40],
      [4, 43],
    ],
    legB: [
      [11, 40],
      [3, 43],
    ],
    footDir: -1,
  });
  // manos juntas
  s.ellipse(20.5, 24.5, 2.2, 2, C.skin);
  s.set(21, 24, C.skinS);
  return finish(s);
}

/** Recostado en la cama, boca arriba, durmiendo. Lienzo 34x16. */
function sleeping() {
  const s = new Sprite(34, 16);
  // cabeza de frente sobre la almohada
  const cx = 8;
  const cy = 8;
  s.ellipse(cx, cy - 1, 6.6, 6.2, C.hair);
  for (const [dx, dy] of [
    [-6, -3],
    [-4, -6],
    [0, -7],
    [4, -6],
    [6, -2],
    [-7, 1],
    [7, 2],
  ] as const) {
    s.ellipse(cx + dx, cy + dy, 2.2, 2.2, C.hair);
    s.set(cx + dx - 0.5, cy + dy - 1, C.hairH);
  }
  s.ellipse(cx, cy + 1.5, 4, 4.6, C.skin);
  s.rect(cx - 3, cy - 3, 7, 2, C.hair);
  s.ellipse(cx - 2, cy - 3, 2, 1.4, C.hair);
  s.ellipse(cx + 2, cy - 3, 2, 1.4, C.hair);
  s.rect(cx - 3, cy + 1, 2, 1, C.hairL); // ojos cerrados
  s.rect(cx + 1, cy + 1, 2, 1, C.hairL);
  s.set(cx - 0.5, cy + 3, C.skinS);
  s.rect(cx - 1, cy + 5, 3, 1, C.skinD);
  // hombros (suéter) y brazo sobre la manta
  s.rect(12, 8, 7, 7, C.sweater);
  s.rect(12, 8, 7, 1, C.sweaterH);
  s.limb(14, 11, 25, 12, 3, C.sweater);
  s.line(14, 10, 24, 11, C.sweaterH);
  s.ellipse(26.5, 12, 1.8, 1.8, C.skin);
  return finish(s);
}

/** Sentado en la cama apoyado en la almohada. `book` o `phone`. Lienzo 34x34. */
function propped(item: "book" | "phone") {
  const s = new Sprite(34, 34);
  body(s, {
    head: [8, 8],
    shoulder: [8, 15],
    hip: [10, 31],
    armF: [
      [14, 25],
      [item === "book" ? 19 : 18, item === "book" ? 21 : 19],
    ],
    armB: [
      [13, 26],
      [18, 22],
    ],
    legF: [
      [22, 31],
      [30, 30],
    ],
    legB: [
      [21, 32],
      [30, 31],
    ],
  });
  if (item === "book") {
    s.rect(18, 15, 9, 7, C.white);
    s.rect(18, 15, 9, 1, C.whiteS);
    s.rect(22, 15, 1, 7, C.whiteS);
    s.rect(18, 21, 9, 1, C.blanketL);
    s.rect(19, 17, 3, 1, C.metal);
    s.rect(24, 17, 2, 1, C.metal);
    s.rect(19, 19, 3, 1, C.metal);
    s.rect(24, 19, 2, 1, C.metal);
    s.ellipse(18.5, 21, 1.7, 1.7, C.skin);
  } else {
    s.rect(17, 14, 5, 8, C.dark);
    s.rect(18, 15, 3, 6, "#cfe6f2");
    s.rect(18, 15, 3, 1, "#ffffff");
    s.set(19, 18, C.sageD);
    s.ellipse(17.5, 20.5, 1.7, 1.7, C.skin);
  }
  return finish(s);
}

const cache = new Map<string, Sprite>();
const memo = (key: string, fn: () => Sprite) => {
  let s = cache.get(key);
  if (!s) cache.set(key, (s = fn()));
  return s;
};

export interface Pose {
  sprite: Sprite;
  /** Posición del pie izquierdo/base del sprite en la habitación (px lógicos, y hacia arriba). */
  x: number;
  y: number;
}

export function poseFor(state: SpriteState): Pose {
  switch (state) {
    case "durmiendo":
      return { sprite: memo("sleep", sleeping), x: 4, y: 12 };
    case "reading_bed":
      return { sprite: memo("read", () => propped("book")), x: 3, y: 12 };
    case "scrolling_phone":
      return { sprite: memo("phone", () => propped("phone")), x: 3, y: 12 };
    case "praying":
      return { sprite: memo("pray", praying), x: 46, y: 2 };
    case "writing_board":
      return { sprite: memo("write", writing), x: 40, y: 1 };
    case "working_macbook":
      return { sprite: memo("work", sitting), x: 62, y: 1 };
  }
}
