// =============================================================================
// lib/phase.tsx — THE CLOCK-PHASE ENGINE (a week of nights, each one a single number)
//
// A night is ONE SCALAR: `phase`, the hours the body clock sits away from where school needs
// it. Everything drawn on a row is derived from that one number — when they fall asleep, when
// they would wake on their own, when an alarm makes them wake instead, the sleep that survives
// the difference, and the two-hour window before bedtime where sleep is hardest. Nothing on a
// row is keyframed independently, so no two things on a row can disagree.
//
// The engine's whole argument lives in `stepsAt(i, start, taken)`: the SAME staircase of
// 15-minute steps, with one argument — the row it starts on — deciding whether it is taken in a
// week with an alarm in it or a week without one. The reveal and the twist are that one
// argument, moved. Same ethos as prob.tsx's seeded trials, map.tsx's real Mercator, orbit.tsx's
// Verlet integrator, cycle.tsx's conserved particles, order.tsx's replayed swaps, budget.tsx's
// read-back hub and kid.tsx's measured gaits: never assert what the code can compute.
//
// TIME CONVENTION: hours as a continuous decimal on a night's own axis, so an evening and the
// morning after it are one increasing line. 20.5 = 20:30 tonight, 30.75 = 06:45 tomorrow. The
// axis never wraps; only `hhmm()` folds a value back onto a clock face for display.
// =============================================================================
import React from 'react';
import { Easing } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const PHASE_COLORS = {
  stage: '#0b0e14',
  grid: 'rgba(255,255,255,0.055)',
  gridStrong: 'rgba(255,255,255,0.16)',
  rail: 'rgba(255,255,255,0.05)',
  dim: '#8b93a7',
  text: '#e8ecf5',
  sleep: '#6366F1',
  sleepEdge: '#8b8ef5',
  full: '#4db8a8',
  lost: '#e8879f',
  zone: '#f5d76e',
  accent: '#f5d76e',
} as const;

export const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE MODEL — three constants. Everything below is arithmetic on them.
// =============================================================================
export const ONSET0 = 23.5; // 23:30, the summer bedtime (a stated premise, not a statistic)
export const ALARM = 30.75; // 06:45, the school morning
export const NEED = 9; // hours — the FLOOR of the AASM 9-12 range for ages 6-12
export const STEP = 0.25; // 15 minutes: the nightly bite (AAP back-to-school guidance)

/** The phase that has to be closed: bedtime + need, minus the alarm. 1h45. */
export const TO_CLOSE = ONSET0 + NEED - ALARM;
/** ...and therefore the number of nights. SEVEN is derived here and nowhere else. */
export const NIGHTS = Math.round(TO_CLOSE / STEP);
export const ZONE = 2; // the wake-maintenance zone: the 2h before habitual onset

export const ROWS = 12;
export const SCHOOL_ROW = 7; // rows 0..6 are the last holiday nights, 7..11 are school mornings
/** Start the run on the night school begins... */
export const START_LATE = SCHOOL_ROW - 1;
/** ...or exactly NIGHTS rows earlier. The twist is this one number, animated. */
export const START_EARLY = START_LATE - NIGHTS;

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
export const labelOf = (i: number) => (i < SCHOOL_ROW ? `${i - SCHOOL_ROW}` : DAYS[i - SCHOOL_ROW]);

/**
 * How many 15-minute steps night `i` has taken.
 *
 * `start` is the row BEFORE the first stepped night, so row `start + 1` has taken one step.
 * `taken` is how far the run has got in time: a row that the run has not reached yet is still
 * sitting on the summer phase, which is what makes the staircase form night by night instead of
 * as a block. Both are continuous, so both animate.
 */
export const stepsAt = (i: number, start: number, taken: number) => {
  const k = clamp(i - start, 0, NIGHTS);
  return k * clamp01(taken - k + 1);
};
export const phaseAt = (i: number, start: number, taken: number) => -STEP * stepsAt(i, start, taken);

export type Night = {
  i: number;
  label: string;
  school: boolean;
  phase: number;
  onset: number;
  natWake: number; // when they would wake on their own — onset + NEED, always
  wake: number; // when they actually wake
  slept: number;
  lost: number; // the wedge. The distance between those two, and nothing else.
};

