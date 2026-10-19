"use client";

import { useSyncExternalStore } from "react";
import * as logic from "@/lib/gameLogic";
import type { GameState, SpriteState, StatKey } from "@/lib/types";

/*
 * Store único respaldado por localStorage. En la primera carga (no hay JSON
 * guardado) crea el estado inicial con appStartDate = hoy y lo persiste de
 * inmediato, antes de que cualquier componente lo lea.
 */

let cache: GameState | null = null;
const listeners = new Set<() => void>();

function persist(s: GameState) {
  try {
    localStorage.setItem(logic.STORAGE_KEY, JSON.stringify(s));
  } catch {
    // modo privado / cuota llena: seguimos en memoria
  }
}

function load(): GameState {
  if (cache) return cache;
  let saved: unknown = null;
  try {
    const raw = localStorage.getItem(logic.STORAGE_KEY) ?? localStorage.getItem(logic.LEGACY_STORAGE_KEY);
    saved = raw ? JSON.parse(raw) : null;
  } catch {
    saved = null;
  }
  cache = logic.hydrate(saved, new Date());
  persist(cache);
  return cache;
}

function commit(next: GameState) {
  if (next === cache) return;
  cache = next;
  persist(next);
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== logic.STORAGE_KEY) return;
  cache = null;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

const today = () => logic.dateKey(new Date());
const update = (fn: (s: GameState) => GameState) => commit(fn(load()));

const actions = {
  toggleHabit: (id: string) => update((s) => logic.toggleHabit(s, id, today())),
  addHabit: (name: string, stat: StatKey) => update((s) => logic.addHabit(s, name, stat)),
  removeHabit: (id: string) => update((s) => logic.removeHabit(s, id)),
  addGoal: (name: string, targetHours: number) => update((s) => logic.addGoal(s, name, targetHours)),
  removeGoal: (id: string) => update((s) => logic.removeGoal(s, id)),
  setSprite: (st: SpriteState) => update((s) => logic.setSprite(s, st)),
  startStopwatch: (goalId: string) => update((s) => logic.startStopwatch(s, goalId, Date.now())),
  stopStopwatch: () => update((s) => logic.stopStopwatch(s, Date.now())),
  cancelStopwatch: () => update(logic.cancelStopwatch),
  addTomorrowTask: (text: string) => update((s) => logic.addTomorrowTask(s, text, today())),
  completeTask: (id: string) => update((s) => logic.completeTask(s, id, today())),
  removeTask: (id: string) => update((s) => logic.removeTask(s, id)),
  addTransaction: (amount: number, label: string) =>
    update((s) => logic.addTransaction(s, amount, label, today())),
  buyItem: (id: string) => update((s) => logic.buyItem(s, id, today())),
};

export type GameActions = typeof actions;

/** `state` es null en el servidor y durante la hidratación. */
export function useGameEngine() {
  const state = useSyncExternalStore(subscribe, load, () => null);
  return { state, actions };
}
