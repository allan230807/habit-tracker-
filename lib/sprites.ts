import type { SpriteState } from "./types";

/*
 * Sprites como mapas de caracteres. Cada carácter es un DIV con una clase de
 * Tailwind (ver PALETTE). Las filas más cortas se rellenan con "." (vacío).
 */

export const PALETTE: Record<string, string> = {
  ".": "",
  k: "bg-black",
  d: "bg-zinc-900",
  g: "bg-zinc-600",
  G: "bg-zinc-400",
  w: "bg-zinc-100",
  s: "bg-amber-200",
  h: "bg-neon-magenta",
  c: "bg-neon-cyan shadow-[0_0_4px_#00f0ff]",
  l: "bg-neon-lime shadow-[0_0_4px_#9dff00]",
  m: "bg-neon-magenta shadow-[0_0_4px_#ff2bd6]",
  b: "bg-blue-700",
  B: "bg-blue-500",
  n: "bg-blue-950",
  y: "bg-yellow-300",
  r: "bg-red-500",
  p: "bg-purple-700",
  P: "bg-purple-900",
  W: "bg-amber-900",
  R: "bg-neon-magenta animate-rgb",
};

const d = (n: number) => ".".repeat(n);
const r = (c: string, n: number) => c.repeat(n);

// ------------------------------------------------------------ personaje

export const CHARACTER: Record<SpriteState, { rows: string[]; x: number; y: number }> = {
  durmiendo: {
    x: 3,
    y: 16,
    rows: [
      "..hhhh",
      ".hhssss",
      ".hhsksspppppppppppppp",
      "..hsssspppppppppppppp",
      "...ssspPPPPPPPPPPPPPP",
    ],
  },
  reading_bed: {
    x: 4,
    y: 16,
    rows: [
      "...hhhhh....",
      "..hhhhhhh...",
      "..hhsssss...",
      "..hhsskss...",
      "..hhsssss...",
      "....sss.....",
      "..ccccccc...",
      ".ccccccccw..",
      ".cccccccwlw.",
      r("p", 26),
      r("p", 26),
      r("P", 26),
    ],
  },
  scrolling_phone: {
    x: 20,
    y: 12,
    rows: [
      "...hhhhh....",
      "..hhhhhhh...",
      "..hhsssss.kk",
      "..hhsskss.kc",
      "..hhsssss.kc",
      "....sss.ss..",
      "..cccccccc..",
      ".cccccccc...",
      ".cccccccc...",
      "..bbbbbbbbb.",
      "..bbbbbbbbbb",
      "........bb..",
      "........bb..",
      "........kk..",
    ],
  },
  praying: {
    x: 36,
    y: 3,
    rows: [
      "...yyyyyy...",
      "....hhhh....",
      "...hhhhhh...",
      "...hhsssss..",
      "...hhsksss..",
      "....ssss....",
      "...cccccc...",
      "..cccccccss.",
      "..ccccccsss.",
      "..cccccccc..",
      "..cccccccc..",
      "..bbbbbbbbb.",
      "..bbbbbbbbbb",
      "..kkkkkkkkk.",
    ],
  },
  writing_board: {
    x: 35,
    y: 8,
    rows: [
      "...hhhhh....",
      "..hhhhhhh...",
      "..hhsssss...",
      "..hhsskss...",
      "..hhsssss...",
      "....sss.....",
      "..ccccccc.ss",
      ".cccccccccs.",
      ".ccccc......",
      ".ccccc......",
      "..ccccc.....",
      "..bbbbbb....",
      "..bbbbbb....",
      "..bb..bb....",
      "..bb..bb....",
      "..kk..kk....",
    ],
  },
  working_macbook: {
    x: 68,
    y: 8,
    rows: [
      "...hhhhh....",
      "..hhhhhhh...",
      "..hhsssss...",
      "..hhsskss...",
      "..hhsssss...",
      "....sss.....",
      "..ccccccc...",
      ".cccccccccs.",
      ".ccccccccss.",
      ".ccccccc....",
      "..bbbbbbbbb.",
      "..bbbbbbbbbb",
      "........bb..",
      "........bb..",
      "........bb..",
      "........kk..",
    ],
  },
};