/** `alarmAmt` lets the alarm DROP onto the school rows (0 = not there yet, 1 = biting). */
export const nightAt = (i: number, start: number, taken: number, alarmAmt = 1): Night => {
  const school = i >= SCHOOL_ROW;
  const phase = phaseAt(i, start, taken);
  const onset = ONSET0 + phase;
  const natWake = onset + NEED;
  const lost = school ? Math.max(0, natWake - ALARM) * clamp01(alarmAmt) : 0;
  return { i, label: labelOf(i), school, phase, onset, natWake, wake: natWake - lost, slept: NEED - lost, lost };
};

export const ladderAt = (start: number, taken: number, alarmAmt = 1): Night[] =>
  Array.from({ length: ROWS }, (_, i) => nightAt(i, start, taken, alarmAmt));

/** The debt, summed off the wedges that are actually on screen this frame. Never a counter. */
export const debtOf = (nights: Night[]) => nights.reduce((a, n) => a + n.lost, 0);

// =============================================================================
// TIME FORMATTING
// =============================================================================
const mins = (h: number) => Math.round(h * 60);
/** 30.75 -> "6:45 AM". Folds the continuous axis back onto a clock face. */
export const hhmm = (h: number) => {
  const t = ((mins(h) % 1440) + 1440) % 1440;
  const H = Math.floor(t / 60);
  const M = t % 60;
  const h12 = H % 12 === 0 ? 12 : H % 12;
  return `${h12}:${String(M).padStart(2, '0')} ${H < 12 ? 'AM' : 'PM'}`;
};
/** 1.75 -> "1h 45m" */
export const dur = (h: number) => {
  const m = Math.max(0, mins(h));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};
/** 1.75 -> "1h45" — the compact form that fits inside a wedge */
export const durShort = (h: number) => {
  const m = Math.max(0, mins(h));
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
};

// =============================================================================
// GEOMETRY — the ladder. x is the clock, y is the calendar.
// =============================================================================
export type Geom = {
  x: number;
  w: number;
  y: number;
  rowH: number;
  barH: number;
  split: number; // extra air at the school divider, so two weeks read as two weeks
  t0: number;
  t1: number;
};

export const xOf = (h: number, g: Geom) => g.x + ((h - g.t0) / (g.t1 - g.t0)) * g.w;
export const yOf = (i: number, g: Geom) => g.y + i * g.rowH + (i >= SCHOOL_ROW ? g.split : 0) + g.rowH / 2;
export const dividerY = (g: Geom) => g.y + SCHOOL_ROW * g.rowH + g.split / 2;
export const ladderBottom = (g: Geom) => g.y + ROWS * g.rowH + g.split;

// =============================================================================
// DEFS — the two hatches. Mount once per <svg>.
// =============================================================================
export const PhaseDefs: React.FC = () => (
  <defs>
    <pattern id="ph-lost" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={14} height={14} fill="rgba(232,135,159,0.14)" />
      <line x1={0} y1={0} x2={0} y2={14} stroke="rgba(232,135,159,0.80)" strokeWidth={5} />
    </pattern>
    <pattern id="ph-zone" width={13} height={13} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <rect width={13} height={13} fill="rgba(245,215,110,0.09)" />
      <line x1={0} y1={0} x2={0} y2={13} stroke="rgba(245,215,110,0.42)" strokeWidth={3} />
    </pattern>
    <linearGradient id="ph-sleep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#5457e0" />
      <stop offset="100%" stopColor="#7b7ef0" />
    </linearGradient>
  </defs>
);

