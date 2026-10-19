"use client";

import { useState } from "react";
import { Pixel } from "@/components/Pixel";
import { QUICK_ACTIONS, SHOP_ITEMS, formatDate } from "@/lib/gameLogic";
import { Sprite } from "@/lib/pixel";
import type { SectionProps } from "./types";

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

function coinSprite() {
  const s = new Sprite(9, 9);
  s.ellipse(4.5, 4.5, 4.5, 4.5, "#8a6a22");
  s.ellipse(4.5, 4.5, 3.7, 3.7, "#d9b24a");
  s.rect(4, 2, 1, 5, "#a3801f");
  s.set(2, 3, "#f1d98a");
  s.set(3, 2, "#f1d98a");
  return s;
}

const COIN = coinSprite();

export default function WalletSection({ state, actions }: SectionProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [showAll, setShowAll] = useState(false);

  const sorted = [...state.transactions].sort((a, b) => b.ts - a.ts);
  const rows = showAll ? sorted : sorted.slice(0, 30);

  return (
    <div className="space-y-4">
      <section className="card text-center">
        <p className="section-title !mb-1">Saldo</p>
        <div className="flex items-center justify-center gap-3">
          <Pixel sprite={COIN} u={4} />
          <span className={`font-mono text-6xl font-medium tabular-nums ${state.coins < 0 ? "text-rose" : "text-fg"}`}>{state.coins}</span>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => actions.addTransaction(a.amount, a.label)}
              className="btn !justify-between text-left"
            >
              <span>{a.label}</span>
              <span className={`font-mono ${a.amount > 0 ? "text-accent" : "text-rose"}`}>{signed(a.amount)}</span>
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2 border-t border-line pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addTransaction(Number(amount), label);
            setLabel("");
            setAmount("");
          }}
        >
          <input className="input" placeholder="Concepto" value={label} onChange={(e) => setLabel(e.target.value)} />
          <input
            className="input !w-20 text-center"
            placeholder="±"
            inputMode="numeric"
            pattern="-?[0-9]*"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="btn">Añadir</button>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Tienda</h2>
        <ul className="space-y-2">
          {SHOP_ITEMS.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2">
              <span>{i.name}</span>
              <button className="btn !py-1.5" disabled={state.coins < i.price} onClick={() => actions.buyItem(i.id)}>
                <span className="font-mono text-sand">{i.price}</span> Comprar
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-line pt-3">
          <p className="section-title !mb-2">Inventario</p>
          {state.inventory.length === 0 ? (
            <p className="text-sm text-muted">Vacío.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {state.inventory.map((i) => (
                <li key={i.id} className="chip !text-fg">
                  {i.name} <span className="text-muted">×{i.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Historial</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">Sin movimientos.</p>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="w-14 pb-2 font-medium">Monto</th>
                <th className="pb-2 font-medium">Concepto</th>
                <th className="w-28 pb-2 text-right font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-line/50 align-top last:border-0">
                  <td className={`py-2 font-mono ${t.amount > 0 ? "text-accent" : "text-rose"}`}>{signed(t.amount)}</td>
                  <td className="break-words py-2 pr-2">{t.label}</td>
                  <td className="py-2 text-right text-muted">{formatDate(t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {sorted.length > 30 && (
          <button className="btn mt-3 w-full" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Ver menos" : `Ver todo (${sorted.length})`}
          </button>
        )}
      </section>
    </div>
  );
}
