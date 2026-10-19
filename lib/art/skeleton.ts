import { Sprite } from "../pixel";
import { C } from "./palette";

/*
 * Personaje con esqueleto: una pose son ángulos (grados) y la posición de la
 * cadera. Interpolando poses se obtienen movimientos fluidos (caminar, sentarse,
 * acostarse…) y cada fotograma se dibuja como pixel art a partir de los huesos.
 *
 * Convenciones: x hacia la derecha, y hacia ARRIBA (altura sobre el piso).
 * Ángulos de brazos/piernas: 0° = hacia abajo, + = hacia adelante.
 * Ángulo del torso: 0° = vertical, + = inclinado hacia adelante, -90° = acostado de espaldas.
 */

export interface Pose {
  /** Posición de la cadera respecto al ancla (x) y altura (null = apoyar los pies en el piso). */
  hipX: number;
  hipY: number | null;
  torso: number;
  head: number;
  armF: [number, number];
  armB: [number, number];
  /** [muslo, pantorrilla, pie] — pie: 0 = plano, + = punta hacia arriba. */
  legF: [number, number, number];
  legB: [number, number, number];
  /** 0 = ojos abiertos, 1 = cerrados. */
  eyes: number;
}

export type Prop = "none" | "book_closed" | "book_open" | "phone" | "marker";

export const BONE = { thigh: 14, shin: 13, torso: 17, neck: 3, upper: 8.5, fore: 8, head: 5.5 };

const rad = (d: number) => (d * Math.PI) / 180;
/** Dirección de un hueso medido desde "abajo". */
const down = (a: number): [number, number] => [Math.sin(rad(a)), -Math.cos(rad(a))];
/** Dirección medida desde "arriba". */
const up = (a: number): [number, number] => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p: [number, number], d: [number, number], k: number): [number, number] => [p[0] + d[0] * k, p[1] + d[1] * k];

export interface Joints {
  hip: [number, number];
  shoulder: [number, number];
  neckTop: [number, number];
  headC: [number, number];
  elbowF: [number, number];
  wristF: [number, number];
  elbowB: [number, number];
  wristB: [number, number];
  kneeF: [number, number];
  ankleF: [number, number];
  toeF: [number, number];
  kneeB: [number, number];
  ankleB: [number, number];
  toeB: [number, number];
}

export function joints(p: Pose): Joints {
  const hip: [number, number] = [p.hipX, p.hipY ?? 0];
  const shoulder = add(hip, up(p.torso), BONE.torso);
  const neckTop = add(shoulder, up(p.torso + p.head * 0.4), BONE.neck);
  const headC = add(neckTop, up(p.torso + p.head), BONE.head);
  const elbowF = add(shoulder, down(p.armF[0]), BONE.upper);
  const wristF = add(elbowF, down(p.armF[1]), BONE.fore);
  const elbowB = add(shoulder, down(p.armB[0]), BONE.upper);
  const wristB = add(elbowB, down(p.armB[1]), BONE.fore);
  const kneeF = add(hip, down(p.legF[0]), BONE.thigh);
  const ankleF = add(kneeF, down(p.legF[1]), BONE.shin);
  const kneeB = add(hip, down(p.legB[0]), BONE.thigh);
  const ankleB = add(kneeB, down(p.legB[1]), BONE.shin);
  const toe = (a: [number, number], f: number): [number, number] => [a[0] + Math.cos(rad(f)) * 6, a[1] + Math.sin(rad(f)) * 6 - 1.5];
  return {
    hip,
    shoulder,
    neckTop,
    headC,
    elbowF,
    wristF,
    elbowB,
    wristB,
    kneeF,
    ankleF,
    toeF: toe(ankleF, p.legF[2]),
    kneeB,
    ankleB,
    toeB: toe(ankleB, p.legB[2]),
  };
}