// =============================================================================
// THE CLOCK AXIS — hour rules down the whole ladder, labelled every three hours.
// =============================================================================
export const ClockAxis: React.FC<{ g: Geom; opacity?: number }> = ({ g, opacity = 1 }) => {
  const first = Math.ceil(g.t0);
  const last = Math.floor(g.t1);
  const top = g.y + 6;
  const bot = ladderBottom(g) - 6;
  const hours: number[] = [];
  for (let h = first; h <= last; h += 1) hours.push(h);
  return (
    <g opacity={opacity}>
      {hours.map((h) => {
        const strong = h % 3 === 0;
        return (
          <line
            key={h}
            x1={xOf(h, g)}
            y1={top}
            x2={xOf(h, g)}
            y2={bot}
            stroke={strong ? PHASE_COLORS.gridStrong : PHASE_COLORS.grid}
            strokeWidth={strong ? 2 : 1}
          />
        );
      })}
      {hours
        .filter((h) => h % 3 === 0)
        .map((h) => (
          <text
            key={`l${h}`}
            x={xOf(h, g)}
            y={g.y - 16}
            fill={PHASE_COLORS.dim}
            fontFamily={FONT_MONO}
            fontSize={24}
            fontWeight={500}
            letterSpacing={1}
            textAnchor="middle"
          >
            {hhmm(h).replace(':00', '')}
          </text>
        ))}
    </g>
  );
};

// =============================================================================
// A NIGHT — the bar, and the wedge that is the whole video.
// =============================================================================
export const NightRow: React.FC<{
  night: Night;
  g: Geom;
  opacity?: number;
  hot?: number; // 0..1 — this is the row the narration is on
  zone?: number; // 0..1 — draw the wake-maintenance band, anchored to THIS row's onset
  showTime?: number; // 0..1 — print the bedtime clock face at the head of the bar
}> = ({ night, g, opacity = 1, hot = 0, zone = 0, showTime = 0 }) => {
  const y = yOf(night.i, g);
  const top = y - g.barH / 2;
  const x0 = xOf(night.onset, g);
  const x1 = xOf(night.wake, g);
  const x2 = xOf(night.natWake, g);
  const lostW = Math.max(0, x2 - x1);
  const r = g.barH / 2;
  return (
    <g opacity={opacity}>
      {/* the night itself, so an empty row is still a row */}
      <line
        x1={g.x}
        y1={y}
        x2={g.x + g.w}
        y2={y}
        stroke={PHASE_COLORS.rail}
        strokeWidth={g.barH}
        strokeLinecap="round"
      />

      {/* THE ZONE — 2h wide and anchored to the onset, so it TRAVELS with the clock. */}
      {zone > 0.01 ? (
        <g opacity={zone}>
          <rect
            x={xOf(night.onset - ZONE, g)}
            y={top - 5}
            width={xOf(night.onset, g) - xOf(night.onset - ZONE, g)}
            height={g.barH + 10}
            rx={7}
            fill="url(#ph-zone)"
            stroke="rgba(245,215,110,0.5)"
            strokeWidth={2}
          />
        </g>
      ) : null}

      {/* THE SLEEP */}
      <rect x={x0} y={top} width={Math.max(0, x1 - x0)} height={g.barH} rx={r} fill="url(#ph-sleep)" />
      {hot > 0.01 ? (
        <rect
          x={x0}
          y={top}
          width={Math.max(0, x1 - x0)}
          height={g.barH}
          rx={r}
          fill="none"
          stroke={PHASE_COLORS.sleepEdge}
          strokeWidth={3}
          opacity={hot}
        />
      ) : null}

      {/* THE WEDGE — the distance between when they would wake and when they must. */}
      {lostW > 0.6 ? (
        <g>
          <rect x={x1} y={top} width={lostW} height={g.barH} rx={Math.min(7, lostW / 2)} fill="url(#ph-lost)" />
          <rect
            x={x1}
            y={top}
            width={lostW}
            height={g.barH}
            rx={Math.min(7, lostW / 2)}
            fill="none"
            stroke={PHASE_COLORS.lost}
            strokeWidth={2}
          />
          {lostW > 76 ? (
            <text
              x={x1 + lostW / 2}
              y={y + 9}
              fill={PHASE_COLORS.lost}
              fontFamily={FONT_MONO}
              fontSize={26}
              fontWeight={700}
              textAnchor="middle"
            >
              {durShort(night.lost)}
            </text>
          ) : null}
        </g>
      ) : null}

      {/* the calendar gutter */}
      <text
        x={g.x - 18}
        y={y + 9}
        fill={night.school ? PHASE_COLORS.text : PHASE_COLORS.dim}
        fontFamily={FONT_BODY}
        fontSize={night.school ? 25 : 24}
        fontWeight={night.school ? 700 : 500}
        letterSpacing={1}
        textAnchor="end"
        opacity={mix(0.75, 1, hot)}
      >
        {night.label}
      </text>

      {showTime > 0.01 ? (
        <g opacity={showTime}>
          <text x={x0 - 12} y={y + 8} fill={PHASE_COLORS.sleepEdge} fontFamily={FONT_MONO} fontSize={23} fontWeight={700} textAnchor="end">
            {hhmm(night.onset)}
          </text>
          <text x={x2 + 12} y={y + 8} fill={PHASE_COLORS.sleepEdge} fontFamily={FONT_MONO} fontSize={23} fontWeight={700}>
            {hhmm(night.natWake)}
          </text>
          <text
            x={(x0 + x1) / 2}
            y={y + 9}
            fill="#ffffff"
            fontFamily={FONT_MONO}
            fontSize={25}
            fontWeight={700}
            textAnchor="middle"
          >
            {dur(night.slept)}
          </text>
        </g>
      ) : null}
    </g>
  );
};

