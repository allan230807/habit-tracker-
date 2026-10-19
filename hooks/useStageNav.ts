"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cam } from "@/components/Stage";
import { DESK_ITEMS, type DeskItem } from "@/lib/art/desk";

export type Scene = "room" | "desk";
export type Section = "habits" | "goals" | "stats" | "todo" | "wallet";

export interface Nav {
  scene: Scene;
  section: Section | null;
  cam: Cam;
  animate: boolean;
}

export const FULL: Cam = { s: 1, cx: 64, cy: 60 };
export const ROOM_ZOOM = {
  desk: { s: 2.4, cx: 106, cy: 95 },
  board: { s: 2.8, cx: 100, cy: 53 },
} satisfies Record<string, Cam>;

const ITEM_SCALE: Record<DeskItem, number> = { macbook: 2.2, phone: 3.2, notebook: 3, wallet: 3.4 };
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
