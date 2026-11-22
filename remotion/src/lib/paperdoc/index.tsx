// PAPERDOC — the drawn-documentary engine ("big stories, drawn small").
//
// A video is a list of SCENES, one per narration line. The engine does the montage itself:
//  · every scene arrives as a new paper sheet sliding over the last one (alternating sides),
//  · the camera never stops (slow push + drift), with a punch-in on the scene's key moment,
//  · every element is drawn in crayon (rough.js, line boil) and appears ON THE WORD the narrator says it,
//  · crayon characters (doodle.tsx) act in the corner or carry a whole scene.
// The composition is just: <PaperDoc vo={VO} scenes={SCENES} />. tools/paperdoc.py writes both from
// paper-docs/<slug>/doc.json (voice → timing → scenes.gen.ts → render → SFX → music).
import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadHand } from '@remotion/google-fonts/Kalam';
import { FONT_EDITORIAL } from '../../fonts';
import type { VoLine } from '../shorts';
import { timeWords } from '../shorts';
import { Grain } from '../collage';
import { CRAYON, CrayonDefs, INK, RCircle, RLine, RPath, RPoly, RRect, boilSeed } from './rough';
import { DOODLES, Doodle, Prop, type DoodleExpr, type DoodlePose, type DoodleProp, type DoodleSpec } from './doodle';

export { DOODLES } from './doodle';
export const FONT_HAND = loadHand('normal', { weights: ['400', '700'], subsets: ['latin'] }).fontFamily;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const EASE = Easing.bezier(0.33, 1, 0.68, 1);
const BACK = Easing.bezier(0.3, 1.4, 0.5, 1);
const prog = (t: number, a: number, b: number, e = EASE) => interpolate(t, [a, Math.max(a + 0.001, b)], [0, 1], { ...clamp, easing: e });

// ───────────────────────────── the script contract ─────────────────────────────
export type CastItem = {
  who: keyof typeof DOODLES | DoodleSpec;
  x: number; // 0..1 of the width
  y?: number; // 0..1 of the height (feet); default 0.9
  s?: number;
  pose?: DoodlePose;
  expr?: DoodleExpr;
  prop?: DoodleProp;
  facing?: 1 | -1;
  talk?: boolean; // mouth moves while the narrator speaks
  cue?: string; // appear on this word (default: at the start)
  enter?: 'pop' | 'walk-l' | 'walk-r' | 'none';
  acts?: [string, DoodlePose?, DoodleExpr?][]; // [cue word, pose, expr] changes during the scene
};
type Base = {
  vo: string; // the narration line (used by the tool; the engine reads the timed VO)
  bg?: 'paper' | 'kraft' | 'grid' | 'night';
  cast?: CastItem[];
  stamp?: { text: string; cue?: string; color?: string };
  source?: string; // "Source: …" chip — trust is the whole format
  sfx?: string[]; // optional extra SFX ids (the tool adds the standard ones)
};
export type Scene = Base &
  (
    | { type: 'title'; kicker?: string; title: string; sub?: string }
    | { type: 'statement'; text: string; hl?: string[] }
    | { type: 'number'; value: number; from?: number; prefix?: string; suffix?: string; decimals?: number; label?: string; cue?: string }
    | { type: 'chart'; kind?: 'line' | 'bars'; points: { label: string; value: number }[]; unit?: string; peak?: number; title?: string }
    | { type: 'timeline'; events: { date: string; label: string; cue?: string }[] }
    | { type: 'compare'; left: { title: string; value: string; color?: string; icon?: DoodleProp }; right: { title: string; value: string; color?: string; icon?: DoodleProp }; cue?: string }
    | { type: 'list'; title?: string; items: string[] }
    | { type: 'quote'; text: string; who: string }
    | { type: 'document'; title: string; lines: string[]; hl?: number; cue?: string }
    | { type: 'scene'; caption?: string; props?: { prop: DoodleProp; x: number; y: number; s?: number; cue?: string }[] }
  );

// ───────────────────────────── per-scene context ─────────────────────────────
type Ctx = {
  i: number;
  t: number; // global seconds
  t0: number; // scene start (global s)
  t1: number; // scene end (global s)
  line: VoLine;
  W: number;
  H: number;
  seed: (n: number) => number; // boiling seed for element n of this scene
  cue: (word: string | undefined, frac?: number) => number; // global s
};
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%]/g, '');
const makeCue = (line: VoLine, t0: number, t1: number) => (word: string | undefined, frac = 0.15) => {
  if (word) {
    const target = norm(word);
    const hit = timeWords(line).find((w) => norm(w.w).startsWith(target) || (target.length > 3 && norm(w.w).includes(target)));
    if (hit) return hit.start;
  }
  return t0 + (t1 - t0) * frac;
};

