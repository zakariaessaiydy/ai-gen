// =============================================================================
// lib/hear.tsx — THE HEARING CHART (who is calling, and which part of it reaches you)
//
// First used by short-51 ("What If Humans Could Talk to Animals?").
//
// One panel, one rule, COMPUTED, never typed:
//   a log-frequency axis; each species is a band [lo, hi] Hz; a listening WINDOW [wLo, wHi] Hz
//   (your ears, or a translator) lights the part of every band it covers. The "% heard" on each
//   row is the log-frequency overlap of that band with the window.
//
// The chart is drawn in LOCAL px (0..w, 0..h). Every wave texture completes a whole number of
// cycles over `loopFrames`, so frame 0 and the last frame match.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const logMix = (a: number, b: number, t: number) => 10 ** mix(Math.log10(a), Math.log10(b), t);

export const HR = {
  bg: '#0d1117',
  panel: '#131a24',
  panelBorder: 'rgba(255,255,255,0.08)',
  grid: 'rgba(255,255,255,0.06)',
  dim: '#8b949e',
  deaf: '#2b313b',
  ink: '#e6edf3',
  ears: '#6366F1', // your ears
  translator: '#4ecdc4', // the translator
} as const;

// =============================================================================
// THE NUMBERS
// =============================================================================
export const EARS = { lo: 20, hi: 20_000 } as const;
export const AXIS = { lo: 10, hi: 150_000 } as const; // the chart's (and the translator's) span

export type Band = { id: string; name: string; call: string; lo: number; hi: number; color: string };

/** 0..1 share of [lo, hi] (on a log axis) that falls inside [wLo, wHi] */
export const heardShare = (b: { lo: number; hi: number }, wLo: number, wHi: number) => {
  const a = Math.max(Math.log10(b.lo), Math.log10(wLo));
  const z = Math.min(Math.log10(b.hi), Math.log10(wHi));
  return clamp01((z - a) / (Math.log10(b.hi) - Math.log10(b.lo)));
};