/** Fija la altura de la cadera para que los pies pisen el piso (si hipY es null). */
export function resolve(p: Pose): Pose & { hipY: number } {
  if (p.hipY !== null) return p as Pose & { hipY: number };
  const j = joints({ ...p, hipY: 0 });
  const low = Math.min(j.ankleF[1] - 2.5, j.toeF[1] - 2, j.ankleB[1] - 2.5, j.toeB[1] - 2);
  return { ...p, hipY: -low };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** Interpola dos poses (resuelve el apoyo en el piso antes de mezclar). */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const ra = resolve(a);
  const rb = resolve(b);
  return {
    hipX: lerp(ra.hipX, rb.hipX, t),
    hipY: lerp(ra.hipY, rb.hipY, t),
    torso: lerp(ra.torso, rb.torso, t),
    head: lerp(ra.head, rb.head, t),
    armF: lerp2(ra.armF, rb.armF, t),
    armB: lerp2(ra.armB, rb.armB, t),
    legF: lerp3(ra.legF, rb.legF, t),
    legB: lerp3(ra.legB, rb.legB, t),
    eyes: lerp(ra.eyes, rb.eyes, t),
  };
}

// --------------------------------------------------------------------- cabeza

let headCache: Sprite | null = null;

/**
 * Cabeza de perfil mirando a la derecha (13x15). Pelo corto y rizado, orejas,
 * cejas, ojo con esclerótica, nariz y labios. El centro del cráneo es (6, 7).
 */
function headSprite() {
  if (headCache) return headCache;
  const s = new Sprite(14, 15);
  const skin = C.skin;
  // cráneo y cara
  s.ellipse(6.4, 7, 5.3, 6.2, skin);
  s.rect(6, 10, 5, 3, skin); // mandíbula
  s.set(5, 12, skin);
  s.set(11, 8, skin); // nariz
  s.set(12, 8, skin);
  s.set(11, 9, skin);
  s.set(11, 10, C.skinS);
  s.set(10, 12, null);
  s.set(11, 12, null);
  s.set(11, 11, null);
  // sombras suaves
  s.rect(5, 10, 2, 2, C.skinS);
  s.set(8, 11, C.skinS);
  s.set(9, 12, C.skinS);
  // pelo corto con rizos: altura del borde inferior del pelo por columna
  const hairBottom: Record<number, number> = { 0: 9, 1: 10, 2: 10, 3: 9, 4: 7, 5: 5, 6: 4, 7: 3, 8: 3, 9: 3, 10: 3 };
  for (let y = 0; y < 15; y++)
    for (let x = 0; x < 14; x++) {
      const inSkull = s.get(x, y) !== null;
      const lim = hairBottom[x];
      if (lim !== undefined && inSkull && y < lim) s.set(x, y, C.hair);
    }
  // rizos: bultos en el borde superior y trasero
  const curls: [number, number][] = [
    [2, 2], [4, 0], [6, 0], [8, 1], [10, 2], [1, 4], [0, 6], [1, 8], [11, 3], [3, 1], [5, 0], [7, 0], [9, 1],
  ];
  for (const [x, y] of curls) {
    s.set(x, y, C.hair);
    s.set(x, y + 1, C.hair);
  }
  s.ellipse(6, 3.2, 5.6, 3.6, C.hair);
  s.set(12, 3, null);
  for (let y = 4; y < 10; y++) s.set(0, y, y > 7 ? null : C.hair);
  // reflejos y sombras del pelo (textura rizada)
  for (const [x, y] of [[3, 2], [5, 1], [7, 1], [9, 2], [2, 5], [4, 3], [8, 3]] as const) s.set(x, y, C.hairH);
  for (const [x, y] of [[3, 4], [6, 3], [2, 7], [9, 3], [10, 4]] as const) s.set(x, y, C.hairL);
  // patilla y frente
  s.set(5, 5, C.hair);
  s.set(5, 6, C.hairL);
  // oreja
  s.set(5, 7, C.skinS);
  s.set(4, 8, C.skinS);
  s.set(5, 8, C.skinD);
  s.set(5, 9, C.skinS);
  // ceja
  s.rect(8, 5, 3, 1, C.hairL);
  // ojo: esclerótica + iris + pupila
  s.set(8, 6, "#f4f1ea");
  s.set(9, 6, "#f4f1ea");
  s.set(8, 7, "#f4f1ea");
  s.set(9, 7, "#2b211c");
  s.set(10, 6, "#2b211c");
  s.set(9, 6, "#4a3628");
  // boca y labio
  s.rect(9, 10, 2, 1, "#c98f7e");
  s.set(8, 10, C.skinD);
  s.set(10, 11, C.skinS);
  headCache = s;
  return s;
}

