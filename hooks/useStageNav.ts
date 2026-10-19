"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cam } from "@/components/Stage";
import { DESK_ITEMS, type DeskItem } from "@/lib/art/desk";
import type { SpriteState } from "@/lib/types";

export type Scene = "room" | "desk";
export type Section = "habits" | "activity" | "goals" | "stats" | "todo" | "wallet";

export interface Nav {
  scene: Scene;
  section: Section | null;
  cam: Cam;
  animate: boolean;
}

export const FULL: Cam = { s: 1, cx: 56, cy: 50 };
/** Cámara que sigue al personaje según lo que esté haciendo. */
export function camForSprite(state: SpriteState): Cam {
  switch (state) {
    case "praying":
      return { s: 2.4, cx: 58, cy: 74 };
    case "writing_board":
      return { s: 2.1, cx: 56, cy: 66 };
    case "working_macbook":
      return { s: 2.1, cx: 78, cy: 74 };
    default:
      return ROOM_ZOOM.bed;
  }
}

export const ROOM_ZOOM = {
  desk: { s: 2.3, cx: 88, cy: 79 },
  board: { s: 2.7, cx: 62, cy: 45 },
  bed: { s: 2.2, cx: 26, cy: 80 },
} satisfies Record<string, Cam>;

const ITEM_SCALE: Record<DeskItem, number> = { macbook: 2.3, phone: 3.2, notebook: 3, wallet: 3.4 };
const ITEM_SECTION: Record<DeskItem, Section> = { macbook: "goals", phone: "stats", notebook: "todo", wallet: "wallet" };

const itemCam = (k: DeskItem): Cam => {
  const r = DESK_ITEMS[k];
  return { s: ITEM_SCALE[k], cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
};

/**
 * Máquina de navegación del escenario: habitación ⇄ escritorio ⇄ objeto.
 * Los cambios de escena hacen primero un zoom y luego cambian de vista.
 */
export function useStageNav() {
  const [nav, setNav] = useState<Nav>({ scene: "room", section: null, cam: FULL, animate: false });
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const enterDesk = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setNav((n) => ({ ...n, cam: ROOM_ZOOM.desk, animate: true }));
    later(() => {
      setNav({ scene: "desk", section: null, cam: FULL, animate: false });
      busy.current = false;
    }, 580);
  }, [later]);

  const leaveDesk = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setNav({ scene: "room", section: null, cam: ROOM_ZOOM.desk, animate: false });
    later(() => setNav((n) => ({ ...n, cam: FULL, animate: true })), 60);
    later(() => {
      busy.current = false;
    }, 640);
  }, [later]);

  const open = useCallback((section: Section, cam: Cam) => setNav((n) => ({ ...n, section, cam, animate: true })), []);
  const closeSection = useCallback(() => setNav((n) => ({ ...n, section: null, cam: FULL, animate: true })), []);
  const openItem = useCallback((k: DeskItem) => open(ITEM_SECTION[k], itemCam(k)), [open]);
  const setCam = useCallback((cam: Cam) => setNav((n) => ({ ...n, cam, animate: true })), []);

  return { nav, enterDesk, leaveDesk, open, closeSection, openItem, setCam };
}
