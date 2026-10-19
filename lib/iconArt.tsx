/* Icono de la PWA: una "P" en píxeles, generada con DIVs (sin archivos de imagen). */

const GLYPH = ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."];

export function iconElement(size: number) {
  const cell = Math.floor(size / 12);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", boxShadow: `${cell}px ${cell}px 0 #ff2bd6` }}>
        {GLYPH.map((row, y) => (
          <div key={y} style={{ display: "flex" }}>
            {[...row].map((c, x) => (
              <div
                key={x}
                style={{ width: cell, height: cell, background: c === "X" ? "#9dff00" : "#050505" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
