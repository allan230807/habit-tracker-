import { BED, DEPTH, LANE, SPOTS } from "../art/layout";
import { POSES, walkPose } from "../art/poses";
import { lerpPose, renderCharacter, type Pose, type Prop, type Rendered } from "../art/skeleton";

/*
 * Personaje autónomo. Una cola de pasos (caminar, animar poses, esperar)
 * describe cada actividad; el actor decide solo cuál hacer según la hora y si
 * hay un cronómetro en marcha. Las poses se interpolan, así que nunca "salta".
 */

export type Layer = "front" | "mid";
type Ctx = "stand" | "desk" | "bed" | "cushion" | "kneel";
type BedState = "none" | "edge" | "propped" | "lying";

interface Frame {
  pose: Pose;
  ms: number;
  dx?: number;
  dy?: number;
}

type Step =
  | { k: "walk"; x: number }
  | { k: "frames"; frames: Frame[] }
  | { k: "hold"; ms: number; pose: (t: number, a: Actor) => Pose; until?: (a: Actor) => boolean }
  | { k: "do"; fn: (a: Actor) => void };

export interface Inputs {
  night: boolean;
  working: boolean;
}

export interface ActorFrame {
  sprite: Rendered["sprite"];
  /** Esquina inferior izquierda en px lógicos del mundo. */
  left: number;
  bottom: number;
  layer: Layer;
  sleeping: boolean;
  inBed: boolean;
  bed: BedState;
  bookGap: boolean;
}

const ease = (p: number) => p * p * (3 - 2 * p);
const WALK_SPEED = 34;
const STRIDE_HZ = 1.55;
const MIN_X = 6;
const MAX_X = 122;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

const breathe = (base: Pose, amp = 1) => (t: number): Pose => ({
  ...base,
  torso: base.torso + 0.9 * amp * Math.sin(t / 900),
  head: base.head + 1.3 * amp * Math.sin(t / 1400 + 1),
});

const F = (pose: Pose, ms: number, dx = 0, dy = 0): Frame => ({ pose, ms, dx, dy });

export class Actor {
  x = 70;
  y = LANE;
  facing: 1 | -1 = 1;
  layer: Layer = "front";
  prop: Prop = "none";
  bookTaken = false;
  bookColor = "#5f7387";
  ctx: Ctx = "stand";
  bed: BedState = "none";
  activity = "idle";
  inputs: Inputs = { night: false, working: false };

  private shown: Pose = POSES.stand;
  private from: Pose = POSES.stand;
  private phase = 0;
  private queue: Step[] = [];
  private cur: Step | null = null;
  private t = 0;
  private fi = 0;
  private ft = 0;
  private fe = 0;
  private fFrom: Pose = POSES.stand;
  private last = "";
  private clock = 0;
  private blinkAt = 2500;

  constructor(night: boolean) {
    this.inputs.night = night;
    if (night) {
      // arranca ya dormido en la cama
      this.x = SPOTS.bedHead;
      this.y = DEPTH;
      this.layer = "mid";
      this.ctx = "bed";
      this.bed = "lying";
      this.activity = "sleep";
      this.shown = POSES.lying;
      this.queue = [this.sleepHold()];
    }
  }

  // ------------------------------------------------------------------ estado

  get sleeping() {
    return this.bed === "lying";
  }

  setInputs(next: Inputs) {
    const prev = this.inputs;
    this.inputs = next;
    if (next.working && !prev.working && this.activity !== "work") this.interrupt("work");
  }

  // ----------------------------------------------------------------- simulación

  update(dtMs: number) {
    const dt = Math.min(dtMs, 100);
    this.clock += dt;
    let remaining = dt;
    for (let guard = 0; guard < 10; guard++) {
      if (!this.cur) {
        this.cur = this.queue.shift() ?? this.decide();
        if (!this.cur) break;
        this.t = 0;
        this.fi = 0;
        this.ft = 0;
        this.fe = 0;
        this.from = this.shown;
        this.fFrom = this.shown;
      }
      const done = this.run(this.cur, remaining);
      remaining = 0;
      if (!done) break;
      this.cur = null;
    }
  }

