// SONG SHOW — the shared sing-along engine for Tiny Sparks long songs (16:9) built from ACE-Step takes.
// A song file gives its FORM (section name + sung line count, in the song.json form order) and its teaching
// visuals; the engine does the rest the same way every time (kids learn the routine):
//   chorus "SING WITH ME!" · quiz card (parts + "?", THINK ring, answer pop, confetti) · actions "DO IT WITH US!"
//   (the cast does the move) · karaoke chorus "NOW YOU SING!" (only when the take left room for it) · slow pass
//   (each item, then YOUR TURN) · end line + star wipe · the lyric bar with the bouncing ball.
// Every time comes from the take's song.X.gen.ts, so one song file renders any take (A/B/C = one video each).
import React from 'react';
import { Kid, type KArm } from './kid';
import { Critter, type CArm } from './critter';
import { BOBO_HERO, HOOT_HERO, LEO_HERO, MILA_HERO } from './cast/tiny-sparks';
import { FLOOR } from './sets';
import { Backdrop, PlaceLight, standY, type Place, type PlaceFx } from './places';
import { Confetti, FONT_TOON, PopText, SingAlong, ThinkTimer } from './kit';
import { speechAt } from './acting';
import { KINK, kst } from './face';
import { ActionStage, StarWipe, directorCam, type Shot } from './energy';
import { EASE_OUT, prog, timeWords, type VoLine } from '../shorts';

export const SW = 1920;
export const SH = 1080;
export const SF = FLOOR(SH);
export const CARD: [number, number] = [1450, 320];
export const CARD_W = 520;
export const CARD_H = 400;
export const LEFT: [number, number] = [430, 320]; // centre of the big teaching area (top left)

export type FormSpec = [string, number[]][]; // SONG_FORM from tools/align_sung.py: section + the slots (its lines) sung
export type Seg = { name: string; occ: number; lines: number[]; slots: number[]; t0: number; t1: number };
export type Show = {
  song: VoLine[];
  beat: number;
  bar: number;
  duration: number;
  segs: Seg[];
  S: (i: number) => number;
  E: (i: number) => number;
  all: (name: string) => Seg[];
  segAt: (t: number) => Seg;
  /** start of slot k of the seg (its k-th line in song.json); if the take skipped it: the next sung slot, else the seg's end */
  at: (seg: Seg, k: number) => number;
  endOf: (seg: Seg, k: number) => number;
  has: (seg: Seg, k: number) => boolean;
  karOn: boolean;
  kar0: number;
  karaoke: VoLine[];
  end: number; // the star wipe
  last: number;
};

const shift = (l: VoLine, d: number): VoLine => ({ ...l, start: l.start + d, end: l.end + d, words: (l.words ?? []).map((w) => ({ ...w, start: w.start + d, end: w.end + d })) });

