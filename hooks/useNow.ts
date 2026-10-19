"use client";

import { useSyncExternalStore } from "react";

let snap = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const subs = new Set<() => void>();

function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) {
    snap = Date.now();
    timer = setInterval(() => {
      snap = Date.now();
      subs.forEach((f) => f());
    }, 1000);
  }
  return () => {
    subs.delete(cb);
    if (!subs.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * Timestamp actual redondeado a `stepMs`. El componente solo se re-renderiza
 * cuando cambia el "bucket", así que un reloj de minutos no repinta cada segundo.
 * En el servidor devuelve 0.
 */
export function useNow(stepMs = 1000) {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!snap) snap = Date.now();
      return Math.floor(snap / stepMs) * stepMs;
    },
    () => 0,
  );
}
