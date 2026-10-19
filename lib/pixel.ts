/*
 * Lienzo de pixel art procedural. Cada sprite es una grilla de colores que se
 * pinta como UN solo DIV con una lista de box-shadow (un cuadrado por píxel),
 * así se pueden dibujar escenas detalladas sin miles de nodos en el DOM.
 */

export type Rgb = [number, number, number];

const toRgb = (c: string): Rgb => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
];
const toHex = ([r, g, b]: Rgb) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

/** Mezcla dos colores #rrggbb (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number) {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

export class Sprite {
  readonly cells: (string | null)[];

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = new Array(w * h).fill(null);
  }

  get(x: number, y: number) {
    x = Math.round(x);
    y = Math.round(y);
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.cells[y * this.w + x];
  }

  set(x: number, y: number, c: string | null) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = c;
    return this;
  }

  rect(x: number, y: number, w: number, h: number, c: string | null) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, c: string | null) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
    return this;
  }

  /** Trazo con grosor `t` (pincel cuadrado). Sirve para brazos, piernas, palos. */
  limb(x0: number, y0: number, x1: number, y1: number, t: number, c: string | null) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2));
    const half = t / 2;
    for (let i = 0; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps;
      const y = y0 + ((y1 - y0) * i) / steps;
      this.rect(Math.round(x - half), Math.round(y - half), Math.max(1, Math.round(t)), Math.max(1, Math.round(t)), c);
    }
    return this;
  }

  line(x0: number, y0: number, x1: number, y1: number, c: string | null) {
    return this.limb(x0, y0, x1, y1, 1, c);
  }

  /** Degradado vertical entre dos colores. */
  vgradient(x: number, y: number, w: number, h: number, c0: string, c1: string) {
    for (let j = 0; j < h; j++) this.rect(x, y + j, w, 1, mix(c0, c1, h <= 1 ? 0 : j / (h - 1)));
    return this;
  }

  /** Pega otro sprite (los píxeles transparentes no pisan). */
  paste(o: Sprite, x: number, y: number) {
    for (let j = 0; j < o.h; j++)
      for (let i = 0; i < o.w; i++) {
        const c = o.cells[j * o.w + i];
        if (c) this.set(x + i, y + j, c);
      }
    return this;
  }

  /** Aclara/oscurece (mezcla con `c`) solo los píxeles ya pintados dentro de la elipse. */
  tint(cx: number, cy: number, r: number, c: string, strength: number) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const cur = this.get(x, y);
        if (!cur) continue;
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r;
        if (d <= 1) this.set(x, y, mix(cur, c, strength * (1 - d)));
      }
    return this;
  }

  mirror() {
    const o = new Sprite(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) o.cells[y * this.w + x] = this.cells[y * this.w + (this.w - 1 - x)];
    return o;
  }

  /** Contorno de 1 px alrededor de la silueta (los bordes del lienzo no se dibujan). */
  outline(c: string) {
    const add: [number, number][] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.cells[y * this.w + x]) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y]);
      }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }

  /**
   * CSS box-shadow para pintar el sprite con celdas de `u` px. `spread` agranda
   * cada celda unos décimas de píxel para que se solapen y no queden costuras.
   */
  shadow(u: number, spread = 0) {
    const out: string[] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const c = this.cells[y * this.w + x];
        if (c) out.push(`${+(x * u).toFixed(3)}px ${+(y * u).toFixed(3)}px 0 ${spread}px ${c}`);
      }
    return out.join(",");
  }
}
