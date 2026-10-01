// Identity-vote lib — an accruing tally that flips a label at a majority threshold.
// Engine: a schedule of small actions ('left' | 'right'), each one a vote for a competing
// self-label. Every number on screen (the two counts, the leading label) is read off
// `voteSeries(schedule)` at the current count — never typed twice. A single continuous scalar
// (`revealCount`) drives both directions: rising, it casts votes in schedule order; falling
// (the "rewind"), it un-casts them in the exact reverse order, because it is the same
// interpolation between adjacent cumulative states either way.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import { EASE_OUT, prog } from './shorts';

export type Side = 'left' | 'right';
export type Tally = { left: number; right: number };

// Cumulative {left,right} after k votes, k = 0..schedule.length. Pure — the only authored
// content is the schedule itself; every count on screen is this array, read back.
export const voteSeries = (schedule: Side[]): Tally[] => {
  const out: Tally[] = [{ left: 0, right: 0 }];
  let left = 0;
  let right = 0;
  for (const s of schedule) {
    if (s === 'left') left += 1;
    else right += 1;
    out.push({ left, right });
  }
  return out;
};

// The label leading at tally t: 'left' | 'right' | null (tie / no votes yet).
export const leaderOf = (t: Tally): Side | null => {
  if (t.left === t.right) return null;
  return t.left > t.right ? 'left' : 'right';
};

const VOTE_W = 176;
const VOTE_H = 54;
const VOTE_GAP = 12;

const VoteChip: React.FC<{ color: string; scale: number; opacity: number }> = ({ color, scale, opacity }) => (
  <div
    style={{
      width: VOTE_W,
      height: VOTE_H,
      borderRadius: 14,
      background: `${color}26`,
      border: `2px solid ${color}`,
      opacity,
      transform: `scale(${scale})`,
      boxShadow: `0 6px 22px ${color}33`,
    }}
  />
);

// One stack of vote chips growing upward from a baseline. `count` fully-settled chips plus one
// optional fractional "landing" chip (0..1, the vote currently being cast or un-cast).
export const VoteStack: React.FC<{
  x: number;
  baseline: number;
  count: number;
  landing: number; // 0..1, the (count+1)-th chip's entrance progress
  color: string;
  chipW?: number;
  gap?: number;
}> = ({ x, baseline, count, landing, color, chipW = VOTE_W, gap = VOTE_GAP }) => {
  const scale = chipW / VOTE_W;
  const step = VOTE_H * scale + gap;
  const chips = [...Array(count)].map((_, i) => i);
  return (
    <>
      {chips.map((i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: baseline - (i + 1) * step, transform: 'translateX(-50%)' }}>
          <VoteChip color={color} scale={scale} opacity={1} />
        </div>
      ))}
      {landing > 0.01 ? (
        <div style={{ position: 'absolute', left: x, top: baseline - (count + 1) * step, transform: 'translateX(-50%)' }}>
          <VoteChip color={color} scale={scale * (0.55 + 0.45 * EASE_OUT(landing))} opacity={landing} />
        </div>
      ) : null}
    </>
  );
};

// The identity pill above the stacks — cross-fades to whichever side currently leads.
export const IdentityLabel: React.FC<{ x: number; y: number; leftText: string; rightText: string; neutralText: string; leader: Side | null; leftColor: string; rightColor: string; size?: number }> = ({
  x,
  y,
  leftText,
  rightText,
  neutralText,
  leader,
  leftColor,
  rightColor,
  size = 48,
}) => {
  const text = leader === 'left' ? leftText : leader === 'right' ? rightText : neutralText;
  const color = leader === 'left' ? leftColor : leader === 'right' ? rightColor : '#ffffff';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        textShadow: '0 4px 24px rgba(0,0,0,0.55)',
      }}
    >
      {text}
    </div>
  );
};

// Small mono readout of the running score, e.g. "2 — 3".
export const TallyReadout: React.FC<{ x: number; y: number; left: number; right: number; leftColor: string; rightColor: string; size?: number }> = ({
  x,
  y,
  left,
  right,
  leftColor,
  rightColor,
  size = 34,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      fontFamily: FONT_MONO,
      fontWeight: 700,
      fontSize: size,
      color: '#fff',
      display: 'flex',
      gap: 14,
      alignItems: 'center',
    }}
  >
    <span style={{ color: leftColor }}>{left}</span>
    <span style={{ opacity: 0.5 }}>—</span>
    <span style={{ color: rightColor }}>{right}</span>
  </div>
);

// A horizontal percentage bar with a label above and a big number at its trailing edge.
// Generic — reusable for any two-condition comparison, not just this video.
export const CompareBar: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  pct: number;
  color: string;
  label: string;
  at: number;
  dur?: number;
}> = ({ x, y, w, h = 76, pct, color, label, at, dur = 24 }) => {
  const frame = useCurrentFrame();
  const p = EASE_OUT(prog(frame, at, at + dur));
  const trackW = w - 150;
  const fillW = Math.max(h, trackW * (pct / 100) * p);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: prog(frame, at - 4, at + 4) }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 27,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)',
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ position: 'relative', width: trackW, height: h, borderRadius: h / 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: fillW,
              borderRadius: h / 2,
              background: color,
              boxShadow: `0 8px 30px ${color}55`,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 46,
            color,
            whiteSpace: 'nowrap',
            minWidth: 118,
          }}
        >
          {Math.round(pct * p)}%
        </div>
      </div>
    </div>
  );
};
