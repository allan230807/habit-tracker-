import type {
  GameState,
  Goal,
  Habit,
  JournalTask,
  SpriteState,
  StatKey,
} from "./types";

export const STORAGE_KEY = "habit-tracker:v1";
/** Clave de la versión anterior (Party Habit): se migra al primer arranque. */
export const LEGACY_STORAGE_KEY = "party-habit:v1";

export const SPRITE_STATES: SpriteState[] = [
  "durmiendo",
  "scrolling_phone",
  "reading_bed",
  "praying",
  "writing_board",
  "working_macbook",
];

export const SPRITE_LABELS: Record<SpriteState, string> = {
  durmiendo: "Durmiendo",
  scrolling_phone: "Con el celular",
  reading_bed: "Leyendo",
  praying: "Orando",
  writing_board: "Planeando",
  working_macbook: "Trabajando",
};

export const STAT_LABELS: Record<StatKey, string> = {
  fuerza: "Fuerza",
  inteligencia: "Inteligencia",
  espiritu: "Espíritu",
  disciplina: "Disciplina",
};

export const QUICK_ACTIONS = [
  { label: "Día libre", amount: -30 },
  { label: "Alcohol", amount: -5 },
  { label: "Despertar > 11 AM", amount: -9 },
  { label: "Trotar 1km", amount: 5 },
  { label: "Ingreso", amount: 50 },
] as const;

export const SHOP_ITEMS = [
  { id: "cheat-pizza", name: "Pizza (cheat meal)", price: 20 },
  { id: "neon-poster", name: "Póster neón", price: 40 },
  { id: "headphones", name: "Auriculares", price: 60 },
  { id: "mech-keyboard", name: "Teclado mecánico", price: 80 },
] as const;

// ---------------------------------------------------------------- fechas

const pad = (n: number) => String(n).padStart(2, "0");
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** Clave de día en hora local: YYYY-MM-DD. */
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const keyToUtc = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export const daysBetween = (a: string, b: string) => Math.round((keyToUtc(b) - keyToUtc(a)) / 86400000);

export function addDays(key: string, n: number) {
  const t = new Date(keyToUtc(key) + n * 86400000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** 0 = domingo. */
export const weekday = (key: string) => new Date(keyToUtc(key)).getUTCDay();

export function formatDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return `${pad(d)} ${MONTHS[m - 1]} ${y}`;
}

export const monthLabel = (key: string) => MONTHS[Number(key.split("-")[1]) - 1];

/** Día 1 = appStartDate. */
export const dayNumber = (s: GameState, today: string) => Math.max(1, daysBetween(s.appStartDate, today) + 1);

/** Sol 7:00–19:59, noche 20:00–6:59. */
export const isDaytime = (d: Date) => d.getHours() >= 7 && d.getHours() < 20;

// ---------------------------------------------------------------- estado

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function createInitialState(now: Date): GameState {
  const habit = (name: string, stat: StatKey): Habit => ({ id: uid(), name, stat, history: [] });
  const goal = (name: string, targetHours: number): Goal => ({ id: uid(), name, targetHours, currentHours: 0 });
  return recompute({
    version: 1,
    appStartDate: dateKey(now),
    coins: 0,
    characterStats: { level: 1, discipline: 0, focus: 0 },
    currentState: "scrolling_phone",
    habits: [
      habit("Despertar antes de las 8", "disciplina"),
      habit("Ejercicio", "fuerza"),
      habit("Leer 20 min", "inteligencia"),
      habit("Orar / meditar", "espiritu"),
      habit("Planear el día", "disciplina"),
    ],
    goals: [goal("Proyecto principal", 100), goal("Estudio", 50)],
    transactions: [],
    inventory: [],
    tomorrowTasks: [],
    stopwatch: null,
  });
}

/** Completa con defaults un JSON guardado (o de una versión anterior). */
export function hydrate(raw: unknown, now: Date): GameState {
  const base = createInitialState(now);
  if (!raw || typeof raw !== "object") return base;
  const saved = { ...(raw as Record<string, unknown>) };
  delete saved.timer; // el temporizador de la versión anterior ya no existe
  const s = { ...base, ...(saved as Partial<GameState>) };
  if (s.currentState && !SPRITE_STATES.includes(s.currentState)) s.currentState = base.currentState;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.appStartDate)) s.appStartDate = base.appStartDate;
  return recompute(s);
}