  private run(step: Step, dt: number): boolean {
    switch (step.k) {
      case "do":
        step.fn(this);
        return true;
      case "walk": {
        const dist = step.x - this.x;
        if (Math.abs(dist) > 0.4) this.facing = dist > 0 ? 1 : -1;
        const move = Math.min(Math.abs(dist), (WALK_SPEED * dt) / 1000);
        this.x += Math.sign(dist) * move;
        this.phase = (this.phase + (dt / 1000) * STRIDE_HZ) % 1;
        this.t += dt;
        this.shown = lerpPose(this.from, walkPose(this.phase), ease(Math.min(1, this.t / 240)));
        return Math.abs(step.x - this.x) < 0.3;
      }
      case "hold": {
        this.t += dt;
        const target = step.pose(this.t, this);
        this.shown = lerpPose(this.from, target, ease(Math.min(1, this.t / 280)));
        return this.t >= step.ms || (!!step.until && this.t > 300 && step.until(this));
      }
      case "frames": {
        this.ft += dt;
        for (let n = 0; n < 6; n++) {
          const f = step.frames[this.fi];
          const p = f.ms <= 0 ? 1 : Math.min(1, this.ft / f.ms);
          const e = ease(p);
          this.x += (f.dx ?? 0) * (e - this.fe);
          this.y += (f.dy ?? 0) * (e - this.fe);
          this.fe = e;
          this.shown = lerpPose(this.fFrom, f.pose, e);
          if (p < 1) return false;
          this.fFrom = f.pose;
          this.fi++;
          this.ft = Math.max(0, this.ft - f.ms);
          this.fe = 0;
          if (this.fi >= step.frames.length) return true;
        }
        return false;
      }
    }
  }

  // ------------------------------------------------------------------ decisiones

  private decide(): Step | null {
    this.activity = "idle";
    let steps: Step[];
    if (this.inputs.working) steps = this.work();
    else if (this.inputs.night) steps = this.bed === "lying" ? [this.sleepHold()] : this.sleep();
    else if (this.bed === "lying") steps = this.wake();
    else {
      const options: [string, number, () => Step[]][] = [
        ["read", 3, () => this.readCushion()],
        ["readBed", 1.6, () => this.bedSession("book")],
        ["phone", 1.4, () => this.bedSession("phone")],
        ["write", 1.8, () => this.write()],
        ["pray", 1.2, () => this.pray()],
        ["stretch", 1, () => this.stretch()],
        ["wander", 1.4, () => this.wander()],
      ];
      const pool = options.filter(([n]) => n !== this.last);
      let r = Math.random() * pool.reduce((a, [, w]) => a + w, 0);
      let pick = pool[0];
      for (const o of pool) {
        r -= o[1];
        if (r <= 0) {
          pick = o;
          break;
        }
      }
      this.last = pick[0];
      steps = pick[2]();
    }
    this.queue = steps.slice(1);
    return steps[0] ?? null;
  }

  /** Corta lo que esté haciendo, vuelve a ponerse de pie y empieza otra actividad. */
  private interrupt(next: "work") {
    this.queue = next === "work" ? this.work() : [];
    this.cur = null;
  }

  // ------------------------------------------------------------------ salidas

  private set(patch: { layer?: Layer; ctx?: Ctx; bed?: BedState; prop?: Prop; book?: boolean }): Step {
    return {
      k: "do",
      fn: (a) => {
        if (patch.layer) a.layer = patch.layer;
        if (patch.ctx) a.ctx = patch.ctx;
        if (patch.bed) a.bed = patch.bed;
        if (patch.prop) a.prop = patch.prop;
        if (patch.book !== undefined) a.bookTaken = patch.book;
      },
    };
  }

  private face(dir: 1 | -1): Step {
    return { k: "do", fn: (a) => (a.facing = dir) };
  }

