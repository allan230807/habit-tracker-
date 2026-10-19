import { Sprite, mix } from "../pixel";
import { C } from "./palette";

/* Vista de cerca del escritorio (cámara sobre la mesa). Escena de 128x120. */

export const DESK_ITEMS = {
  macbook: { x: 2, y: 48, w: 52, h: 46 },
  phone: { x: 58, y: 60, w: 18, h: 34 },
  notebook: { x: 80, y: 58, w: 24, h: 36 },
  wallet: { x: 108, y: 74, w: 18, h: 20 },
} as const;

export type DeskItem = keyof typeof DESK_ITEMS;

export function macbook() {
  const { w, h } = DESK_ITEMS.macbook;
  const s = new Sprite(w, h);
  const lidH = 33;
  // tapa de aluminio y marco negro
  s.rect(1, 0, w - 2, lidH, "#c9ccd2");
  s.rect(1, 0, w - 2, 1, "#e4e6ea");
  s.rect(2, 1, w - 4, lidH - 2, "#101218");
  s.rect(3, 2, w - 6, lidH - 4, "#1c2330");
  s.rect(w / 2 - 2, 1, 4, 1, "#24262c"); // cámara
  // fondo de pantalla suave
  for (let y = 0; y < lidH - 4; y++) s.rect(3, 2 + y, w - 6, 1, mix("#243044", "#131824", y / (lidH - 5)));
  // ventana de la app: barras de progreso de las metas
  s.rect(5, 4, w - 10, lidH - 9, "#161b26");
  s.rect(5, 4, w - 10, 3, "#202737");
  s.set(7, 5, "#c4554f");
  s.set(9, 5, "#d6b88a");
  s.set(11, 5, "#86b79e");
  const bars: [number, string][] = [[30, C.sage], [17, C.sand], [24, "#7ea3c4"]];
  bars.forEach(([bw, c], i) => {
    const y = 10 + i * 6;
    s.rect(7, y, 11, 1, "#6c7280");
    s.rect(7, y + 2, w - 14, 2, "#2c3446");
    s.rect(7, y + 2, bw, 2, c);
  });
  // brillo diagonal del vidrio
  s.limb(w - 12, 3, 22, lidH - 3, 1, "#212b3b");
  // bisagra y base
  s.rect(0, lidH, w, 1, "#8f939a");
  s.rect(0, lidH + 1, w, h - lidH - 3, "#cfd2d8");
  s.rect(0, lidH + 1, w, 1, "#eceef1");
  s.rect(0, h - 3, w, 2, "#9a9ea6");
  s.rect(0, h - 2, w, 1, "#7c8088");
  s.rect(w / 2 - 6, lidH, 12, 1, "#b2b6bd");
  // teclado con teclas
  s.rect(4, lidH + 3, w - 8, 6, "#1b1d23");
  for (let r = 0; r < 3; r++) for (let k = 0; k < 15; k++) s.rect(5 + k * 3, lidH + 4 + r * 2, 2, 1, "#43474f");
  s.rect(w / 2 - 6, h - 6, 12, 2, "#b5b9c0"); // trackpad
  return s.outline(C.line);
}

export function phone() {
  const { w, h } = DESK_ITEMS.phone;
  const s = new Sprite(w, h);
  s.rect(0, 1, w, h - 1, "#25272d");
  s.rect(1, 0, w - 2, h, "#25272d");
  s.rect(1, 2, w - 2, h - 4, "#0e1118");
  s.rect(7, 3, 4, 1, "#25272d"); // isla
  // anillo de nivel y hora
  s.ellipse(9, 13, 5.2, 5.2, "#2a3341");
  s.ellipse(9, 13, 4, 4, "#0e1118");
  for (const [x, y] of [[9, 8], [10, 8], [12, 9], [13, 10], [13, 12], [13, 14], [12, 16], [10, 17], [8, 17]] as const) s.set(x, y, C.sage);
  s.rect(8, 12, 2, 2, "#e8e6e1");
  s.rect(4, 21, 10, 1, "#2e3544");
  s.rect(4, 23, 6, 1, "#2e3544");
  // gráfico de barras
  const hs = [4, 7, 5, 9, 6];
  hs.forEach((bh, i) => s.rect(3 + i * 3, 31 - bh, 2, bh, i === 3 ? C.sand : C.sage));
  s.rect(7, h - 3, 4, 1, "#3a3d45");
  s.set(w - 1, 8, "#3a3d45");
  return s.outline(C.line);
}

