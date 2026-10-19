import { POSES } from "./poses";
import { joints, resolve } from "./skeleton";

/** Medidas y posiciones de la habitación (px lógicos, origen abajo-izquierda). */
export const SCENE = { w: 128, h: 120 };
export const FLOOR_H = 20;

/** Línea del piso por donde camina el personaje (más cerca de la cámara)… */
export const LANE = 3;
/** …y línea donde apoyan los muebles (contra la pared). */
export const DEPTH = 6;

// Alturas derivadas de las poses para que muebles y cuerpo coincidan.
const sit = resolve(POSES.sitChair);
const sitJ = joints(sit);
export const SEAT_H = Math.round(sit.hipY - 3);
export const DESK_H = Math.round(sitJ.wristF[1] - 1.5);
const floorSit = resolve(POSES.sitFloor);
export const CUSHION_H = Math.max(4, Math.round(floorSit.hipY - 5));

export const BED = { x: 22, y: DEPTH, w: 56, h: 34, mattress: 18 };
export const CHAIR = { x: 82, y: DEPTH, w: 14, h: SEAT_H + 12 };
export const DESK = { x: 98, y: DEPTH, w: 30, h: DESK_H };
export const BOARD = { x: 84, y: 52, w: 32, h: 31 };
export const WINDOW = { x: 24, y: 66, w: 40, h: 50 };
export const CUSHION = { x: 18, y: LANE, w: 20, h: CUSHION_H };
export const BOOKS = { x: 5, y: LANE, w: 10, h: 10 };
export const RUG = { x: 40, y: 0, w: 56, h: 9 };

/** Puntos de referencia de la actividad del personaje (x del ancla = cadera). */
export const SPOTS = {
  stack: 20, // de pie junto a la pila de libros, mirando a la izquierda
  cushion: 28, // sentado en el cojín
  bedFoot: 84, // junto a los pies de la cama
  bedSit: 72, // sentado en el borde
  bedHead: 56, // acostado
  chair: 89, // sentado en el escritorio
  board: 84, // frente al tablero
  rug: 66, // alfombra (orar / estirarse)
} as const;