  /** Pasos para volver a estar de pie en el piso desde el contexto actual. */
  private exit(): Step[] {
    const drop = this.set({ prop: "none", book: false });
    switch (this.ctx) {
      case "desk":
        return [
          drop,
          { k: "frames", frames: [F(POSES.squat, 380, -3), F(POSES.stand, 360, -1, -(this.y - LANE))] },
          this.set({ layer: "front", ctx: "stand", bed: "none" }),
        ];
      case "bed": {
        const steps: Step[] = [drop];
        if (this.bed === "lying") steps.push({ k: "frames", frames: [F(POSES.slide, 650, -8), F(POSES.proppedPhone, 700, -12)] }, this.set({ bed: "propped" }));
        if (this.bed === "lying" || this.bed === "propped")
          steps.push({ k: "frames", frames: [F(POSES.scootB, 500, 14), F(POSES.scootA, 520, 14), F(POSES.sitEdge, 520, 10)] }, this.set({ bed: "edge" }));
        steps.push(
          { k: "frames", frames: [F(POSES.squat, 380, 4, -(DEPTH - LANE) / 2), F(POSES.stand, 420, 6, -(DEPTH - LANE) / 2)] },
          this.set({ layer: "front", ctx: "stand", bed: "none" }),
        );
        return steps;
      }
      case "cushion":
      case "kneel":
        return [
          drop,
          { k: "frames", frames: [F(POSES.crouch, 420), F(POSES.stand, 420)] },
          this.set({ layer: "front", ctx: "stand", bed: "none" }),
        ];
      default:
        return [drop];
    }
  }

  // ---------------------------------------------------------------- actividades

  private idleFor(ms: number): Step {
    return { k: "hold", ms, pose: breathe(POSES.stand) };
  }

  private walkTo(x: number): Step {
    return { k: "walk", x: Math.max(MIN_X, Math.min(MAX_X, x)) };
  }

  private wander(): Step[] {
    this.activity = "wander";
    const x = rand(14, 118);
    return [
      this.walkTo(x),
      { k: "hold", ms: rand(2500, 5000), pose: breathe(POSES.think) },
    ];
  }

  private stretch(): Step[] {
    this.activity = "stretch";
    return [
      this.walkTo(rand(40, 90)),
      { k: "frames", frames: [F(POSES.stretch, 800)] },
      { k: "hold", ms: 1600, pose: breathe(POSES.stretch, 1.4) },
      { k: "frames", frames: [F(POSES.stretchSide, 700), F(POSES.stretch, 600), F(POSES.stand, 700)] },
      this.idleFor(900),
    ];
  }

  private pray(): Step[] {
    this.activity = "pray";
    return [
      this.walkTo(SPOTS.rug),
      this.face(1),
      this.set({ ctx: "kneel" }),
      { k: "frames", frames: [F(POSES.crouch, 520), F(POSES.kneel, 620)] },
      { k: "hold", ms: rand(12000, 18000), pose: breathe(POSES.kneel, 1.6) },
      { k: "frames", frames: [F(POSES.crouch, 520), F(POSES.stand, 520)] },
      this.set({ ctx: "stand" }),
      this.idleFor(1200),
    ];
  }

  private write(): Step[] {
    this.activity = "write";
    const strokes = (t: number): Pose => {
      const a = Math.sin(t / 260);
      const b = Math.sin(t / 830);
      return {
        ...POSES.write,
        armF: [POSES.write.armF[0] + 4 * b, POSES.write.armF[1] + 7 * a],
        torso: POSES.write.torso + 1.2 * b,
      };
    };
    return [
      this.walkTo(SPOTS.board),
      this.face(1),
      this.set({ prop: "marker" }),
      { k: "frames", frames: [F(POSES.write, 650)] },
      { k: "hold", ms: rand(7000, 11000), pose: strokes },
      { k: "frames", frames: [F(POSES.think, 800, -3)] },
      { k: "hold", ms: 2200, pose: breathe(POSES.think) },
      { k: "frames", frames: [F(POSES.write, 650, 3)] },
      { k: "hold", ms: rand(4000, 7000), pose: strokes },
      { k: "frames", frames: [F(POSES.stand, 700)] },
      this.set({ prop: "none" }),
      this.idleFor(700),
    ];
  }

