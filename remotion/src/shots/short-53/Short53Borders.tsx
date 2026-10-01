import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, EASE_INOUT, EASE_OUT, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import { centroid, countryPath, inCountry, makeMapScale } from '../../lib/map';
import { WORLD, byName } from '../../lib/geo/world';
import { Tag } from '../../lib/suns';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short53Borders',
  durationInSeconds: 42.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = '#f5d76e';
const TEAL = '#4db8a8';
const PINK = '#e8879f';
const INDIGO = '#8f93f7';
const F = (s: number) => Math.round(s * 30);
const END = F(42.0);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short53Borders: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);

// =============================================================================
// CUES — all spoken words, global frames (the only <Sequence> is the PauseCard).
// =============================================================================
const REW = F(word(0, 'borders').end) + 3; // the hook's borderless world snaps back to today's
const WORKER = wAt(1, 'worker');
const EARN = wAt(1, 'earn');
const EIGHT = wAt(1, 'eight');
const LINE = wAt(1, 'line');
const W750 = wAt(2, '750');
const ECON = wAt(3, 'economy');
const QUIZ_IN = F(14.8);
const QUIZ_OUT = F(17.3);
const ECONOMISTS = wAt(4, 'economists');
const FREELY = wAt(5, 'freely');
const DOUBLE = wAt(5, 'double');
const NOTHING = wAt(6, 'nothing');
const TRADE = wAt(6, 'trade');
const EUROPE = wAt(7, 'europe');
const N29 = wAt(8, '29');
const FOUR = wAt(8, 'four');
const OPEN = wAt(9, 'open');
const TITLE_BACK = F(39.3);
const GROW = F(39.6);

// =============================================================================
// THE FACTS ON SCREEN (sources in beats.json › facts)
// =============================================================================
const WAGE_NIGERIA = 8.4; // Clemens, Montenegro & Pritchett — place premium, Nigeria → US
const WAGE_MEDIAN = 2.7; // …median across 42 countries (Bolivia)
const WANT_TO_MOVE = 750e6; // Gallup 2018 — 15% of the world's adults
const GDP_OPEN = 2.0; // Clemens 2011 — +50%..+150% of world GDP, midpoint doubles it
const GDP_BAND: [number, number] = [1.5, 2.5];
const GDP_TRADE = 1.017; // same review — all trade barriers: +0.3..4.1%, average 1.7%
const EU_MOVED = 4.4; // Eurostat 2024 — % of working-age EU citizens in another member state

// Schengen, 2025: 29 members. Liechtenstein and Malta are too small for the 110m outlines.
const SCHENGEN = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France',
  'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands',
  'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
];
const SCHENGEN_COUNT = SCHENGEN.length + 2; // + Liechtenstein, Malta

// =============================================================================
// THE MAP — real Natural Earth outlines, real Mercator. Paths are built ONCE in map pixels;
// the camera is a single SVG transform, so zooming into Europe re-projects nothing.
// =============================================================================
const MAPY = 497;
const SC = makeMapScale([-180, 180], [-58, 84], { x: 20, y: MAPY, w: 1040 });
const MC: [number, number] = [540, MAPY + SC.box.h / 2];
const LAND = WORLD.filter((c) => c.cont !== 'Antarctica' && c.cont !== 'Seven seas (open ocean)');
const PATHS = LAND.map((c) => ({ name: c.name, d: countryPath(SC, c), schengen: SCHENGEN.includes(c.name) }));
const EU_FOCUS = SC.px(13, 52);
const ZOOM = 3.3;

// the camera: zoom z about a focus that glides from the map centre to Europe, then the punch-in
const camera = (zt: number, punch: number) => {
  const z = Math.pow(ZOOM, zt);
  const w = (1 - 1 / z) / (1 - 1 / ZOOM);
  const P: [number, number] = [mix(MC[0], EU_FOCUS[0], w), mix(MC[1], EU_FOCUS[1], w)];
  const s = z * punch;
  return {
    z,
    s,
    transform: `translate(${MC[0]} ${MC[1]}) scale(${s}) translate(${-P[0]} ${-P[1]})`,
    at: ([x, y]: [number, number]): [number, number] => [MC[0] + s * (x - P[0]), MC[1] + s * (y - P[1])],
  };
};