export function notebook() {
  const { w, h } = DESK_ITEMS.notebook;
  const s = new Sprite(w, h);
  s.rect(0, 0, w, h, "#3c4656");
  s.rect(0, 0, 4, h, "#2a313d");
  s.rect(4, 0, 1, h, "#566379");
  s.rect(w - 4, 0, 4, h, "#343d4b");
  s.rect(w - 6, 0, 2, h, "#1c1f26"); // elástico
  // etiqueta
  s.rect(8, 5, 10, 9, "#ebe6d9");
  s.rect(9, 7, 8, 1, "#8b909a");
  s.rect(9, 9, 6, 1, "#8b909a");
  s.rect(9, 11, 7, 1, C.sage);
  // lápiz
  s.limb(8, 30, 17, 20, 2, C.sand);
  s.limb(17, 20, 18, 19, 1, "#f1efe9");
  s.set(18, 18, "#2a2c32");
  s.rect(6, 17, 11, 1, "#46526a");
  s.rect(6, 25, 5, 1, "#46526a");
  return s.outline(C.line);
}

export function wallet() {
  const { w, h } = DESK_ITEMS.wallet;
  const s = new Sprite(w, h);
  s.rect(0, 3, w, h - 3, "#6b4a35");
  s.rect(0, 3, w, 1, "#8f6a4f");
  s.rect(0, h - 1, w, 1, "#4e3524");
  s.rect(0, 3, w, 7, "#7b563f");
  s.rect(0, 10, w, 1, "#4e3524");
  for (let x = 2; x < w - 2; x += 2) s.set(x, 6, "#b08a68");
  s.rect(w / 2 - 2, 8, 4, 4, C.metalH);
  s.rect(w / 2 - 1, 9, 2, 2, C.metalL);
  s.rect(3, 0, 8, 4, "#9db8a0");
  s.rect(4, 1, 6, 1, "#7da182");
  s.ellipse(14.5, 2, 2.2, 2, "#d9b24a");
  s.set(14, 1, "#f1d98a");
  return s.outline(C.line);
}

export function mug() {
  const s = new Sprite(13, 12);
  s.rect(0, 2, 10, 10, "#ebe9e4");
  s.rect(0, 2, 10, 1, "#ffffff");
  s.rect(8, 2, 2, 10, "#c9c6bd");
  s.rect(1, 3, 8, 2, "#4a3426");
  s.rect(10, 4, 2, 1, "#ebe9e4");
  s.rect(11, 4, 1, 5, "#ebe9e4");
  s.rect(10, 8, 2, 1, "#ebe9e4");
  s.set(3, 0, "#c6c9cf");
  s.set(5, 1, "#c6c9cf");
  s.set(4, 0, "#dfe1e5");
  return s.outline(C.line);
}

export function smallPlant() {
  const s = new Sprite(14, 17);
  s.rect(2, 11, 10, 6, "#cfcbc0");
  s.rect(2, 11, 10, 1, "#ebe8df");
  s.rect(2, 16, 10, 1, "#9c988d");
  s.ellipse(7, 6, 3.6, 4.4, "#4f8a6f");
  s.ellipse(3.5, 7, 2.4, 3.2, "#5f9d7e");
  s.ellipse(10.5, 7, 2.4, 3.2, "#5f9d7e");
  s.set(6, 3, "#8cc9a8");
  s.set(10, 5, "#8cc9a8");
  s.rect(7, 8, 1, 4, "#2f5a47");
  return s.outline(C.line);
}
