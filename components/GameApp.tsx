"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useNow } from "@/hooks/useNow";
import { ROOM_ZOOM, useStageNav, type Section } from "@/hooks/useStageNav";
import { setActorInputs } from "@/lib/actor/store";
import type { DeskItem } from "@/lib/art/desk";
import { computeProgress, dateKey, dayNumber, hasGamerDesk, heatLevels, isGoalDone, isSleepTime, phaseOf } from "@/lib/gameLogic";
import { mix } from "@/lib/pixel";
import DeskScene from "./scenes/DeskScene";
import RoomScene from "./scenes/RoomScene";
import GoalsSection from "./sections/GoalsSection";
import HabitsSection from "./sections/HabitsSection";
import StatsSection from "./sections/StatsSection";
import TodoSection from "./sections/TodoSection";
import WalletSection from "./sections/WalletSection";
import Stage from "./Stage";
import { ProgressBar } from "./ui";

const SECTION_TITLE: Record<Section, string> = {
  habits: "Hábitos de hoy",
  goals: "Metas y cronómetro",
  stats: "Estadísticas",
  todo: "Tareas de mañana",
  wallet: "Cartera",
};

/** Colores de pared/piso para los márgenes del escenario. */
function backdropFor(scene: "room" | "desk", day: boolean, gamer: boolean) {
  const night = (c: string, a: number) => (day ? c : mix(c, "#0e1430", a));
  const wallA = night("#f7f6f3", 0.46);
  const wallB = night("#ebe9e4", 0.46);
  const trim = night("#fbfbf9", 0.46);
  if (scene === "room") {
    const floor = night("#c9a47a", 0.46);
    return `linear-gradient(to bottom, ${wallA} 0, ${wallB} 82%, ${trim} 82%, ${trim} 84%, ${floor} 84%)`;
  }
  const wood = gamer ? "#30333b" : night("#cfae82", 0.3);
  return `linear-gradient(to bottom, ${wallA} 0, ${wallB} 12%, ${trim} 12%, ${trim} 14%, ${wood} 14%)`;
}

