"use client";

import { useMemo, type ReactNode } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useNow } from "@/hooks/useNow";
import { ROOM_ZOOM, camForSprite, useStageNav, type Section } from "@/hooks/useStageNav";
import type { DeskItem } from "@/lib/art/desk";
import {
  computeProgress,
  dateKey,
  dayNumber,
  hasGamerDesk,
  heatLevels,
  isDaytime,
  SPRITE_LABELS,
} from "@/lib/gameLogic";
import DeskScene from "./scenes/DeskScene";
import RoomScene from "./scenes/RoomScene";
import ActivitySection from "./sections/ActivitySection";
import GoalsSection from "./sections/GoalsSection";
import HabitsSection from "./sections/HabitsSection";
import StatsSection from "./sections/StatsSection";
import TodoSection from "./sections/TodoSection";
import WalletSection from "./sections/WalletSection";
import Stage from "./Stage";
import { mix } from "@/lib/pixel";
import { ProgressBar } from "./ui";

const SECTION_LABEL: Record<Section, string> = {
  habits: "Tablero",
  activity: "Cama",
  goals: "Macbook",
  stats: "Teléfono",
  todo: "Cuaderno",
  wallet: "Cartera",
};

/** Colores de pared/piso para los márgenes del escenario. */
function backdropFor(scene: "room" | "desk", day: boolean, gamer: boolean) {
  const night = (c: string, a: number) => mix(c, "#0a0e22", a);
  const wallA = day ? "#ddd6c9" : night("#2b2f38", 0.38);
  const wallB = day ? "#cfc8ba" : night("#262a32", 0.38);
  const trim = day ? "#f1ede4" : night("#555a66", 0.38);
  if (scene === "room") {
    const floor = day ? "#b48f69" : night("#40362d", 0.38);
    return `linear-gradient(to bottom, ${wallA} 0, ${wallB} 83%, ${trim} 83%, ${trim} 85%, ${floor} 85%)`;
  }
  const wood = gamer ? "#30333b" : day ? "#9a7351" : night("#6b4f38", 0.34);
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
  const { nav, enterDesk, leaveDesk, open, closeSection, openItem, setCam } = useStageNav();

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
  const day = isDaytime(date);
  const gamer = hasGamerDesk(state);
  const p = computeProgress(state);
  const sw = state.stopwatch;

  // ------------------------------------------------------------ migas de pan
  const crumbs: { label: string; onClick?: () => void }[] = [];
  const atHome = nav.scene === "room" && !nav.section;
  if (!atHome) {
    crumbs.push({ label: "Habitación", onClick: nav.scene === "desk" ? leaveDesk : closeSection });
    if (nav.scene === "desk") crumbs.push({ label: "Escritorio", onClick: nav.section ? closeSection : undefined });
    if (nav.section) crumbs.push({ label: SECTION_LABEL[nav.section] });
  }

  const props = { state, actions, today };
  let panel: ReactNode;
  switch (nav.section) {
    case "habits":
      panel = <HabitsSection {...props} />;
      break;
    case "activity":
      panel = (
        <ActivitySection
          {...props}
          actions={{
            ...actions,
            setSprite: (st) => {
              actions.setSprite(st);
              setCam(camForSprite(st));
            },
          }}
        />
      );
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
          <Home
            state={state}
            today={today}
            onHabits={() => open("habits", ROOM_ZOOM.board)}
            onDesk={enterDesk}
          />
        );
  }

  const doneCount = state.habits.filter((h) => h.history.includes(today)).length;

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

      <div className="relative bg-black/20">
        <Stage
          cam={nav.cam}
          animate={nav.animate}
          backdrop={backdropFor(nav.scene, day, gamer)}
          render={(u) => (
            <div key={nav.scene} className="animate-fadein absolute inset-0">
              {nav.scene === "room" ? (
                <RoomScene
                  u={u}
                  day={day}
                  hour={date.getHours()}
                  minute={date.getMinutes()}
                  sprite={state.currentState}
                  gamer={gamer}
                  heat={heat}
                  labels={!nav.section}
                  onDesk={enterDesk}
                  onBoard={() => open("habits", ROOM_ZOOM.board)}
                  onBed={() => open("activity", ROOM_ZOOM.bed)}
                />
              ) : (
                <DeskScene
                  u={u}
                  day={day}
                  gamer={gamer}
                  startedAt={sw?.startedAt ?? null}
                  coins={state.coins}
                  labels={!nav.section}
                  onItem={openItem}
                />
              )}
            </div>
          )}
        />
        {sw && (
          <div className="pointer-events-none absolute left-3 top-3 z-30 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono">
              <Elapsed since={sw.startedAt} />
            </span>
            <span className="text-white/60">{state.goals.find((g) => g.id === sw.goalId)?.name}</span>
          </div>
        )}
        <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
          {SPRITE_LABELS[state.currentState]}
        </div>
      </div>

      <main className="-mt-3 flex-1 rounded-t-3xl border-t border-line bg-bg px-4 pb-10 pt-4">
        {crumbs.length > 0 && (
          <nav aria-label="Navegación" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted">›</span>}
                {c.onClick ? (
                  <button onClick={c.onClick} className="rounded-lg px-1.5 py-0.5 text-accent hover:bg-raised">
                    {i === 0 ? "← " : ""}
                    {c.label}
                  </button>
                ) : (
                  <span className="px-1.5 py-0.5 font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div key={`${nav.scene}-${nav.section}`} className="animate-rise">
          {panel}
        </div>
        {atHome && (
          <p className="mt-6 text-center text-xs text-muted">
            {doneCount}/{state.habits.length} hábitos hoy · toca el escritorio, el tablero o la cama
          </p>
        )}
      </main>
    </div>
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
    <div>
      <p className="section-title">Sobre la mesa</p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <button key={i.k} onClick={() => onPick(i.k)} className="card text-left transition-colors hover:border-muted/60">
            <p className="font-medium">{i.title}</p>
            <p className="text-sm text-muted">{i.sub}</p>
          </button>
        ))}
      </div>
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