export function buildShow(song: VoLine[], beat: number, duration: number, form: FormSpec): Show {
  const S = (i: number) => song[i].start;
  const E = (i: number) => song[i].end;
  const segs: Seg[] = [];
  const occ: Record<string, number> = {};
  let li = 0;
  for (const [name, slots] of form) {
    occ[name] = (occ[name] ?? -1) + 1;
    const lines = slots.map((_, k) => li + k);
    li += slots.length;
    segs.push({ name, occ: occ[name], lines, slots, t0: S(lines[0]) - 0.35, t1: 0 });
  }
  if (li !== song.length) throw new Error(`song-show: SONG_FORM has ${li} lines, SONG has ${song.length}`);
  // karaoke: the take's longest vocal gap between two sections in the 2nd half, if a whole chorus fits in it
  const ch = segs.find((g) => g.name === 'chorus' && g.slots.length === 4) ?? segs.find((g) => g.name === 'chorus')!;
  const chorusLen = E(ch.lines[ch.lines.length - 1]) - S(ch.lines[0]);
  let kar0 = 0;
  let karOn = false;
  let gi = -1;
  let gap = 0;
  for (let i = 1; i < segs.length; i++) {
    const a = E(segs[i - 1].lines[segs[i - 1].lines.length - 1]);
    const g = S(segs[i].lines[0]) - a;
    if (a > duration * 0.35 && g > gap) { gap = g; gi = i; }
  }
  if (gi > 0 && gap >= chorusLen + 1.0) {
    karOn = true;
    kar0 = E(segs[gi - 1].lines[segs[gi - 1].lines.length - 1]) + 0.5;
    segs.splice(gi, 0, { name: 'karaoke', occ: 0, lines: [], slots: [], t0: kar0 - 0.35, t1: 0 });
  }
  const karaoke = karOn ? ch.lines.map((i) => shift(song[i], kar0 - S(ch.lines[0]))) : [];
  segs[0].t0 = -1;
  segs.forEach((g, i) => (g.t1 = i + 1 < segs.length ? segs[i + 1].t0 : 1e9));
  const has = (g: Seg, k: number) => g.slots.includes(k);
  const at = (g: Seg, k: number) => {
    const i = g.slots.indexOf(k);
    if (i >= 0) return S(g.lines[i]);
    const nx = g.slots.findIndex((x) => x > k);
    return nx >= 0 ? S(g.lines[nx]) : Math.max(g.t0 + 0.4, g.t1 - 0.6);
  };
  const endOf = (g: Seg, k: number) => {
    const i = g.slots.indexOf(k);
    return i >= 0 ? E(g.lines[i]) : at(g, k) + 0.4;
  };
  const last = song.length - 1;
  return {
    song, beat, bar: beat * 4, duration, segs, S, E, at, endOf, has, karOn, kar0, karaoke, last,
    end: duration - 2.0,
    all: (name) => segs.filter((g) => g.name === name),
    segAt: (t) => {
      let i = 0;
      while (i + 1 < segs.length && segs[i + 1].t0 <= t) i++;
      return segs[i];
    },
  };
}

/** the slot (song.json line index within the section) being sung or last sung; -1 before the first */
export const lineIn = (show: Show, seg: Seg, t: number) => {
  let k = -1;
  seg.lines.forEach((li, i) => { if (t >= show.S(li) - 0.2) k = seg.slots[i]; });
  return k;
};

// ── words → values (counting, moves) ────────────────────────────────────────────────────────────
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
export const NUMW: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
};
export type Key<V> = [number, V];
/** (time, value) for every word of these lines that `value` maps; value gets the word, the next word and the index */
export function wordKeys<V>(song: VoLine[], lines: number[], value: (w: string, next: string, i: number) => V | undefined): Key<V>[] {
  const out: Key<V>[] = [];
  for (const li of lines) {
    const ws = timeWords(song[li]);
    ws.forEach((w, i) => {
      const v = value(norm(w.w), i + 1 < ws.length ? norm(ws[i + 1].w) : '', i);
      if (v !== undefined) out.push([w.start, v]);
    });
  }
  return out.sort((a, b) => a[0] - b[0]);
}
export function keyAt<V>(keys: Key<V>[], t: number): Key<V> | undefined {
  let k: Key<V> | undefined;
  for (const x of keys) if (x[0] <= t) k = x;
  return k;
}

export const popIn = (t: number, at: number, d = 0.35) => {
  const p = prog(t, at, at + d);
  return p <= 0 ? 0 : p >= 1 ? 1 : EASE_OUT(p) + Math.sin(p * Math.PI) * 0.25 * (1 - p);
};

// ── drawing helpers ─────────────────────────────────────────────────────────────────────────────
export const Txt: React.FC<{ x?: number; y?: number; size: number; color?: string; text: string | number; stroke?: number; anchor?: 'middle' | 'start' | 'end' }> = ({
  x = 0, y = 0, size, color = '#ffffff', text, stroke, anchor = 'middle',
}) => (
  <text x={x} y={y + size * 0.35} textAnchor={anchor} fontFamily={FONT_TOON} fontWeight={700} fontSize={size} fill={color}
    stroke={KINK} strokeWidth={stroke ?? Math.max(3, size * 0.09)} paintOrder="stroke">{text}</text>
);

