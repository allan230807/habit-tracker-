import type { GameActions } from "@/hooks/useGameEngine";
import type { GameState } from "@/lib/types";

export interface SectionProps {
  state: GameState;
  actions: GameActions;
  /** Día local actual (YYYY-MM-DD). */
  today: string;
}