const clock = (ms: number) => {
  const t = Math.floor(Math.max(0, ms) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`;
};

/** Texto del cronómetro; vive aparte para que solo él se repinte cada segundo. */
function Elapsed({ since }: { since: number }) {
  const now = useNow(1000);
  return <>{clock(now - since)}</>;
}

export default function GameApp() {
  const { state, actions } = useGameEngine();
  const now = useNow(60_000);
  const { nav, enterDesk, leaveDesk, open, closeSection, openItem } = useStageNav();

  const working = !!state?.stopwatch;
  const hour = new Date(now).getHours();
  useEffect(() => {
    if (!now) return;
    setActorInputs({ night: isSleepTime(hour), working });
  }, [now, hour, working]);

  const today = dateKey(new Date(now));
  const heat = useMemo(() => (state ? heatLevels(state, today, 9) : []), [state, today]);

  if (!state) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="animate-pulse-dot text-sm text-muted">Cargando…</p>
      </main>
    );
  }

  const date = new Date(now);
  const phase = phaseOf(date.getHours());
  const day = phase !== "night";
  const doneGoals = state.goals
    .filter(isGoalDone)
    .sort((a, b) => (a.doneAt ?? 0) - (b.doneAt ?? 0))
    .map((g) => g.stat);
  const gamer = hasGamerDesk(state);
  const p = computeProgress(state);
  const sw = state.stopwatch;

  const atHome = nav.scene === "room" && !nav.section;
  const goBack = nav.section ? closeSection : leaveDesk;
  const showHome = nav.scene === "desk" && !!nav.section;

  const props = { state, actions, today };
  let panel: ReactNode;
  switch (nav.section) {
    case "habits":
      panel = <HabitsSection {...props} />;
      break;
    case "goals":
      panel = <GoalsSection {...props} />;
      break;
    case "stats":
      panel = <StatsSection {...props} />;
      break;
    case "todo":
      panel = <TodoSection {...props} />;
      break;
    case "wallet":
      panel = <WalletSection {...props} />;
      break;
    default:
      panel =
        nav.scene === "desk" ? (
          <DeskMenu onPick={openItem} />
        ) : (
          <Home state={state} today={today} onHabits={() => open("habits", ROOM_ZOOM.board)} onDesk={enterDesk} />
        );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[560px] flex-col pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="text-lg font-semibold tracking-tight">Habit Tracker</h1>
        <div className="flex items-center gap-1.5">
          <span className="chip">Día {dayNumber(state, today)}</span>
          <span className="chip">Nv {p.level}</span>
          <span className={`chip font-mono ${state.coins < 0 ? "!text-rose" : "!text-sand"}`}>● {state.coins}</span>
        </div>
      </header>

      <div className="relative">
        <Stage
          cam={nav.cam}
          animate={nav.animate}
          backdrop={backdropFor(nav.scene, day, gamer)}
          render={(u) => (
            <div key={nav.scene} className="animate-fadein absolute inset-0">
              {nav.scene === "room" ? (
                <RoomScene
                  u={u}
                  phase={phase}
                  frames={doneGoals}
                  hour={date.getHours()}
                  minute={date.getMinutes()}
                  gamer={gamer}
                  heat={heat}
                  hints={!nav.section}
                  onDesk={enterDesk}
                  onBoard={() => open("habits", ROOM_ZOOM.board)}
                />
              ) : (
                <DeskScene u={u} day={day} gamer={gamer} startedAt={sw?.startedAt ?? null} hints={!nav.section} onItem={openItem} />
              )}
            </div>
          )}
        />

        {/* botones grandes para volver, siempre a la vista */}
        {!atHome && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-2 p-3">
            <button onClick={goBack} className="pointer-events-auto flex min-h-11 items-center gap-1.5 rounded-full border border-white/25 bg-black/75 px-4 text-[15px] font-semibold text-white shadow-lg backdrop-blur-md active:scale-95">
              <span className="text-xl leading-none">‹</span> Atrás
            </button>
            {showHome && (
              <button onClick={leaveDesk} className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-black/75 px-4 text-[15px] font-semibold text-white shadow-lg backdrop-blur-md active:scale-95">
                <HomeIcon /> Habitación
              </button>
            )}
          </div>
        )}
        {sw && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-50 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <span className="animate-pulse-dot h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono">
              <Elapsed since={sw.startedAt} />
            </span>
            <span className="text-white/60">{state.goals.find((g) => g.id === sw.goalId)?.name}</span>
          </div>
        )}
      </div>

      <main className="-mt-3 flex-1 rounded-t-3xl border-t border-line bg-bg px-4 pb-10 pt-4">
        {!atHome && (
          <div className="mb-4 flex items-center gap-2">
            <button onClick={goBack} className="btn !min-h-11 !px-4 text-[15px]">
              <span className="text-lg leading-none">‹</span> Atrás
            </button>
            {showHome && (
              <button onClick={leaveDesk} className="btn !min-h-11 !px-4 text-[15px]">
                <HomeIcon /> Habitación
              </button>
            )}
            {nav.section && <h2 className="ml-auto text-base font-semibold">{SECTION_TITLE[nav.section]}</h2>}
          </div>
        )}
        <div key={`${nav.scene}-${nav.section}`} className="animate-rise">
          {panel}
        </div>
      </main>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8.5V16h10V8.5" />
      <path d="M8.5 16v-4.5h3V16" />
    </svg>
  );
}

function DeskMenu({ onPick }: { onPick: (k: DeskItem) => void }) {
  const items: { k: DeskItem; title: string; sub: string }[] = [
    { k: "macbook", title: "Macbook", sub: "Metas y cronómetro" },
    { k: "phone", title: "Teléfono", sub: "Estadísticas" },
    { k: "notebook", title: "Cuaderno", sub: "Lista de tareas" },
    { k: "wallet", title: "Cartera", sub: "Monedas y tienda" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((i) => (
        <button key={i.k} onClick={() => onPick(i.k)} className="card text-left transition-colors hover:border-muted/60">
          <p className="font-medium">{i.title}</p>
          <p className="text-sm text-muted">{i.sub}</p>
        </button>
      ))}
    </div>
  );
}

function Home({
  state,
  today,
  onHabits,
  onDesk,
}: {
  state: NonNullable<ReturnType<typeof useGameEngine>["state"]>;
  today: string;
  onHabits: () => void;
  onDesk: () => void;
}) {
  const done = state.habits.filter((h) => h.history.includes(today)).length;
  const pending = state.tomorrowTasks.filter((t) => !t.completed && t.dueOn <= today).length;
  const nextGoal = [...state.goals]
    .filter((g) => g.currentHours < g.targetHours)
    .sort((a, b) => b.currentHours / b.targetHours - a.currentHours / a.targetHours)[0];

  return (
    <div className="space-y-3">
      <button onClick={onHabits} className="card block w-full text-left transition-colors hover:border-muted/60">
        <ProgressBar value={done} max={state.habits.length} label="Hábitos de hoy" right={`${done}/${state.habits.length}`} />
      </button>
      {nextGoal && (
        <button onClick={onDesk} className="card block w-full text-left transition-colors hover:border-muted/60">
          <ProgressBar
            value={nextGoal.currentHours}
            max={nextGoal.targetHours}
            tone="sky"
            label={nextGoal.name}
            right={`${Math.round(nextGoal.currentHours * 10) / 10} / ${nextGoal.targetHours} h`}
          />
        </button>
      )}
      <div className="card flex items-center justify-between">
        <span className="text-sm">Tareas pendientes de hoy</span>
        <span className="font-mono text-sand">{pending}</span>
      </div>
    </div>
  );
}
