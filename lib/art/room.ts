import { Sprite, mix } from "../pixel";
import { C } from "./palette";

export const SCENE = { w: 112, h: 100 };
export const FLOOR_H = 16;

/** Pseudo-aleatorio determinista para que el arte sea estable entre renders. */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------ ventana

export const GLASS = { x: 3, y: 2, w: 24, h: 28 };

/** La calle que se ve por la ventana. */
export function streetGlass(day: boolean) {
  const s = new Sprite(GLASS.w, GLASS.h);
  const roadY = 24;
  if (day) {
    s.vgradient(0, 0, 24, 23, "#86b5d3", "#d6e8eb");
    s.ellipse(6, 5, 4, 1.5, "#f6fafa");
    s.ellipse(8, 4, 2.6, 1.6, "#f6fafa");
    s.ellipse(19, 9, 3.4, 1.1, "#eef5f6");
    // edificios lejanos
    for (const [x, w, top, c] of [
      [0, 5, 13, "#aab9c6"],
      [4, 5, 10, "#9eaebd"],
      [12, 6, 12, "#a5b4c2"],
      [19, 5, 9, "#9fb0bf"],
    ] as const) {
      s.rect(x, top, w, 24 - top, c);
      for (let y = top + 2; y < 22; y += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) s.set(xx, y, "#c3d0db");
    }
    // edificios cercanos
    s.rect(0, 12, 8, 12, "#b4695a");
    s.rect(0, 12, 8, 1, "#cf8574");
    s.rect(9, 9, 8, 15, "#d9c7a6");
    s.rect(9, 9, 8, 1, "#ece0c4");
    s.rect(17, 14, 7, 10, "#8a97a8");
    s.rect(17, 14, 7, 1, "#a3afbd");
    for (let y = 14; y < 23; y += 3) for (const x of [1, 4, 10, 13, 18, 21]) s.rect(x, y, 2, 2, "#dcebf1");
    s.rect(1, 17, 2, 1, "#a8c4d2");
    s.rect(10, 11, 2, 2, "#9bb9c8");
  } else {
    s.vgradient(0, 0, 24, 23, "#0e1530", "#2b3658");
    for (let i = 0; i < 16; i++) s.set(Math.floor(rnd(i) * 24), Math.floor(rnd(i + 40) * 12), i % 3 === 0 ? "#f4efd2" : "#9aa3c4");
    s.ellipse(18, 5, 2.6, 2.6, "#f1ecd0");
    s.ellipse(19.2, 4.4, 2.3, 2.3, "#16204a");
    for (const [x, w, top, c] of [
      [0, 5, 13, "#1c2338"],
      [4, 5, 10, "#171d31"],
      [12, 6, 12, "#1b2237"],
      [19, 5, 9, "#171d31"],
    ] as const) {
      s.rect(x, top, w, 24 - top, c);
    }
    s.rect(0, 12, 8, 12, "#262e47");
    s.rect(9, 9, 8, 15, "#2d3652");
    s.rect(17, 14, 7, 10, "#222a42");
    let k = 0;
    for (let y = 14; y < 23; y += 3)
      for (const x of [1, 4, 10, 13, 18, 21]) {
        k++;
        s.rect(x, y, 2, 2, rnd(k * 3 + 1) > 0.45 ? "#f3d98a" : "#1a2036");
      }
  }
  // vereda, calle y rayas
  s.rect(0, 22, 24, 2, day ? "#bab5aa" : "#2a2d38");
  s.rect(0, 23, 24, 1, day ? "#8f8b80" : "#1d2029");
  s.rect(0, roadY, 24, 4, day ? "#5b5e66" : "#171a22");
  for (let x = 1; x < 24; x += 6) s.rect(x, 26, 3, 1, day ? "#d9d5c6" : "#4b4f5c");
  // árbol
  s.rect(14, 18, 2, 5, day ? "#6b4a35" : "#2a2420");
  s.ellipse(15, 15.5, 3.4, 3.6, day ? "#6b9a67" : "#223a2b");
  s.ellipse(14, 14.5, 1.6, 1.4, day ? "#8fb784" : "#2e4c39");
  // farola
  s.rect(21, 14, 1, 9, day ? "#3a3d45" : "#4a4e5a");
  s.rect(20, 13, 3, 1, day ? "#3a3d45" : "#f3e2a8");
  if (!day) s.tint(21.5, 14, 8, "#f3d98a", 0.7);
  // peatón
  s.rect(6, 19, 2, 4, day ? "#3b4a5c" : "#2d3548");
  s.rect(6, 17, 2, 2, day ? "#d9b18d" : "#7c6a5a");
  return s;
}

