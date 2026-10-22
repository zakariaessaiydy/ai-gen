// KIDS KIT — ENERGY: the "more action" layer (user request after Day 36: livelier sound, more action).
// A DIRECTOR CAMERA (cuts, snap zooms, whip pans, slow push-ins, zoom punches, shakes) on <ActionStage>,
// cartoon REACTIONS over heads (! ? sweat, hearts, dizzy stars, rain cloud, steam, idea), action FX in stage
// space (landing dust, motion + strain lines, impact stars, comic words that move with the camera), screen
// FOCUS LINES, a squash-and-stretch HOP, the channel ident <SparksIntro> synced to the jingle
// (media/library/sfx/clips/tiny-sparks-jingle.mp3) and a <StarWipe>. Global seconds everywhere, like the kit.
// Kids rules kept: no full-screen flashes, nothing strobes (every motion is smooth; nothing re-randomises
// per frame), shakes are short and small.
import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { EASE_INOUT, EASE_OUT, prog } from '../shorts';
import { FONT_TOON, shakeAt, type Cam } from '../toon/comedy';
import { KINK, kst, Twinkle, type KExpr } from './face';
import { K3DDefs, Vol } from './depth';
import { Kid, type KidSpec } from './kid';
import { Critter, type CritterSpec } from './critter';
import { Confetti, RAINBOW, Star } from './kit';

// the channel ident + jingle length: the theme bed (tiny-sparks-bounce, 120 bpm) enters here, the first VO
// line starts at >= INTRO_S + 0.2 on long videos
export const INTRO_S = 3.7;
// the first beat of the theme bed at or after t (bed started at `start`): start ThinkTimers + the
// think-tick SFX here so the tick-tock sits on the music
export const onBeat = (t: number, start = INTRO_S, spb = 0.5) => start + Math.max(0, Math.ceil((t - start) / spb - 1e-6)) * spb;

// ── easing
const backOut = (p: number, k = 1.6) => 1 + (k + 1) * Math.pow(p - 1, 3) + k * Math.pow(p - 1, 2);
const quintInOut = (p: number) => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2);
const easeIn = (p: number) => p * p * p;
// pop scale: 0 → overshoot → 1 at `at`, shrink away over the last 0.18 s before `until`
const popScale = (t: number, at: number, until: number, dur = 0.3) =>
  t < at || t >= until ? 0 : backOut(prog(t, at, at + dur)) * (1 - EASE_INOUT(prog(t, until - 0.18, until)));

// ---------------------------------------------------------------------------------------------
// DIRECTOR CAMERA — a shot list. Each shot frames (x, y) at zoom z from time t, arriving by:
//   cut (instant) · snap (0.22 s, tiny overshoot — the "zoom punch-in") · smooth (0.9 s ease) ·
//   whip (0.3 s fast pan, with horizontal motion blur on <ActionStage>).
// push = slow zoom-in per second while the shot holds (the camera never sits dead still).
// punches = zoom kicks on impacts (+7 %, 0.35 s). Feed {blur} to ActionStage.
// ---------------------------------------------------------------------------------------------
export type Move = 'cut' | 'snap' | 'smooth' | 'whip';
export type Shot = { t: number; z: number; x: number; y: number; rot?: number; move?: Move; dur?: number; push?: number };
type Framing = { z: number; x: number; y: number; rot: number };

const EASES: Record<Move, (p: number) => number> = { cut: () => 1, snap: (p) => backOut(p, 1.2), smooth: (p) => EASE_INOUT(p), whip: quintInOut };
const DUR: Record<Move, number> = { cut: 0, snap: 0.22, smooth: 0.9, whip: 0.3 };
const aim = (s: Shot, t: number): Framing => ({ z: s.z * (1 + (s.push ?? 0) * Math.max(0, t - s.t)), x: s.x, y: s.y, rot: s.rot ?? 0 });
const mix = (a: Framing, b: Framing, p: number): Framing => ({
  z: a.z + (b.z - a.z) * p, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, rot: a.rot + (b.rot - a.rot) * p,
});

