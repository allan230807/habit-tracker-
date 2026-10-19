"use client";

import { useState } from "react";
import type { GameActions } from "@/hooks/useGameEngine";
import { QUICK_ACTIONS, SHOP_ITEMS, formatDate } from "@/lib/gameLogic";
import { COIN } from "@/lib/sprites";
import type { GameState } from "@/lib/types";
import { PixelArt } from "./PixelArt";

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

export default function Ledger({ state, actions }: { state: GameState; actions: GameActions }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [showAll, setShowAll] = useState(false);

  const sorted = [...state.transactions].sort((a, b) => b.ts - a.ts);
  const rows = showAll ? sorted : sorted.slice(0, 30);

  return (
    <>
      <section className="panel !border-neon-lime text-center">
        <p className="uppercase text-zinc-500">Saldo</p>
        <div className="flex items-center justify-center gap-3">
          <PixelArt rows={COIN} px={5} />
          <span
            className={`text-8xl leading-none ${state.coins < 0 ? "text-neon-magenta" : "text-neon-lime"}`}
            style={{ textShadow: "0 0 12px currentColor" }}
          >
            {state.coins}
          </span>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => actions.addTransaction(a.amount, a.label)}
              className={`btn ${a.amount > 0 ? "btn-lime" : "btn-magenta"} flex justify-between gap-2 text-left`}
            >
              <span>{a.label}</span>
              <span>{signed(a.amount)}</span>
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2 border-t-2 border-line pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addTransaction(Number(amount), label);
            setLabel("");
            setAmount("");
          }}
        >
          <input className="input" placeholder="Concepto" value={label} onChange={(e) => setLabel(e.target.value)} />
          <input
            className="input !w-24"
            placeholder="±"
            inputMode="numeric"
            pattern="-?[0-9]*"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="btn">+</button>
        </form>
      </section>

      <section className="panel !border-neon-magenta">
        <h2 className="panel-title !text-neon-magenta">Tienda</h2>
        <ul className="space-y-2">
          {SHOP_ITEMS.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2">
              <span>{i.name}</span>
              <button className="btn btn-magenta" disabled={state.coins < i.price} onClick={() => actions.buyItem(i.id)}>
                -{i.price}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t-2 border-line pt-3">
          <p className="uppercase text-zinc-500">Inventario</p>
          {state.inventory.length === 0 ? (
            <p className="text-zinc-600">Vacío.</p>
          ) : (
            <ul className="flex flex-wrap gap-2 pt-1">
              {state.inventory.map((i) => (
                <li key={i.id} className="border-2 border-neon-cyan px-2 text-neon-cyan">
                  {i.name} ×{i.qty}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Ledger</h2>
        {sorted.length === 0 ? (
          <p className="text-zinc-600">Sin movimientos.</p>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b-2 border-line text-left uppercase text-zinc-500">
                <th className="w-14 py-1">Monto</th>
                <th>Concepto</th>
                <th className="w-32 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-line/60 align-top">
                  <td className={`py-1 ${t.amount > 0 ? "text-neon-lime" : "text-neon-magenta"}`}>{signed(t.amount)}</td>
                  <td className="break-words pr-2">{t.label}</td>
                  <td className="py-1 text-right text-zinc-400">{formatDate(t.date)}</td>
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
    </>
  );
}