  private takeBook(): Step[] {
    const colors = ["#5f7387", "#a3685e", "#6f8f7d", "#8a6f9a", "#c9a66b", "#5d6f8f"];
    return [
      this.walkTo(SPOTS.bookcase),
      this.face(-1),
      { k: "frames", frames: [F(POSES.browse, 520)] },
      { k: "hold", ms: 900, pose: (t) => ({ ...POSES.browse, head: POSES.browse.head + 6 * Math.sin(t / 220) }) },
      { k: "frames", frames: [F(POSES.reach, 650)] },
      { k: "hold", ms: 550, pose: breathe(POSES.reach, 0.5) },
      {
        k: "do",
        fn: (a) => {
          a.bookTaken = true;
          a.bookColor = colors[Math.floor(Math.random() * colors.length)];
          a.prop = "book_closed";
        },
      },
      { k: "frames", frames: [F(POSES.carry, 600)] },
    ];
  }

  private returnBook(): Step[] {
    return [
      this.walkTo(SPOTS.bookcase),
      this.face(-1),
      { k: "frames", frames: [F(POSES.reach, 650)] },
      { k: "hold", ms: 450, pose: breathe(POSES.reach, 0.5) },
      this.set({ prop: "none", book: false }),
      { k: "frames", frames: [F(POSES.stand, 650)] },
      this.idleFor(700),
    ];
  }

  private readCushion(): Step[] {
    this.activity = "read";
    return [
      ...this.takeBook(),
      this.walkTo(SPOTS.cushion),
      this.face(1),
      this.set({ ctx: "cushion", prop: "book_open" }),
      { k: "frames", frames: [F(POSES.crouch, 520, 1), F(POSES.sitFloor, 620, 1)] },
      {
        k: "hold",
        ms: rand(22000, 38000),
        pose: (t) => ({
          ...POSES.sitFloor,
          head: POSES.sitFloor.head + 5 * Math.sin(t / 1100) * Math.sin(t / 5300),
          torso: POSES.sitFloor.torso + 0.8 * Math.sin(t / 1000),
        }),
      },
      this.set({ prop: "book_closed" }),
      { k: "frames", frames: [F(POSES.crouch, 520), F(POSES.carry, 520)] },
      this.set({ ctx: "stand" }),
      ...this.returnBook(),
    ];
  }

  /** Se sube a la cama (de pie → sentado en el borde → recostado contra el cabecero). */
  private getInBed(prop: Prop, pose: Pose): Step[] {
    return [
      this.walkTo(SPOTS.bedFoot),
      this.face(1),
      this.set({ ctx: "bed", layer: "mid", bed: "edge" }),
      { k: "frames", frames: [F(POSES.squat, 380, -3, (DEPTH - LANE) / 2), F(POSES.sitEdge, 440, -9, (DEPTH - LANE) / 2)] },
      { k: "hold", ms: 700, pose: breathe(POSES.sitEdge) },
      this.set({ prop, bed: "propped" }),
      {
        k: "frames",
        frames: [F(POSES.scootA, 520, -12), F(POSES.scootB, 520, -14), F(pose, 560, -12)],
      },
    ];
  }

  private getOutOfBed(): Step[] {
    return [
      { k: "frames", frames: [F(POSES.scootB, 480, 12), F(POSES.scootA, 520, 14), F(POSES.sitEdge, 520, 12)] },
      this.set({ bed: "edge" }),
      { k: "hold", ms: 500, pose: breathe(POSES.sitEdge) },
      { k: "frames", frames: [F(POSES.squat, 400, 5, -(DEPTH - LANE) / 2), F(POSES.stand, 420, 4, -(DEPTH - LANE) / 2)] },
      this.set({ layer: "front", ctx: "stand", bed: "none" }),
      this.idleFor(900),
    ];
  }