export const Ladder: React.FC<{
  nights: Night[];
  g: Geom;
  hotRow?: number;
  hot?: number;
  zoneOf?: (n: Night) => number;
  timeRow?: number;
  showTime?: number;
  rowOpacity?: (n: Night) => number;
}> = ({ nights, g, hotRow = -1, hot = 0, zoneOf, timeRow = -1, showTime = 0, rowOpacity }) => (
  <g>
    {nights.map((n) => (
      <NightRow
        key={n.i}
        night={n}
        g={g}
        opacity={rowOpacity ? rowOpacity(n) : 1}
        hot={n.i === hotRow ? hot : 0}
        zone={zoneOf ? zoneOf(n) : 0}
        showTime={n.i === timeRow ? showTime : 0}
      />
    ))}
  </g>
);

// =============================================================================
// THE ALARM — one column, dropping down the school rows.
// =============================================================================
export const AlarmColumn: React.FC<{ g: Geom; drop: number; label?: string }> = ({ g, drop, label = 'ALARM' }) => {
  const x = xOf(ALARM, g);
  const y0 = dividerY(g) - 4;
  const y1 = ladderBottom(g) - 2;
  const d = clamp01(drop);
  if (d <= 0.005) return null;
  return (
    <g>
      <line x1={x} y1={y0} x2={x} y2={mix(y0, y1, d)} stroke={PHASE_COLORS.lost} strokeWidth={4} strokeLinecap="round" />
      <g opacity={d} transform={`translate(${x} ${dividerY(g) - 22})`}>
        <rect x={-100} y={-17} width={200} height={34} rx={17} fill="#0b0e14" stroke="rgba(232,135,159,0.6)" strokeWidth={2} />
        <text x={0} y={8} fill={PHASE_COLORS.lost} fontFamily={FONT_MONO} fontSize={23} fontWeight={700} textAnchor="middle">
          {label} {hhmm(ALARM)}
        </text>
      </g>
    </g>
  );
};

// =============================================================================
// THE DIVIDER — where the holidays stop.
// =============================================================================
export const SchoolDivider: React.FC<{ g: Geom; opacity?: number; label?: string; labelX?: number }> = ({
  g,
  opacity = 1,
  label = 'SCHOOL STARTS',
  labelX,
}) => {
  const y = dividerY(g);
  return (
    <g opacity={opacity}>
      <line x1={g.x - 60} y1={y} x2={g.x + g.w} y2={y} stroke={PHASE_COLORS.accent} strokeWidth={2} strokeDasharray="10 9" opacity={0.55} />
      <g transform={`translate(${labelX ?? g.x + 150} ${y - 22})`}>
        <rect x={-136} y={-17} width={272} height={34} rx={17} fill="#0b0e14" stroke="rgba(245,215,110,0.55)" strokeWidth={2} />
        <text x={0} y={8} fill={PHASE_COLORS.accent} fontFamily={FONT_BODY} fontSize={22} fontWeight={700} letterSpacing={3} textAnchor="middle">
          {label}
        </text>
      </g>
    </g>
  );
};

