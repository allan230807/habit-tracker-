import { Sprite, mix } from "../pixel";
import { C } from "./palette";
import { BED, BOOKS, CHAIR as CHAIR_BOX, CUSHION, DESK as DESK_BOX, SEAT_H, RUG as RUG_BOX, SCENE, FLOOR_H } from "./layout";

export { SCENE, FLOOR_H };

/** Pseudo-aleatorio determinista para que el arte sea estable entre renders. */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const OAK = { base: "#c9a47a", light: "#d8b68c", dark: "#b78f66", grain: "#a98258" };
const WOOD = { base: "#9a6f4b", hi: "#b88a60", lo: "#6f4d33", dark: "#4f3524" };

// ------------------------------------------------------------------ piso

export function floor() {
  const s = new Sprite(SCENE.w, FLOOR_H);
  // tablones horizontales vistos de frente, con juntas desfasadas y veta
  const rows = 4;
  const rh = FLOOR_H / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    for (let x = 0; x < SCENE.w; ) {
      const len = 26 + Math.floor(rnd(r * 17 + x) * 26);
      const shade = rnd(r * 31 + x * 7);
      const base = shade > 0.66 ? OAK.light : shade > 0.33 ? OAK.base : OAK.dark;
      s.rect(x, y, Math.min(len, SCENE.w - x), rh, base);
      s.rect(x, y, Math.min(len, SCENE.w - x), 1, OAK.light); // borde superior iluminado
      s.rect(x, y + rh - 1, Math.min(len, SCENE.w - x), 1, OAK.grain);
      s.rect(x + len - 1, y, 1, rh, OAK.grain); // junta
      for (let k = 0; k < len / 5; k++) s.set(x + Math.floor(rnd(x * 3 + k + r) * len), y + 1 + Math.floor(rnd(k * 9 + r) * (rh - 2)), OAK.grain);
      x += len;
    }
  }
  // sombra de la pared sobre el piso
  s.rect(0, 0, SCENE.w, 2, mix(OAK.dark, "#3a2a1c", 0.18));
  return s;
}

export function baseboard() {
  const s = new Sprite(SCENE.w, 4);
  s.rect(0, 0, SCENE.w, 4, "#fbfbf9");
  s.rect(0, 0, SCENE.w, 1, "#ffffff");
  s.rect(0, 3, SCENE.w, 1, "#d9d7d1");
  s.rect(0, 1, SCENE.w, 1, "#f1efea");
  return s;
}

// ------------------------------------------------------------------ ventana

export const WIN_GLASS = { x: 3, y: 3, w: 34, h: 40 };

export type SkyPhase = "dawn" | "day" | "dusk" | "night";

const SKY: Record<SkyPhase, { top: string; bottom: string }> = {
  dawn: { top: "#7f9fd1", bottom: "#f6cfa8" },
  day: { top: "#7fb7e0", bottom: "#d8ecf2" },
  dusk: { top: "#5b6bb0", bottom: "#f3b27a" },
  night: { top: "#0a1030", bottom: "#2a3358" },
};

const ROAD_Y = 33;

/** Cielo: degradado, sol o luna y estrellas (los edificios van en otra capa). */
export function streetSky(phase: SkyPhase) {
  const { w, h } = WIN_GLASS;
  const s = new Sprite(w, h);
  s.vgradient(0, 0, w, ROAD_Y, SKY[phase].top, SKY[phase].bottom);
  s.rect(0, ROAD_Y, w, h - ROAD_Y, SKY[phase].bottom);
  if (phase === "day") {
    s.ellipse(27, 6, 6, 6, "#fff0b8");
    s.ellipse(27, 6, 4.4, 4.4, "#fff6cf");
    s.ellipse(27, 6, 3, 3, "#fffbe8");
  } else if (phase === "dawn") {
    s.ellipse(9, 26, 7, 7, "#ffd9b0");
    s.ellipse(9, 26, 4.6, 4.6, "#ffe9c8");
  } else if (phase === "dusk") {
    s.ellipse(26, 25, 7.5, 7.5, "#f6a468");
    s.ellipse(26, 25, 5, 5, "#ffc080");
    for (let i = 0; i < 6; i++) s.set(Math.floor(rnd(i) * w), Math.floor(rnd(i + 90) * 6), "#c9cdf0");
  } else {
    for (let i = 0; i < 34; i++) s.set(Math.floor(rnd(i) * w), Math.floor(rnd(i + 70) * 20), i % 4 === 0 ? "#f4efd2" : i % 3 === 0 ? "#b9c0e0" : "#7d86ad");
    s.ellipse(26, 7, 5.5, 5.5, "#2b3560");
    s.ellipse(26, 7, 4.6, 4.6, "#f3eed2");
    s.ellipse(27.6, 6.1, 4, 4, "#16204a");
  }
  return s;
}