function eyesClosed(base: Sprite) {
  const s = new Sprite(base.w, base.h);
  s.paste(base, 0, 0);
  for (const [x, y] of [[8, 6], [9, 6], [10, 6]] as const) s.set(x, y, C.skin);
  s.rect(8, 7, 3, 1, C.hairL);
  return s;
}

const rotated = new Map<string, Sprite>();
function headVariant(k: number, closed: boolean, flip: boolean) {
  const key = `${k}:${closed ? 1 : 0}:${flip ? 1 : 0}`;
  let s = rotated.get(key);
  if (s) return s;
  s = closed ? eyesClosed(headSprite()) : headSprite();
  if (flip) s = s.mirror();
  // k = giros de 90° en sentido horario, ya en coordenadas de pantalla
  const turns = ((k % 4) + 4) % 4;
  for (let i = 0; i < turns; i++) s = s.rotateCW();
  rotated.set(key, s);
  return s;
}

// -------------------------------------------------------------------- dibujo

interface Opts {
  facing: 1 | -1;
  prop: Prop;
  /** Color de la tapa del libro. */
  bookColor?: string;
}

const norm = (dx: number, dy: number): [number, number] => {
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
};

/** Hueso con volumen: base + luz en un borde + sombra en el otro. */
function bone(s: Sprite, a: [number, number], b: [number, number], t: number, base: string, hi: string, lo: string) {
  s.limb(a[0], a[1], b[0], b[1], t, base);
  if (t < 3) return;
  const [nx, ny] = norm(b[0] - a[0], b[1] - a[1]);
  let px = -ny;
  let py = nx;
  if (px + py > 0) {
    px = -px;
    py = -py;
  }
  const o = Math.max(0.5, t / 2 - 0.5);
  s.line(a[0] + px * o, a[1] + py * o, b[0] + px * o, b[1] + py * o, hi);
  s.line(a[0] - px * o, a[1] - py * o, b[0] - px * o, b[1] - py * o, lo);
}

export interface Rendered {
  sprite: Sprite;
  /** Esquina inferior izquierda del sprite respecto al ancla (px lógicos, y hacia arriba). */
  ox: number;
  oy: number;
}