// ---------------------------------------------------------------- progreso

export function computeProgress(s: GameState) {
  const totalHours = s.goals.reduce((n, g) => n + g.currentHours, 0);
  const habitChecks = s.habits.reduce((n, h) => n + h.history.length, 0);
  const tasksDone = s.tomorrowTasks.filter((t) => t.completed).length;
  const runs = s.transactions.filter((t) => t.label === "Trotar 1km").length;
  const checksBy = (stat: StatKey) =>
    s.habits.filter((h) => h.stat === stat).reduce((n, h) => n + h.history.length, 0);

  const xp = Math.round(totalHours * 20 + habitChecks * 5 + tasksDone * 3 + runs * 5);
  const level = Math.floor(Math.sqrt(xp / 25)) + 1;
  const levelStartXp = 25 * (level - 1) ** 2;
  const nextLevelXp = 25 * level ** 2;

  return {
    xp,
    level,
    levelStartXp,
    nextLevelXp,
    totalHours,
    discipline: habitChecks + tasksDone,
    focus: Math.round(totalHours * 10) / 10,
    fuerza: 1 + runs * 2 + checksBy("fuerza"),
    inteligencia: 1 + Math.floor(totalHours * 2) + checksBy("inteligencia") + tasksDone,
    espiritu: 1 + checksBy("espiritu"),
  };
}

export function recompute(s: GameState): GameState {
  const p = computeProgress(s);
  return { ...s, characterStats: { level: p.level, discipline: p.discipline, focus: p.focus } };
}

export const hasGamerDesk = (s: GameState) => s.goals.some((g) => g.targetHours > 0 && g.currentHours >= g.targetHours);

/** Nivel 0..4 de un día según la fracción de hábitos completados. */
export function heatLevel(count: number, total: number) {
  if (!count || !total) return 0;
  const r = count / total;
  return r >= 1 ? 4 : r > 0.67 ? 3 : r > 0.34 ? 2 : 1;
}

/** Últimas `weeks` semanas (columnas, domingo→sábado). null = día futuro. */
export function heatLevels(s: GameState, today: string, weeks: number): (number | null)[][] {
  const lastSat = addDays(today, 6 - weekday(today));
  const start = addDays(lastSat, -(weeks * 7 - 1));
  const counts = new Map<string, number>();
  for (const h of s.habits) for (const d of h.history) counts.set(d, (counts.get(d) ?? 0) + 1);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const key = addDays(start, w * 7 + d);
      return key > today ? null : heatLevel(counts.get(key) ?? 0, s.habits.length);
    }),
  );
}

export function habitSuccess(s: GameState, h: Habit, today: string) {
  const days = dayNumber(s, today);
  const done = h.history.filter((d) => d >= s.appStartDate && d <= today).length;
  return Math.min(100, (done / days) * 100);
}

// ---------------------------------------------------------------- mutaciones (puras)

function withTx(s: GameState, amount: number, label: string, today: string): GameState {
  return {
    ...s,
    coins: s.coins + amount,
    transactions: [...s.transactions, { id: uid(), amount, label, date: today, ts: Date.now() }],
  };
}

export function addTransaction(s: GameState, amount: number, label: string, today: string) {
  if (!Number.isFinite(amount) || amount === 0 || !label.trim()) return s;
  return recompute(withTx(s, amount, label.trim(), today));
}