/** Nube suelta para animar (variante a/b). */
export function cloud(variant: 0 | 1, phase: SkyPhase) {
  const tint = phase === "dawn" ? "#fde3d4" : phase === "dusk" ? "#f6c9b0" : "#f8fcfc";
  const hi = phase === "dawn" ? "#fff2ea" : phase === "dusk" ? "#ffe0cc" : "#ffffff";
  const s = new Sprite(variant === 0 ? 14 : 10, variant === 0 ? 5 : 4);
  if (variant === 0) {
    s.ellipse(7, 3.4, 6.4, 1.6, tint);
    s.ellipse(5, 2.4, 3, 1.8, tint);
    s.ellipse(9, 2.2, 2.6, 1.6, hi);
  } else {
    s.ellipse(5, 2.6, 4.6, 1.3, tint);
    s.ellipse(4, 1.8, 2.2, 1.4, hi);
  }
  return s;
}

export function bird() {
  const s = new Sprite(6, 3);
  for (const [x, y] of [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0], [5, 0]] as const) s.set(x, y, "#3a3d45");
  return s;
}

/** Ciudad y calle (el cielo queda transparente). */
export function streetCity(phase: SkyPhase) {
  const { w, h } = WIN_GLASS;
  const s = new Sprite(w, h);
  const night = phase === "night";
  const warm = phase === "dusk" ? ["#ff9a5c", 0.26] : phase === "dawn" ? ["#ffd2b8", 0.2] : null;
  const tint = (c: string) => (warm ? mix(c, warm[0] as string, warm[1] as number) : c);
  const roadY = ROAD_Y;
  const far = night ? ["#1b2238", "#171d31", "#1e2540"] : ["#b6c7d6", "#a9bccd", "#bccddb"].map(tint);
  for (let x = 0, i = 0; x < w; i++) {
    const bw = 5 + Math.floor(rnd(i * 5) * 5);
    const bh = 9 + Math.floor(rnd(i * 3 + 1) * 10);
    s.rect(x, 26 - bh + 6, bw, bh, far[i % 3]);
    x += bw;
  }
  const near = night
    ? [["#2b2f4a", "#363b5c", "#1d2036"], ["#2f3552", "#3a4163", "#212640"], ["#262b45", "#30365a", "#1a1e34"], ["#2d3350", "#383f62", "#20253c"]]
    : [["#b8685a", "#d58a76", "#8c4a40"], ["#dccaa8", "#efe2c4", "#b9a883"], ["#8d9bab", "#a9b6c4", "#6b7886"], ["#c7a37e", "#dcc09c", "#9c7e5c"]].map((row) => row.map(tint));
  const litProb = night ? 0.55 : phase === "dusk" ? 0.5 : phase === "dawn" ? 0.25 : 0;
  let bx = 0;
  let bi = 0;
  while (bx < w) {
    const bw = 8 + Math.floor(rnd(bi * 7 + 2) * 5);
    const top = 14 + Math.floor(rnd(bi * 11 + 3) * 7);
    const [base, hi, lo] = near[bi % near.length];
    s.rect(bx, top, bw, roadY - top - 2, base);
    s.rect(bx, top, bw, 1, hi);
    s.rect(bx + bw - 1, top, 1, roadY - top - 2, lo);
    s.rect(bx, top - 1, bw, 1, lo);
    if (bi % 2 === 0) s.rect(bx + 2, top - 3, 1, 2, lo);
    for (let wy = top + 3; wy < roadY - 6; wy += 4)
      for (let wx = bx + 2; wx < bx + bw - 2; wx += 3) {
        const lit = rnd(wx * 13 + wy * 7 + 5) < litProb;
        const glass = night ? "#1a1e34" : tint("#9fb7c6");
        s.rect(wx, wy, 2, 2, lit ? "#f3d98a" : night ? glass : tint("#dcebf1"));
        if (!night && !lit) s.set(wx, wy, tint("#ffffff"));
      }
    s.rect(bx + 1, roadY - 6, bw - 2, 4, night ? "#232844" : tint("#6e7a86"));
    s.rect(bx + 2, roadY - 5, bw - 4, 2, night || phase === "dusk" ? "#f0cf80" : tint("#d8e6ee"));
    bx += bw;
    bi++;
  }
  // vereda, calle y rayas
  s.rect(0, roadY - 2, w, 3, night ? "#34374a" : tint("#c2beb3"));
  s.rect(0, roadY - 2, w, 1, night ? "#44485c" : tint("#d8d4c9"));
  s.rect(0, roadY + 1, w, h - roadY - 1, night ? "#181b26" : tint("#585c66"));
  s.rect(0, roadY + 1, w, 1, night ? "#2a2d3c" : tint("#8b8e94"));
  for (let x = 2; x < w; x += 8) s.rect(x, roadY + 4, 4, 1, night ? "#555a6d" : tint("#e6e2d4"));
  // árboles
  for (const tx of [6, 24]) {
    s.rect(tx, roadY - 9, 2, 8, night ? "#2a2420" : "#6b4a35");
    s.ellipse(tx + 1, roadY - 12, 4.2, 4.4, night ? "#1f3a2b" : tint("#5f9a63"));
    s.ellipse(tx - 0.5, roadY - 13, 2.2, 2.2, night ? "#2c4d39" : tint("#86bb82"));
    s.ellipse(tx + 3, roadY - 11, 2, 2, night ? "#193126" : tint("#4d8452"));
  }
  // farola (encendida al atardecer y de noche)
  const lx = 15;
  const lampOn = phase === "night" || phase === "dusk";
  s.rect(lx, roadY - 15, 1, 14, night ? "#555a6a" : "#3a3d45");
  s.rect(lx, roadY - 16, 4, 1, night ? "#555a6a" : "#3a3d45");
  s.rect(lx + 3, roadY - 15, 2, 1, lampOn ? "#fff0b8" : "#c9c5b6");
  if (lampOn) s.tint(lx + 4, roadY - 14, 12, "#f3d98a", night ? 0.75 : 0.45);
  // auto estacionado
  const cx = 2;
  const cy = roadY + 1;
  s.rect(cx, cy, 12, 3, night ? "#5a2a2c" : "#b9433c");
  s.rect(cx + 2, cy - 2, 7, 2, night ? "#5a2a2c" : "#b9433c");
  s.rect(cx + 3, cy - 1, 2, 1, night ? "#1b2a46" : "#a9d0e6");
  s.rect(cx + 6, cy - 1, 2, 1, night ? "#1b2a46" : "#a9d0e6");
  s.rect(cx + 2, cy + 3, 2, 1, "#15161a");
  s.rect(cx + 8, cy + 3, 2, 1, "#15161a");
  return s;
}

