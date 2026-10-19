/* Icono de la PWA: una "H" en píxeles, generada con DIVs (sin archivos de imagen). */

const GLYPH = ["X...X", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"];

export function iconElement(size: number) {
  const cell = Math.floor(size / 12);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#1a1d23",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {GLYPH.map((row, y) => (
          <div key={y} style={{ display: "flex" }}>
            {[...row].map((c, x) => (
              <div
                key={x}
                style={{ width: cell, height: cell, background: c === "X" ? "#86b79e" : "#1a1d23" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
