import { Sprite, mix } from "../pixel";
import { C } from "./palette";

/* Vista de cerca del escritorio (cámara sobre la mesa). */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Posición (px lógicos, y hacia abajo) de cada objeto en la vista del escritorio. */
export const DESK_ITEMS = {
  macbook: { x: 3, y: 38, w: 44, h: 40 },
  phone: { x: 52, y: 46, w: 14, h: 28 },
  notebook: { x: 70, y: 44, w: 22, h: 31 },
  wallet: { x: 89, y: 56, w: 20, h: 16 },
} as const;

export type DeskItem = keyof typeof DESK_ITEMS;

export function macbook() {
  const s = new Sprite(44, 40);
  // tapa
  s.rect(1, 0, 42, 28, C.metalH);
  s.rect(2, 1, 40, 26, "#14151a");
  s.rect(3, 2, 38, 24, "#1d2430");
  s.rect(21, 1, 2, 1, "#2a2c32");
  // fondo de pantalla: degradado suave
  for (let y = 0; y < 24; y++) s.rect(3, 2 + y, 38, 1, mix("#222b3a", "#171c27", y / 23));
  // ventana con barras de progreso (metas)
  s.rect(5, 4, 34, 1, "#2e3544");
  s.rect(6, 4, 1, 1, "#c4554f");
  s.rect(8, 4, 1, 1, "#d6b88a");
  s.rect(10, 4, 1, 1, C.sage);
  const bars: [number, string][] = [
    [26, C.sage],
    [14, C.sand],
    [20, "#7ea3c4"],
  ];
  bars.forEach(([w, c], i) => {
    const y = 8 + i * 5;
    s.rect(6, y, 8, 1, "#6c7280");
    s.rect(6, y + 2, 32, 2, "#2e3544");
    s.rect(6, y + 2, w, 2, c);
  });
  // brillo
  s.limb(34, 3, 24, 25, 1, "#252e3e");
  // bisagra y base
  s.rect(0, 28, 44, 1, C.metalL);
  s.rect(0, 29, 44, 9, "#c4c7cd");
  s.rect(0, 29, 44, 1, "#dfe1e5");
  s.rect(0, 37, 44, 2, "#8f939a");
  s.rect(3, 31, 38, 5, "#1f2126");
  for (let r = 0; r < 4; r++) for (let k = 0; k < 14; k++) s.rect(4 + k * 2.6, 31 + r * 1.3 + (r > 1 ? 0 : 0), 2, 1, "#41454f");
  s.rect(17, 36, 10, 1, "#a9acb3");
  s.rect(19, 28, 6, 1, "#a9acb3");
  return s.outline(C.line);
}

export function phone() {
  const s = new Sprite(14, 28);
  s.rect(0, 0, 14, 28, "#25272d");
  s.rect(1, 1, 12, 26, "#0f1218");
  s.rect(5, 2, 4, 1, "#25272d");
  // anillo de nivel
  s.ellipse(7, 9, 4, 4, "#2b3340");
  s.ellipse(7, 9, 3, 3, "#0f1218");
  for (const [x, y] of [
    [7, 5],
    [8, 5],
    [10, 6],
    [10, 7],
    [10, 9],
    [9, 12],
    [7, 12],
  ] as const)
    s.set(x, y, C.sage);
  s.rect(6, 8, 2, 2, "#e8e6e1");
  // barras
  const hs = [3, 6, 4, 8, 5];
  hs.forEach((h, i) => s.rect(2 + i * 2, 24 - h, 1, h, i === 3 ? C.sand : C.sage));
  s.rect(3, 16, 8, 1, "#2e3544");
  s.rect(3, 18, 5, 1, "#2e3544");
  s.rect(5, 26, 4, 1, "#3a3d45");
  s.rect(13, 7, 1, 3, "#3a3d45");
  return s.outline(C.line);
}

export function notebook() {
  const s = new Sprite(22, 31);
  s.rect(0, 0, 22, 31, "#3c4656");
  s.rect(0, 0, 3, 31, "#2a313d");
  s.rect(3, 0, 1, 31, "#4d596c");
  s.rect(19, 0, 3, 31, "#343d4b");
  s.rect(17, 0, 2, 31, "#1c1f26"); // elástico
  // etiqueta
  s.rect(6, 5, 9, 8, "#e8e3d6");
  s.rect(7, 7, 7, 1, "#8b909a");
  s.rect(7, 9, 5, 1, "#8b909a");
  s.rect(7, 11, 6, 1, C.sage);
  // marcapáginas y lápiz
  s.rect(10, 31, 2, 0, C.sand);
  s.limb(7, 27, 14, 19, 2, C.sand);
  s.limb(14, 19, 15, 18, 1, "#f1efe9");
  s.set(15, 17, "#2a2c32");
  s.rect(5, 16, 9, 1, "#46526a");
  return s.outline(C.line);
}

export function wallet() {
  const s = new Sprite(20, 16);
  s.rect(0, 2, 20, 14, "#6b4a35");
  s.rect(0, 2, 20, 1, "#8f6a4f");
  s.rect(0, 15, 20, 1, "#4e3524");
  // solapa
  s.rect(0, 2, 20, 6, "#7b563f");
  s.rect(0, 8, 20, 1, "#4e3524");
  for (let x = 2; x < 18; x += 2) s.set(x, 4, "#b08a68"); // costura
  s.rect(8, 7, 4, 3, C.metalH);
  s.rect(9, 8, 2, 1, C.metalL);
  // billete y moneda asomando
  s.rect(3, 0, 8, 3, "#9db8a0");
  s.rect(4, 1, 6, 1, "#7da182");
  s.ellipse(15.5, 1.5, 2, 1.8, "#d9b24a");
  s.set(15, 1, "#f1d98a");
  return s.outline(C.line);
}

export function mug() {
  const s = new Sprite(11, 10);
  s.rect(0, 2, 8, 8, "#e8e6e1");
  s.rect(0, 2, 8, 1, "#ffffff");
  s.rect(7, 2, 1, 8, "#c6c3ba");
  s.rect(1, 3, 6, 1, "#4a3426");
  s.rect(8, 4, 2, 1, "#e8e6e1");
  s.rect(9, 4, 1, 4, "#e8e6e1");
  s.rect(8, 7, 2, 1, "#e8e6e1");
  s.set(2, 0, "#c6c9cf");
  s.set(4, 1, "#c6c9cf");
  return s.outline(C.line);
}

export function smallPlant() {
  const s = new Sprite(12, 14);
  s.rect(2, 9, 8, 5, "#c9c5bb");
  s.rect(2, 9, 8, 1, "#e5e2d9");
  s.rect(2, 13, 8, 1, "#9b978d");
  s.ellipse(6, 5, 3, 3.5, "#5f917a");
  s.ellipse(3, 6, 2, 2.4, "#6aa58a");
  s.ellipse(9, 6, 2, 2.4, "#6aa58a");
  s.set(5, 3, "#86b79e");
  s.set(8, 5, "#86b79e");
  s.rect(6, 7, 1, 3, "#3f6a58");
  return s.outline(C.line);
}
