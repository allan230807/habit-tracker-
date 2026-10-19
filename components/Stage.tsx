"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SCENE } from "@/lib/art/room";

/** Cámara: escala y punto central (px lógicos, y hacia abajo). */
export interface Cam {
  s: number;
  cx: number;
  cy: number;
}

interface Props {
  cam: Cam;
  animate: boolean;
  /** Fondo CSS de los márgenes laterales (continúa la pared y el piso). */
  backdrop?: string;
  render: (u: number) => ReactNode;
}

interface View {
  cam: Cam;
  /** Transición CSS activa (solo en modo transformación). */
  transition: boolean;
  /** true = escena redibujada a la escala final (arte nítido, sin transform). */
  settled: boolean;
  pending: { cam: Cam; animate: boolean } | null;
}

const ZOOM_MS = 560;

/**
 * Paso mínimo del "píxel" lógico en px CSS. Las medidas deben ser exactas para el
 * motor de layout (múltiplos de 1/64) y caer en píxeles físicos enteros; con
 * pantallas 3x solo los px CSS enteros cumplen ambas cosas.
 */
const unitStep = () => {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return dpr === 1 || dpr === 2 || dpr === 4 ? 1 / dpr : 1;
};

/**
 * Contenedor del escenario. El "píxel" lógico mide un número entero de píxeles
 * físicos. La cámara se anima con una transformación CSS y, al terminar, la
 * escena se vuelve a dibujar a la escala final para evitar costuras entre celdas.
 */
export default function Stage({ cam, animate, backdrop, render }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [u, setU] = useState(3);
  const [lastProp, setLastProp] = useState(cam);
  const [view, setView] = useState<View>({ cam, transition: false, settled: true, pending: null });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setU(Math.max(unitStep(), Math.floor(entry.contentRect.width / (SCENE.w * unitStep())) * unitStep()));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cambio de cámara (ajuste de estado durante el render).
  if (cam !== lastProp) {
    setLastProp(cam);
    if (animate) setView((v) => ({ ...v, transition: false, settled: false, pending: { cam, animate } }));
    else setView({ cam, transition: false, settled: true, pending: null });
  }

  useEffect(() => {
    const p = view.pending;
    if (!p) return;
    let t: number | undefined;
    const raf = window.requestAnimationFrame(() => {
      setView({ cam: p.cam, transition: true, settled: false, pending: null });
      t = window.setTimeout(() => setView((v) => ({ ...v, transition: false, settled: true })), ZOOM_MS + 40);
    });
    return () => {
      window.cancelAnimationFrame(raf);
      if (t) window.clearTimeout(t);
    };
  }, [view.pending]);

  const step = unitStep();
  const W = SCENE.w * u;
  const H = SCENE.h * u;
  const c = view.cam;
  const cell = Math.max(u, Math.round((u * c.s) / step) * step);
  const snap = (v: number) => Math.round(v / step) * step;

  let inner: ReactNode;
  let style: React.CSSProperties;
  if (view.settled && c.s !== 1) {
    // Escena redibujada a la escala final.
    const u2 = cell;
    const W2 = SCENE.w * u2;
    const H2 = SCENE.h * u2;
    style = {
      width: W2,
      height: H2,
      transform: `translate(${snap(Math.min(0, Math.max(W - W2, W / 2 - c.cx * u2)))}px, ${snap(
        Math.min(0, Math.max(H - H2, H / 2 - c.cy * u2)),
      )}px)`,
    };
    inner = render(u2);
  } else {
    const s = cell / u;
    style = {
      width: W,
      height: H,
      transformOrigin: "0 0",
      transform: `translate(${snap(Math.min(0, Math.max(W * (1 - s), W / 2 - c.cx * u * s)))}px, ${snap(
        Math.min(0, Math.max(H * (1 - s), H / 2 - c.cy * u * s)),
      )}px) scale(${s})`,
      transition: view.transition ? `transform ${ZOOM_MS}ms cubic-bezier(.4,0,.2,1)` : "none",
      willChange: "transform",
    };
    inner = render(u);
  }

  return (
    <div ref={ref} className="w-full" style={{ background: backdrop }}>
      <div className="relative mx-auto overflow-hidden" style={{ width: W, height: H }}>
        <div style={style}>{inner}</div>
      </div>
    </div>
  );
}
