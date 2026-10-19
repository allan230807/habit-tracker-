"use client";

import { useEffect, useMemo, useRef } from "react";
import { addDays, formatDate, monthLabel, weekday } from "@/lib/gameLogic";
import type { Habit } from "@/lib/types";

const WEEKS = 53;
const DAY_LABELS = ["", "L", "", "M", "", "V", ""];

/** Grilla tipo commits de GitHub: opacidad del color = hábitos completados / total ese día. */
export default function Heatmap({ habits, today }: { habits: Habit[]; today: string }) {
  const scroller = useRef<HTMLDivElement>(null);

  const { weeks, counts } = useMemo(() => {
    const lastSaturday = addDays(today, 6 - weekday(today));
    const start = addDays(lastSaturday, -(WEEKS * 7 - 1));
    const counts = new Map<string, number>();
    for (const h of habits) for (const d of h.history) counts.set(d, (counts.get(d) ?? 0) + 1);
    const weeks = Array.from({ length: WEEKS }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
    return { weeks, counts };
  }, [habits, today]);

  useEffect(() => {
    scroller.current?.scrollTo({ left: scroller.current.scrollWidth });
  }, []);

  const total = habits.length;

  return (
    <div className="flex gap-2">
      <div className="mt-[22px] grid shrink-0 grid-rows-7 gap-[3px] text-[10px] leading-[12px] text-muted">
        {DAY_LABELS.map((l, i) => (
          <span key={i} className="h-3">
            {l}
          </span>
        ))}
      </div>
      <div ref={scroller} className="overflow-x-auto pb-1">
        <div className="flex w-max gap-[3px]">
          {weeks.map((week, w) => {
            const first = week[0];
            const showMonth = Number(first.slice(8)) <= 7;
            return (
              <div key={first} className="flex flex-col gap-[3px]">
                <span className="h-4 text-[10px] leading-4 text-muted">{showMonth || w === 0 ? monthLabel(first) : ""}</span>
                {week.map((key) => {
                  const future = key > today;
                  const count = counts.get(key) ?? 0;
                  const ratio = total ? Math.min(1, count / total) : 0;
                  return (
                    <div
                      key={key}
                      title={`${formatDate(key)} · ${count}/${total}`}
                      className={`h-3 w-3 rounded-[3px] ${
                        future ? "border border-line/50" : count > 0 ? "bg-accent" : "bg-raised"
                      } ${key === today ? "ring-1 ring-fg/70" : ""}`}
                      style={count > 0 && !future ? { opacity: 0.25 + 0.75 * ratio } : undefined}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