const camRaw = (t: number, k: Shot[]): Framing => {
  if (t <= k[0].t) return aim(k[0], k[0].t);
  const during = (i: number, tt: number, from: Framing) => {
    const s = k[i];
    const mv = s.move ?? 'smooth';
    const d = s.dur ?? DUR[mv];
    return mix(from, aim(s, tt), mv === 'cut' || d <= 0 ? 1 : EASES[mv](prog(tt, s.t, s.t + d)));
  };
  let from = aim(k[0], k[0].t);
  let i = 0;
  for (; i < k.length - 1 && k[i + 1].t <= t; i++) from = during(i, k[i + 1].t, from); // where shot i+1 starts from
  return during(i, t, from);
};

export const directorCam = (t: number, shots: Shot[], punches: number[] = [], fps = 30): Cam & { blur: number } => {
  const k = [...shots].sort((a, b) => a.t - b.t);
  const c = camRaw(t, k);
  const kick = punches.reduce((m, at) => {
    const u = t - at;
    return u < 0 || u > 0.35 ? m : Math.max(m, u < 0.05 ? u / 0.05 : Math.exp(-(u - 0.05) * 10));
  }, 0);
  // motion blur only while a whip is travelling: screen px moved this frame (horizontal)
  const live = k.filter((s) => s.t <= t).pop();
  let blur = 0;
  if (live && (live.move ?? 'smooth') === 'whip' && t < live.t + (live.dur ?? DUR.whip)) {
    const b = camRaw(t - 1 / fps, k);
    blur = Math.min(26, Math.abs(c.x - b.x) * c.z * 0.45);
  }
  return { z: c.z * (1 + 0.07 * kick), x: c.x, y: c.y, rot: c.rot, blur };
};

// shakes: short decaying jitters (amp px on screen). Sum of every hit live at t.
export type Hit = { at: number; amp?: number; dur?: number };
export const shakeOf = (t: number, hits: Hit[]): [number, number] =>
  hits.reduce<[number, number]>((acc, h) => {
    const [a, b] = shakeAt(t, h.at, h.amp ?? 14, h.dur ?? 0.35);
    return [acc[0] + a, acc[1] + b];
  }, [0, 0]);