// =============================================================================
// A MEASURE — the bracket that says how big a move is. Used for the two hours a
// parent tries to take, and for the fifteen minutes they actually get.
// =============================================================================
export const Bracket: React.FC<{
  g: Geom;
  row: number;
  from: number;
  to: number;
  label: string;
  color?: string;
  opacity?: number;
  above?: number;
}> = ({ g, row, from, to, label, color = PHASE_COLORS.accent, opacity = 1, above = 20 }) => {
  const y = yOf(row, g) - g.barH / 2 - above;
  const xa = xOf(Math.min(from, to), g);
  const xb = xOf(Math.max(from, to), g);
  if (opacity <= 0.01) return null;
  const lx = xb + 13;
  const lw = label.length * 15 + 22;
  return (
    <g opacity={opacity}>
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={color} strokeWidth={3} />
      <line x1={xa} y1={y - 10} x2={xa} y2={y + 10} stroke={color} strokeWidth={3} />
      <line x1={xb} y1={y - 10} x2={xb} y2={y + 10} stroke={color} strokeWidth={3} />
      <rect x={lx} y={y - 17} width={lw} height={34} rx={9} fill="rgba(11,14,20,0.92)" stroke={`${color}55`} strokeWidth={2} />
      <text x={lx + 11} y={y + 9} fill={color} fontFamily={FONT_MONO} fontSize={25} fontWeight={700}>
        {label}
      </text>
    </g>
  );
};

/** The bedtime a parent aims at — a dashed post standing in the middle of the zone. */
export const GhostBed: React.FC<{ g: Geom; row: number; at: number; opacity?: number; label?: string }> = ({
  g,
  row,
  at,
  opacity = 1,
  label,
}) => {
  const y = yOf(row, g);
  const x = xOf(at, g);
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <line
        x1={x}
        y1={y - g.barH / 2 - 14}
        x2={x}
        y2={y + g.barH / 2 + 14}
        stroke={PHASE_COLORS.accent}
        strokeWidth={4}
        strokeDasharray="8 7"
      />
      {label ? (
        <text x={x} y={y + g.barH / 2 + 38} fill={PHASE_COLORS.accent} fontFamily={FONT_MONO} fontSize={23} fontWeight={700} textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
  );
};

// =============================================================================
// THE READOUT — the debt, read back off the wedges that were just drawn.
// =============================================================================
export const Readout: React.FC<{
  lost: number;
  x: number;
  y: number;
  opacity?: number;
  label?: string;
}> = ({ lost, x, y, opacity = 1, label = 'SLEEP LOST BY FRIDAY' }) => {
  const zero = mins(lost) === 0;
  const c = zero ? PHASE_COLORS.full : PHASE_COLORS.lost;
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <text x={x} y={y} fill={c} fontFamily={FONT_DISPLAY} fontSize={86} fontWeight={700} letterSpacing={-1}>
        {dur(lost)}
      </text>
      <text x={x} y={y + 40} fill={PHASE_COLORS.dim} fontFamily={FONT_BODY} fontSize={25} fontWeight={600} letterSpacing={4}>
        {label}
      </text>
    </g>
  );
};

/** A small statement of fact, bottom-right of the ladder. */
export const Chip: React.FC<{
  x: number;
  y: number;
  lines: string[];
  color?: string;
  opacity?: number;
  w?: number;
}> = ({ x, y, lines, color = PHASE_COLORS.full, opacity = 1, w = 420 }) => {
  if (opacity <= 0.01) return null;
  const h = 30 + lines.length * 34;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="rgba(12,16,24,0.88)" stroke={`${color}66`} strokeWidth={2} />
      <rect x={x} y={y} width={7} height={h} rx={3.5} fill={color} />
      {lines.map((l, k) => (
        <text
          key={k}
          x={x + 26}
          y={y + 38 + k * 34}
          fill={k === 0 ? color : PHASE_COLORS.text}
          fontFamily={FONT_BODY}
          fontSize={k === 0 ? 26 : 25}
          fontWeight={k === 0 ? 700 : 500}
          letterSpacing={k === 0 ? 3 : 0.5}
        >
          {l}
        </text>
      ))}
    </g>
  );
};