/** Dibuja el personaje completo en la pose dada. */
export function renderCharacter(pose: Pose, o: Opts): Rendered {
  const p = resolve(pose);
  const j = joints(p);
  const f = o.facing;
  const X = (x: number) => x * f;

  // límites en coordenadas de mundo (x ya reflejada)
  const pts = Object.values(j) as [number, number][];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, X(x));
    maxX = Math.max(maxX, X(x));
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const M = 9;
  const x0 = Math.floor(minX) - M;
  const y0 = Math.floor(minY) - M;
  const W = Math.ceil(maxX) + M - x0 + 1;
  const H = Math.ceil(maxY) + M - y0 + 1;
  const s = new Sprite(W, H);
  // mundo → lienzo
  const cx = (x: number) => X(x) - x0;
  const cy = (y: number) => H - 1 - (y - y0);
  const P = (q: [number, number]): [number, number] => [cx(q[0]), cy(q[1])];

  const hip = P(j.hip);
  const sh = P(j.shoulder);
  const neck = P(j.neckTop);

  const arm = (el: [number, number], wr: [number, number], back: boolean) => {
    const shp = [sh[0] + (back ? -0.5 : 0.5), sh[1]] as [number, number];
    const e = P(el);
    const w = P(wr);
    const base = back ? C.sweaterL : C.sweater;
    const hi = back ? C.sweater : C.sweaterH;
    bone(s, shp, e, 4, base, hi, C.sweaterL);
    bone(s, e, w, 3.6, base, hi, C.sweaterL);
    // pliegue en el codo y puño acanalado
    s.set(e[0], e[1], hi);
    const [dx, dy] = norm(w[0] - e[0], w[1] - e[1]);
    const cuff: [number, number] = [w[0] - dx * 1.5, w[1] - dy * 1.5];
    s.limb(cuff[0], cuff[1], w[0] - dx * 0.5, w[1] - dy * 0.5, 3.6, back ? C.sweater : C.sweaterH);
    // mano con pulgar
    const hx = w[0] + dx * 1.8;
    const hy = w[1] + dy * 1.8;
    s.ellipse(hx, hy, 1.9, 1.9, back ? C.skinS : C.skin);
    s.set(hx + dy * 1.5, hy - dx * 1.5, back ? C.skinD : C.skinS);
  };

  const leg = (kn: [number, number], an: [number, number], toe: [number, number], back: boolean) => {
    const k = P(kn);
    const a = P(an);
    const t = P(toe);
    const short = back ? C.shortsS : C.shorts;
    const shortHi = back ? "#c4c1b7" : "#ffffff";
    const skin = back ? C.skinD : C.skinS;
    // muslo: short blanco hasta ~70 %, luego piel
    const cut: [number, number] = [hip[0] + (k[0] - hip[0]) * 0.72, hip[1] + (k[1] - hip[1]) * 0.72];
    bone(s, hip, cut, 7, short, shortHi, back ? "#a9a69d" : C.shortsS);
    bone(s, cut, k, 5, skin, back ? C.skinS : C.skin, C.skinD);
    // pantorrilla
    bone(s, k, a, 4, skin, back ? C.skinS : C.skin, C.skinD);
    // zapatilla blanca con suela y cordones
    const ax = a[0];
    const ay = a[1];
    s.limb(ax, ay + 0.5, t[0], t[1], 4, back ? C.shoeS : C.shoe);
    s.limb(ax, ay + 1.8, t[0], t[1] + 1.8, 1, C.sole);
    const [dx, dy] = norm(t[0] - ax, t[1] - ay);
    s.limb(ax - dx * 1.5, ay - dy * 1.5 + 2, ax + dx * 1.5, ay + dy * 1.5 + 2, 2, back ? C.shoeS : C.shoe);
    s.set(ax + dx * 3, ay + dy * 3 - 1, "#8d8c86");
    s.set(ax + dx * 4, ay + dy * 4 - 1, "#8d8c86");
  };

  // 1) brazo y pierna traseros
  arm(j.elbowB, j.wristB, true);
  leg(j.kneeB, j.ankleB, j.toeB, true);

  // 2) torso: suéter negro con dobladillo, pliegues y cuello redondo
  const torsoTop = sh;
  const torsoBot: [number, number] = [hip[0] + (sh[0] - hip[0]) * 0.18, hip[1] + (sh[1] - hip[1]) * 0.18];
  bone(s, torsoBot, torsoTop, 9.5, C.sweater, C.sweaterH, C.sweaterL);
  s.ellipse(sh[0], sh[1] + 0.5, 4.8, 3.4, C.sweater); // hombros redondeados
  // pelvis con shorts blancos
  s.limb(hip[0], hip[1], torsoBot[0], torsoBot[1], 8.5, C.shorts);
  const [tx, ty] = norm(sh[0] - hip[0], sh[1] - hip[1]);
  // dobladillo acanalado
  const hem: [number, number] = [torsoBot[0] + tx * 1, torsoBot[1] + ty * 1];
  s.limb(hem[0], hem[1], hem[0] + tx * 1, hem[1] + ty * 1, 9.5, C.sweaterH);
  // costura y bolsillo del short
  s.line(hip[0], hip[1] + 1, hip[0] - tx * 0.5, hip[1] - ty * 0.5, C.shortsS);
  // pliegues del suéter
  for (const [k, l] of [[0.35, -2], [0.55, 2], [0.7, -1]] as const) {
    const px = hip[0] + (sh[0] - hip[0]) * k + l;
    const py = hip[1] + (sh[1] - hip[1]) * k;
    s.line(px, py, px - tx * 3 - ty * -0.5, py - ty * 3, C.sweaterL);
  }
  // cuello del suéter
  s.limb(sh[0] + tx * 0.5, sh[1] + ty * 0.5, sh[0] + tx * 1.5, sh[1] + ty * 1.5, 5, C.sweaterH);
  // 3) pierna delantera
  leg(j.kneeF, j.ankleF, j.toeF, false);

  // 4) cuello y cabeza
  bone(s, [sh[0] + tx * 1.2, sh[1] + ty * 1.2], neck, 3.4, C.skinS, C.skin, C.skinD);
  const h = P(j.headC);
  const k = Math.round((p.torso + p.head) / 90);
  const head = headVariant(k * f, p.eyes > 0.5, f === -1);
  s.paste(head, Math.round(h[0] - head.w / 2 + 0.5 * f), Math.round(h[1] - head.h / 2 - 0.5));

  // 5) brazo delantero (encima del torso) y objetos en la mano
  arm(j.elbowF, j.wristF, false);
  drawProp(s, o, P(j.wristF), P(j.wristB), P(j.elbowF), f);

  // contorno
  s.outline(C.line);
  return { sprite: s, ox: x0, oy: y0 };
}