/** Auto que cruza la calle (se anima con CSS). */
export function car(phase: SkyPhase) {
  const night = phase === "night";
  const s = new Sprite(14, 7);
  const body = night ? "#4b505f" : "#d9dce2";
  const dark = night ? "#2f3340" : "#a9aeb8";
  s.rect(0, 3, 14, 3, body);
  s.rect(2, 1, 9, 2, body);
  s.rect(0, 5, 14, 1, dark);
  s.rect(3, 1, 3, 2, night ? "#1b2a46" : "#8fc0dc");
  s.rect(7, 1, 3, 2, night ? "#1b2a46" : "#8fc0dc");
  s.rect(1, 5, 3, 2, "#15161a");
  s.rect(10, 5, 3, 2, "#15161a");
  const lamp = night || phase === "dusk" ? "#fff3c4" : "#f3e2a8";
  s.set(13, 3, lamp);
  s.set(13, 4, lamp);
  s.set(0, 3, "#c4554f");
  return s.outline(C.line);
}

/** Marco blanco de una sola hoja (sin cruceta), cortinas y alféizar. */
export function windowFrame() {
  const { w, h } = { w: 40, h: 50 };
  const g = WIN_GLASS;
  const s = new Sprite(w, h);
  s.rect(1, 0, w - 2, h - 5, "#f6f5f1");
  s.rect(1, 0, w - 2, 1, "#ffffff");
  s.rect(1, 0, 1, h - 5, "#ffffff");
  s.rect(w - 2, 0, 1, h - 5, "#dad7cf");
  s.rect(1, h - 6, w - 2, 1, "#dad7cf");
  s.rect(g.x, g.y, g.w, g.h, null);
  // sombra interior del marco sobre el vidrio
  s.rect(g.x, g.y, g.w, 1, "#c9c6bd");
  s.rect(g.x, g.y, 1, g.h, "#d5d2c9");
  s.rect(g.x + g.w - 1, g.y, 1, g.h, "#e6e3dc");
  s.rect(g.x, g.y + g.h - 1, g.w, 1, "#e6e3dc");
  // cortinas de gasa recogidas a los lados
  for (let x = 0; x < 6; x++) {
    const c = x % 3 === 0 ? "#d8dce0" : x % 3 === 1 ? "#eef0f2" : "#e2e5e8";
    s.rect(g.x + x, g.y + 1, 1, g.h - 2, c);
    s.rect(g.x + g.w - 1 - x, g.y + 1, 1, g.h - 2, c);
  }
  s.rect(g.x, g.y + 24, 6, 2, "#b9bfc6");
  s.rect(g.x + g.w - 6, g.y + 24, 6, 2, "#b9bfc6");
  s.rect(g.x, g.y, g.w, 2, "#cfd3d8"); // riel
  // alféizar
  s.rect(0, h - 5, w, 3, "#f1efe9");
  s.rect(0, h - 5, w, 1, "#ffffff");
  s.rect(0, h - 3, w, 2, "#cbc8bf");
  s.rect(0, h - 2, w, 1, "#b3afa5");
  return s;
}

