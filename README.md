# Habit Tracker

Tracker de hábitos, metas y finanzas personales (PWA, Next.js + Tailwind) donde
cada sección vive en un objeto de tu habitación en pixel art:

| Objeto | Sección |
| --- | --- |
| Tablero de la pared | Hábitos del día + heatmap anual |
| Cama / personaje | Qué está haciendo el personaje |
| Escritorio → Macbook | Metas y cronómetro |
| Escritorio → Teléfono | Estadísticas y estadísticas RPG |
| Escritorio → Cuaderno | To-do del día siguiente |
| Escritorio → Cartera | Monedas, acciones rápidas, tienda e historial |

Todo el estado se guarda en `localStorage` (`hooks/useGameEngine.ts`). El arte se
dibuja por código (`lib/pixel.ts`, `lib/art/*`): no hay imágenes.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```