// handwritten / editorial text helpers (SVG)
const wrap = (text: string, max: number) => {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  return out;
};
const Hand: React.FC<{ x: number; y: number; size: number; text: string; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; op?: number; rot?: number }> = ({
  x, y, size, text, color = INK, anchor = 'middle', weight = 700, op = 1, rot = 0,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT_HAND} fontWeight={weight} fontSize={size} fill={color} opacity={op} transform={rot ? `rotate(${rot},${x},${y})` : undefined}>
    {text}
  </text>
);
const popS = (t: number, at: number, d = 0.35) => (t < at ? 0 : interpolate(t, [at, at + d], [0, 1], { ...clamp, easing: BACK }));
const fmt = (v: number, decimals = 0) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// ───────────────────────────── backgrounds ─────────────────────────────
const BG: React.FC<{ kind: Base['bg']; W: number; H: number; seed: number }> = ({ kind = 'paper', W, H, seed }) => {
  const base = kind === 'kraft' ? '#d9b98c' : kind === 'night' ? '#2b2d42' : CRAYON.paper;
  return (
    <g>
      <rect width={W} height={H} fill={base} />
      {kind === 'grid' &&
        Array.from({ length: Math.ceil(H / 54) }).map((_, i) => <line key={i} x1={0} y1={i * 54 + 20} x2={W} y2={i * 54 + 20} stroke="#b9d0e8" strokeWidth={2} opacity={0.6} />)}
      {kind === 'grid' && <line x1={150} y1={0} x2={150} y2={H} stroke="#e8a0a0" strokeWidth={3} opacity={0.7} />}
      {/* paper fibres */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 377 + seed * 13) % W;
        const y = (i * 211 + seed * 7) % H;
        return <line key={`f${i}`} x1={x} y1={y} x2={x + 40} y2={y + 6} stroke={kind === 'night' ? '#ffffff' : '#8a7550'} strokeWidth={1.4} opacity={0.12} />;
      })}
      <radialGradient id={`vig${seed}`} cx="50%" cy="45%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#3a2a10" stopOpacity={kind === 'night' ? 0.45 : 0.22} />
      </radialGradient>
      <rect width={W} height={H} fill={`url(#vig${seed})`} />
    </g>
  );
};
const ink = (bg: Base['bg']) => (bg === 'night' ? CRAYON.white : INK);

// ───────────────────────────── scene bodies ─────────────────────────────
const TitleScene: React.FC<{ s: Extract<Scene, { type: 'title' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, W, H } = c;
  const lines = wrap(s.title, 22);
  const size = lines.length > 2 ? 104 : 128;
  const draw = prog(t, t0 + 0.5, t0 + 1.3);
  return (
    <g>
      {s.kicker && (
        <g transform={`translate(${W / 2},${H * 0.26}) scale(${popS(t, t0 + 0.15)})`}>
          <RRect x={-200} y={-38} w={400} h={70} seed={c.seed(1)} o={{ fill: CRAYON.yellow, fillStyle: 'solid', strokeWidth: 4 }} />
          <Hand x={0} y={14} size={38} text={s.kicker.toUpperCase()} />
        </g>
      )}
      {lines.map((ln, k) => {
        const p = prog(t, t0 + 0.25 + k * 0.18, t0 + 0.75 + k * 0.18);
        return (
          <text key={k} x={W / 2} y={H * 0.46 + k * size * 1.05 + (1 - p) * 30} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} fill={ink(s.bg)} opacity={p}>
            {ln}
          </text>
        );
      })}
      <g opacity={draw > 0 ? 1 : 0}>
        <RPath d={`M ${W * 0.3},${H * 0.46 + lines.length * size * 1.05 - size * 0.55} Q ${W / 2},${H * 0.46 + lines.length * size * 1.05 - size * 0.35} ${W * 0.3 + W * 0.4 * draw},${H * 0.46 + lines.length * size * 1.05 - size * 0.6}`} seed={c.seed(2)} o={{ stroke: CRAYON.red, strokeWidth: 9 }} />
      </g>
      {s.sub && <Hand x={W / 2} y={H * 0.46 + lines.length * size * 1.05 + 30} size={44} text={s.sub} color={CRAYON.brown} op={prog(t, t0 + 1.0, t0 + 1.5)} />}
    </g>
  );
};