export function cactus() {
  const s = new Sprite(9, 11);
  s.rect(1, 7, 7, 4, "#c97b5f");
  s.rect(1, 7, 7, 1, "#e0967a");
  s.rect(1, 10, 7, 1, "#9f5c45");
  s.rect(3, 1, 3, 6, "#5f917a");
  s.rect(3, 1, 1, 6, "#7db296");
  s.rect(1, 3, 2, 1, "#5f917a");
  s.rect(1, 2, 1, 2, "#5f917a");
  s.rect(6, 4, 2, 1, "#5f917a");
  s.rect(7, 3, 1, 2, "#5f917a");
  s.set(4, 2, "#e8f0d8");
  s.set(4, 5, "#e8f0d8");
  return s.outline(C.line);
}

// --------------------------------------------------------------------- cama

/** Cama de madera clara con almohadas (el edredón va aparte, encima del personaje). */
export function bedBase() {
  const s = new Sprite(BED.w, BED.h);
  const top = BED.h - BED.mattress; // fila de la superficie del colchón
  // cabecero alto con listones
  s.rect(0, 0, 5, BED.h, WOOD.base);
  s.rect(0, 0, 1, BED.h, WOOD.hi);
  s.rect(4, 0, 1, BED.h, WOOD.lo);
  s.rect(1, 0, 3, 1, WOOD.hi);
  for (let y = 4; y < top - 2; y += 4) s.rect(1, y, 3, 1, WOOD.lo);
  // pie de cama
  s.rect(BED.w - 5, top - 4, 5, BED.h - top + 4, WOOD.base);
  s.rect(BED.w - 5, top - 4, 1, BED.h - top + 4, WOOD.hi);
  s.rect(BED.w - 1, top - 4, 1, BED.h - top + 4, WOOD.lo);
  // somier y patas
  s.rect(5, top + 9, BED.w - 10, 4, WOOD.base);
  s.rect(5, top + 9, BED.w - 10, 1, WOOD.hi);
  s.rect(5, top + 12, BED.w - 10, 1, WOOD.lo);
  s.rect(6, top + 13, 3, BED.h - top - 13, WOOD.lo);
  s.rect(BED.w - 10, top + 13, 3, BED.h - top - 13, WOOD.lo);
  // colchón con funda blanca
  s.rect(5, top, BED.w - 10, 9, "#eeede9");
  s.rect(5, top, BED.w - 10, 1, "#ffffff");
  s.rect(5, top + 7, BED.w - 10, 2, "#d3d1ca");
  s.rect(5, top + 8, BED.w - 10, 1, "#bdbab1");
  // almohadas
  const pillow = (x: number, y: number, w: number, h: number, c: string) => {
    s.rect(x + 1, y, w - 2, h, c);
    s.rect(x, y + 1, w, h - 2, c);
    s.rect(x + 1, y, w - 2, 1, "#ffffff");
    s.rect(x + 1, y + h - 2, w - 2, 1, "#d6d3cc");
    s.rect(x + w - 2, y + 2, 1, h - 3, "#dedbd4");
    s.set(x + (w >> 1), y + (h >> 1), "#e4e1da");
  };
  pillow(6, top - 7, 13, 8, "#f6f5f2");
  pillow(10, top - 11, 12, 7, "#ecebe6");
  return s.outline(C.line);
}

