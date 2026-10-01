// Comedy kit for toon series — camera, cuts, dialogue captions, title bar, time cards and the
// series SIGNATURE ending. Everything here runs on GLOBAL seconds (t = frame / fps): toon
// episodes don't nest <Sequence>s, so a cue written as 12.8 is 12.8 everywhere — no local-frame
// conversions, no off-by-a-sequence bugs.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadFredoka } from '@remotion/google-fonts/Fredoka';
import { loadFont as loadBangers } from '@remotion/google-fonts/Bangers';
import { EASE_INOUT, EASE_OUT, chunkLines, prog, timeWords, type VoLine } from '../shorts';

export const FONT_TOON = loadFredoka('normal', { weights: ['600', '700'], subsets: ['latin'] }).fontFamily;
export const FONT_PUNCH = loadBangers('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily;

export const W = 1080;
export const H = 1920;

export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// ---------------------------------------------------------------------------------------------
// CAMERA — keyframed zoom/focus over the 1080x1920 stage. A key with cut:true is a hard cut
// (hold the previous framing until its time, then jump); otherwise frames ease between keys.
// ---------------------------------------------------------------------------------------------
export type CamKey = { t: number; z: number; x: number; y: number; cut?: boolean; rot?: number };
export type Cam = { z: number; x: number; y: number; rot: number };

export const camAt = (t: number, keys: CamKey[]): Cam => {
  const k = [...keys].sort((a, b) => a.t - b.t);
  if (t <= k[0].t) return { z: k[0].z, x: k[0].x, y: k[0].y, rot: k[0].rot ?? 0 };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (t >= a.t && t < b.t) {
      if (b.cut) return { z: a.z, x: a.x, y: a.y, rot: a.rot ?? 0 };
      const p = EASE_INOUT(prog(t, a.t, b.t));
      return {
        z: a.z + (b.z - a.z) * p,
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p,
        rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * p,
      };
    }
  }
  const l = k[k.length - 1];
  return { z: l.z, x: l.x, y: l.y, rot: l.rot ?? 0 };
};

// shake: deterministic jitter, amplitude in px, decays over `dur` seconds from `at`
export const shakeAt = (t: number, at: number, amp = 18, dur = 0.35): [number, number] => {
  if (t < at || t > at + dur) return [0, 0];
  const k = 1 - (t - at) / dur;
  const f = (t - at) * 60;
  return [Math.sin(f * 2.1) * amp * k, Math.cos(f * 2.7) * amp * k];
};

// The stage: one SVG, the camera transform on a group. Focus is clamped so the 1080x1920 set
// never shows its edge (keep z >= 1).
export const Stage: React.FC<{ cam: Cam; shake?: [number, number]; filter?: string; children: React.ReactNode }> = ({
  cam,
  shake = [0, 0],
  filter,
  children,
}) => {
  const z = Math.max(1, cam.z);
  const hw = W / 2 / z;
  const hh = H / 2 / z;
  const cx = Math.min(W - hw, Math.max(hw, cam.x));
  const cy = Math.min(H - hh, Math.max(hh, cam.y));
  const tx = W / 2 - cx * z + shake[0];
  const ty = H / 2 - cy * z + shake[1];
  return (
    <AbsoluteFill style={{ filter }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${tx},${ty}) scale(${z}) rotate(${cam.rot} ${cx} ${cy})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

// renders children only inside [from, to) GLOBAL seconds
export const Cut: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const t = useT();
  return t >= from && t < to ? <>{children}</> : null;
};

// white pop on a smash cut
export const Flash: React.FC<{ at: number; dur?: number; color?: string }> = ({ at, dur = 0.12, color = '#ffffff' }) => {
  const t = useT();
  if (t < at || t > at + dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: 0.85 * (1 - (t - at) / dur) }} />;
};

// ---------------------------------------------------------------------------------------------
// LIP-SYNC — mouth openness for one speaker from the VO word map (real word times once
// gen_voice has run; estimated before). Flaps on words, rests between them.
// ---------------------------------------------------------------------------------------------
export const lipSync = (vo: VoLine[], speaker: string, t: number): number => {
  for (const line of vo) {
    if (line.speaker !== speaker || t < line.start - 0.05 || t > line.end + 0.05) continue;
    for (const w of timeWords(line)) {
      if (t >= w.start && t < w.end) {
        const k = (t - w.start) * 13;
        return 0.3 + 0.7 * Math.abs(Math.sin(k + 0.6));
      }
    }
    return 0.08;
  }
  return 0;
};