export function toggleHabit(s: GameState, id: string, today: string) {
  const h = s.habits.find((x) => x.id === id);
  if (!h) return s;
  const done = h.history.includes(today);
  const habits = s.habits.map((x) =>
    x.id !== id ? x : { ...x, history: done ? x.history.filter((d) => d !== today) : [...x.history, today] },
  );
  return recompute(
    withTx({ ...s, habits }, done ? -1 : 1, done ? `Hábito desmarcado: ${h.name}` : `Hábito: ${h.name}`, today),
  );
}

export function addHabit(s: GameState, name: string, stat: StatKey) {
  if (!name.trim()) return s;
  return { ...s, habits: [...s.habits, { id: uid(), name: name.trim(), stat, history: [] }] };
}

export const removeHabit = (s: GameState, id: string) =>
  recompute({ ...s, habits: s.habits.filter((h) => h.id !== id) });

export function addGoal(s: GameState, name: string, targetHours: number) {
  if (!name.trim() || !(targetHours > 0)) return s;
  return { ...s, goals: [...s.goals, { id: uid(), name: name.trim(), targetHours, currentHours: 0 }] };
}

export function removeGoal(s: GameState, id: string) {
  const stopwatch = s.stopwatch?.goalId === id ? null : s.stopwatch;
  const currentState = s.stopwatch && !stopwatch ? s.stopwatch.prevState : s.currentState;
  return recompute({ ...s, goals: s.goals.filter((g) => g.id !== id), stopwatch, currentState });
}

export const setSprite = (s: GameState, currentState: SpriteState) =>
  s.stopwatch ? s : { ...s, currentState };

export function startStopwatch(s: GameState, goalId: string, nowMs: number): GameState {
  if (s.stopwatch || !s.goals.some((g) => g.id === goalId)) return s;
  return {
    ...s,
    currentState: "working_macbook",
    stopwatch: { goalId, startedAt: nowMs, prevState: s.currentState },
  };
}

/** Detiene el cronómetro y suma el tiempo transcurrido a la meta. */
export function stopStopwatch(s: GameState, nowMs: number): GameState {
  const w = s.stopwatch;
  if (!w) return s;
  const hours = Math.max(0, nowMs - w.startedAt) / 3_600_000;
  const goals = s.goals.map((g) =>
    g.id === w.goalId ? { ...g, currentHours: Math.round((g.currentHours + hours) * 10000) / 10000 } : g,
  );
  return recompute({ ...s, goals, stopwatch: null, currentState: w.prevState });
}

export const cancelStopwatch = (s: GameState): GameState =>
  s.stopwatch ? { ...s, stopwatch: null, currentState: s.stopwatch.prevState } : s;

export function addTomorrowTask(s: GameState, text: string, today: string) {
  if (!text.trim()) return s;
  const task: JournalTask = {
    id: uid(),
    text: text.trim(),
    createdOn: today,
    dueOn: addDays(today, 1),
    completed: false,
    completedOn: null,
  };
  return { ...s, tomorrowTasks: [...s.tomorrowTasks, task] };
}

export function completeTask(s: GameState, id: string, today: string) {
  const t = s.tomorrowTasks.find((x) => x.id === id);
  if (!t || t.completed || t.dueOn > today) return s;
  const tomorrowTasks = s.tomorrowTasks.map((x) => (x.id === id ? { ...x, completed: true, completedOn: today } : x));
  return recompute(withTx({ ...s, tomorrowTasks }, 1, `Journal: ${t.text}`, today));
}

export const removeTask = (s: GameState, id: string) => ({
  ...s,
  tomorrowTasks: s.tomorrowTasks.filter((t) => t.id !== id || t.completed),
});

export function buyItem(s: GameState, itemId: string, today: string) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item || s.coins < item.price) return s;
  const has = s.inventory.some((i) => i.id === item.id);
  const inventory = has
    ? s.inventory.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
    : [...s.inventory, { id: item.id, name: item.name, qty: 1 }];
  return recompute(withTx({ ...s, inventory }, -item.price, `Tienda: ${item.name}`, today));
}