export const fmtHz = (hz: number) => {
  if (hz >= 1000) {
    const k = hz / 1000;
    return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10} kHz`;
  }
  return `${Math.round(hz)} Hz`;
};

// =============================================================================
// THE CHART
// =============================================================================
type ChartProps = {
  w: number;
  h: number;
  bands: Band[];
  wLo: number;
  wHi: number;
  translator: number; // 0 = ears (indigo), 1 = translator (teal)
  frame: number;
  loopFrames: number;
  focus?: Record<string, number>; // row id -> 0..1 spotlight
  tags?: Record<string, { text: string; o: number }>; // row id -> a call tag
  edgePop?: number; // 0..1 pop of the window's edge labels
  marker?: { hz: number; label: string; o: number; color: string };
};

const PAD_X = 64;
const TOP = 110; // axis labels live above this
const ROW_H = 150;
const BAR_H = 46;

export const HearChart: React.FC<ChartProps> = ({ w, h, bands, wLo, wHi, translator, frame, loopFrames, focus = {}, tags = {}, edgePop = 0, marker }) => {
  const x = (hz: number) => PAD_X + ((Math.log10(hz) - Math.log10(AXIS.lo)) / (Math.log10(AXIS.hi) - Math.log10(AXIS.lo))) * (w - 2 * PAD_X);
  const x0 = x(wLo);
  const x1 = x(wHi);
  const winColor = translator > 0.5 ? HR.translator : HR.ears;
  const rowsTop = TOP + 30;
  const rowsBot = rowsTop + bands.length * ROW_H;
  const anyFocus = Math.max(0, ...Object.values(focus));

  const decades = [10, 100, 1000, 10_000, 100_000];
  const minors: number[] = [];
  for (let d = 1; d <= 100_000; d *= 10) for (let m = 2; m <= 9; m++) if (d * m >= AXIS.lo && d * m <= AXIS.hi) minors.push(d * m);

  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <clipPath id="hear-window">
          <rect x={x0} y={0} width={Math.max(0, x1 - x0)} height={h} />
        </clipPath>
      </defs>

      {/* grid */}
      {minors.map((m) => (
        <line key={m} x1={x(m)} x2={x(m)} y1={TOP} y2={rowsBot} stroke={HR.grid} strokeWidth={1} />
      ))}
      {decades.map((d) => (
        <g key={d}>
          <line x1={x(d)} x2={x(d)} y1={TOP - 6} y2={rowsBot} stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />
          <text x={x(d)} y={TOP - 18} textAnchor="middle" fill={HR.dim} fontFamily={FONT_MONO} fontSize={26} fontWeight={500}>
            {fmtHz(d)}
          </text>
        </g>
      ))}

      {/* the listening window */}
      <rect x={x0} y={TOP} width={Math.max(0, x1 - x0)} height={rowsBot - TOP + 20} fill={winColor} opacity={0.13} rx={10} />
      <line x1={x0} x2={x0} y1={TOP} y2={rowsBot + 20} stroke={winColor} strokeWidth={3} opacity={0.9} />
      <line x1={x1} x2={x1} y1={TOP} y2={rowsBot + 20} stroke={winColor} strokeWidth={3} opacity={0.9} />

      {/* rows */}
      {bands.map((b, i) => {
        const cy = rowsTop + i * ROW_H + ROW_H - BAR_H / 2 - 18;
        const bx0 = x(b.lo);
        const bx1 = x(b.hi);
        const fo = focus[b.id] ?? 0;
        const rowO = 1 - 0.55 * anyFocus * (1 - fo);
        const share = heardShare(b, wLo, wHi);
        const pct = Math.round(share * 100);
        // wave texture: tighter for higher calls, a whole number of cycles over the loop
        const centre = Math.sqrt(b.lo * b.hi);
        const lambda = mix(70, 16, clamp01((Math.log10(centre) - 1) / 4));
        const cycles = 2 + i;
        const phase = ((frame / loopFrames) * cycles) % 1;
        let d = '';
        for (let px = bx0; px <= bx1 + 0.5; px += 3) {
          const yy = cy + Math.sin(((px - bx0) / lambda + phase) * Math.PI * 2) * (BAR_H * 0.28);
          d += `${px === bx0 ? 'M' : 'L'}${px.toFixed(1)},${yy.toFixed(1)} `;
        }
        const tag = tags[b.id];
        return (
          <g key={b.id} opacity={rowO}>
            {/* label line */}
            <text x={PAD_X - 6} y={cy - BAR_H / 2 - 16} fill={HR.ink} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={40} letterSpacing={1}>
              {b.name.toUpperCase()}
              <tspan fill={b.color} fontFamily={FONT_MONO} fontWeight={500} fontSize={28} dx={16}>
                {b.call.toUpperCase()}
              </tspan>
            </text>
            <text x={w - PAD_X + 6} y={cy - BAR_H / 2 - 16} textAnchor="end" fill={pct === 0 ? '#e8879f' : pct === 100 ? winColor : HR.ink} fontFamily={FONT_MONO} fontWeight={700} fontSize={36}>
              {pct}% <tspan fill={HR.dim} fontWeight={500} fontSize={24}>HEARD</tspan>
            </text>
            {/* spotlight halo */}
            {fo > 0.01 ? <rect x={bx0 - 10} y={cy - BAR_H / 2 - 10} width={bx1 - bx0 + 20} height={BAR_H + 20} rx={(BAR_H + 20) / 2} fill="none" stroke={b.color} strokeWidth={3} opacity={fo * 0.8} /> : null}
            {/* the whole band, unheard */}
            <rect x={bx0} y={cy - BAR_H / 2} width={bx1 - bx0} height={BAR_H} rx={BAR_H / 2} fill={HR.deaf} stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} strokeDasharray="6 6" />
            <path d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={3} />
            {/* the part that reaches you */}
            <g clipPath="url(#hear-window)">
              <rect x={bx0} y={cy - BAR_H / 2} width={bx1 - bx0} height={BAR_H} rx={BAR_H / 2} fill={b.color} opacity={0.9} />
              <path d={d} fill="none" stroke="rgba(13,17,23,0.55)" strokeWidth={3} />
            </g>
            {tag && tag.o > 0.01 ? (
              <text
                x={(bx0 + bx1) / 2 > w / 2 ? bx0 - 26 - (1 - tag.o) * 16 : bx1 + 26 + (1 - tag.o) * 16}
                y={cy + 9}
                textAnchor={(bx0 + bx1) / 2 > w / 2 ? 'end' : 'start'}
                opacity={tag.o}
                fill={b.color}
                fontFamily={FONT_MONO}
                fontWeight={700}
                fontSize={27}
                letterSpacing={1}
              >
                {tag.text}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* marker (e.g. 50 kHz) */}
      {marker && marker.o > 0.01 ? (
        <g opacity={marker.o}>
          <line x1={x(marker.hz)} x2={x(marker.hz)} y1={TOP} y2={rowsBot} stroke={marker.color} strokeWidth={3} strokeDasharray="8 6" />
          <rect x={x(marker.hz) - 84} y={TOP + 4} width={168} height={44} rx={22} fill={HR.bg} stroke={marker.color} strokeWidth={2} />
          <text x={x(marker.hz)} y={TOP + 35} textAnchor="middle" fill={marker.color} fontFamily={FONT_MONO} fontWeight={700} fontSize={26}>
            {marker.label}
          </text>
        </g>
      ) : null}

      {/* window edge labels */}
      {[
        [Math.max(x0, 96), fmtHz(wLo)],
        [Math.min(x1, w - 96), fmtHz(wHi)],
      ].map(([px, t], i) => (
        <g key={i} transform={`translate(${px as number}, ${rowsBot + 48}) scale(${1 + 0.18 * edgePop})`}>
          <rect x={-84} y={-26} width={168} height={52} rx={26} fill={winColor} />
          <text x={0} y={9} textAnchor="middle" fill={HR.bg} fontFamily={FONT_MONO} fontWeight={700} fontSize={26}>
            {t as string}
          </text>
        </g>
      ))}
      <text x={(x0 + x1) / 2} y={rowsBot + 58} textAnchor="middle" fill={winColor} fontFamily={FONT_BODY} fontWeight={600} fontSize={30} letterSpacing={6}>
        {translator > 0.5 ? 'TRANSLATOR' : 'YOUR EARS'}
      </text>
    </svg>
  );
};

// =============================================================================
// CALL CARD — "this sound means this" (call glyph -> meaning -> response)
// =============================================================================
export type CallShape = 'bark' | 'cough' | 'chutter' | 'whistle';

/** a small spectrogram-ish glyph of a call: frequency over time */
export const CallGlyph: React.FC<{ shape: CallShape; w: number; h: number; color: string; draw?: number }> = ({ shape, w, h, color, draw = 1 }) => {
  const pts: [number, number][] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let v = 0.5;
    if (shape === 'bark') v = 0.5 + 0.38 * Math.sin(t * Math.PI * 6) * (Math.sin(t * Math.PI * 3) > 0 ? 1 : 0.2);
    if (shape === 'cough') v = 0.55 + 0.35 * Math.exp(-(((t % 0.5) - 0.12) ** 2) / 0.004);
    if (shape === 'chutter') v = 0.5 + 0.3 * Math.sin(t * Math.PI * 22) * Math.sin(t * Math.PI);
    if (shape === 'whistle') v = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2.4 - 1.2)) * (0.6 + 0.4 * t);
    pts.push([t * w, h - v * h]);
  }
  const shown = pts.slice(0, Math.max(2, Math.round(draw * pts.length)));
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <line x1={0} x2={w} y1={h} y2={h} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      <polyline points={shown.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const CallCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  shape: CallShape;
  label: string;
  meaning: string;
  response: string;
  color: string;
  o: number; // 0..1 entrance
}> = ({ x, y, w, h = 156, shape, label, meaning, response, color, o }) => {
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: o,
        transform: `translateY(${(1 - o) * 24}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        padding: '0 30px',
        boxSizing: 'border-box',
        background: 'rgba(22,27,34,0.95)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderLeft: `8px solid ${color}`,
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ width: 170, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <CallGlyph shape={shape} w={170} h={50} color={color} draw={o} />
        <div style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 22, letterSpacing: 2, color: HR.dim }}>{label}</div>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: HR.dim }}>→</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, letterSpacing: 1, color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>{meaning}</div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 31, color, marginTop: 10 }}>{response}</div>
      </div>
    </div>
  );
};