  private bedSession(kind: "book" | "phone"): Step[] {
    this.activity = kind === "book" ? "readBed" : "phone";
    const prop: Prop = kind === "book" ? "book_open" : "phone";
    const pose = kind === "book" ? POSES.proppedBook : POSES.proppedPhone;
    const intro = kind === "book" ? this.takeBook() : [];
    const outro = kind === "book" ? this.returnBook() : [];
    return [
      ...intro,
      ...this.getInBed(prop, pose),
      {
        k: "hold",
        ms: rand(20000, 32000),
        pose: (t) => ({
          ...pose,
          head: pose.head + 4 * Math.sin(t / 1200) * Math.sin(t / 4700),
          armF: [pose.armF[0] + (kind === "phone" ? 2.5 * Math.sin(t / 380) : 0), pose.armF[1] + (kind === "phone" ? 3 * Math.sin(t / 380) : 0)],
        }),
      },
      this.set({ prop: kind === "book" ? "book_closed" : "none" }),
      ...this.getOutOfBed(),
      ...outro,
    ];
  }

  private sleepHold(): Step {
    return {
      k: "hold",
      ms: Infinity,
      pose: (t) => ({ ...POSES.lying, torso: POSES.lying.torso + 0.9 * Math.sin(t / 1100), head: POSES.lying.head + 0.6 * Math.sin(t / 1100) }),
      until: (a) => !a.inputs.night || a.inputs.working,
    };
  }

  private sleep(): Step[] {
    this.activity = "sleep";
    return [
      ...this.getInBed("none", POSES.proppedPhone),
      { k: "hold", ms: 1800, pose: breathe(POSES.proppedPhone) },
      { k: "frames", frames: [F(POSES.slide, 760, 8), F(POSES.lying, 900, 12)] },
      this.set({ bed: "lying" }),
      this.sleepHold(),
    ];
  }

  private wake(): Step[] {
    this.activity = "wake";
    return [
      { k: "hold", ms: 1200, pose: breathe(POSES.lying) },
      { k: "frames", frames: [F(POSES.slide, 700, -8), F(POSES.proppedPhone, 760, -12)] },
      this.set({ bed: "propped" }),
      ...this.getOutOfBed(),
      ...this.stretch(),
    ];
  }

  private work(): Step[] {
    this.activity = "work";
    const typing = (t: number): Pose => {
      const a = Math.sin(t / 150);
      const b = Math.sin(t / 190 + 1.6);
      const lean = Math.sin(t / 3100);
      return {
        ...POSES.sitChair,
        torso: POSES.sitChair.torso + 1.5 * lean,
        head: POSES.sitChair.head + 2.5 * Math.sin(t / 2300),
        armF: [POSES.sitChair.armF[0], POSES.sitChair.armF[1] + 3.2 * a],
        armB: [POSES.sitChair.armB[0], POSES.sitChair.armB[1] + 3.2 * b],
      };
    };
    return [
      ...(this.ctx === "stand" ? [] : this.exit()),
      this.walkTo(SPOTS.chair - 5),
      this.face(1),
      this.set({ ctx: "desk", layer: "mid" }),
      { k: "frames", frames: [F(POSES.squat, 380, 2, (DEPTH - LANE) / 2), F(POSES.sitChair, 460, 3, (DEPTH - LANE) / 2)] },
      {
        k: "hold",
        ms: Infinity,
        pose: typing,
        until: (a) => !a.inputs.working,
      },
      ...this.exit(),
    ];
  }

  // ---------------------------------------------------------------- dibujo

  /** Fotograma actual listo para pintar. */
  frame(): ActorFrame {
    const t = this.clock;
    let pose = this.shown;
    // parpadeo
    if (pose.eyes < 0.5) {
      if (t > this.blinkAt) {
        if (t < this.blinkAt + 140) pose = { ...pose, eyes: 1 };
        else this.blinkAt = t + rand(2500, 6000);
      }
    }
    const r = renderCharacter(pose, { facing: this.facing, prop: this.prop, bookColor: this.bookColor });
    return {
      sprite: r.sprite,
      left: this.x + r.ox,
      bottom: this.y + r.oy,
      layer: this.layer,
      sleeping: this.bed === "lying",
      inBed: this.ctx === "bed",
      bed: this.bed,
      bookGap: this.bookTaken,
    };
  }
}

export { BED };