// =============================================================================
// THE PEOPLE — 300 dots scattered onto real land (seeded, so every render is identical).
// 1 dot ≈ 2.5 million adults who say they would move. When the borders open ~15% of them
// travel to the most-wanted destinations (Gallup: US, Canada, Germany, France, Australia, UK)
// and the rest stay put — which is exactly what the twist says Europe found.
// =============================================================================
const mulberry = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const N_DOTS = 300;
const HUBS: [number, number][] = [
  [-96, 39],
  [-79, 45],
  [10, 51],
  [2.5, 47],
  [147, -33],
  [-1.5, 52.5],
];
type Dot = { x: number; y: number; hx: number; hy: number; delay: number; moveDelay: number; mover: boolean; ph: number };
const DOTS: Dot[] = (() => {
  const rnd = mulberry(53);
  const pool = LAND.filter((c) => !['Greenland', 'French Southern and Antarctic Lands', 'Falkland Islands'].includes(c.name));
  const weights = pool.map((c) => Math.sqrt(c.km2));
  const total = weights.reduce((a, b) => a + b, 0);
  const out: Dot[] = [];
  while (out.length < N_DOTS) {
    let r = rnd() * total;
    let i = 0;
    while (r > weights[i]) r -= weights[i++];
    const c = pool[Math.min(i, pool.length - 1)];
    let lo0 = 999;
    let lo1 = -999;
    let la0 = 999;
    let la1 = -999;
    for (const ring of c.rings)
      for (const [lo, la] of ring) {
        lo0 = Math.min(lo0, lo);
        lo1 = Math.max(lo1, lo);
        la0 = Math.min(la0, la);
        la1 = Math.max(la1, la);
      }
    for (let tries = 0; tries < 40; tries++) {
      const lon = mix(lo0, lo1, rnd());
      const lat = mix(la0, la1, rnd());
      if (!inCountry(c, lon, lat)) continue;
      const [x, y] = SC.px(lon, lat);
      const mover = rnd() < 0.15;
      const hub = HUBS[Math.floor(rnd() * HUBS.length)];
      const [hx, hy] = SC.px(hub[0] + (rnd() - 0.5) * 8, hub[1] + (rnd() - 0.5) * 5);
      out.push({ x, y, hx, hy, delay: rnd() * 40, moveDelay: rnd() * 36, mover, ph: rnd() * 6.283 });
      break;
    }
  }
  return out;
})();

const NIGERIA = SC.px(...centroid(byName('Nigeria')));
const USA = SC.px(-97, 39);
const ARC_LIFT = 150;
const arcPt = (t: number): [number, number] => {
  const cx = (NIGERIA[0] + USA[0]) / 2;
  const cy = Math.min(NIGERIA[1], USA[1]) - ARC_LIFT;
  const u = 1 - t;
  return [u * u * NIGERIA[0] + 2 * u * t * cx + t * t * USA[0], u * u * NIGERIA[1] + 2 * u * t * cy + t * t * USA[1]];
};

// the claims on the voice track, checked against what the picture draws
{
  if (SCHENGEN_COUNT !== 29) throw new Error('Short53Borders: "29 countries" — the Schengen list must add up');
  if (Math.round(WAGE_NIGERIA) !== 8) throw new Error('Short53Borders: "eight times more" must be the Nigeria place premium');
  if (!(GDP_BAND[0] < GDP_OPEN && GDP_OPEN < GDP_BAND[1])) throw new Error('Short53Borders: "roughly double" must sit inside the estimate band');
  if (Math.round((GDP_TRADE - 1) * 100) !== 2) throw new Error('Short53Borders: "about two percent" for trade');
  if (Math.round(EU_MOVED) !== 4) throw new Error('Short53Borders: "four percent" for EU movers');
  if (!(EUROPE < N29 && N29 < FOUR && FOUR < OPEN)) throw new Error('Short53Borders: twist cues out of order');
  if (!(QUIZ_IN > F(VO[3].end) && QUIZ_OUT < F(VO[4].start))) throw new Error('Short53Borders: the quiz must sit in the silence');
  const last = VO[VO.length - 1];
  if (last.end + 0.8 > END / 30 - 0.4) throw new Error('Short53Borders: the last caption must clear before the loop');
}

