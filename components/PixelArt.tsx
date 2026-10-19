import { memo } from "react";
import { PALETTE } from "@/lib/sprites";

interface Props {
  rows: readonly string[];
  /** Tamaño en px de cada "píxel" (entero, para evitar costuras). */
  px: number;
  className?: string;
}

/** Dibuja un mapa de caracteres como una grilla de DIVs con clases de Tailwind. */
function PixelArtBase({ rows, px, className }: Props) {
  const w = rows.reduce((m, row) => Math.max(m, row.length), 0);
  const cells = [];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < w; x++) {
      cells.push(<div key={y * w + x} className={PALETTE[rows[y][x] ?? "."] || undefined} />);
    }
  }
  return (
    <div
      className={`grid ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${w}, ${px}px)`, gridAutoRows: `${px}px` }}
    >
      {cells}
    </div>
  );
}

export const PixelArt = memo(PixelArtBase);