export type BlanketMode = "flat" | "legs" | "knees";

/** Edredón que cubre la parte baja del cuerpo (va ENCIMA del personaje). */
export function bedBlanket(mode: BlanketMode) {
  const s = new Sprite(BED.w, BED.h);
  const top = BED.h - BED.mattress;
  const x0 = mode === "flat" ? 24 : 17;
  const x1 = BED.w - 6;
  const smooth = (a: number, b: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  // perfil superior del edredón (altura sobre el colchón)
  const prof = (x: number) => {
    if (mode === "flat") return 2;
    if (mode === "legs") return 2 + 8 * smooth(17, 23, x) * (1 - smooth(44, 50, x));
    const k1 = Math.exp(-Math.pow((x - 41) / 6, 2)) * 13;
    const k2 = Math.exp(-Math.pow((x - 46) / 5, 2)) * 11;
    return 3 + Math.max(k1, k2);
  };
  for (let x = x0; x <= x1; x++) {
    const hgt = Math.round(prof(x));
    s.rect(x, top - hgt + 1, 1, hgt + 5, C.blanket);
    s.set(x, top - hgt + 1, C.blanketH);
    s.set(x, top - hgt + 2, C.blanketH);
  }
  // borde doblado (sábana blanca)
  for (let x = x0; x <= x1; x++) {
    const hgt = Math.round(prof(x));
    s.rect(x, top - hgt + 1, 1, 2, "#eceae4");
    s.set(x, top - hgt + 3, "#c9c6bd");
  }
  // caída lateral del edredón sobre el costado de la cama
  s.rect(x0, top + 2, x1 - x0 + 1, 7, C.blanket);
  s.rect(x0, top + 2, x1 - x0 + 1, 1, C.blanketH);
  s.rect(x0, top + 7, x1 - x0 + 1, 2, C.blanketL);
  for (let x = x0 + 3; x < x1 - 1; x += 6) {
    s.rect(x, top + 3, 1, 5, C.blanketL);
    s.rect(x + 1, top + 3, 1, 4, C.blanketH);
  }
  if (mode === "knees") {
    s.line(34, top - 2, 38, top + 3, C.blanketL);
    s.line(43, top - 6, 47, top + 3, C.blanketL);
  }
  if (mode === "legs") s.line(28, top - 5, 36, top + 1, C.blanketL);
  s.rect(x1, top - 1, 2, 11, C.blanketL);
  return s.outline(C.line);
}

// ------------------------------------------------------------------ libros

/** Pila de libros en el piso (3 libros; 2 cuando se llevó uno). */
export function bookStack(n: number) {
  const s = new Sprite(BOOKS.w, BOOKS.h);
  const books: [number, number, string][] = [
    [10, 3, "#5d6f8f"],
    [9, 3, "#c98f6a"],
    [8, 3, "#6f8f7d"],
  ];
  let y = BOOKS.h;
  books.slice(0, n).forEach(([w, h, c], i) => {
    y -= h;
    const x = i % 2 === 0 ? 0 : 1;
    s.rect(x, y, w, h, c);
    s.rect(x, y, w, 1, mix(c, "#ffffff", 0.3));
    s.rect(x + w - 1, y, 1, h, mix(c, "#000000", 0.22));
    s.rect(x + 1, y + h - 1, w - 2, 1, "#f1efe9"); // cantos de las hojas
  });
  return s.outline(C.line);
}

/** Cuadrito de una meta cumplida: el dibujo depende de la categoría. */
export function goalFrame(stat: string) {
  const s = new Sprite(11, 13);
  s.rect(0, 0, 11, 13, "#35312d");
  s.rect(1, 1, 9, 11, "#f7f5ef");
  const bg: Record<string, string> = {
    inteligencia: "#dbe8f3",
    dinero: "#efe6c9",
    fuerza: "#f3dcd8",
    espiritu: "#dcd8ee",
    disciplina: "#d8e8df",
  };
  s.rect(2, 2, 7, 9, bg[stat] ?? "#e8e6df");
  switch (stat) {
    case "inteligencia": // foco
      s.ellipse(5.5, 5.5, 2.4, 2.6, "#f3d46a");
      s.set(4, 4, "#fff3b5");
      s.rect(4, 8, 3, 1, "#8b909a");
      s.rect(4, 9, 3, 1, "#6c7280");
      break;
    case "dinero": // moneda
      s.ellipse(5.5, 6.5, 2.8, 2.8, "#d9b24a");
      s.ellipse(5.5, 6.5, 1.6, 1.6, "#f1d98a");
      s.rect(5, 5, 1, 3, "#a3801f");
      break;
    case "fuerza": // corazón
      for (const [x, y] of [[3, 4], [4, 4], [6, 4], [7, 4], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [4, 6], [5, 6], [6, 6], [5, 7]] as const) s.set(x, y, "#cf6f6a");
      s.set(3, 4, "#e58f8a");
      break;
    case "espiritu": // luna y estrella
      s.ellipse(5, 6, 2.6, 2.6, "#f3eed2");
      s.ellipse(6.2, 5.4, 2.4, 2.4, "#dcd8ee");
      s.set(7, 3, "#f3d98a");
      s.set(3, 9, "#f3d98a");
      break;
    default: // montaña con bandera
      s.limb(2, 10, 5, 5, 1, "#6b7a8c");
      s.limb(5, 5, 8, 10, 1, "#6b7a8c");
      s.rect(3, 9, 5, 2, "#8da0b4");
      s.rect(5, 3, 1, 3, "#3a3d45");
      s.rect(6, 3, 2, 1, "#cf7f78");
      break;
  }
  s.set(5, 0, "#1d1b19");
  return s.outline(C.line);
}

// ---------------------------------------------------------------- escritorio

export function desk(gamer: boolean) {
  const w = DESK_BOX.w;
  const h = DESK_BOX.h;
  const s = new Sprite(w, h);
  const top = gamer ? "#2f323a" : "#d9bf98";
  const topH = gamer ? "#454952" : "#ebd5b3";
  const topL = gamer ? "#1d1f24" : "#a98a62";
  const body = gamer ? "#272a31" : "#c3a47a";
  s.rect(0, 0, w, 3, top);
  s.rect(0, 0, w, 1, topH);
  s.rect(0, 3, w, 1, topL);
  // pata izquierda
  s.rect(1, 4, 2, h - 4, gamer ? "#272a31" : "#a98a62");
  s.rect(1, 4, 1, h - 4, gamer ? "#3a3e47" : "#c3a47a");
  // cajonera derecha
  const cw = 12;
  s.rect(w - cw - 1, 4, cw, h - 4, body);
  s.rect(w - cw - 1, 4, cw, 1, topL);
  s.rect(w - cw - 1, 4, 1, h - 4, gamer ? "#3a3e47" : topH);
  s.rect(w - 2, 4, 1, h - 4, topL);
  const dh = Math.floor((h - 5) / 3);
  for (let i = 0; i < 3; i++) {
    const y = 5 + i * dh;
    s.rect(w - cw + 1, y, cw - 3, dh - 1, gamer ? "#30333b" : "#d2b78e");
    s.rect(w - cw + 1, y, cw - 3, 1, gamer ? "#454952" : "#ebd5b3");
    s.rect(w - cw + 4, y + 2, 4, 1, C.metalH);
  }
  if (gamer) {
    s.rect(0, 3, w, 1, C.sage);
    s.rect(w - cw - 1, 4, 1, h - 4, C.sage);
  }
  return s.outline(C.line);
}

export function monitor() {
  const s = new Sprite(22, 16);
  s.rect(0, 0, 22, 13, "#16171a");
  s.rect(1, 1, 20, 11, "#1d2430");
  const rows: [number, number, string][] = [[2, 9, C.sage], [4, 13, "#8b909a"], [6, 7, C.sand], [8, 12, "#8b909a"]];
  for (const [y, w, c] of rows) s.rect(3, y + 1, w, 1, c);
  s.rect(10, 13, 2, 2, C.metalL);
  s.rect(7, 15, 8, 1, C.metal);
  s.rect(0, 12, 22, 1, C.sage);
  return s.outline(C.line);
}

/** Silla de oficina; la altura del asiento sale de la pose sentada. */
export function chair() {
  const s = new Sprite(CHAIR_BOX.w, CHAIR_BOX.h);
  const seatY = CHAIR_BOX.h - SEAT_H; // fila del asiento
  // respaldo curvo
  s.rect(0, 1, 4, seatY - 2, "#3a3d45");
  s.rect(0, 1, 1, seatY - 2, "#555a66");
  s.rect(3, 1, 1, seatY - 2, "#2a2c32");
  s.rect(1, 0, 3, 1, "#3a3d45");
  s.rect(1, seatY - 3, 3, 3, "#2a2c32");
  // asiento acolchado
  s.rect(0, seatY, 13, 3, "#4a4e58");
  s.rect(0, seatY, 13, 1, "#6b7080");
  s.rect(0, seatY + 2, 13, 1, "#2f3239");
  // pistón y base
  s.rect(6, seatY + 3, 2, CHAIR_BOX.h - seatY - 6, C.metal);
  s.rect(6, seatY + 3, 1, CHAIR_BOX.h - seatY - 6, C.metalH);
  s.rect(1, CHAIR_BOX.h - 3, 12, 1, C.metalL);
  for (const x of [1, 6, 11]) s.rect(x, CHAIR_BOX.h - 2, 2, 2, "#2a2c32");
  return s.outline(C.line);
}

export function laptopSide() {
  const s = new Sprite(16, 13);
  s.rect(0, 11, 14, 2, C.metalH);
  s.rect(0, 12, 14, 1, C.metalL);
  s.rect(0, 11, 14, 1, "#dfe1e5");
  s.limb(12, 11, 14.5, 1, 2, "#b9bcc2");
  s.line(11, 10, 13, 1, "#cfe6f2"); // pantalla encendida hacia el usuario
  s.set(14, 6, "#e3e5e8");
  return s.outline(C.line);
}

export function deskTrinkets() {
  const s = new Sprite(10, 9);
  s.rect(0, 7, 4, 1, "#25272d");
  s.rect(1, 7, 2, 1, "#cfe6f2");
  s.rect(0, 5, 8, 3, "#3c4656");
  s.rect(0, 7, 8, 1, "#f1efe9");
  s.rect(5, 5, 1, 3, "#1c1f26");
  s.rect(5, 2, 5, 3, "#6b4a35");
  s.rect(5, 2, 5, 1, "#8f6a4f");
  return s.outline(C.line);
}

export function deskLamp() {
  const s = new Sprite(11, 19);
  s.rect(1, 17, 7, 2, C.dark);
  s.rect(1, 17, 7, 1, "#4a4d55");
  s.limb(4, 17, 3, 7, 1, C.metal);
  s.limb(3, 7, 8, 3, 1, C.metal);
  s.rect(6, 2, 5, 4, C.dark);
  s.rect(6, 2, 5, 1, "#4a4d55");
  s.rect(7, 6, 3, 1, C.warm);
  return s.outline(C.line);
}

// ------------------------------------------------------------------- pared

/** Tablero con el heatmap real (niveles 0..4, null = día futuro). */
export function board(levels: (number | null)[][]) {
  const s = new Sprite(32, 31);
  s.rect(0, 0, 32, 31, WOOD.lo);
  s.rect(1, 1, 30, 29, WOOD.base);
  s.rect(1, 1, 30, 1, WOOD.hi);
  s.rect(2, 2, 28, 27, "#f3f1ea");
  s.rect(2, 2, 28, 1, "#d9d6cc");
  s.rect(2, 28, 28, 1, "#d9d6cc");
  s.rect(4, 4, 8, 1, "#8b909a");
  s.rect(14, 4, 4, 1, "#c6c9cf");
  const palette = ["#dedbd1", "#bcd8c9", "#8fbfa5", "#5fa585", "#3f8a6b"];
  levels.forEach((week, w) =>
    week.forEach((lvl, d) => {
      if (lvl === null) return;
      s.rect(4 + w * 3, 7 + d * 3, 2, 2, palette[lvl]);
    }),
  );
  s.set(2, 1, "#c4554f");
  s.set(29, 1, "#c4554f");
  return s.outline(C.line);
}

export function clock(h: number, m: number) {
  const s = new Sprite(14, 14);
  s.ellipse(7, 7, 6.6, 6.6, C.line);
  s.ellipse(7, 7, 5.8, 5.8, "#f8f7f3");
  s.ellipse(7, 7, 5.8, 5.8, "#f8f7f3");
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    s.set(7 + Math.cos(a) * 4.6, 7 + Math.sin(a) * 4.6, i % 3 === 0 ? "#3a3d45" : "#a5a8b0");
  }
  const ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
  const ha = (((h % 12) + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  s.line(7, 7, 7 + Math.cos(ha) * 3, 7 + Math.sin(ha) * 3, C.line);
  s.line(7, 7, 7 + Math.cos(ma) * 4.4, 7 + Math.sin(ma) * 4.4, "#4b5060");
  s.set(7, 7, C.sageD);
  return s;
}

// ------------------------------------------------------------------ alfombra

export function rug() {
  const s = new Sprite(RUG_BOX.w, RUG_BOX.h);
  const cx = RUG_BOX.w / 2;
  const cy = RUG_BOX.h / 2;
  s.ellipse(cx, cy, cx, cy, "#7f8f8b");
  s.ellipse(cx, cy, cx - 1.5, cy - 1, "#9aaaa5");
  s.ellipse(cx, cy, cx - 6, cy - 2, "#b5c4bf");
  s.ellipse(cx, cy, cx - 12, cy - 3, "#9aaaa5");
  for (let x = 6; x < RUG_BOX.w - 6; x += 4) s.set(x, cy, "#7f8f8b");
  return s;
}

export function cushion() {
  const s = new Sprite(CUSHION.w, CUSHION.h);
  const h = CUSHION.h;
  s.ellipse(CUSHION.w / 2, h - h / 2, CUSHION.w / 2, h / 2, "#cf8f78");
  s.ellipse(CUSHION.w / 2, h - h / 2 - 0.8, CUSHION.w / 2 - 1.5, h / 2 - 1, "#e0a58d");
  s.rect(CUSHION.w / 2 - 1, 1, 2, 1, "#b87560");
  return s.outline(C.line);
}

export function floorPlant() {
  const s = new Sprite(12, 30);
  s.rect(2, 22, 8, 8, "#d8d4c9");
  s.rect(2, 22, 8, 1, "#efece3");
  s.rect(2, 29, 8, 1, "#a6a297");
  s.rect(9, 23, 1, 6, "#bdb9ae");
  const leaf = (x: number, y: number, len: number, lean: number) => {
    s.limb(x, y, x + lean, y - len, 2, "#3f7a5e");
    s.limb(x, y, x + lean, y - len, 1, "#5da283");
  };
  leaf(5, 22, 20, -2);
  leaf(6, 22, 22, 0);
  leaf(7, 22, 17, 3);
  leaf(4, 22, 14, -4);
  leaf(8, 22, 12, 4);
  return s.outline(C.line);
}