/** Auto que cruza la calle (se anima con CSS). */
export function car(day: boolean) {
  const s = new Sprite(11, 6);
  const body = day ? "#c9ccd2" : "#454a58";
  s.rect(0, 3, 11, 2, body);
  s.rect(2, 1, 7, 2, body);
  s.rect(3, 2, 2, 1, day ? "#87b4cf" : "#1b2a46");
  s.rect(6, 2, 2, 1, day ? "#87b4cf" : "#1b2a46");
  s.rect(1, 5, 2, 1, "#1b1c20");
  s.rect(8, 5, 2, 1, "#1b1c20");
  s.set(10, 3, day ? "#f3e2a8" : "#fff3c4");
  s.set(0, 3, "#c4554f");
  return s;
}

/** Marco, cruceta, cortinas y alféizar (el vidrio queda transparente). */
export function windowFrame() {
  const s = new Sprite(30, 36);
  s.rect(1, 0, 28, 33, "#efece4");
  s.rect(1, 0, 28, 1, "#fbfaf6");
  s.rect(1, 0, 1, 33, "#fbfaf6");
  s.rect(28, 0, 1, 33, "#cfcabd");
  s.rect(1, 32, 28, 1, "#cfcabd");
  s.rect(GLASS.x, GLASS.y, GLASS.w, GLASS.h, null);
  s.rect(14, 2, 2, 28, "#efece4");
  s.rect(3, 15, 24, 2, "#efece4");
  s.rect(14, 2, 1, 28, "#fbfaf6");
  s.rect(3, 15, 24, 1, "#fbfaf6");
  // cortinas
  for (let x = 3; x < 8; x++) s.rect(x, 2, 1, 28, x % 2 ? "#a9b4aa" : "#bcc6bd");
  for (let x = 22; x < 27; x++) s.rect(x, 2, 1, 28, x % 2 ? "#bcc6bd" : "#a9b4aa");
  s.rect(3, 18, 5, 1, "#7f8b82");
  s.rect(22, 18, 5, 1, "#7f8b82");
  s.rect(3, 2, 24, 1, "#8c978e");
  // alféizar
  s.rect(0, 33, 30, 3, "#e2ded3");
  s.rect(0, 33, 30, 1, "#fbfaf6");
  s.rect(0, 35, 30, 1, "#b9b3a5");
  return s;
}

export function cactus() {
  const s = new Sprite(8, 9);
  s.rect(1, 6, 6, 3, "#b8735a");
  s.rect(1, 6, 6, 1, "#d08b72");
  s.rect(3, 1, 2, 5, "#5f917a");
  s.rect(1, 3, 2, 1, "#5f917a");
  s.rect(1, 2, 1, 2, "#5f917a");
  s.rect(5, 4, 2, 1, "#5f917a");
  s.rect(6, 3, 1, 2, "#5f917a");
  s.set(3, 1, "#86b79e");
  s.set(3, 3, "#86b79e");
  return s;
}

// --------------------------------------------------------------------- cama

export function bedBase() {
  const s = new Sprite(46, 26);
  // cabecero y pie
  s.rect(1, 0, 2, 2, C.wood);
  s.rect(0, 2, 4, 24, C.wood);
  s.rect(1, 2, 1, 24, C.woodH);
  s.rect(3, 2, 1, 24, C.woodL);
  s.rect(1, 0, 1, 1, C.woodH);
  s.rect(42, 12, 4, 14, C.wood);
  s.rect(43, 12, 1, 14, C.woodH);
  s.rect(45, 12, 1, 14, C.woodL);
  // colchón y bastidor
  s.rect(4, 17, 38, 5, "#e6e3da");
  s.rect(4, 17, 38, 1, "#f6f4ee");
  s.rect(4, 21, 38, 1, "#cfcbc0");
  s.rect(4, 22, 38, 3, C.wood);
  s.rect(4, 22, 38, 1, C.woodH);
  s.rect(4, 24, 38, 1, C.woodL);
  s.rect(5, 25, 2, 1, C.woodD);
  s.rect(39, 25, 2, 1, C.woodD);
  // almohada
  s.rect(5, 12, 11, 5, "#f6f4ee");
  s.rect(6, 11, 9, 1, "#f6f4ee");
  s.rect(5, 15, 11, 2, "#d9d6cc");
  s.rect(15, 12, 1, 5, "#d9d6cc");
  s.set(10, 13, "#e5e2d8");
  return s.outline(C.line);
}