export const Card: React.FC<{ t: number; at: number; children: React.ReactNode; x?: number; y?: number; w?: number; h?: number; tint?: string; rot?: number }> = ({
  t, at, children, x = CARD[0], y = CARD[1], w = CARD_W, h = CARD_H, tint, rot = -2,
}) => (
  <g transform={`translate(${x},${y}) scale(${EASE_OUT(prog(t, at - 0.3, at))}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={50} fill="#ffffff" {...kst(10)} />
    {tint && <rect x={-w / 2 + 22} y={-h / 2 + 22} width={w - 44} height={h - 44} rx={36} fill={tint} opacity={0.16} />}
    {children}
  </g>
);

/** a row of parts ("19", "→", "?") — the "?" becomes the answer when it is sung */
export const QuizCard: React.FC<{ t: number; show: Show; seg: Seg; title: string; parts: string[]; answer: string; color?: string }> = ({ t, show, seg, title, parts, answer, color = '#ff6fa5' }) => {
  const ansAt = show.at(seg, 1) - 0.05;
  const done = t >= ansAt;
  const n = parts.length;
  const gap = Math.min(150, 460 / n);
  return (
    <Card t={t} at={show.at(seg, 0)} w={CARD_W + 40} tint={color}>
      <Txt y={-120} size={44} color={KINK} stroke={0} text={title} />
      {parts.map((p, i) => {
        const x = (i - (n - 1) / 2) * gap;
        if (p !== '?') return <Txt key={i} x={x} y={30} size={p.length > 2 ? 64 : 90} color={/[0-9]/.test(p) ? color : KINK} stroke={/[0-9]/.test(p) ? 8 : 0} text={p} />;
        return (
          <g key={i} transform={`translate(${x},30) scale(${done ? popIn(t, ansAt) : 1 + Math.sin(t * 6) * 0.05})`}>
            <rect x={-gap * 0.55 - (done && answer.length > 2 ? 30 : 0)} y={-62} width={gap * 1.1 + (done && answer.length > 2 ? 60 : 0)} height={124} rx={28} fill={done ? '#ffca3a' : '#ffffff'} {...kst(done ? 9 : 6)} />
            <Txt y={0} size={done ? (answer.length > 2 ? 64 : 84) : 84} color={done ? '#ffffff' : KINK} stroke={done ? 8 : 0} text={done ? answer : '?'} />
          </g>
        );
      })}
    </Card>
  );
};

// ── the cast ────────────────────────────────────────────────────────────────────────────────────
export type Move = 'dance' | 'clap' | 'stomp' | 'jump' | 'wiggle' | 'spin' | 'nose' | 'wave' | 'crouch' | 'cheer' | 'fingers';
const XS = [220, 640, 1290, 1700];

// The cast is the ENHANCED cast (Nov 2026 standard): `polish acting` (soft arms, cartoon hands, details,
// brows that lift with the voice), lips from speechAt (visemes), and on every CHORUS the whole gang sings
// along (kids choir). Pass `place` to light them like the set (PlaceLight) and stand them on its painted floor.
export const Cast: React.FC<{ t: number; show: Show; move?: Move; fingers?: number; present?: boolean; happy?: boolean; lift?: number; xs?: number[]; place?: Place }> = ({
  t, show, move = 'dance', fingers = 5, present = false, happy = false, lift = 0, xs = XS, place,
}) => {
  const ph = (t / show.beat) * Math.PI;
  const bar = Math.floor(t / show.bar);
  const swap = bar % 2 === 0;
  const onBeat = Math.abs(Math.sin(ph)) > 0.5;
  const singing = show.song.some((l) => t >= l.start && t < l.end);
  const pose = (k: number, kid: boolean): { armL: string; armR: string; hop: number; lean: number; squash: number; sx: number; dx: number } => {
    const d = (amp: number, p = k * 0.6) => Math.abs(Math.sin(ph + p)) * amp;
    switch (move) {
      case 'clap': return { armL: onBeat ? 'clap' : 'up', armR: onBeat ? 'clap' : 'up', hop: d(10), lean: 0, squash: 0, sx: 1, dx: 0 };
      case 'stomp': { const s = Math.abs(Math.sin(t * 7 + k)); return { armL: kid ? 'hip' : 'down', armR: kid ? 'hip' : 'down', hop: s * 22, lean: 0, squash: s < 0.15 ? 0.6 : 0, sx: 1, dx: 0 }; }
      case 'jump': return { armL: kid ? 'cheer' : 'up', armR: 'up', hop: Math.abs(Math.sin(t * 5 + k * 0.4)) * 95, lean: 0, squash: 0, sx: 1, dx: 0 };
      case 'wiggle': return { armL: 'wave', armR: 'wave', hop: d(8), lean: Math.sin(t * 11 + k) * 12, squash: 0, sx: 1, dx: Math.sin(t * 11 + k) * 10 };
      case 'spin': return { armL: 'up', armR: 'up', hop: d(14), lean: 0, squash: 0, sx: Math.cos(t * 5 + k), dx: 0 };
      case 'nose': return { armL: kid ? 'down' : 'down', armR: kid ? 'cover' : 'cheeks', hop: d(6), lean: 0, squash: 0, sx: 1, dx: 0 };
      case 'wave': return { armL: 'down', armR: 'wave', hop: d(10), lean: Math.sin(t * 4 + k) * 5, squash: 0, sx: 1, dx: 0 };
      case 'crouch': return { armL: 'hug', armR: 'hug', hop: 0, lean: Math.sin(t * 30) * 1.5, squash: 0.8, sx: 1, dx: Math.sin(t * 40 + k) * 2 };
      case 'cheer': return { armL: kid ? 'cheer' : 'cheer', armR: kid ? 'cheer' : 'cheer', hop: d(40), lean: 0, squash: 0, sx: 1, dx: 0 };
      case 'fingers': return { armL: kid ? 'count' : 'up', armR: kid ? 'wave' : 'up', hop: d(6), lean: 0, squash: 0, sx: 1, dx: 0 };
      default: return {
        armL: kid ? (swap ? 'up' : 'wave') : onBeat ? 'clap' : 'up',
        armR: kid ? (swap ? 'wave' : 'up') : onBeat ? 'clap' : 'up',
        hop: d(k === 1 && singing ? 10 : 24), lean: 0, squash: 0, sx: 1, dx: 0,
      };
    }
  };
  const wrap = (k: number, sx: number, node: React.ReactNode) => (
    <g key={k} transform={`translate(${xs[k]},0) scale(${Math.abs(sx) < 0.15 ? 0.15 * Math.sign(sx || 1) : sx},1) translate(${-xs[k]},${-lift})`}>{node}</g>
  );
  const expr = happy ? 'laugh' : 'happy';
  const p0 = pose(0, false), p1 = pose(1, true), p2 = pose(2, false), p3 = pose(3, true);
  const milaR = present && move === 'dance' ? 'present' : p1.armR;
  const lead = speechAt(show.song, 'mila', t);
  const choir = show.segAt(t).name === 'chorus' && lead.mouth > 0.05;
  // the friends sing a touch smaller than Mila (backing voices), same sound shape
  const back = choir ? { mouth: lead.mouth * 0.8, viseme: lead.viseme } : {};
  // the painted floor may RAISE a dancer, never sink one under the lyric bar (songs always have it)
  const fy = (k: number, s: number) => (place ? Math.min(SF, standY(place, xs[k], SW, SH, { halfW: 150 * s })) : SF);
  const cast = (
    <g>
      {wrap(0, p0.sx, <Critter polish acting spec={BOBO_HERO} x={xs[0] + p0.dx} y={fy(0, 0.44)} scale={0.44} expr={choir ? 'happy' : 'laugh'} look={[0.4, -0.2]} {...back} armL={p0.armL as CArm} armR={p0.armR as CArm} hop={p0.hop} tilt={p0.lean} squash={p0.squash} />)}
      {wrap(1, p1.sx, <Kid polish acting spec={MILA_HERO} x={xs[1] + p1.dx} y={fy(1, 0.52)} scale={0.52} expr={expr} look={[0.3, -0.2]} {...lead}
        armL={p1.armL as KArm} armR={milaR as KArm} fingersL={move === 'fingers' ? fingers : 0} hop={p1.hop} lean={p1.lean} squash={p1.squash} />)}
      {wrap(2, p2.sx, <Critter polish acting spec={HOOT_HERO} x={xs[2] + p2.dx} y={fy(2, 0.4)} scale={0.4} expr={happy || choir ? 'happy' : 'laugh'} look={[-0.2, -0.2]} {...back} armL={p2.armL as CArm} armR={p2.armR as CArm} hop={p2.hop} tilt={p2.lean} squash={p2.squash} />)}
      {wrap(3, p3.sx, <Kid polish acting spec={LEO_HERO} x={xs[3] + p3.dx} y={fy(3, 0.52)} scale={0.52} expr={choir ? 'happy' : 'laugh'} look={[-0.4, -0.2]} {...back}
        armL={p3.armL as KArm} armR={p3.armR as KArm} fingersL={move === 'fingers' ? fingers : 0} hop={p3.hop} lean={p3.lean} squash={p3.squash} />)}
    </g>
  );
  return place ? <PlaceLight place={place}>{cast}</PlaceLight> : cast;
};

// ── the stage + the shared overlays ─────────────────────────────────────────────────────────────
export const shotsFor = (show: Show): { shots: Shot[]; punches: number[] } => {
  const shots: Shot[] = [{ t: 0, z: 1.0, x: 960, y: 540, move: 'cut' }];
  const punches: number[] = [];
  for (const q of show.segs.filter((s) => /^q\d/.test(s.name))) {
    const a = show.at(q, 1);
    shots.push({ t: a - 0.05, z: 1.08, x: 1000, y: 500, move: 'snap' }, { t: show.endOf(q, 1) + 0.4, z: 1.0, x: 960, y: 540, move: 'smooth', dur: 0.8 });
    punches.push(a);
  }
  return { shots: shots.sort((x, y) => x.t - y.t), punches };
};

export const SongStage: React.FC<{ t: number; show: Show; place: Place; fx?: PlaceFx[]; children: React.ReactNode }> = ({ t, show, place, fx, children }) => {
  const { shots, punches } = shotsFor(show);
  const cam = directorCam(t, shots, punches);
  return (
    <ActionStage cam={cam} blur={cam.blur}>
      <Backdrop place={place} w={SW} h={SH} t={t} fx={fx ?? true} />
      {children}
    </ActionStage>
  );
};

/** the routine every Tiny Sparks song shares (screen space, after the stage) */
export const SongOverlays: React.FC<{ t: number; show: Show; endText: string; ball?: string }> = ({ t, show, endText, ball = '#ff595e' }) => {
  const seg = show.segAt(t);
  const { S, E } = show;
  const lastEnd = E(show.last);
  const kar = seg.name === 'karaoke';
  const slow = seg.name === 'slow' ? seg : undefined;
  const sk = slow ? lineIn(show, slow, t) : -1;
  const breaks: number[] = []; // long instrumental gaps in the take (not the karaoke one): DANCE BREAK!
  for (let i = 1; i < show.song.length; i++) {
    const a = E(i - 1);
    if (S(i) - a >= 8 && !(show.karOn && show.kar0 >= a && show.kar0 < S(i))) breaks.push(a + 0.6);
  }
  return (
    <>
      {breaks.map((b) => <PopText key={`db${b}`} t={t} at={b} until={b + 3.0} text="DANCE BREAK!" y={90} size={90} color="#ffca3a" />)}
      {show.all('chorus').map((c) => <PopText key={`c${c.occ}`} t={t} at={S(c.lines[0])} until={S(c.lines[0]) + 2.0} text="SING WITH ME!" y={90} size={80} color="#ffffff" />)}
      {show.all('chorus').map((c) => <Confetti key={`cf${c.occ}`} t={t} at={E(c.lines[c.lines.length - 1])} y={400} dur={1.4} />)}
      {show.karOn && <PopText t={t} at={show.kar0 - 0.3} until={show.kar0 + 2.4} text="NOW YOU SING!" y={90} size={100} color="#ff6fa5" />}
      {show.all('actions').map((a) => <PopText key={`a${a.occ}`} t={t} at={S(a.lines[0])} until={S(a.lines[0]) + 3} text="DO IT WITH US!" y={90} size={90} color="#ffffff" />)}
      {show.segs.filter((s) => /^q\d/.test(s.name)).map((q) => (
        <React.Fragment key={`${q.name}-${q.occ}`}>
          <ThinkTimer t={t} from={show.endOf(q, 0) + 0.1} to={Math.max(show.endOf(q, 0) + 0.3, show.at(q, 1) - 0.1)} x={1790} y={110} r={80} label="THINK!" />
          <Confetti t={t} at={show.at(q, 1) + 0.2} y={400} dur={1.1} />
        </React.Fragment>
      ))}
      {slow && sk === 0 && <PopText t={t} at={S(slow.lines[0])} until={show.at(slow, 1) - 0.2} text="NICE AND SLOW..." x={CARD[0]} y={380} size={86} color="#ffffff" />}
      {slow && sk >= 1 && t >= show.endOf(slow, sk) + 0.1 && t < show.at(slow, sk + 1) - 0.2 && t < lastEnd + 0.2 &&
        <PopText t={t} at={show.endOf(slow, sk) + 0.1} until={seg.t1} text="YOUR TURN!" x={CARD[0]} y={590} size={76} color="#ffca3a" />}
      {t >= lastEnd + 0.2 && <PopText t={t} at={lastEnd + 0.2} until={show.end + 1.5} text={endText} y={540} size={96} color="#ffca3a" />}
      <SingAlong t={t} lines={kar ? show.karaoke : show.song} ball={kar ? '#ff6fa5' : ball} />
      <StarWipe t={t} at={show.end + 1.4} dur={0.5} hold={5} color="#3b2a4a" x={SW / 2} y={SH * 0.45} />
    </>
  );
};

/** the slow pass card: item k is shown while its line (k+1) is sung and through the YOUR TURN gap */
export const SlowCard: React.FC<{ t: number; show: Show; items: string[]; color?: string }> = ({ t, show, items, color = '#4cc9f0' }) => {
  const seg = show.segAt(t);
  // a take that ENDS on the slow pass: the card leaves when the end line pops (no pile-up with it)
  if (seg.name !== 'slow' || t >= show.E(show.last) + 0.2) return null;
  const k = lineIn(show, seg, t) - 1;
  if (k < 0) return null;
  const s = items[Math.min(k, items.length - 1)];
  return (
    <g key={`slow${k}`} transform={`translate(${CARD[0]},${CARD[1] + 40}) scale(${popIn(t, show.at(seg, k + 1) - 0.2)})`}>
      <Txt size={s.length > 9 ? 84 : s.length > 5 ? 110 : 150} color={color} stroke={13} text={s} />
    </g>
  );
};