// is `speaker` talking right now (for look-at / gesture switches)
export const talking = (vo: VoLine[], speaker: string, t: number) =>
  vo.some((l) => l.speaker === speaker && t >= l.start && t <= l.end);

// ---------------------------------------------------------------------------------------------
// DIALOGUE CAPTIONS — chunked, big rounded type with a thick ink stroke; the active word takes
// its speaker's colour, so the viewer knows who's talking with the sound off.
// ---------------------------------------------------------------------------------------------
export const DialogueCaptions: React.FC<{
  lines: VoLine[];
  colors: Record<string, string>;
  narrator?: string;
  y?: number;
  size?: number;
  maxWords?: number;
}> = ({ lines, colors, narrator = '#ffffff', y = 1330, size = 74, maxWords = 3 }) => {
  const t = useT();
  // chunk per line so a chunk never spans two speakers
  const chunks = lines.flatMap((l) => chunkLines([l], maxWords).map((c) => ({ ...c, speaker: l.speaker })));
  chunks.forEach((c, i) => {
    const next = chunks[i + 1];
    c.hold = next ? Math.min(next.start, c.end + 0.5) : c.end + 0.7;
  });
  const active = chunks.find((c) => t >= c.start && t < c.hold);
  if (!active) return null;
  const color = (active.speaker && colors[active.speaker]) || narrator;
  const enter = prog(t, active.start, active.start + 0.1);
  return (
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        top: y,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.26,
        transform: `translateY(-50%) scale(${0.86 + 0.14 * EASE_OUT(enter)})`,
      }}
    >
      {active.words.map((w, i) => {
        const on = t >= w.start && t < w.end + 0.04;
        const seen = t >= w.start - 0.02;
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_TOON,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.12,
              color: on ? color : '#ffffff',
              opacity: seen ? 1 : 0.45,
              WebkitTextStroke: `${size * 0.16}px #160e09`,
              paintOrder: 'stroke fill',
              textShadow: '0 6px 0 rgba(0,0,0,0.35)',
              transform: `scale(${on ? 1.1 : 1}) rotate(${on ? -2 : 0}deg)`,
              display: 'inline-block',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// TITLE BAR — the meme-format episode title that stays on screen the whole video (white box,
// black type), with the series tag pill above it. Frame 0 is fully composed.
// ---------------------------------------------------------------------------------------------
export const TitleBar: React.FC<{ title: string; series: string; ep: number; accent: string; until?: number }> = ({
  title,
  series,
  ep,
  accent,
  until = 1e9,
}) => {
  const t = useT();
  if (t >= until) return null;
  return (
    <div style={{ position: 'absolute', top: 158, left: 70, right: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          fontFamily: FONT_PUNCH,
          fontSize: 40,
          letterSpacing: 2,
          color: '#ffffff',
          background: accent,
          padding: '6px 20px 2px',
          borderRadius: 999,
          border: '4px solid #160e09',
          transform: 'rotate(-2deg)',
        }}
      >
        {series} · EP {ep}
      </div>
      <div
        style={{
          fontFamily: FONT_TOON,
          fontWeight: 700,
          fontSize: 54,
          lineHeight: 1.14,
          color: '#111111',
          background: '#ffffff',
          padding: '16px 28px',
          borderRadius: 20,
          textAlign: 'center',
          boxShadow: '0 8px 0 rgba(0,0,0,0.28)',
          border: '4px solid #160e09',
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// TIME CARD — "3 HOURS LATER", cartoon-style: sunburst, wobbling punch type.
// ---------------------------------------------------------------------------------------------
export const TimeCard: React.FC<{ from: number; to: number; text: string; bg?: string; ray?: string }> = ({
  from,
  to,
  text,
  bg = '#ffd23f',
  ray = '#ffbe0b',
}) => {
  const t = useT();
  if (t < from || t >= to) return null;
  const p = t - from;
  const pop = EASE_OUT(prog(p, 0, 0.22));
  const wob = Math.sin(p * 9) * 2.5;
  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 3000,
          height: 3000,
          marginLeft: -1500,
          marginTop: -1500,
          background: `repeating-conic-gradient(${ray} 0deg 10deg, transparent 10deg 20deg)`,
          transform: `rotate(${p * 22}deg)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: FONT_PUNCH,
            fontSize: 168,
            lineHeight: 0.95,
            textAlign: 'center',
            color: '#ffffff',
            WebkitTextStroke: '22px #160e09',
            paintOrder: 'stroke fill',
            textShadow: '0 14px 0 rgba(0,0,0,0.3)',
            transform: `scale(${0.4 + 0.6 * pop}) rotate(${-4 + wob}deg)`,
            padding: '0 60px',
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// FX on the stage (SVG, inside the camera)
// ---------------------------------------------------------------------------------------------
// epic light rays behind a character — for the "main character" moments
export const Rays: React.FC<{ x: number; y: number; t: number; from: number; to: number; color?: string }> = ({
  x,
  y,
  t,
  from,
  to,
  color = '#fff3b0',
}) => {
  if (t < from || t >= to) return null;
  const o = Math.min(prog(t, from, from + 0.25), 1 - prog(t, to - 0.2, to));
  const rot = (t - from) * 14;
  return (
    <g opacity={0.75 * o} transform={`translate(${x},${y}) rotate(${rot})`}>
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={i} d="M 0,0 L -70,-1400 L 70,-1400 Z" fill={color} transform={`rotate(${(i * 360) / 14})`} />
      ))}
    </g>
  );
};

// 4-point sparkles popping around a point
export const Sparkles: React.FC<{ x: number; y: number; t: number; at: number; spread?: number; color?: string }> = ({
  x,
  y,
  t,
  at,
  spread = 130,
  color = '#fff6c2',
}) => {
  const pts: [number, number, number][] = [
    [-1, -0.6, 0],
    [0.9, -0.9, 0.08],
    [1.1, 0.4, 0.16],
    [-0.8, 0.7, 0.22],
  ];
  return (
    <g>
      {pts.map(([dx, dy, d], i) => {
        const p = prog(t, at + d, at + d + 0.5);
        if (p <= 0 || p >= 1) return null;
        const s = Math.sin(p * Math.PI) * 34;
        return (
          <path
            key={i}
            d={`M 0,${-s} Q 0,0 ${s},0 Q 0,0 0,${s} Q 0,0 ${-s},0 Q 0,0 0,${-s} Z`}
            fill={color}
            stroke="#160e09"
            strokeWidth={4}
            transform={`translate(${x + dx * spread},${y + dy * spread}) rotate(${p * 90})`}
          />
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// THE SIGNATURE ENDING — identical in every episode of a series (only the timing moves):
// the world drains to grey, letterbox bars slam in, the camera holds on THE STARE, and the
// catchphrase stamps down. Mount it at the root, over the stage; pair it with a camera push
// to the hero's face and expr 'deadpan' (the stare) on him.
// ---------------------------------------------------------------------------------------------
export const signatureFilter = (t: number, at: number) => {
  const p = EASE_OUT(prog(t, at, at + 0.35));
  return p > 0 ? `grayscale(${0.75 * p}) contrast(${1 + 0.18 * p})` : undefined;
};

export const SignatureStamp: React.FC<{ at: number; text: string; accent: string; stampAt?: number }> = ({
  at,
  text,
  accent,
  stampAt,
}) => {
  const t = useT();
  if (t < at) return null;
  const bars = EASE_OUT(prog(t, at, at + 0.22));
  const sAt = stampAt ?? at + 0.45;
  const s = prog(t, sAt, sAt + 0.16);
  const [jx, jy] = shakeAt(t, sAt + 0.16, 10, 0.3);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(120,10,20,0.55) 100%)', opacity: bars }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 150 * bars, background: '#0b0706' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 * bars, background: '#0b0706' }} />
      {s > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 1190 }}>
          <div
            style={{
              fontFamily: FONT_PUNCH,
              fontSize: 190,
              letterSpacing: 4,
              color: '#ffd23f',
              WebkitTextStroke: '26px #160e09',
              paintOrder: 'stroke fill',
              textShadow: `0 14px 0 ${accent}`,
              transform: `translate(${jx}px,${jy}px) scale(${2.4 - 1.4 * EASE_OUT(s)}) rotate(-7deg)`,
              opacity: Math.min(1, s * 3),
            }}
          >
            {text}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Zzz — snore letters drifting up from a sleeping head (stage coords)
// ---------------------------------------------------------------------------------------------
export const Zzz: React.FC<{ x: number; y: number; t: number; from?: number; to?: number }> = ({ x, y, t, from = -1e9, to = 1e9 }) => {
  if (t < from || t >= to) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const p = ((t - from) * 0.55 + i / 3) % 1;
        return (
          <text
            key={i}
            x={x + p * 90 + Math.sin(p * 6) * 14}
            y={y - p * 230}
            fontFamily={FONT_PUNCH}
            fontSize={56 + i * 16}
            fill="#ffffff"
            stroke="#160e09"
            strokeWidth={7}
            paintOrder="stroke"
            opacity={Math.sin(p * Math.PI)}
          >
            Z
          </text>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// BRO MATH — the "calculating meme": chalk equations pop in around a head, one per `at`, and
// bob while he computes. A recurring visual for every "bro math" payoff (stage coords).
// ---------------------------------------------------------------------------------------------
export type MathLine = { text: string; dx: number; dy: number; at: number; rot?: number; color?: string };
export const BroMath: React.FC<{ x: number; y: number; t: number; to: number; lines: MathLine[]; size?: number }> = ({
  x,
  y,
  t,
  to,
  lines,
  size = 46,
}) => {
  if (t >= to) return null;
  return (
    <g>
      {lines.map((l, i) => {
        if (t < l.at) return null;
        const p = EASE_OUT(prog(t, l.at, l.at + 0.2));
        const bob = Math.sin((t - l.at) * 3 + i) * 6;
        return (
          <text
            key={i}
            x={x + l.dx}
            y={y + l.dy + bob}
            textAnchor="middle"
            fontFamily={FONT_TOON}
            fontWeight={700}
            fontSize={size}
            fill={l.color ?? '#ffffff'}
            stroke="#160e09"
            strokeWidth={9}
            paintOrder="stroke"
            opacity={p}
            transform={`rotate(${l.rot ?? 0} ${x + l.dx} ${y + l.dy}) translate(0,${(1 - p) * 20})`}
          >
            {l.text}
          </text>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// NOTIFICATION — a phone push banner sliding down under the title bar (screen space). The
// fastest way to deliver bad news without a line of dialogue.
// ---------------------------------------------------------------------------------------------
export const Notification: React.FC<{ at: number; until: number; app: string; title: string; body: string; color?: string }> = ({
  at,
  until,
  app,
  title,
  body,
  color = '#e63946',
}) => {
  const t = useT();
  if (t < at || t >= until) return null;
  const inP = EASE_OUT(prog(t, at, at + 0.25));
  const outP = prog(t, until - 0.2, until);
  const wob = t < at + 0.6 ? Math.sin((t - at) * 50) * 4 * (1 - prog(t, at, at + 0.6)) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: 450,
        transform: `translate(${wob}px, ${(1 - inP) * -260 - outP * 260}px)`,
        opacity: 1 - outP,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 30,
        border: '4px solid #160e09',
        boxShadow: '0 12px 0 rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '20px 26px',
      }}
    >
      <div style={{ width: 84, height: 84, borderRadius: 20, background: color, border: '4px solid #160e09', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_PUNCH, fontSize: 56, color: '#fff' }}>
        {app.slice(0, 1)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: FONT_TOON, fontWeight: 600, fontSize: 28, color: '#6c757d' }}>{app} · now</div>
        <div style={{ fontFamily: FONT_TOON, fontWeight: 700, fontSize: 42, color: '#111' }}>{title}</div>
        <div style={{ fontFamily: FONT_TOON, fontWeight: 600, fontSize: 34, color: color }}>{body}</div>
      </div>
    </div>
  );
};