// the stage with the director camera: KidsStage + screen shake (scaled so the set's edge never shows)
// + horizontal motion blur for whip pans.
export const ActionStage: React.FC<{ cam: Cam; shake?: [number, number]; blur?: number; bg?: string; children: React.ReactNode }> = ({
  cam, shake = [0, 0], blur = 0, bg = '#ffffff', children,
}) => {
  const { width: W, height: H } = useVideoConfig();
  const z = Math.max(1, cam.z);
  const hw = W / 2 / z;
  const hh = H / 2 / z;
  const cx = Math.min(W - hw, Math.max(hw, cam.x));
  const cy = Math.min(H - hh, Math.max(hh, cam.y));
  const amp = Math.max(Math.abs(shake[0]), Math.abs(shake[1]));
  const s = amp > 0.01 ? 1 + (2 * amp + 4) / Math.min(W, H) : 1;
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <K3DDefs />
        <defs>
          <filter id="kids-mblur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} />
          </filter>
        </defs>
        <g transform={`translate(${W / 2 + shake[0]},${H / 2 + shake[1]}) scale(${s}) translate(${-W / 2},${-H / 2})`} filter={blur > 0.5 ? 'url(#kids-mblur)' : undefined}>
          <g transform={`translate(${W / 2 - cx * z},${H / 2 - cy * z}) scale(${z}) rotate(${cam.rot} ${cx} ${cy})`}>{children}</g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// HOP — anticipation crouch → stretch up → squash on landing → little rebound. Returns Critter/Kid
// props. takeoffs = the moments the feet leave the ground (sync them to the "Boing" words).
// ---------------------------------------------------------------------------------------------
export type HopOpts = { h?: number; air?: number; pre?: number; land?: number };
export const hopAt = (t: number, takeoffs: number[], o: HopOpts = {}): { hop: number; squash: number; inAir: boolean } => {
  const h = o.h ?? 120;
  const air = o.air ?? 0.42;
  const pre = o.pre ?? 0.1;
  const land = o.land ?? 0.24;
  for (const at of takeoffs) {
    if (t >= at - pre && t < at) return { hop: 0, squash: 0.9 * EASE_OUT((t - at + pre) / pre), inAir: false };
    if (t >= at && t < at + air) {
      const p = (t - at) / air;
      return { hop: h * 4 * p * (1 - p), squash: p < 0.5 ? -0.9 * (1 - p * 2) : -0.9 * (p - 0.5), inAir: true };
    }
    if (t >= at + air && t < at + air + land) {
      const p = (t - at - air) / land;
      return { hop: 0, squash: Math.cos(p * Math.PI * 1.5) * (1 - p), inAir: false };
    }
  }
  return { hop: 0, squash: 0, inAir: false };
};

// ---------------------------------------------------------------------------------------------
// REACTIONS (stage space) — cartoon symbols over / beside a head. (x, y) = the anchor just above the
// head (sweat: beside it; steam: at ear height). They pop in with an overshoot and shrink away.
// ---------------------------------------------------------------------------------------------
export type ReactionKind = '!' | '?' | 'sweat' | 'heart' | 'stars' | 'cloud' | 'steam' | 'idea';

const HEART = 'M 0,24 C -44,-4 -36,-36 -14,-36 C -4,-36 0,-26 0,-18 C 0,-26 4,-36 14,-36 C 36,-36 44,-4 0,24 Z';
const DROP = 'M 0,-30 C 12,-10 20,4 20,14 A 20,20 0 0 1 -20,14 C -20,4 -12,-10 0,-30 Z';
const starPts = (n: number, R: number, r: number, rot = -90) =>
  Array.from({ length: n * 2 })
    .map((_, i) => {
      const a = ((rot + (i * 180) / n) * Math.PI) / 180;
      const rr = i % 2 ? r : R;
      return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
    })
    .join(' ');

export const Reaction: React.FC<{ kind: ReactionKind; t: number; at: number; until?: number; x: number; y: number; s?: number; flip?: boolean }> = ({
  kind, t, at, until, x, y, s = 1, flip = false,
}) => {
  const end = until ?? at + 1.6;
  const k = popScale(t, at, end);
  if (k <= 0) return null;
  const u = t - at;
  let body: React.ReactNode = null;
  if (kind === '!') {
    const shiver = Math.sin(u * 42) * 9 * Math.max(0, 1 - u * 2.2);
    body = (
      <g transform={`rotate(${shiver})`}>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${sd * 48},-104 l ${sd * 30},-20`} {...kst(7)} fill="none" />
            <path d={`M ${sd * 54},-62 l ${sd * 34},0`} {...kst(7)} fill="none" />
          </g>
        ))}
        <Vol><path d="M -22,-140 Q 0,-152 22,-140 L 12,-46 Q 0,-38 -12,-46 Z" fill="#ff595e" {...kst(6)} /></Vol>
        <Vol><circle cx={0} cy={-12} r={16} fill="#ff595e" {...kst(6)} /></Vol>
      </g>
    );
  } else if (kind === '?') {
    body = (
      <g transform={`rotate(${Math.sin(u * 3.2) * 12})`}>
        <text x={-10} y={0} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={170} fill="#ffca3a" stroke={KINK} strokeWidth={11} strokeLinejoin="round" paintOrder="stroke">?</text>
        <text x={58} y={-70} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={84} fill="#4cc9f0" stroke={KINK} strokeWidth={8} strokeLinejoin="round" paintOrder="stroke" transform={`rotate(18 58 -70)`}>?</text>
      </g>
    );
  } else if (kind === 'sweat') {
    body = (
      <g>
        {[0, 1].map((j) => {
          const ph = ((u * 0.9 + j * 0.5) % 1 + 1) % 1;
          return (
            <g key={j} transform={`translate(${j * 26},${ph * 46 + j * 30}) scale(${1 - j * 0.3})`} opacity={1 - ph * ph}>
              <path d={DROP} fill="#7fd3ff" {...kst(5)} />
              <ellipse cx={-6} cy={8} rx={5} ry={8} fill="#ffffff" opacity={0.8} />
            </g>
          );
        })}
      </g>
    );
  } else if (kind === 'heart') {
    body = (
      <g>
        {[0, 1, 2].map((j) => {
          const ph = (u * 0.7 + j / 3) % 1;
          return <path key={j} d={HEART} fill={['#ff6fa5', '#ff595e', '#ff8fab'][j]} {...kst(4)} transform={`translate(${(j - 1) * 56 + Math.sin(u * 3 + j) * 10},${-ph * 120}) scale(${(0.9 + Math.sin(ph * Math.PI) * 0.5) * (j === 1 ? 1.3 : 1)})`} opacity={1 - ph * 0.85} />;
        })}
      </g>
    );
  } else if (kind === 'stars') {
    body = (
      <g>
        {[0, 1, 2, 3].map((j) => {
          const a = u * 7 + (j * Math.PI) / 2;
          const d = Math.sin(a);
          return <g key={j} transform={`translate(${Math.cos(a) * 92},${d * 22 - 30}) scale(${0.32 + (d + 1) * 0.08})`}><Star c={['#ffd166', '#ffffff', '#ffd166', '#ff8fab'][j]} /></g>;
        })}
      </g>
    );
  } else if (kind === 'cloud') {
    const bob = Math.sin(u * 2.4) * 6;
    body = (
      <g transform={`translate(0,${bob - 40})`}>
        {Array.from({ length: 7 }).map((_, j) => {
          const ph = (u * 1.6 + j * 0.37) % 1;
          return <path key={j} d={`M ${-72 + j * 24},${34 + ph * 70} l -6,22`} stroke="#4cc9f0" strokeWidth={6} strokeLinecap="round" opacity={1 - ph} />;
        })}
        <Vol>
          <path d="M -90,30 Q -112,30 -112,8 Q -112,-18 -84,-20 Q -80,-58 -40,-58 Q -16,-82 18,-66 Q 52,-82 72,-46 Q 112,-44 110,-6 Q 110,30 82,30 Z" fill="#aab8cf" {...kst(6)} />
        </Vol>
        <path d="M -40,-6 q 10,-8 20,0 M 20,-6 q 10,-8 20,0" fill="none" {...kst(5)} />
        <path d="M -12,14 q 12,-8 24,0" fill="none" {...kst(5)} />
      </g>
    );
  } else if (kind === 'steam') {
    body = (
      <g>
        {[-1, 1].map((sd) =>
          [0, 1, 2].map((j) => {
            const ph = (u * 1.8 + j / 3) % 1;
            const lobes: [number, number, number][] = [[0, 0, 16], [14, -8, 12], [-12, -6, 11]];
            return (
              <g key={`${sd}${j}`} transform={`translate(${sd * (70 + ph * 70)},${-ph * 90}) scale(${0.7 + ph * 0.9})`} opacity={ph < 0.6 ? 1 : 1 - (ph - 0.6) / 0.4}>
                {lobes.map(([lx, ly, lr], q) => <circle key={`o${q}`} cx={lx} cy={ly} r={lr} fill="#ffffff" {...kst(6)} />)}
                {lobes.map(([lx, ly, lr], q) => <circle key={`f${q}`} cx={lx} cy={ly} r={lr} fill="#ffffff" />)}
              </g>
            );
          }),
        )}
      </g>
    );
  } else if (kind === 'idea') {
    body = (
      <g transform="translate(0,-60)">
        {Array.from({ length: 8 }).map((_, j) => {
          const a = (j / 8) * Math.PI * 2 + u * 0.8;
          const r0 = 74 + Math.sin(u * 6 + j) * 6;
          return <path key={j} d={`M ${Math.cos(a) * r0},${Math.sin(a) * r0} L ${Math.cos(a) * (r0 + 26)},${Math.sin(a) * (r0 + 26)}`} {...kst(7)} stroke="#ffca3a" />;
        })}
        <Vol><circle r={52} fill="#fff3b0" {...kst(6)} /></Vol>
        <Vol kind="tube"><rect x={-24} y={44} width={48} height={30} rx={8} fill="#aab8cf" {...kst(5)} /></Vol>
        <path d="M -14,8 Q 0,-20 14,8" fill="none" stroke="#ff924c" strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  }
  return <g transform={`translate(${x},${y}) scale(${s * k * (flip ? -1 : 1)},${s * k})`}>{body}</g>;
};

// ---------------------------------------------------------------------------------------------
// ACTION FX (stage space)
// ---------------------------------------------------------------------------------------------
// landing dust: cream puffs rolling out both ways from the feet
export const Dust: React.FC<{ t: number; at: number; x: number; y: number; s?: number }> = ({ t, at, x, y, s = 1 }) => {
  if (t < at || t >= at + 0.6) return null;
  const p = prog(t, at, at + 0.6);
  const e = EASE_OUT(p);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={1 - p * p}>
      {[-1, 1].map((sd) =>
        [0, 1, 2].map((j) => (
          <circle key={`${sd}${j}`} cx={sd * (34 + j * 44 + e * (50 + j * 42))} cy={-6 - e * (16 + j * 12)} r={(15 + j * 5) * (0.55 + e * 0.75)} fill="#fff4d6" {...kst(4)} />
        )),
      )}
    </g>
  );
};

// motion lines trailing behind a moving thing. dir = travel direction in degrees (0 = right, -90 = up)
export const MotionLines: React.FC<{ t: number; from: number; to: number; x: number; y: number; dir?: number; n?: number; len?: number; spread?: number; s?: number }> = ({
  t, from, to, x, y, dir = 0, n = 4, len = 90, spread = 34, s = 1,
}) => {
  if (t < from || t >= to) return null;
  const o = Math.min(1, prog(t, from, from + 0.1)) * (1 - prog(t, to - 0.12, to));
  return (
    <g transform={`translate(${x},${y}) rotate(${dir + 180}) scale(${s})`} opacity={o}>
      {Array.from({ length: n }).map((_, i) => {
        const ph = (t * 3.2 + i * 0.37) % 1;
        const d0 = 50 + ph * 60;
        return <path key={i} d={`M ${d0},${(i - (n - 1) / 2) * spread} L ${d0 + len * (1 - ph * 0.5)},${(i - (n - 1) / 2) * spread}`} stroke={KINK} strokeWidth={7} strokeLinecap="round" opacity={0.6 * (1 - ph)} />;
      })}
    </g>
  );
};

// effort marks vibrating around a point (pulling, pushing, straining)
export const StrainLines: React.FC<{ t: number; from: number; to: number; x: number; y: number; r?: number; s?: number }> = ({ t, from, to, x, y, r = 70, s = 1 }) => {
  if (t < from || t >= to) return null;
  const o = Math.min(1, prog(t, from, from + 0.1)) * (1 - prog(t, to - 0.12, to));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      {[-150, -110, -70, 70, 110, 150].map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const j = Math.sin(t * 31 + i * 1.7) * 5;
        const r0 = r + j;
        return <path key={deg} d={`M ${Math.cos(a) * r0},${Math.sin(a) * r0} L ${Math.cos(a) * (r0 + 30)},${Math.sin(a) * (r0 + 30)}`} {...kst(7)} />;
      })}
    </g>
  );
};

// comic impact burst (a jagged star + flying sparks), optional word inside
export const ImpactStar: React.FC<{ t: number; at: number; x: number; y: number; s?: number; color?: string; text?: string; textColor?: string }> = ({
  t, at, x, y, s = 1, color = '#ffca3a', text, textColor = '#ff595e',
}) => {
  if (t < at || t >= at + 0.55) return null;
  const p = prog(t, at, at + 0.55);
  const k = p < 0.22 ? backOut(p / 0.22) : 1 - 0.25 * EASE_INOUT((p - 0.22) / 0.78);
  const o = 1 - prog(t, at + 0.38, at + 0.55);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const d = 70 + EASE_OUT(p) * 150;
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={10 * (1 - p) + 2} fill={RAINBOW[i % 6]} {...kst(3)} />;
      })}
      <g transform={`scale(${k}) rotate(${p * 30})`}>
        <polygon points={starPts(10, 130, 78)} fill={color} {...kst(7)} />
        <polygon points={starPts(10, 82, 52, -72)} fill="#ffffff" opacity={0.9} />
      </g>
      {text && (
        <text y={20} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64 * k} fill={textColor} stroke={KINK} strokeWidth={8} strokeLinejoin="round" paintOrder="stroke">{text}</text>
      )}
    </g>
  );
};

// a comic word IN THE WORLD (moves with the camera): pops, wobbles, shrinks away
export const StageWord: React.FC<{ t: number; at: number; until?: number; text: string; x: number; y: number; size?: number; color?: string; rot?: number }> = ({
  t, at, until, text, x, y, size = 110, color = '#ffca3a', rot = -6,
}) => {
  const k = popScale(t, at, until ?? at + 1.2, 0.26);
  if (k <= 0) return null;
  const wob = Math.sin((t - at) * 9) * 3 * Math.max(0, 1 - (t - at) * 1.5);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot + wob}) scale(${k})`}>
      <text y={size * 0.35} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={size} fill={color} stroke={KINK} strokeWidth={size * 0.1} strokeLinejoin="round" paintOrder="stroke">{text}</text>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// SCREEN-SPACE FX
// ---------------------------------------------------------------------------------------------
// focus lines: soft white wedges from the frame edge toward (x, y) — the "WHAT?!" moment. Smooth slow spin,
// no flicker.
export const FocusLines: React.FC<{ t: number; from: number; to: number; x?: number; y?: number; r?: number; n?: number; color?: string }> = ({
  t, from, to, x, y, r, n = 40, color = '#ffffff',
}) => {
  const { width: W, height: H } = useVideoConfig();
  if (t < from || t >= to) return null;
  const o = Math.min(1, prog(t, from, from + 0.12)) * (1 - prog(t, to - 0.2, to));
  const cx = x ?? W / 2;
  const cy = y ?? H / 2;
  const r0 = r ?? Math.min(W, H) * 0.42;
  const R = Math.hypot(W, H);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} opacity={o * 0.8}>
        {Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * Math.PI * 2 + Math.sin(i * 7.3) * 0.06 + (t - from) * 0.12;
          const w = 0.012 + ((i * 37) % 5) * 0.004;
          const ri = r0 * (1 + 0.18 * Math.sin((t - from) * 7 + i * 2.1) + ((i * 13) % 7) * 0.05);
          const p1 = `${cx + Math.cos(a) * ri},${cy + Math.sin(a) * ri}`;
          const p2 = `${cx + Math.cos(a - w) * R},${cy + Math.sin(a - w) * R}`;
          const p3 = `${cx + Math.cos(a + w) * R},${cy + Math.sin(a + w) * R}`;
          return <polygon key={i} points={`${p1} ${p2} ${p3}`} fill={color} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const STAR5 = (R: number) => starPts(5, R, R * 0.5);

// star iris scene change: the frame closes to colour around a shrinking star (dur), holds (hold), then opens
// again from a growing star. Swap the scene at `at + dur` (inside the hold). Origin (x, y) = what to close on.
export const StarWipe: React.FC<{ t: number; at: number; dur?: number; hold?: number; color?: string; x?: number; y?: number }> = ({
  t, at, dur = 0.45, hold = 0.15, color = '#ffca3a', x, y,
}) => {
  const { width: W, height: H } = useVideoConfig();
  const t1 = at + dur;
  const t2 = t1 + hold;
  if (t < at || t >= t2 + dur) return null;
  const R = Math.hypot(W, H) * 1.25;
  const r = t < t1 ? R * (1 - EASE_INOUT(prog(t, at, t1))) : t < t2 ? 0 : R * EASE_INOUT(prog(t, t2, t2 + dur));
  const cx = x ?? W / 2;
  const cy = y ?? H / 2;
  const ang = ((t < t2 ? prog(t, at, t1) : 1 - prog(t, t2, t2 + dur)) * 40 * Math.PI) / 180;
  const star = STAR5(Math.max(0.01, r))
    .split(' ')
    .map((pt, i) => {
      const [a, b] = pt.split(',').map(Number);
      return `${i ? 'L' : 'M'} ${(cx + a * Math.cos(ang) - b * Math.sin(ang)).toFixed(1)},${(cy + a * Math.sin(ang) + b * Math.cos(ang)).toFixed(1)}`;
    })
    .join(' ');
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M -10,-10 H ${W + 10} V ${H + 10} H -10 Z ${star} Z`} fill={color} fillRule="evenodd" stroke={KINK} strokeWidth={10} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// SPARKS INTRO — the channel ident, 3.7 s, frame-synced to tiny-sparks-jingle.mp3 (start the SFX at `at`):
//  0–0.45 snare fill: three sparks fly in · 0.45 HIT: burst + logo slams (the kids shout at 0.47) ·
//  0.5–1.2 the name bounces letter by letter · 1.3–1.54 bell sparkle twinkles · 1.8 stab: the cast pops up ·
//  2.05 ta-da: arms up + confetti · 3.0–3.6 a star iris opens onto the episode underneath.
// ---------------------------------------------------------------------------------------------
export type IntroCast = { kids?: [KidSpec, KidSpec]; buddy?: CritterSpec };

export const SparksIntro: React.FC<{ t: number; at?: number; cast: IntroCast; name?: string }> = ({ t, at = 0, cast, name = 'TINY SPARKS' }) => {
  const { width: W, height: H } = useVideoConfig();
  const u = t - at;
  if (u < 0 || u >= 3.6) return null;
  const sc = Math.min(W / 1920, H / 1080);
  const cx = W / 2;
  const hit = 0.45;
  const sh = shakeAt(u, hit, 16 * sc, 0.32);
  const slam = u < hit ? 0 : u < hit + 0.16 ? 1.9 - 0.9 * EASE_OUT((u - hit) / 0.16) : 1 + Math.sin(prog(u, hit + 0.16, hit + 0.5) * Math.PI) * 0.06 * (1 - prog(u, hit + 0.16, hit + 0.5));
  const tada = u >= 2.05 ? 1 + Math.sin(prog(u, 2.05, 2.45) * Math.PI) * 0.08 : 1;
  const arc = u < hit ? 0 : backOut(prog(u, hit, hit + 0.34));
  const castUp = (d: number) => (u < 1.8 + d ? 0 : backOut(prog(u, 1.8 + d, 2.12 + d), 1.3));
  const ribbonY = H * 0.74;
  const iris = prog(u, 3.0, 3.6);
  const holeR = Math.hypot(W, H) * 1.2 * easeIn(iris);
  const cheer = u >= 2.05;
  const expr: KExpr = cheer ? 'laugh' : 'happy';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <K3DDefs />
        <defs>
          <radialGradient id="sparks-sky" cx="50%" cy="42%" r="70%">
            <stop offset="0" stopColor="#fff3b0" />
            <stop offset="0.5" stopColor="#9be0ff" />
            <stop offset="1" stopColor="#5fb4f0" />
          </radialGradient>
          <mask id="sparks-iris" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect width={W} height={H} fill="#ffffff" />
            {holeR > 0.5 && <polygon points={STAR5(holeR)} transform={`translate(${cx},${H / 2}) rotate(${iris * 50})`} fill="#000000" />}
          </mask>
        </defs>
        <g mask="url(#sparks-iris)">
          <g transform={`translate(${sh[0]},${sh[1]})`}>
            <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#sparks-sky)" />
            {/* slow sunburst */}
            <g transform={`translate(${cx},${H * 0.62}) rotate(${u * 18})`} opacity={0.28}>
              {Array.from({ length: 16 }).map((_, i) => (
                <path key={i} d={`M 0,0 L ${-W * 0.09},${-W} L ${W * 0.09},${-W} Z`} fill={RAINBOW[i % 6]} transform={`rotate(${i * 22.5})`} />
              ))}
            </g>
            {/* drum fill: three sparks converge on the centre */}
            {u < hit + 0.05 && [0, 1, 2].map((i) => {
              const p = EASE_INOUT(prog(u, i * 0.08, hit));
              const from: [number, number] = [[-0.1 * W, 0.15 * H], [1.1 * W, 0.2 * H], [0.5 * W, 1.15 * H]][i] as [number, number];
              const px = from[0] + (cx - from[0]) * p;
              const py = from[1] + (H * 0.45 - from[1]) * p;
              const dir = (Math.atan2(H * 0.45 - from[1], cx - from[0]) * 180) / Math.PI;
              return (
                <g key={i}>
                  <MotionLines t={u} from={0} to={hit + 0.05} x={px} y={py} dir={dir} n={3} len={120 * sc} spread={26 * sc} s={1} />
                  <Twinkle x={px} y={py} s={(1.6 + p) * sc} c={['#ffd166', '#ff8fab', '#ffffff'][i]} />
                </g>
              );
            })}
            {/* rainbow arc + big star */}
            {arc > 0 && (
              <g transform={`translate(${cx},${ribbonY + 40 * sc}) scale(${arc * tada})`}>
                {RAINBOW.slice(0, 6).map((c, i) => {
                  const r = (560 - i * 40) * sc;
                  return <path key={i} d={`M ${-r},0 A ${r},${r} 0 0,1 ${r},0`} fill="none" stroke={c} strokeWidth={40 * sc} />;
                })}
                <g transform={`translate(0,${-640 * sc}) rotate(${Math.sin(u * 2) * 8}) scale(${0.95 * sc})`}><Star c="#ffd166" /></g>
                <g transform={`translate(${-470 * sc},${-480 * sc}) rotate(14) scale(${0.45 * sc})`}><Star c="#ff6fa5" /></g>
                <g transform={`translate(${470 * sc},${-480 * sc}) rotate(-14) scale(${0.45 * sc})`}><Star c="#8ac926" /></g>
              </g>
            )}
            {/* the cast pops up behind the ribbon on the stab */}
            {cast.kids && (
              <>
                <g transform={`translate(0,${(1 - castUp(0)) * 700 * sc})`}>
                  <Kid spec={cast.kids[0]} x={cx - 640 * sc} y={H + 120 * sc} scale={0.95 * sc} expr={expr} armL={cheer ? 'up' : 'wave'} armR={cheer ? 'up' : 'down'} shadow={false} />
                </g>
                <g transform={`translate(0,${(1 - castUp(0.06)) * 700 * sc})`}>
                  <Kid spec={cast.kids[1]} x={cx + 640 * sc} y={H + 120 * sc} scale={0.95 * sc} expr={expr} armR={cheer ? 'up' : 'wave'} armL={cheer ? 'up' : 'down'} shadow={false} />
                </g>
              </>
            )}
            {cast.buddy && (
              <g transform={`translate(0,${(1 - castUp(0.03)) * 600 * sc})`}>
                <Critter spec={cast.buddy} x={cx} y={ribbonY + 330 * sc} scale={0.86 * sc} expr={expr} armL={cheer ? 'up' : 'wave'} armR={cheer ? 'up' : 'down'} shadow={false} />
              </g>
            )}
            <ImpactStar t={u} at={hit} x={cx} y={ribbonY - 30 * sc} s={1.7 * sc} />
            {/* the name ribbon: slams in on the hit, letters bounce with the shout */}
            {u >= hit && (
              <g transform={`translate(${cx},${ribbonY}) rotate(-3) scale(${slam * tada * sc})`}>
                <path d="M -560,-74 L 560,-74 L 524,0 L 560,74 L -560,74 L -524,0 Z" fill="#ff595e" {...kst(12)} />
                <path d="M -540,-56 L 540,-56" stroke="#ffffff" strokeWidth={6} opacity={0.35} strokeLinecap="round" />
                <text y={44} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={136} fill="#ffffff" stroke={KINK} strokeWidth={14} strokeLinejoin="round" paintOrder="stroke">
                  {name.split('').map((ch, i) => {
                    // dy (relative), never an absolute y: an absolute position starts a new text chunk and
                    // text-anchor would then centre every letter on its own
                    const off = (k: number) => (k < 0 ? 0 : -Math.sin(prog(u, hit + 0.06 + k * 0.05, hit + 0.34 + k * 0.05) * Math.PI) * 34);
                    return <tspan key={i} dy={off(i) - off(i - 1)}>{ch}</tspan>;
                  })}
                </text>
                {/* bell sparkle on the ribbon */}
                {[[-420, -70], [-60, -84], [300, -76], [470, 50]].map(([sx, sy], i) => {
                  const p = prog(u, 1.3 + i * 0.08, 1.8 + i * 0.08);
                  return p > 0 && p < 1 ? <Twinkle key={i} x={sx} y={sy} s={0.4 + Math.sin(p * Math.PI) * 1.1} c={['#ffd166', '#ffffff', '#ffd166', '#ffffff'][i]} o={Math.sin(p * Math.PI)} /> : null;
                })}
              </g>
            )}
          </g>
        </g>
      </svg>
      {u < 3.0 && <Confetti t={u} at={2.05} y={H * 0.4} dur={1.1} />}
    </AbsoluteFill>
  );
};
