"use client";

import { useSyncExternalStore } from "react";
import { Actor, type ActorFrame, type Inputs } from "./actor";

/*
 * Un solo actor para toda la app. La simulación corre mientras la app esté
 * abierta (también cuando estás en la vista del escritorio); solo se dibuja
 * si hay algún componente suscrito.
 */

let actor: Actor | null = null;
let frame: ActorFrame | null = null;
let raf = 0;
let lastTs = 0;
let acc = 0;
const subs = new Set<() => void>();
let wanted: Inputs = { night: false, working: false };
let started = false;

const STEP_MS = 1000 / 24;

function tick(ts: number) {
  raf = requestAnimationFrame(tick);
  const dt = lastTs ? ts - lastTs : 0;
  lastTs = ts;
  acc += dt;
  if (acc < STEP_MS || !actor) return;
  actor.update(acc);
  acc = 0;
  if (subs.size) {
    frame = actor.frame();
    subs.forEach((f) => f());
  }
}

/** Inicia el actor la primera vez (según la hora) y mantiene sus entradas al día. */
export function setActorInputs(inputs: Inputs) {
  wanted = inputs;
  if (!actor) {
    actor = new Actor(inputs.night && !inputs.working);
    // solo en desarrollo: permite forzar actividades desde las pruebas
    if (process.env.NODE_ENV !== "production") (window as unknown as { __actor?: Actor }).__actor = actor;
  }
  actor.setInputs(inputs);
  if (!started && typeof window !== "undefined") {
    started = true;
    raf = requestAnimationFrame(tick);
  }
}

export function stopActor() {
  cancelAnimationFrame(raf);
  started = false;
  lastTs = 0;
}

function subscribe(cb: () => void) {
  subs.add(cb);
  if (actor && !frame) frame = actor.frame();
  return () => {
    subs.delete(cb);
  };
}

export function useActorFrame(): ActorFrame | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!frame && actor) frame = actor.frame();
      return frame;
    },
    () => null,
  );
}

export const currentInputs = () => wanted;
