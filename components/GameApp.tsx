"use client";

import { useState } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useNow } from "@/hooks/useNow";
import { dateKey, dayNumber } from "@/lib/gameLogic";
import DeepWorkTimer from "./DeepWorkTimer";
import GoalsPanel from "./GoalsPanel";
import HabitsPanel from "./HabitsPanel";
import Journal from "./Journal";
import Ledger from "./Ledger";
import Room from "./Room";
import StatsPanel from "./StatsPanel";

const TABS = [
  { id: "metas", label: "Metas" },
  { id: "habitos", label: "Hábitos" },
  { id: "journal", label: "Journal" },
  { id: "ledger", label: "Ledger" },
  { id: "stats", label: "Stats" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function GameApp() {
  const { state, actions } = useGameEngine();
  const now = useNow(60_000);
  const [tab, setTab] = useState<Tab>("metas");

  if (!state) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="glitch animate-blink text-3xl text-neon-lime">LOADING...</p>
      </main>
    );
  }

  const today = dateKey(new Date(now));

  return (
    <div className="mx-auto min-h-dvh max-w-[760px] px-3 pb-28 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="mb-3 flex items-end justify-between gap-2">
        <h1 className="glitch text-4xl uppercase tracking-widest text-neon-cyan">Party Habit</h1>
        <div className="flex gap-3 text-right text-xl">
          <span className="text-neon-lime">DÍA {dayNumber(state, today)}</span>
          <span className="text-neon-magenta">LV{state.characterStats.level}</span>
          <span className={state.coins < 0 ? "text-neon-magenta" : "text-yellow-300"}>◆{state.coins}</span>
        </div>
      </header>

      <main className="space-y-4">
        <Room state={state} actions={actions} />
        {tab === "metas" && (
          <>
            <DeepWorkTimer state={state} actions={actions} />
            <GoalsPanel state={state} actions={actions} />
          </>
        )}
        {tab === "habitos" && <HabitsPanel state={state} actions={actions} />}
        {tab === "journal" && <Journal state={state} actions={actions} />}
        {tab === "ledger" && <Ledger state={state} actions={actions} />}
        {tab === "stats" && <StatsPanel state={state} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-neon-cyan bg-black pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-[760px] grid-cols-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 text-lg uppercase ${
                tab === t.id ? "bg-neon-cyan text-black" : "text-neon-cyan hover:bg-neon-cyan/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