/** Manta: se dibuja ENCIMA del personaje para que quede tapado. */
export function bedBlanket() {
  const s = new Sprite(46, 26);
  s.rect(17, 12, 25, 11, C.blanket);
  s.rect(17, 12, 25, 3, "#ece9e1");
  s.rect(17, 14, 25, 1, "#cfcbc0");
  s.rect(17, 15, 25, 1, C.blanketH);
  for (let x = 19; x < 41; x += 5) s.rect(x, 17, 2, 5, C.blanketH);
  for (let x = 21; x < 41; x += 5) s.rect(x, 17, 1, 5, C.blanketL);
  s.rect(17, 21, 25, 2, C.blanketL);
  s.rect(17, 12, 1, 11, C.blanketL);
  s.rect(41, 12, 1, 11, C.blanketL);
  // pliegue sobre las piernas
  s.line(24, 16, 30, 19, C.blanketL);
  s.line(33, 16, 37, 19, C.blanketL);
  return s.outline(C.line);
}

// ------------------------------------------------------------- escritorio

export function desk(gamer: boolean) {
  const s = new Sprite(34, 20);
  const top = gamer ? "#2f323a" : C.wood;
  const topH = gamer ? "#454952" : C.woodH;
  const topL = gamer ? "#1d1f24" : C.woodL;
  s.rect(0, 0, 34, 3, top);
  s.rect(0, 0, 34, 1, topH);
  s.rect(0, 3, 34, 1, topL);
  // pata izquierda
  s.rect(1, 4, 2, 16, gamer ? "#272a31" : C.woodL);
  s.rect(1, 4, 1, 16, gamer ? "#3a3e47" : C.wood);
  // cajonera derecha
  s.rect(19, 4, 14, 16, gamer ? "#272a31" : C.wood);
  s.rect(19, 4, 14, 1, topL);
  s.rect(19, 4, 1, 16, gamer ? "#3a3e47" : C.woodH);
  s.rect(32, 4, 1, 16, topL);
  for (const y of [5, 10, 15]) {
    s.rect(21, y, 10, 4, gamer ? "#30333b" : "#97704f");
    s.rect(21, y, 10, 1, gamer ? "#454952" : C.woodH);
    s.rect(25, y + 1, 2, 1, C.metalH);
  }
  if (gamer) {
    s.rect(0, 3, 34, 1, C.sage);
    s.rect(19, 4, 1, 16, C.sage);
    s.rect(32, 4, 1, 16, C.sage);
  }
  return s.outline(C.line);
}

export function monitor() {
  const s = new Sprite(20, 15);
  s.rect(0, 0, 20, 12, "#16171a");
  s.rect(1, 1, 18, 10, "#1d2430");
  const rows: [number, number, string][] = [
    [2, 8, C.sage],
    [4, 11, "#8b909a"],
    [6, 6, C.sand],
    [8, 10, "#8b909a"],
  ];
  for (const [y, w, c] of rows) s.rect(3, y + 1, w, 1, c);
  s.rect(9, 12, 2, 2, C.metalL);
  s.rect(6, 14, 8, 1, C.metal);
  s.rect(0, 11, 20, 1, C.sage);
  return s.outline(C.line);
}

export function chair() {
  const s = new Sprite(14, 24);
  s.rect(0, 2, 3, 12, "#3a3d45");
  s.rect(0, 2, 1, 12, "#4d515b");
  s.rect(1, 1, 2, 1, "#3a3d45");
  s.rect(0, 13, 13, 3, "#4a4e58");
  s.rect(0, 13, 13, 1, "#60656f");
  s.rect(6, 16, 2, 5, C.metal);
  s.rect(2, 21, 10, 1, C.metalL);
  s.rect(2, 22, 2, 2, "#2a2c32");
  s.rect(10, 22, 2, 2, "#2a2c32");
  s.rect(6, 22, 2, 2, "#2a2c32");
  return s.outline(C.line);
}

export function laptopSide() {
  const s = new Sprite(14, 11);
  s.rect(0, 9, 13, 2, C.metalH);
  s.rect(0, 10, 13, 1, C.metalL);
  s.limb(10, 9, 12.5, 1, 2, "#b9bcc2");
  s.line(9, 8, 11, 1, "#e6f1f6");
  s.set(12, 5, "#e3e5e8");
  return s.outline(C.line);
}

