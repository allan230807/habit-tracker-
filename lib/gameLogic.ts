import type { GameState, Goal, Habit, JournalTask, StatKey } from "./types";

export const STORAGE_KEY = "habit-tracker:v1";
/** Clave de la versión anterior (Party Habit): se migra al primer arranque. */
export const LEGACY_STORAGE_KEY = "party-habit:v1";

/** Nombre de cada categoría (la clave interna no cambia para conservar datos guardados). */
export const STAT_LABELS: Record<StatKey, string> = {
  inteligencia: "Conocimiento",
  dinero: "Dinero",
  fuerza: "Salud",
  espiritu: "Espíritu",
  disciplina: "Disciplina",
};

export const STAT_KEYS = Object.keys(STAT_LABELS) as StatKey[];

/** Bonus por completar todos los hábitos del día (los hábitos sueltos no dan monedas). */
export const HABIT_BONUS = 3;
const BONUS_LABEL = "Bonus: todos los hábitos del día";
const BONUS_UNDO_LABEL = "Bonus revertido";

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

export type Phase = "dawn" | "day" | "dusk" | "night";

/** Amanecer 6–8, día 8–17, atardecer 17–20, noche 20–6. */
export const phaseOf = (hour: number): Phase =>
  hour >= 6 && hour < 8 ? "dawn" : hour >= 8 && hour < 17 ? "day" : hour >= 17 && hour < 20 ? "dusk" : "night";

export const isDaytime = (d: Date) => phaseOf(d.getHours()) !== "night";

/** El personaje duerme de 23:00 a 6:59. */
export const isSleepTime = (hour: number) => hour >= 23 || hour < 7;