const pulse = (f: number, at: number, len = 22) => Math.sin(Math.PI * prog(f, at - 2, at + len));
const span = (f: number, a: number, b: number) => EASE_OUT(prog(f, a - 2, a + 8)) * (1 - prog(f, b - 8, b));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// =============================================================================
// THE INSTRUMENT — one panel, five readings, each a number from beats.json › facts.
// =============================================================================
const Row: React.FC<{
  top: number;
  label: string;
  value: string;
  color: string;
  frac: number;
  size?: number;
  barH?: number;
  band?: { a: number; b: number; o: number };
  mark?: { at: number; label: string; o: number };
}> = ({ top, label, value, color, frac, size = 64, barH = 26, band, mark }) => (
  <div style={{ position: 'absolute', left: 28, right: 28, top }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: size * 0.4, letterSpacing: 3, color, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color: '#fff', lineHeight: 1 }}>{value}</div>
    </div>
    <div style={{ position: 'relative', marginTop: 14, height: barH, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
      {band && band.o > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: `${band.a * 100}%`,
            width: `${(band.b - band.a) * 100}%`,
            top: -6,
            bottom: -6,
            borderRadius: 8,
            border: `2px dashed ${color}`,
            background: `${color}22`,
            opacity: band.o,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${Math.max(0, Math.min(1, frac)) * 100}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 18px ${color}66`,
        }}
      />
      {mark && mark.o > 0.01 ? (
        <div style={{ position: 'absolute', left: `${mark.at * 100}%`, top: -8, bottom: -8, width: 3, background: '#fff', opacity: mark.o }}>
          <div
            style={{
              position: 'absolute',
              top: barH + 20,
              left: 0,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            {mark.label}
          </div>
        </div>
      ) : null}
    </div>
  </div>
);

const Note: React.FC<{ top: number; text: string }> = ({ top, text }) => (
  <div
    style={{
      position: 'absolute',
      left: 28,
      right: 28,
      top,
      fontFamily: FONT_BODY,
      fontWeight: 500,
      fontSize: 24,
      letterSpacing: 1,
      color: 'rgba(255,255,255,0.6)',
    }}
  >
    {text}
  </div>
);

const Layer: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) =>
  o > 0.01 ? <div style={{ position: 'absolute', inset: 0, opacity: o }}>{children}</div> : null;

// =============================================================================
// THE SHOT — one world map. No cuts.
// =============================================================================
export default function Short53Borders() {
  const f = useCurrentFrame();

  // --- the state of the world -------------------------------------------------------------
  const B =
    f < FREELY
      ? EASE_OUT(prog(f, REW, REW + 12))
      : f < EUROPE
        ? 1 - EASE_INOUT(prog(f, FREELY, FREELY + 30))
        : f < OPEN
          ? EASE_INOUT(prog(f, EUROPE, EUROPE + 30))
          : 1 - EASE_INOUT(prog(f, OPEN, OPEN + 36));
  const eu = EASE_INOUT(prog(f, EUROPE, EUROPE + 30)) * (1 - EASE_INOUT(prog(f, OPEN, OPEN + 36)));
  const united = 1 - B;
  const zt = EASE_INOUT(prog(f, EUROPE, EUROPE + 42)) * (1 - EASE_INOUT(prog(f, OPEN, OPEN + 42)));
  const punch = f < GROW ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, GROW, END - 1)));
  const cam = camera(zt, punch);
  const flash = pulse(f, LINE, 24);
  const quizDim = span(f, QUIZ_IN, QUIZ_OUT);

  const dotsO = f < OPEN ? 1 : 1 - prog(f, OPEN, OPEN + 30);
  const dotR = 4.2 / Math.sqrt(cam.z) / punch;

  const workerO = span(f, WORKER, W750);
  const wt = EASE_INOUT(prog(f, EARN, EIGHT + 22));
  const wp = arcPt(wt);
  const trail = Array.from({ length: 41 }, (_, i) => arcPt((i / 40) * wt));

  // --- the readings -------------------------------------------------------------------------
  const wage = 1 + (WAGE_NIGERIA - 1) * EASE_OUT(prog(f, EIGHT, EIGHT + 24));
  const people = WANT_TO_MOVE * EASE_OUT(prog(f, W750, W750 + 45));
  const gdp = f < REW || f >= OPEN ? GDP_OPEN : 1 + (GDP_OPEN - 1) * EASE_INOUT(prog(f, FREELY, DOUBLE + 10));
  const bandO = f < REW || f >= OPEN ? 1 : EASE_OUT(prog(f, DOUBLE, DOUBLE + 12));
  const tradeO = f >= OPEN ? 0 : EASE_OUT(prog(f, TRADE, TRADE + 12));
  const lit = EU_MOVED * EASE_OUT(prog(f, FOUR, FOUR + 20));

  const gdpO = f < W750 ? 1 - prog(f, REW - 2, REW + 6) : f < OPEN ? span(f, ECON, EUROPE) : EASE_OUT(prog(f, OPEN, OPEN + 12));
  const wageO = span(f, REW + 2, W750);
  const peopleO = span(f, W750, ECON);
  const euO = span(f, EUROPE, OPEN + 6);

  const titleO = f < TITLE_BACK ? 1 - prog(f, REW - 6, REW + 2) : EASE_OUT(prog(f, TITLE_BACK, TITLE_BACK + 24));
  const [nx, ny] = cam.at(NIGERIA);
  const [ux, uy] = cam.at(USA);

  return (
    <AbsoluteFill style={{ background: '#07090f' }}>
      <ShortsBackdrop base="#07090f" glow="#131a2a" />

      {/* the map, feathered into the page so the Europe zoom never crowds the title or the panel */}
      <AbsoluteFill
        style={{
          opacity: 1 - 0.45 * quizDim,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 330px, #000 440px, #000 1120px, transparent 1185px)',
          maskImage: 'linear-gradient(to bottom, transparent 330px, #000 440px, #000 1120px, transparent 1185px)',
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="land53" gradientUnits="userSpaceOnUse" x1={20} y1={0} x2={1060} y2={0}>
              <stop offset="0" stopColor="#6366F1" />
              <stop offset="0.5" stopColor="#9b7cc4" />
              <stop offset="1" stopColor="#4db8a8" />
            </linearGradient>
          </defs>
          <g transform={cam.transform}>
            {/* divided: grey countries (fill-coloured strokes close the seams; borders are their own layer) */}
            <g>
              {PATHS.map((p) => (
                <path key={p.name} d={p.d} fill="#1b2433" stroke="#1b2433" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            {/* Schengen: one seamless teal block while the rest of the world is divided */}
            {eu > 0.01 ? (
              <g opacity={eu}>
                {PATHS.filter((p) => p.schengen).map((p) => (
                  <path key={p.name} d={p.d} fill="#2c7a72" stroke="#2c7a72" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            ) : null}
            {/* united: one landmass, the signature gradient */}
            {united > 0.01 ? (
              <g opacity={united * (1 - eu)} style={{ filter: 'drop-shadow(0 0 14px rgba(99,102,241,0.55))' }}>
                {PATHS.map((p) => (
                  <path key={p.name} d={p.d} fill="url(#land53)" stroke="url(#land53)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            ) : null}
            {/* the borders themselves */}
            {B > 0.01 ? (
              <g fill="none" strokeLinejoin="round">
                {PATHS.map((p) => {
                  const o = B * (p.schengen ? 1 - eu : 1);
                  return o > 0.01 ? (
                    <path
                      key={p.name}
                      d={p.d}
                      stroke={flash > 0.01 ? `rgba(232,135,159,${0.5 + 0.5 * flash})` : '#7489a8'}
                      strokeWidth={1.3 + 1.4 * flash}
                      vectorEffect="non-scaling-stroke"
                      opacity={o}
                    />
                  ) : null;
                })}
              </g>
            ) : null}

            {/* the people who would move */}
            {f >= W750 && dotsO > 0.01 ? (
              <g opacity={dotsO * (1 - 0.5 * quizDim)}>
                {DOTS.map((d, i) => {
                  const a = EASE_OUT(prog(f, W750 + d.delay, W750 + d.delay + 10));
                  if (a <= 0.01) return null;
                  const m = d.mover ? EASE_INOUT(prog(f, FREELY + d.moveDelay, FREELY + d.moveDelay + 54)) : 0;
                  // fenced in: a restless jitter while the borders stand, stillness once they open
                  const jig = 1.6 * B * (1 - m);
                  const x = mix(d.x, d.hx, m) + Math.sin(f / 9 + d.ph) * jig;
                  const y = mix(d.y, d.hy, m) - Math.sin(Math.PI * m) * 60 + Math.cos(f / 11 + d.ph) * jig;
                  return <circle key={i} cx={x} cy={y} r={dotR * (0.4 + 0.6 * a)} fill={d.mover && m > 0 ? ACCENT : '#e9ecf5'} opacity={0.85 * a} />;
                })}
              </g>
            ) : null}

            {/* the worker: same person, same skills, one line crossed */}
            {workerO > 0.01 ? (
              <g opacity={workerO}>
                <polyline
                  points={trail.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={3}
                  strokeDasharray="10 8"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.8}
                />
                <circle cx={NIGERIA[0]} cy={NIGERIA[1]} r={6} fill="none" stroke={ACCENT} strokeWidth={2} vectorEffect="non-scaling-stroke" />
                <circle cx={wp[0]} cy={wp[1]} r={10} fill={ACCENT} style={{ filter: `drop-shadow(0 0 10px ${ACCENT})` }} />
              </g>
            ) : null}
          </g>
        </svg>

        <Tag x={nx} y={ny + 48} text="NIGERIA ×1" color={ACCENT} o={workerO} />
        <Tag x={ux} y={uy + 50} text={`USA ×${WAGE_NIGERIA}`} color={ACCENT} o={workerO * EASE_OUT(prog(f, EIGHT + 20, EIGHT + 30))} />
        <Tag x={540} y={1040} text={`${SCHENGEN_COUNT} COUNTRIES · NO BORDER CHECKS`} color={TEAL} o={span(f, N29, OPEN)} />
      </AbsoluteFill>

      {/* the instrument */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 1180,
          width: 940,
          height: 250,
          borderRadius: 24,
          background: 'rgba(16,20,28,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        <Layer o={gdpO}>
          <Row
            top={24}
            label={f < REW || f >= OPEN ? 'World GDP · no borders' : 'World GDP · open borders'}
            value={`×${gdp.toFixed(2)}`}
            color={INDIGO}
            frac={gdp / 2.6}
            band={{ a: GDP_BAND[0] / 2.6, b: GDP_BAND[1] / 2.6, o: bandO * (1 - tradeO) }}
          />
          {tradeO < 0.99 ? <Note top={168} text="estimates: +50% to +150% · Clemens 2011" /> : null}
          <Layer o={tradeO}>
            <Row top={150} label="World GDP · free trade" value={`×${GDP_TRADE.toFixed(2)}`} color={PINK} frac={GDP_TRADE / 2.6} size={44} barH={18} />
          </Layer>
        </Layer>
        <Layer o={wageO}>
          <Row
            top={24}
            label="Same worker's wage"
            value={`×${wage.toFixed(1)}`}
            color={ACCENT}
            frac={wage / 9}
            mark={{ at: WAGE_MEDIAN / 9, label: `MEDIAN ×${WAGE_MEDIAN}`, o: EASE_OUT(prog(f, EIGHT + 24, EIGHT + 36)) }}
          />
          <Note top={196} text="Nigeria → USA · same skills · Clemens et al." />
        </Layer>
        <Layer o={peopleO}>
          <Row top={24} label="Adults who want to move" value={fmt(people)} color="#e9ecf5" frac={people / WANT_TO_MOVE} />
          <Note top={168} text="15% of the world's adults · Gallup · 1 dot ≈ 2.5 million" />
        </Layer>
        <Layer o={euO}>
          <Row top={24} label="EU citizens in another EU country" value={`${lit.toFixed(1)}%`} color={TEAL} frac={0} barH={0} size={56} />
          <svg width={884} height={60} style={{ position: 'absolute', left: 28, top: 118 }}>
            {Array.from({ length: 100 }, (_, i) => {
              const on = Math.max(0, Math.min(1, lit - i));
              return (
                <circle
                  key={i}
                  cx={9 + (i % 50) * 17.7}
                  cy={12 + Math.floor(i / 50) * 30}
                  r={7}
                  fill={on > 0.01 ? TEAL : 'rgba(255,255,255,0.14)'}
                  opacity={on > 0.01 ? 0.35 + 0.65 * on : 1}
                />
              );
            })}
          </svg>
          <Note top={196} text="working age · Eurostat 2024 · the other 95.6% stayed" />
        </Layer>
      </div>

      {/* chips under the kicker, landing on their words */}
      <Tag x={540} y={290} text="GALLUP · 15% OF ALL ADULTS" color="#e9ecf5" o={span(f, W750 + 10, ECON)} />
      <Tag x={540} y={290} text="+50% TO +150% OF WORLD GDP" color={INDIGO} o={span(f, DOUBLE, TRADE)} />
      <Tag x={540} y={290} text="ALL TRADE BARRIERS: ~1.7%" color={PINK} o={span(f, TRADE, EUROPE)} />
      <Tag x={540} y={290} text="SCHENGEN AREA" color={TEAL} o={span(f, EUROPE + 10, OPEN)} />

      {/* the beat, named as the narration names it */}
      <Kicker text="Same worker" color={ACCENT} y={170} at={REW + 4} until={W750} />
      <Kicker text="Want to move" color="#e9ecf5" y={170} at={W750} until={ECON} />
      <Kicker text="The world economy" color={INDIGO} y={170} at={ECON} until={QUIZ_IN} />
      <Kicker text="The estimate" color={INDIGO} y={170} at={ECONOMISTS} until={NOTHING} />
      <Kicker text="Versus free trade" color={PINK} y={170} at={NOTHING} until={EUROPE} />
      <Kicker text="Europe tried it" color={TEAL} y={170} at={EUROPE} until={OPEN} />

      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard title="WORLD GDP?" subtitle="if anyone could move anywhere" durSec={(QUIZ_OUT - QUIZ_IN) / 30} y={790} />
      </Sequence>

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={70} y={150} lines={[{ text: 'What if every country' }, { text: 'removed its borders?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