function drawProp(s: Sprite, o: Opts, wF: [number, number], wB: [number, number], eF: [number, number], f: 1 | -1) {
  const color = o.bookColor ?? "#5f7387";
  switch (o.prop) {
    case "book_closed": {
      // libro cerrado sujeto con la mano, cayendo hacia abajo
      const x = Math.round(wF[0] - 2);
      const y = Math.round(wF[1] - 3);
      s.rect(x, y, 5, 8, color);
      s.rect(x, y, 1, 8, mixLight(color));
      s.rect(x + 4, y, 1, 8, "#f1efe9");
      s.rect(x + 1, y + 2, 3, 1, "#e8e3d6");
      break;
    }
    case "book_open": {
      // libro abierto frente al pecho, apoyado en ambas manos
      const mx = (wF[0] + wB[0]) / 2;
      const my = (wF[1] + wB[1]) / 2;
      const x = Math.round(mx - 1 * f);
      const y = Math.round(my - 9);
      s.rect(x, y, 10, 8, color);
      s.rect(x + 1, y + 1, 4, 6, "#f4f1ea");
      s.rect(x + 5, y + 1, 4, 6, "#ebe7dc");
      s.rect(x + 5, y + 1, 1, 6, "#c9c4b6");
      for (const ly of [2, 4]) {
        s.rect(x + 2, y + ly, 2, 1, "#9aa0aa");
        s.rect(x + 6, y + ly, 2, 1, "#9aa0aa");
      }
      break;
    }
    case "phone": {
      const x = Math.round(wF[0] + 1);
      const y = Math.round(wF[1] - 6);
      s.rect(x, y, 4, 7, "#1e2026");
      s.rect(x + 1, y + 1, 2, 5, "#cfe6f2");
      s.set(x + 1, y + 1, "#ffffff");
      s.set(x + 2, y + 3, C.sage);
      break;
    }
    case "marker": {
      const [dx, dy] = norm(wF[0] - eF[0], wF[1] - eF[1]);
      s.limb(wF[0] + dx, wF[1] + dy, wF[0] + dx * 5, wF[1] + dy * 5, 1, "#e8e6e1");
      s.set(Math.round(wF[0] + dx * 6), Math.round(wF[1] + dy * 6), "#cf7f78");
      break;
    }
    default:
      break;
  }
}

function mixLight(c: string) {
  const n = parseInt(c.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 40);
  const g = Math.min(255, ((n >> 8) & 255) + 40);
  const b = Math.min(255, (n & 255) + 40);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
