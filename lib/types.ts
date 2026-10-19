export type SpriteState =
  | "durmiendo"
  | "scrolling_phone"
  | "reading_bed"
  | "praying"
  | "writing_board"
  | "working_macbook";

/** Categorías en las que ayuda un hábito o una meta (y estadísticas del personaje). */
export type StatKey = "inteligencia" | "dinero" | "fuerza" | "espiritu" | "disciplina";

export interface Habit {
  id: string;
  name: string;
  stat: StatKey;
  /** Fechas locales (YYYY-MM-DD) en las que se completó. */
  history: string[];
}

export interface Goal {
  id: string;
  name: string;
  /** ¿En qué ayuda esta meta? Al cumplirla suma puntos a esa estadística. */
  stat: StatKey;
  targetHours: number;
  currentHours: number;
}

export interface Transaction {
  id: string;
  amount: number;
  label: string;
  /** Fecha local YYYY-MM-DD. */
  date: string;
  ts: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
}

export interface JournalTask {
  id: string;
  text: string;
  createdOn: string;
  /** Día a partir del cual se puede completar (día siguiente a createdOn). */
  dueOn: string;
  completed: boolean;
  completedOn: string | null;
}

/** Cronómetro en marcha: suma el tiempo transcurrido a la meta al detenerlo. */
export interface StopwatchState {
  goalId: string;
  startedAt: number;
}

export interface CharacterStats {
  level: number;
  discipline: number;
  focus: number;
}

export interface GameState {
  version: 1;
  appStartDate: string;
  coins: number;
  characterStats: CharacterStats;
  habits: Habit[];
  goals: Goal[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  tomorrowTasks: JournalTask[];
  stopwatch: StopwatchState | null;
}
