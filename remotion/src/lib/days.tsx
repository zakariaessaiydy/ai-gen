// =============================================================================
// lib/days.tsx — A LIFE, ONE CELL PER DAY (a real calendar, not a drawn texture)
//
// Every cell is a real date. Rows are real weekdays (Mon..Sun), columns are real weeks, each
// year is a contribution-graph block, and the count on screen is the count of cells. So "30
// years is almost 11,000 days", "that Tuesday", "name a date → the weekday" are all read back
// off the calendar the picture is drawn from, never typed in twice.
//
// RENDERING: ~11,000 cells cannot be 11,000 animated nodes. At module load the cells are
// sorted into GROUPS by (class, random stagger, chronological stagger) and each group is ONE
// <path>. A frame only decides each group's opacity and colour — a few hundred numbers.
//
// Same ethos as fall.tsx's simulator and recall.tsx's fitted curves: never assert what the
// code can compute.
// =============================================================================
import React from 'react';
import { FONT_BODY, FONT_DISPLAY } from '../fonts';

export const DAY_MS = 86400000;
export const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

/** UTC midnight of y-m-d (m is 1-based). */
export const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
/** 0 = Monday … 6 = Sunday. */
export const weekday = (ms: number) => (new Date(ms).getUTCDay() + 6) % 7;
export const fmtDate = (ms: number) => {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};

// deterministic PRNG (mulberry32) — same life on every render
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type CellClass = 'plain' | 'landmark' | 'recent' | 'bad';
export type Cell = { ms: number; i: number; x: number; y: number; cls: CellClass; sR: number; sC: number };

export type LifeOpts = {
  from: number; // first day (UTC ms)
  years: number; // whole calendar years drawn
  x0: number; // left of the first block column
  y0: number; // top of the first block
  pitch: number; // cell pitch in px
  size: number; // cell size in px
  cols: number; // block columns (years flow down, then across)
  colGap: number;
  rowGap: number;
  landmarksPerYear: number;
  recentDays: number;
  badShare: number;
  stag: number; // number of stagger buckets per axis
  seed: number;
};

export type Life = ReturnType<typeof makeLife>;

export const makeLife = (o: LifeOpts) => {
  const r = rng(o.seed);
  const y1 = new Date(o.from).getUTCFullYear();
  const to = utc(y1 + o.years, 1, 1); // exclusive
  const n = Math.round((to - o.from) / DAY_MS);
  const perCol = Math.ceil(o.years / o.cols);
  const blockW = 54 * o.pitch;
  const blockH = 7 * o.pitch;
  const cells: Cell[] = [];
  const landmark = new Set<number>();
  for (let y = 0; y < o.years; y++) {
    const start = utc(y1 + y, 1, 1);
    const len = Math.round((utc(y1 + y + 1, 1, 1) - start) / DAY_MS);
    for (let k = 0; k < o.landmarksPerYear; k++) landmark.add(Math.round((start - o.from) / DAY_MS) + Math.floor(r() * len));
  }
  for (let i = 0; i < n; i++) {
    const ms = o.from + i * DAY_MS;
    const d = new Date(ms);
    const yr = d.getUTCFullYear() - y1;
    const jan1 = utc(d.getUTCFullYear(), 1, 1);
    const doy = Math.round((ms - jan1) / DAY_MS);
    const col = Math.floor((doy + weekday(jan1)) / 7);
    const bc = Math.floor(yr / perCol);
    const br = yr % perCol;
    const x = o.x0 + bc * (blockW + o.colGap) + col * o.pitch;
    const y = o.y0 + br * (blockH + o.rowGap) + weekday(ms) * o.pitch;
    const cls: CellClass = n - i <= o.recentDays ? 'recent' : landmark.has(i) ? 'landmark' : r() < o.badShare ? 'bad' : 'plain';
    cells.push({ ms, i, x, y, cls, sR: Math.floor(r() * o.stag), sC: Math.floor((i / n) * o.stag) });
  }
  // one path per (class, random stagger, chronological stagger)
  const groups = new Map<string, { cls: CellClass; sR: number; sC: number; n: number; d: string[] }>();
  for (const c of cells) {
    const k = `${c.cls}:${c.sR}:${c.sC}`;
    let g = groups.get(k);
    if (!g) groups.set(k, (g = { cls: c.cls, sR: c.sR, sC: c.sC, n: 0, d: [] }));
    g.n++;
    g.d.push(`M${c.x} ${c.y}h${o.size}v${o.size}h${-o.size}z`);
  }
  const G = [...groups.values()].map((g) => ({ ...g, path: g.d.join('') }));
  const all = cells.map((c) => `M${c.x} ${c.y}h${o.size}v${o.size}h${-o.size}z`).join('');
  const index = (ms: number) => Math.round((ms - o.from) / DAY_MS);
  const count = (cls: CellClass) => cells.filter((c) => c.cls === cls).length;
  const blockOrigin = (yr: number) => ({
    x: o.x0 + Math.floor(yr / perCol) * (blockW + o.colGap),
    y: o.y0 + (yr % perCol) * (blockH + o.rowGap),
  });
  return { o, n, y1, to, cells, groups: G, all, index, count, blockOrigin, perCol, blockW, blockH };
};

export type GroupStyle = { o: number; fill: string };

/** The grid: a static dark underlay (every day that happened) + lit groups on top. */
export const LifeGrid: React.FC<{
  life: Life;
  style: (g: Life['groups'][number]) => GroupStyle;
  underlay?: string;
  glow?: number;
}> = ({ life, style, underlay = '#1a2130', glow = 0 }) => (
  <g>
    <path d={life.all} fill={underlay} />
    {life.groups.map((g, k) => {
      const s = style(g);
      return s.o > 0.004 ? <path key={k} d={g.path} fill={s.fill} opacity={s.o} /> : null;
    })}
    {glow > 0.01
      ? life.groups.map((g, k) => {
          const s = style(g);
          return s.o > 0.3 ? <path key={`g${k}`} d={g.path} fill={s.fill} opacity={s.o * 0.35 * glow} style={{ filter: 'blur(6px)' }} /> : null;
        })
      : null}
  </g>
);

/** A labelled readout row: LABEL ........ value / total, with a bar. */
export const DayMeter: React.FC<{ label: string; value: number; total: number; color: string; note?: string; noteO?: number }> = ({
  label,
  value,
  total,
  color,
  note,
  noteO = 0,
}) => (
  <div style={{ width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: 'rgba(255,255,255,0.6)' }}>
        {label}
        {note ? <span style={{ marginLeft: 14, fontSize: 20, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', opacity: noteO }}>{note}</span> : null}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color }}>
        {value.toLocaleString('en-US')}
        <span style={{ fontSize: 30, color: 'rgba(255,255,255,0.45)' }}> / {total.toLocaleString('en-US')}</span>
      </div>
    </div>
    <div style={{ marginTop: 10, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.1)' }}>
      <div style={{ width: `${(value / total) * 100}%`, height: '100%', borderRadius: 5, background: color }} />
    </div>
  </div>
);