// ---------------------------------------------------------------- estado

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function createInitialState(now: Date): GameState {
  const habit = (name: string, stat: StatKey): Habit => ({ id: uid(), name, stat, history: [] });
  const goal = (name: string, targetHours: number, stat: StatKey): Goal => ({
    id: uid(),
    name,
    stat,
    targetHours,
    currentHours: 0,
  });
  return recompute({
    version: 1,
    appStartDate: dateKey(now),
    startAdjusted: true,
    coins: 0,
    characterStats: { level: 1, discipline: 0, focus: 0 },
    habits: [
      habit("Despertar antes de las 8", "disciplina"),
      habit("Ejercicio", "fuerza"),
      habit("Leer 20 min", "inteligencia"),
      habit("Orar / meditar", "espiritu"),
      habit("Planear el día", "disciplina"),
    ],
    goals: [goal("Proyecto principal", 100, "dinero"), goal("Estudio", 50, "inteligencia")],
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
  delete saved.currentState; // el personaje ahora actúa solo
  const s = { ...base, ...(saved as Partial<GameState>) };
  s.goals = s.goals.map((g) => ({ ...g, stat: STAT_KEYS.includes(g.stat) ? g.stat : "disciplina" }));
  // Ajuste único: si se abrió por primera vez ayer, el Día 1 pasa a ser hoy.
  if (!saved.startAdjusted) {
    const today = dateKey(now);
    const age = /^\d{4}-\d{2}-\d{2}$/.test(s.appStartDate) ? daysBetween(s.appStartDate, today) : 0;
    if (age === 1) s.appStartDate = today;
    s.startAdjusted = true;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.appStartDate)) s.appStartDate = base.appStartDate;
  return recompute(s);
}

// ---------------------------------------------------------------- progreso

/** Puntos que suma una meta a su categoría al cumplirse. */
export const goalReward = (g: Goal) => 10 + Math.floor(g.targetHours / 5);
export const isGoalDone = (g: Goal) => g.targetHours > 0 && g.currentHours >= g.targetHours;

export function computeProgress(s: GameState) {
  const totalHours = s.goals.reduce((n, g) => n + g.currentHours, 0);
  const habitChecks = s.habits.reduce((n, h) => n + h.history.length, 0);
  const tasksDone = s.tomorrowTasks.filter((t) => t.completed).length;
  const runs = s.transactions.filter((t) => t.label === "Trotar 1km").length;
  const goalPoints = s.goals.filter(isGoalDone).reduce((n, g) => n + goalReward(g), 0);

  // Cada categoría parte en 1 y suma: hábitos de esa categoría, medio punto por
  // hora de sus metas y el premio completo de cada meta cumplida.
  const stats: Record<StatKey, number> = { inteligencia: 1, dinero: 1, fuerza: 1, espiritu: 1, disciplina: 1 };
  for (const h of s.habits) stats[h.stat] += h.history.length;
  for (const g of s.goals) stats[g.stat] += Math.floor(g.currentHours / 2) + (isGoalDone(g) ? goalReward(g) : 0);
  stats.disciplina += tasksDone;
  stats.fuerza += runs * 2;

  const xp = Math.round(totalHours * 20 + habitChecks * 5 + tasksDone * 3 + runs * 5 + goalPoints * 5);
  const level = Math.floor(Math.sqrt(xp / 25)) + 1;
  const levelStartXp = 25 * (level - 1) ** 2;
  const nextLevelXp = 25 * level ** 2;

  return {
    xp,
    level,
    levelStartXp,
    nextLevelXp,
    totalHours,
    stats,
    discipline: stats.disciplina,
    focus: Math.round(totalHours * 10) / 10,
  };
}

export function recompute(s: GameState): GameState {
  const p = computeProgress(s);
  return { ...s, characterStats: { level: p.level, discipline: p.discipline, focus: p.focus } };
}

export const hasGamerDesk = (s: GameState) => s.goals.some(isGoalDone);

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

const isBonusLabel = (l: string) => l === BONUS_LABEL || l === BONUS_UNDO_LABEL;

/** Monedas netas de bonus de hábitos ya otorgadas hoy. */
const bonusNetToday = (s: GameState, today: string) =>
  s.transactions.filter((t) => t.date === today && isBonusLabel(t.label)).reduce((n, t) => n + t.amount, 0);

export const habitBonusEarned = (s: GameState, today: string) => bonusNetToday(s, today) > 0;

/** Marcar un hábito no da monedas; completar TODOS los de hoy da un bonus único. */
export function toggleHabit(s: GameState, id: string, today: string) {
  if (!s.habits.some((x) => x.id === id)) return s;
  const habits = s.habits.map((x) => {
    if (x.id !== id) return x;
    const done = x.history.includes(today);
    return { ...x, history: done ? x.history.filter((d) => d !== today) : [...x.history, today] };
  });
  let next: GameState = { ...s, habits };
  const allDone = habits.length > 0 && habits.every((h) => h.history.includes(today));
  const net = bonusNetToday(next, today);
  if (allDone && net <= 0) next = withTx(next, HABIT_BONUS, BONUS_LABEL, today);
  else if (!allDone && net > 0) next = withTx(next, -HABIT_BONUS, BONUS_UNDO_LABEL, today);
  return recompute(next);
}

export function addHabit(s: GameState, name: string, stat: StatKey) {
  if (!name.trim()) return s;
  return { ...s, habits: [...s.habits, { id: uid(), name: name.trim(), stat, history: [] }] };
}

export const removeHabit = (s: GameState, id: string) =>
  recompute({ ...s, habits: s.habits.filter((h) => h.id !== id) });

/** Reinicia la cuenta: el Día 1 pasa a ser hoy. */
export const resetStartDate = (s: GameState, today: string): GameState => ({ ...s, appStartDate: today });

export function addGoal(s: GameState, name: string, targetHours: number, stat: StatKey) {
  if (!name.trim() || !(targetHours > 0) || !STAT_KEYS.includes(stat)) return s;
  return { ...s, goals: [...s.goals, { id: uid(), name: name.trim(), stat, targetHours, currentHours: 0 }] };
}

export function removeGoal(s: GameState, id: string) {
  const stopwatch = s.stopwatch?.goalId === id ? null : s.stopwatch;
  return recompute({ ...s, goals: s.goals.filter((g) => g.id !== id), stopwatch });
}

export function startStopwatch(s: GameState, goalId: string, nowMs: number): GameState {
  if (s.stopwatch || !s.goals.some((g) => g.id === goalId)) return s;
  return { ...s, stopwatch: { goalId, startedAt: nowMs } };
}

/** Detiene el cronómetro y suma el tiempo transcurrido a la meta. */
export function stopStopwatch(s: GameState, nowMs: number): GameState {
  const w = s.stopwatch;
  if (!w) return s;
  const hours = Math.max(0, nowMs - w.startedAt) / 3_600_000;
  const goals = s.goals.map((g) => {
    if (g.id !== w.goalId) return g;
    const next = { ...g, currentHours: Math.round((g.currentHours + hours) * 10000) / 10000 };
    return isGoalDone(next) && !next.doneAt ? { ...next, doneAt: nowMs } : next;
  });
  return recompute({ ...s, goals, stopwatch: null });
}

export const cancelStopwatch = (s: GameState): GameState => (s.stopwatch ? { ...s, stopwatch: null } : s);

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
