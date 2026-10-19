import { memo, type CSSProperties } from "react";
import type { Sprite } from "@/lib/pixel";

const cache = new WeakMap<Sprite, Map<number, string>>();

function shadowFor(sprite: Sprite, u: number) {
  let m = cache.get(sprite);
  if (!m) cache.set(sprite, (m = new Map()));
  let s = m.get(u);
  if (s === undefined) m.set(u, (s = sprite.shadow(u)));
  return s;
}

interface Props {
  sprite: Sprite;
  /** Tamaño de cada píxel lógico en px CSS. */
  u: number;
  className?: string;
  style?: CSSProperties;
}

/** Un sprite = un DIV; cada píxel es un box-shadow. */
function PixelBase({ sprite, u, className, style }: Props) {
  return (
    <div className={className} style={{ position: "relative", width: sprite.w * u, height: sprite.h * u, ...style }}>
      <div style={{ width: u, height: u, boxShadow: shadowFor(sprite, u) }} />
    </div>
  );
}

export const Pixel = memo(PixelBase);