// ------------------------------------------------------------ mobiliario

export const BED = [
  "WW",
  "WW",
  "WW",
  "WW",
  "WW.wwwwwww",
  "WW.GGGGGGGG",
  `WW${r("w", 28)}WW`,
  `WW${r("w", 28)}WW`,
  `WW${r("G", 28)}WW`,
  r("W", 32),
  r("W", 32),
  `WW${d(28)}WW`,
  `WW${d(28)}WW`,
  `WW${d(28)}WW`,
];

export const DESK = [
  r("w", 36),
  r("w", 36),
  r("G", 36),
  ...Array.from({ length: 7 }, () => `.ww${d(30)}ww.`),
];

const monitor = (a: string, b: string) => `${d(17)}k${a}k.k${b}k`;

export const GAMER_DESK = [
  `${d(17)}kkkkkkkkk.kkkkkkkkk`,
  monitor("ccccccc", "mmmmmmm"),
  monitor("clclclc", "mlmlmlm"),
  monitor("ccccccc", "mmmmmmm"),
  monitor("clclccc", "mlmmmmm"),
  monitor("ccccccc", "mmmmmmm"),
  monitor("cclcccc", "mmmlmmm"),
  `${d(17)}kkkkkkkkk.kkkkkkkkk`,
  `${d(21)}g${d(9)}g${d(4)}`,
  `${d(21)}g${d(9)}g${d(4)}`,
  r("k", 36),
  r("k", 36),
  r("R", 36),
  ...Array.from({ length: 7 }, () => `.kR${d(30)}Rk.`),
];

export const CHAIR = [
  "wG",
  "wG",
  "wG",
  "wG",
  "wG",
  "wG",
  "wG",
  "wG",
  r("w", 10),
  r("G", 10),
  "....gg....",
  "....gg....",
  ".gggggggg.",
];

export const MACBOOK = [
  `${d(7)}cG`,
  `${d(7)}cG`,
  `${d(7)}cG`,
  `${d(7)}cG`,
  `${d(7)}cG`,
  `${d(7)}cG`,
  `GGGGGGGGG`,
];

export const WHITEBOARD = (() => {
  const ink = [
    "wwwwwwwwwwwwwwwwwwww",
    "wwBBBBBBBwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwww",
    "wwkkkkkkkkkwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwww",
    "wwrrrrrwwBBBBBwwwwww",
    "wwwwwwwwwwwwwwwwwwww",
    "wwkkkkkkkkkkkkkwwwww",
    "wwwwwwwwwwwwwwwwwwww",
    "wwBBBwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwww",
  ];
  return [
    r("G", 22),
    ...ink.map((row) => `G${row}G`),
    r("G", 22),
    ...Array.from({ length: 7 }, () => `..g${d(16)}g..`),
  ];
})();

/** Ventana 20x16: marco, cruceta, cielo de día (cyan + sol) o de noche (luna + estrellas). */
function buildWindow(day: boolean) {
  const stars = new Set(["4,3", "14,3", "7,10", "15,11", "12,5", "3,6"]);
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = "";
    for (let x = 0; x < 20; x++) {
      if (x < 2 || x > 17 || y < 2 || y > 13) row += y > 13 ? "G" : "w";
      else if (x === 9 || x === 10 || y === 7 || y === 8) row += "G";
      else if (day) {
        if (x >= 13 && x <= 15 && y >= 4 && y <= 6) row += "y";
        else if (x >= 4 && x <= 7 && y >= 10 && y <= 11) row += "w";
        else row += "c";
      } else {
        if (x >= 4 && x <= 6 && y >= 3 && y <= 5 && !(x >= 5 && y <= 4)) row += "w";
        else if (stars.has(`${x},${y}`)) row += "y";
        else row += "n";
      }
    }
    rows.push(row);
  }
  return rows;
}

export const WINDOW_DAY = buildWindow(true);
export const WINDOW_NIGHT = buildWindow(false);

export const COIN = [
  "..yyyy..",
  ".yywwyy.",
  "yywyyyyy",
  "yywyyyyy",
  "yyyyyyyy",
  "yyyyyyyy",
  ".yyyyyy.",
  "..yyyy..",
];