const StatementScene: React.FC<{ s: Extract<Scene, { type: 'statement' }>; c: Ctx }> = ({ s, c }) => {
  const { t, W, H } = c;
  const parts = s.text.split(/\s+/).filter(Boolean);
  const size = s.text.length > 60 ? 74 : 92;
  const vws = timeWords(c.line).map((w) => ({ n: norm(w.w), start: w.start }));
  const hl = (s.hl ?? []).map(norm);
  // each on-screen word appears when the narrator says it (first spoken match after the last one),
  // else on a gentle stagger; the browser lays the words out (no width guessing)
  let from = 0;
  let prev = c.t0 + 0.15;
  const times = parts.map((w) => {
    const k = vws.findIndex((v, idx) => idx >= from && v.n === norm(w));
    if (k >= 0) {
      from = k + 1;
      prev = vws[k].start;
    } else prev += 0.14; // not spoken: arrives right after the word before it
    return prev;
  });
  return (
    <foreignObject x={W * 0.08} y={H * 0.12} width={W * 0.84} height={H * 0.58}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontFamily: FONT_EDITORIAL, fontWeight: 800, fontSize: size, lineHeight: 1.28, color: ink(s.bg) }}>
          {parts.map((w, j) => {
            const p = prog(t, times[j] - 0.05, times[j] + 0.2);
            const isHl = hl.includes(norm(w));
            const sweep = isHl ? prog(t, times[j] + 0.15, times[j] + 0.5) * 100 : 0;
            return (
              <span
                key={j}
                style={{
                  display: 'inline-block',
                  margin: `0 ${size * 0.13}px`,
                  padding: isHl ? `0 ${size * 0.1}px` : undefined,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 20}px)`,
                  background: isHl ? `linear-gradient(to right, rgba(242,194,48,0.8) ${sweep}%, transparent ${sweep}%)` : undefined,
                  borderRadius: 10,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </foreignObject>
  );
};

const NumberScene: React.FC<{ s: Extract<Scene, { type: 'number' }>; c: Ctx }> = ({ s, c }) => {
  const { t, W, H } = c;
  const at = c.cue(s.cue, 0.12);
  const p = prog(t, at, at + 1.3, Easing.bezier(0.16, 1, 0.3, 1));
  const v = (s.from ?? 0) + (s.value - (s.from ?? 0)) * p;
  const txt = `${s.prefix ?? ''}${fmt(v, s.decimals ?? 0)}${s.suffix ?? ''}`;
  const size = Math.min(230, (W * 0.85) / Math.max(4, txt.length * 0.58));
  return (
    <g>
      {/* ledger lines */}
      {Array.from({ length: 7 }).map((_, k) => <line key={k} x1={W * 0.12} y1={H * 0.25 + k * 70} x2={W * 0.88} y2={H * 0.25 + k * 70} stroke="#9bb8a0" strokeWidth={2} opacity={0.35} />)}
      <g transform={`translate(${W / 2},${H * 0.5}) scale(${0.85 + 0.15 * popS(t, at)})`} opacity={t >= at ? 1 : 0}>
        <text x={0} y={size * 0.35} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} fill={ink(s.bg)}>{txt}</text>
        {p >= 1 && <RPath d={`M ${-size * txt.length * 0.3},${size * 0.5} Q 0,${size * 0.62} ${size * txt.length * 0.3},${size * 0.48}`} seed={c.seed(3)} o={{ stroke: CRAYON.green, strokeWidth: 10 }} />}
      </g>
      {s.label && (
        <g transform={`translate(${W / 2},${H * 0.5 + size * 0.95}) scale(${popS(t, at + 0.9)})`}>
          <RRect x={-(s.label.length * 13 + 40)} y={-36} w={s.label.length * 26 + 80} h={66} seed={c.seed(4)} o={{ fill: CRAYON.white, fillStyle: 'solid', strokeWidth: 3 }} />
          <Hand x={0} y={12} size={40} text={s.label} />
        </g>
      )}
    </g>
  );
};

const ChartScene: React.FC<{ s: Extract<Scene, { type: 'chart' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, t1, W, H } = c;
  const L = W * 0.14, R = W * 0.86, T = H * 0.2, B = H * 0.72;
  const max = Math.max(...s.points.map((p) => p.value)) * 1.1;
  const n = s.points.length;
  const px = (i: number) => L + ((i + 0.5) / n) * (R - L);
  const py = (v: number) => B - (v / max) * (B - T);
  const span = Math.min(t1 - t0 - 1.2, 3.5);
  const drawP = prog(t, t0 + 0.6, t0 + 0.6 + span, Easing.inOut(Easing.cubic));
  const axes = (
    <g>
      <RLine x1={L - 30} y1={B} x2={R + 20} y2={B} seed={c.seed(1)} o={{ strokeWidth: 5, stroke: ink(s.bg) }} />
      <RLine x1={L - 30} y1={B} x2={L - 30} y2={T - 30} seed={c.seed(2)} o={{ strokeWidth: 5, stroke: ink(s.bg) }} />
      {s.points.map((p, i) => <Hand key={i} x={px(i)} y={B + 52} size={34} text={p.label} color={ink(s.bg)} weight={400} />)}
      {s.title && <Hand x={W / 2} y={T - 50} size={52} text={s.title} color={ink(s.bg)} />}
    </g>
  );
  if (s.kind === 'bars') {
    return (
      <g>
        {axes}
        {s.points.map((p, i) => {
          const g = prog(t, t0 + 0.5 + (i / n) * span, t0 + 0.9 + (i / n) * span);
          const h = (B - py(p.value)) * g;
          return (
            <g key={i}>
              {h > 2 && <RRect x={px(i) - 46} y={B - h} w={92} h={h} seed={c.seed(10 + i)} o={{ fill: i === s.peak ? CRAYON.red : CRAYON.teal, strokeWidth: 4 }} />}
              {g >= 1 && <Hand x={px(i)} y={B - h - 18} size={34} text={`${fmt(p.value)}${s.unit ?? ''}`} color={ink(s.bg)} />}
            </g>
          );
        })}
      </g>
    );
  }
  // line: drawn on like a pencil, point by point
  const upto = drawP * (n - 1);
  const pts: [number, number][] = [];
  for (let i = 0; i <= Math.floor(upto); i++) pts.push([px(i), py(s.points[i].value)]);
  const f = upto - Math.floor(upto);
  if (Math.floor(upto) < n - 1 && f > 0) {
    const a = s.points[Math.floor(upto)].value, b = s.points[Math.floor(upto) + 1].value;
    pts.push([px(Math.floor(upto)) + (px(1) - px(0)) * f, py(a + (b - a) * f)]);
  }
  const d = pts.length > 1 ? 'M ' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ') : '';
  const peakAt = s.peak !== undefined ? t0 + 0.6 + (s.peak / Math.max(1, n - 1)) * span : 1e9;
  return (
    <g>
      {axes}
      {d && <RPath d={d} seed={c.seed(5)} o={{ stroke: CRAYON.red, strokeWidth: 9 }} />}
      {s.points.map((p, i) =>
        i <= upto + 0.01 ? (
          <g key={i}>
            <RCircle x={px(i)} y={py(p.value)} d={20} seed={c.seed(20 + i)} o={{ fill: CRAYON.red, fillStyle: 'solid', strokeWidth: 3 }} />
            <Hand x={px(i)} y={py(p.value) - 24} size={30} text={`${fmt(p.value)}${s.unit ?? ''}`} color={ink(s.bg)} op={0.85} />
          </g>
        ) : null,
      )}
      {s.peak !== undefined && t > peakAt && (
        <g>
          <RCircle x={px(s.peak)} y={py(s.points[s.peak].value)} d={110 * Math.min(1, prog(t, peakAt, peakAt + 0.3))} seed={c.seed(40)} o={{ stroke: CRAYON.orange, strokeWidth: 6 }} />
          <Hand x={px(s.peak)} y={py(s.points[s.peak].value) - 80} size={46} text="PEAK!" color={CRAYON.orange} rot={-6} op={prog(t, peakAt + 0.1, peakAt + 0.3)} />
        </g>
      )}
    </g>
  );
};

const TimelineScene: React.FC<{ s: Extract<Scene, { type: 'timeline' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, t1, W, H } = c;
  const y = H * 0.48;
  const n = s.events.length;
  const lineP = prog(t, t0 + 0.2, t0 + 1.0);
  return (
    <g>
      <RLine x1={W * 0.08} y1={y} x2={W * 0.08 + W * 0.84 * lineP} y2={y} seed={c.seed(1)} o={{ strokeWidth: 7, stroke: ink(s.bg) }} />
      {s.events.map((e, i) => {
        const x = W * 0.08 + (W * 0.84 * (i + 0.5)) / n;
        const at = e.cue ? c.cue(e.cue) : t0 + 0.8 + ((t1 - t0 - 1.4) * i) / n;
        const k = popS(t, at);
        const up = i % 2 === 0;
        return (
          <g key={i} opacity={t >= at ? 1 : 0}>
            <g transform={`translate(${x},${y}) scale(${k})`}>
              <RCircle x={0} y={0} d={34} seed={c.seed(10 + i)} o={{ fill: CRAYON.red, fillStyle: 'solid', strokeWidth: 3 }} />
            </g>
            <g transform={`translate(${x},${up ? y - 120 : y + 130}) scale(${k})`}>
              <RRect x={-130} y={-48} w={260} h={92} seed={c.seed(20 + i)} o={{ fill: CRAYON.white, fillStyle: 'solid', strokeWidth: 3 }} />
              <Hand x={0} y={-4} size={34} text={e.date} color={CRAYON.red} />
              <Hand x={0} y={32} size={26} text={e.label} weight={400} />
            </g>
            <RLine x1={x} y1={up ? y - 70 : y + 80} x2={x} y2={up ? y - 18 : y + 18} seed={c.seed(30 + i)} o={{ strokeWidth: 3, stroke: ink(s.bg) }} />
          </g>
        );
      })}
    </g>
  );
};

const CompareScene: React.FC<{ s: Extract<Scene, { type: 'compare' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, W, H } = c;
  const atR = c.cue(s.cue, 0.45);
  const card = (side: { title: string; value: string; color?: string; icon?: DoodleProp }, x: number, at: number, k: number) => {
    const p = popS(t, at);
    return (
      <g transform={`translate(${x},${H * 0.45}) scale(${p}) rotate(${k ? 2 : -2})`} opacity={t >= at ? 1 : 0}>
        <RRect x={-300} y={-210} w={600} h={420} seed={c.seed(1 + k)} o={{ fill: side.color ?? (k ? CRAYON.pink : CRAYON.teal), fillStyle: 'hachure', hachureGap: 9, strokeWidth: 5 }} />
        <RRect x={-270} y={-180} w={540} h={360} seed={c.seed(3 + k)} o={{ fill: CRAYON.white, fillStyle: 'solid', strokeWidth: 3 }} />
        {side.icon && side.icon !== 'none' && (
          <g transform="translate(0,-90)">
            <Prop prop={side.icon} seed={c.seed(5 + k)} s={1.2} />
          </g>
        )}
        <Hand x={0} y={side.icon ? 20 : -40} size={48} text={side.title} />
        <text x={0} y={side.icon ? 120 : 90} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={84} fill={INK}>{side.value}</text>
      </g>
    );
  };
  return (
    <g>
      {card(s.left, W * 0.27, t0 + 0.3, 0)}
      {card(s.right, W * 0.73, atR, 1)}
      <g transform={`translate(${W / 2},${H * 0.45}) scale(${popS(t, atR - 0.2)})`}>
        <RCircle x={0} y={0} d={130} seed={c.seed(9)} o={{ fill: CRAYON.yellow, fillStyle: 'solid', strokeWidth: 5 }} />
        <text x={0} y={20} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={60} fill={INK}>VS</text>
      </g>
    </g>
  );
};

const ListScene: React.FC<{ s: Extract<Scene, { type: 'list' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, t1, W, H } = c;
  const n = s.items.length;
  const cols = Math.min(n, 3);
  const colors = [CRAYON.yellow, '#9fd8a8', '#f6b3c8', '#a9c8f5'];
  return (
    <g>
      {s.title && <Hand x={W / 2} y={H * 0.16} size={64} text={s.title} color={ink(s.bg)} />}
      {s.items.map((it, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = W / 2 + (col - (cols - 1) / 2) * 470;
        const y = H * 0.38 + row * 300;
        const at = t0 + 0.5 + ((t1 - t0 - 1.0) * i) / n;
        const lines = wrap(it, 16);
        return (
          <g key={i} transform={`translate(${x},${y}) rotate(${(i % 3) - 1 * 2}) scale(${popS(t, at)})`} opacity={t >= at ? 1 : 0}>
            <RRect x={-190} y={-110} w={380} h={230} seed={c.seed(1 + i)} o={{ fill: colors[i % colors.length], fillStyle: 'solid', strokeWidth: 3 }} />
            <RCircle x={0} y={-104} d={26} seed={c.seed(20 + i)} o={{ fill: CRAYON.red, fillStyle: 'solid', strokeWidth: 3 }} />
            {lines.map((ln, k) => <Hand key={k} x={0} y={-10 + k * 48 - ((lines.length - 1) * 24)} size={42} text={ln} />)}
          </g>
        );
      })}
    </g>
  );
};

const QuoteScene: React.FC<{ s: Extract<Scene, { type: 'quote' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, t1, W, H } = c;
  const lines = wrap(`“${s.text}”`, 34);
  const p = prog(t, t0 + 0.4, t1 - 0.8, Easing.linear);
  const totalChars = lines.join('').length;
  let shown = Math.floor(p * totalChars);
  return (
    <g>
      <g transform={`rotate(-1.5,${W / 2},${H / 2})`}>
        <RRect x={W * 0.15} y={H * 0.14} w={W * 0.7} h={H * 0.62} seed={c.seed(1)} o={{ fill: CRAYON.white, fillStyle: 'solid', strokeWidth: 4 }} />
        {Array.from({ length: 8 }).map((_, k) => <line key={k} x1={W * 0.17} y1={H * 0.24 + k * 62} x2={W * 0.83} y2={H * 0.24 + k * 62} stroke="#b9d0e8" strokeWidth={2} />)}
        <line x1={W * 0.21} y1={H * 0.15} x2={W * 0.21} y2={H * 0.75} stroke="#e8a0a0" strokeWidth={3} />
        {lines.map((ln, k) => {
          const vis = Math.max(0, Math.min(ln.length, shown));
          shown -= ln.length;
          return <Hand key={k} x={W * 0.24} y={H * 0.3 + k * 72} size={56} text={ln.slice(0, vis)} anchor="start" />;
        })}
        <Hand x={W * 0.8} y={H * 0.7} size={40} text={`— ${s.who}`} anchor="end" color={CRAYON.brown} op={prog(t, t1 - 1.2, t1 - 0.8)} />
      </g>
    </g>
  );
};

const DocumentScene: React.FC<{ s: Extract<Scene, { type: 'document' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, W, H } = c;
  const at = c.cue(s.cue, 0.45);
  const x0 = W * 0.27, y0 = H * 0.1, w = W * 0.46, h = H * 0.78;
  return (
    <g transform={`rotate(1.2,${W / 2},${H / 2})`}>
      <RRect x={x0 + 14} y={y0 + 14} w={w} h={h} seed={c.seed(1)} o={{ fill: '#d8ccb0', fillStyle: 'solid', strokeWidth: 2, stroke: '#b5a685' }} />
      <RRect x={x0} y={y0} w={w} h={h} seed={c.seed(2)} o={{ fill: CRAYON.white, fillStyle: 'solid', strokeWidth: 4 }} />
      <text x={W / 2} y={y0 + 80} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={800} fontSize={44} fill={INK}>{s.title}</text>
      <RLine x1={x0 + 60} y1={y0 + 110} x2={x0 + w - 60} y2={y0 + 110} seed={c.seed(3)} o={{ strokeWidth: 3 }} />
      {s.lines.map((ln, k) => {
        const y = y0 + 180 + k * 78;
        const isHl = k === s.hl;
        const sweep = isHl ? prog(t, at, at + 0.6) : 0;
        const tw = Math.min(w - 120, ln.length * 17);
        const appear = prog(t, t0 + 0.2 + k * 0.12, t0 + 0.5 + k * 0.12);
        return (
          <g key={k} opacity={appear}>
            {isHl && sweep > 0 && <rect x={x0 + 54} y={y - 36} width={(tw + 14) * sweep} height={50} fill={CRAYON.yellow} opacity={0.8} />}
            <text x={x0 + 60} y={y} fontFamily={FONT_EDITORIAL} fontWeight={600} fontSize={32} fill={isHl ? INK : '#6a6255'}>{ln}</text>
            {isHl && sweep >= 1 && <RPath d={`M ${x0 + 40},${y - 30} Q ${x0 + 40 + tw / 2},${y - 70} ${x0 + 80 + tw},${y - 26} Q ${x0 + 90 + tw},${y + 22} ${x0 + 40 + tw / 2},${y + 26} Q ${x0 + 20},${y + 24} ${x0 + 44},${y - 34}`} seed={c.seed(9)} o={{ stroke: CRAYON.red, strokeWidth: 5 }} />}
          </g>
        );
      })}
    </g>
  );
};

const SceneCaption: React.FC<{ s: Extract<Scene, { type: 'scene' }>; c: Ctx }> = ({ s, c }) => {
  const { t, t0, W, H } = c;
  return (
    <g>
      {s.caption && (
        <g transform={`translate(${W / 2},${H * 0.14}) scale(${popS(t, t0 + 0.3)})`}>
          <Hand x={0} y={0} size={68} text={s.caption} color={ink(s.bg)} />
        </g>
      )}
      {(s.props ?? []).map((p, i) => {
        const at = c.cue(p.cue, 0.1 + i * 0.1);
        return (
          <g key={i} transform={`translate(${p.x * W},${p.y * H}) scale(${popS(t, at) * (p.s ?? 1.6)})`} opacity={t >= at ? 1 : 0}>
            <Prop prop={p.prop} seed={c.seed(50 + i)} />
          </g>
        );
      })}
    </g>
  );
};

// cast: characters enter (pop / walk) and change pose + face on cue words
const Cast: React.FC<{ cast: CastItem[]; c: Ctx; main: boolean }> = ({ cast, c, main }) => {
  const { t, W, H } = c;
  return (
    <g>
      {cast.map((m, i) => {
        const spec = typeof m.who === 'string' ? DOODLES[m.who] : m.who;
        const at = m.cue ? c.cue(m.cue) : c.t0 + 0.1;
        if (t < at) return null;
        let pose: DoodlePose = m.pose ?? 'stand';
        let expr: DoodleExpr = m.expr ?? 'neutral';
        for (const [w, p, e] of m.acts ?? []) {
          if (t >= c.cue(w)) {
            pose = p ?? pose;
            expr = e ?? expr;
          }
        }
        const tx = m.x * W;
        const walkIn = m.enter === 'walk-l' || m.enter === 'walk-r';
        const wp = walkIn ? prog(t, at, at + 1.4, Easing.out(Easing.quad)) : 1;
        const x = walkIn ? tx + (1 - wp) * (m.enter === 'walk-l' ? -W * 0.4 : W * 0.4) : tx;
        const k = m.enter === 'pop' || !m.enter ? popS(t, at, 0.4) : 1;
        const speaking = !!m.talk && t >= c.line.start && t <= c.line.end;
        return (
          <g key={i} transform={`translate(${x},${(m.y ?? 0.92) * H}) scale(${k}) translate(${-x},${-(m.y ?? 0.92) * H})`}>
            <Doodle
              spec={spec} x={x} y={(m.y ?? 0.92) * H} s={m.s ?? (main ? 1.25 : 0.72)} t={t} pose={pose} expr={expr} prop={m.prop}
              facing={m.facing ?? (m.x > 0.5 ? -1 : 1)} talk={speaking} walk={walkIn && wp < 1 ? t * 1.6 : 0}
            />
          </g>
        );
      })}
    </g>
  );
};

const Stamp: React.FC<{ s: NonNullable<Base['stamp']>; c: Ctx }> = ({ s, c }) => {
  const at = c.cue(s.cue, 0.6);
  if (c.t < at) return null;
  const p = prog(c.t, at, at + 0.22, BACK);
  const col = s.color ?? CRAYON.red;
  const w = s.text.length * 46 + 80;
  return (
    <g transform={`translate(${c.W * 0.72},${c.H * 0.24}) rotate(-12) scale(${2.2 - 1.2 * p})`} opacity={Math.min(1, p * 1.6) * 0.9}>
      <RRect x={-w / 2} y={-60} w={w} h={120} seed={c.seed(77)} o={{ stroke: col, strokeWidth: 9, roughness: 2 }} />
      <text x={0} y={26} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={78} letterSpacing={6} fill={col}>{s.text.toUpperCase()}</text>
    </g>
  );
};

const Source: React.FC<{ text: string; c: Ctx }> = ({ text, c }) => {
  const op = prog(c.t, c.t0 + 0.8, c.t0 + 1.2);
  const w = text.length * 13 + 40;
  return (
    <g opacity={op}>
      <rect x={36} y={c.H - 76} width={w} height={44} rx={6} fill="rgba(255,253,246,0.92)" stroke={INK} strokeWidth={2} />
      <Hand x={56} y={c.H - 45} size={24} text={text} anchor="start" weight={400} />
    </g>
  );
};

// ───────────────────────────── one scene, with its camera ─────────────────────────────
const SceneView: React.FC<{ s: Scene; c: Ctx }> = ({ s, c }) => {
  const { t, t0, t1, W, H, i } = c;
  // camera: slow push + drift, alternating direction; a punch on the scene's key cue
  const p = Math.max(0, Math.min(1, (t - t0) / Math.max(0.5, t1 - t0)));
  const dir = i % 2 ? 1 : -1;
  const keyAt =
    s.type === 'number' ? c.cue(s.cue, 0.12) : s.stamp ? c.cue(s.stamp.cue, 0.6) : s.type === 'compare' ? c.cue(s.cue, 0.45) : -1;
  const punch = keyAt > 0 ? Math.max(0, 1 - Math.abs(t - keyAt - 0.12) / 0.3) * 0.035 : 0;
  const z = 1.0 + 0.06 * p + punch;
  const panX = dir * 26 * (p - 0.5);
  const panY = -10 * p;
  const main = s.type === 'scene';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <CrayonDefs />
      <BG kind={s.bg} W={W} H={H} seed={i + 1} />
      <g transform={`translate(${W / 2 + panX},${H / 2 + panY}) scale(${z}) translate(${-W / 2},${-H / 2})`}>
        <g filter="url(#crayon)">
          {s.type === 'title' && <TitleScene s={s} c={c} />}
          {s.type === 'statement' && <StatementScene s={s} c={c} />}
          {s.type === 'number' && <NumberScene s={s} c={c} />}
          {s.type === 'chart' && <ChartScene s={s} c={c} />}
          {s.type === 'timeline' && <TimelineScene s={s} c={c} />}
          {s.type === 'compare' && <CompareScene s={s} c={c} />}
          {s.type === 'list' && <ListScene s={s} c={c} />}
          {s.type === 'quote' && <QuoteScene s={s} c={c} />}
          {s.type === 'document' && <DocumentScene s={s} c={c} />}
          {s.type === 'scene' && <SceneCaption s={s} c={c} />}
          {s.cast && <Cast cast={s.cast} c={c} main={main} />}
          {s.stamp && <Stamp s={s.stamp} c={c} />}
        </g>
      </g>
      {s.source && <Source text={s.source} c={c} />}
    </svg>
  );
};

// ───────────────────────────── the composition ─────────────────────────────
export const SHEET = 0.45; // s — the paper-sheet transition
export const LEAD = 0.35; // s — a scene arrives this long before its line starts

export const sceneWindows = (vo: VoLine[], total: number) =>
  vo.map((l, i) => ({ t0: i === 0 ? 0 : Math.max(0, l.start - LEAD), t1: i === vo.length - 1 ? total : vo[i + 1].start - LEAD }));

export const PaperDoc: React.FC<{ vo: VoLine[]; scenes: Scene[]; captions?: boolean }> = ({ vo, scenes, captions = false }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const wins = sceneWindows(vo, durationInFrames / fps);
  const cur = vo.find((l) => t >= l.start - 0.05 && t < l.end + 0.3);
  return (
    <AbsoluteFill style={{ background: CRAYON.paper }}>
      {scenes.map((s, i) => {
        const { t0, t1 } = wins[i];
        const from = Math.round(t0 * fps);
        const dur = Math.max(1, Math.round((t1 - t0 + SHEET) * fps));
        // the new sheet slides in over the last one: from the right, the bottom, the left in turn
        const local = t - t0;
        const e = i === 0 ? 1 : interpolate(local, [0, SHEET], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.9, 0.3, 1) });
        const side = i % 3;
        const dx = side === 0 ? (1 - e) * W : side === 2 ? -(1 - e) * W : 0;
        const dy = side === 1 ? (1 - e) * H : 0;
        const rot = (1 - e) * (side === 2 ? -3 : 3);
        const c: Ctx = {
          i, t, t0, t1, line: vo[i], W, H,
          seed: (n) => boilSeed(frame, i * 50 + n),
          cue: makeCue(vo[i], t0, t1),
        };
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <AbsoluteFill style={{ transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, boxShadow: e < 1 ? '0 0 60px rgba(40,25,5,0.45)' : undefined }}>
              <SceneView s={s} c={c} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {captions && cur && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: H * 0.06 }}>
          <div style={{ fontFamily: FONT_HAND, fontWeight: 700, fontSize: H * 0.045, color: INK, background: 'rgba(255,253,246,0.9)', padding: '6px 22px', borderRadius: 10, border: `3px solid ${INK}` }}>
            {timeWords(cur).filter((w) => t >= w.start - 0.6 && t < w.end + 1.2).slice(-6).map((w) => w.w).join(' ')}
          </div>
        </AbsoluteFill>
      )}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
