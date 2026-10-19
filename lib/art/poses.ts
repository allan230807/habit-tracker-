import type { Pose } from "./skeleton";

/* Biblioteca de poses (ángulos en grados, ver skeleton.ts). */

const pose = (p: Partial<Pose>): Pose => ({
  hipX: 0,
  hipY: null,
  torso: 2,
  head: 0,
  armF: [6, 14],
  armB: [-5, 2],
  legF: [2, 2, 0],
  legB: [-2, -2, 0],
  eyes: 0,
  ...p,
});

export const POSES = {
  stand: pose({}),
  /** De pie con las manos en la cadera / pensando. */
  think: pose({ torso: 0, head: -4, armF: [38, -30], armB: [-30, 40] }),
  /** Brazos arriba estirándose. */
  stretch: pose({ torso: -4, head: -14, armF: [165, 172], armB: [158, 168], legF: [4, 4, 0], legB: [-4, -4, 0] }),
  stretchSide: pose({ torso: -12, head: -8, armF: [168, 176], armB: [152, 160], legF: [6, 6, 0], legB: [-6, -6, 0] }),
  /** Estirando el brazo hacia un estante alto. */
  reach: pose({ torso: 7, head: -16, armF: [142, 158], armB: [-4, 6], legF: [4, 2, 6], legB: [-6, -8, -10] }),
  /** Sosteniendo un libro cerrado al costado. */
  carry: pose({ torso: 3, head: 4, armF: [22, 70], armB: [-6, 2] }),
  /** De pie leyendo el lomo / hojeando. */
  browse: pose({ torso: 5, head: 14, armF: [48, 112], armB: [40, 104] }),
  /** Escribiendo en una pizarra. */
  write: pose({ torso: 6, head: -4, armF: [128, 158], armB: [-6, 4], legF: [6, 4, 6], legB: [-4, -6, -4] }),
  /** Sentado en una silla escribiendo en la laptop. */
  sitChair: pose({
    hipX: -1,
    torso: 6,
    head: 6,
    armF: [36, 100],
    armB: [32, 96],
    legF: [92, 4, 6],
    legB: [88, 6, 6],
  }),
  /** Sentado en el borde de la cama con los pies en el piso. */
  sitEdge: pose({
    hipY: 20.5,
    torso: 10,
    head: 8,
    armF: [18, 60],
    armB: [10, 40],
    legF: [78, -6, 8],
    legB: [70, -12, 8],
  }),
  /** En la cama recostado contra el cabecero (libro). */
  proppedBook: pose({
    hipY: 21.5,
    torso: -9,
    head: 14,
    armF: [44, 108],
    armB: [38, 100],
    legF: [84, 86, 62],
    legB: [80, 84, 66],
  }),
  /** En la cama recostado contra el cabecero (celular). */
  proppedPhone: pose({
    hipY: 21.5,
    torso: -10,
    head: 16,
    armF: [40, 116],
    armB: [30, 90],
    legF: [84, 86, 62],
    legB: [80, 84, 66],
  }),
  /** Acostado de espaldas durmiendo. */
  lying: pose({
    hipY: 21.5,
    torso: -90,
    head: 2,
    armF: [74, 100],
    armB: [66, 96],
    legF: [135, 20, 6],
    legB: [140, 24, 6],
    eyes: 1,
  }),
  /** Medio recostado, deslizándose para acostarse. */
  slide: pose({
    hipY: 21.5,
    torso: -50,
    head: 8,
    armF: [60, 80],
    armB: [50, 70],
    legF: [120, 40, 24],
    legB: [118, 44, 24],
  }),
  /** Apoyando las manos atrás para subir a la cama. */
  scootA: pose({
    hipY: 20.5,
    torso: -24,
    head: 6,
    armF: [-26, -22],
    armB: [-34, -28],
    legF: [96, 34, 20],
    legB: [92, 40, 20],
  }),
  scootB: pose({
    hipY: 21.5,
    torso: -14,
    head: 8,
    armF: [-18, -8],
    armB: [-24, -12],
    legF: [88, 68, 40],
    legB: [86, 72, 44],
  }),
  /** Medio agachado (para sentarse o levantarse). */
  squat: pose({
    torso: 20,
    head: 6,
    armF: [34, 74],
    armB: [26, 62],
    legF: [62, -34, 4],
    legB: [56, -38, 4],
  }),
  /** Sentado en el piso con las rodillas arriba (leyendo). */
  sitFloor: pose({
    torso: -4,
    head: 16,
    armF: [56, 120],
    armB: [48, 112],
    legF: [112, -14, 4],
    legB: [108, -18, 4],
  }),
  /** De rodillas orando. */
  kneel: pose({
    torso: 5,
    head: 28,
    armF: [30, 122],
    armB: [26, 118],
    legF: [6, -88, -50],
    legB: [-2, -92, -50],
    eyes: 1,
  }),
  /** Agachado (transición para sentarse en el piso / arrodillarse). */
  crouch: pose({
    torso: 18,
    head: 6,
    armF: [30, 70],
    armB: [22, 60],
    legF: [66, -50, 4],
    legB: [60, -54, 4],
  }),
} satisfies Record<string, Pose>;

const mix = (v: number) => Math.max(0, v);

/** Ciclo de caminata: fase 0..1. */
export function walkPose(phase: number): Pose {
  const th = phase * Math.PI * 2;
  const s = Math.sin(th);
  const c = Math.cos(th);
  const cB = Math.cos(th + Math.PI);
  const thighF = 27 * s;
  const thighB = -27 * s;
  return pose({
    torso: 4 + 0.8 * Math.sin(2 * th),
    head: -1,
    armF: [-26 * s + 4, -26 * s + 28],
    armB: [26 * s - 4, 26 * s + 26],
    legF: [thighF, thighF - (6 + 44 * mix(c)), 14 * c - 8],
    legB: [thighB, thighB - (6 + 44 * mix(cB)), 14 * cB - 8],
  });
}