export function deskTrinkets() {
  const s = new Sprite(18, 8);
  // teléfono
  s.rect(0, 6, 4, 1, "#25272d");
  s.rect(1, 6, 2, 1, "#cfe6f2");
  // cuaderno
  s.rect(6, 4, 7, 3, "#3c4656");
  s.rect(6, 6, 7, 1, "#f1efe9");
  s.rect(11, 4, 1, 3, "#1c1f26");
  // billetera
  s.rect(9, 2, 5, 2, "#6b4a35");
  s.rect(9, 2, 5, 1, "#8f6a4f");
  return s.outline(C.line);
}

export function deskLamp() {
  const s = new Sprite(9, 16);
  s.rect(1, 14, 6, 2, C.dark);
  s.limb(4, 14, 3, 6, 1, C.metal);
  s.limb(3, 6, 7, 3, 1, C.metal);
  s.rect(5, 3, 4, 3, C.dark);
  s.rect(6, 6, 2, 1, C.warm);
  return s.outline(C.line);
}

// ------------------------------------------------------------------- pared

/** Tablero con el heatmap real (niveles 0..4, null = día futuro). */
export function board(levels: (number | null)[][]) {
  const s = new Sprite(32, 31);
  s.rect(0, 0, 32, 31, C.woodL);
  s.rect(1, 1, 30, 29, C.wood);
  s.rect(2, 2, 28, 27, "#ece8de");
  s.rect(2, 2, 28, 1, "#cfcabd");
  s.rect(2, 28, 28, 1, "#cfcabd");
  // título
  s.rect(4, 4, 8, 1, "#8b909a");
  s.rect(14, 4, 4, 1, "#c6c9cf");
  const palette = ["#d9d5c9", "#bcd8c9", "#8fbfa5", "#5fa585", "#3f8a6b"];
  levels.forEach((week, w) =>
    week.forEach((lvl, d) => {
      if (lvl === null) return;
      s.rect(4 + w * 3, 7 + d * 3, 2, 2, palette[lvl]);
    }),
  );
  // chinches
  s.set(2, 1, "#c4554f");
  s.set(29, 1, "#c4554f");
  return s.outline(C.line);
}

export function shelf() {
  const s = new Sprite(28, 12);
  s.rect(0, 9, 28, 3, C.wood);
  s.rect(0, 9, 28, 1, C.woodH);
  s.rect(0, 11, 28, 1, C.woodL);
  const books: [number, number, string][] = [
    [2, 8, "#7d8fa3"],
    [5, 7, "#c9a66b"],
    [8, 9, "#6f8f7d"],
    [11, 6, "#a3685e"],
  ];
  for (const [x, h, c] of books) {
    s.rect(x, 9 - h, 3, h, c);
    s.rect(x, 9 - h, 1, h, mix(c, "#ffffff", 0.25));
  }
  s.limb(14, 8, 17, 4, 1, C.sageD); // libro inclinado
  s.rect(16, 5, 3, 4, "#8a97a8");
  // maceta
  s.rect(21, 5, 5, 4, "#b8735a");
  s.rect(21, 5, 5, 1, "#d08b72");
  s.ellipse(23.5, 2.5, 3, 2.4, "#5f917a");
  s.set(22, 1, "#86b79e");
  s.set(25, 2, "#86b79e");
  return s.outline(C.line);
}

export function clock(h: number, m: number) {
  const s = new Sprite(12, 12);
  s.ellipse(6, 6, 5.6, 5.6, C.line);
  s.ellipse(6, 6, 4.8, 4.8, "#f3f1ea");
  for (const [x, y] of [
    [6, 2],
    [10, 6],
    [6, 10],
    [2, 6],
  ] as const)
    s.set(x, y, "#8b909a");
  const ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
  const ha = (((h % 12) + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  s.line(6, 6, 6 + Math.cos(ha) * 2.4, 6 + Math.sin(ha) * 2.4, C.line);
  s.line(6, 6, 6 + Math.cos(ma) * 3.8, 6 + Math.sin(ma) * 3.8, "#5d6270");
  s.set(6, 6, C.sageD);
  return s;
}

export function rug() {
  const s = new Sprite(44, 7);
  s.ellipse(22, 3.5, 22, 3.5, "#6f7e7a");
  s.ellipse(22, 3.5, 20, 2.8, "#8d9d98");
  s.ellipse(22, 3.5, 14, 1.8, "#a3b2ad");
  for (let x = 6; x < 38; x += 4) s.set(x, 3, "#8d9d98");
  return s;
}
