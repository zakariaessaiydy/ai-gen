import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, EASE_INOUT, EASE_OUT, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog, timeWords } from '../../lib/shorts';
import {
  OrbitRing,
  Planet,
  Readout,
  Star,
  SunDisc,
  SunGauge,
  Sys,
  Starfield,
  Tag,
  circumbinaryLimit,
  distanceFor,
  fluxOf,
  integratePhases,
  lum,
  massOf,
  mixHex,
  mixSys,
  periodDays,
  yearOf,
} from '../../lib/suns';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short52Suns',
  durationInSeconds: 42.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = '#f5d76e';
const F = (s: number) => Math.round(s * 30);
const END = F(42.0);
const SQRT2 = Math.SQRT2;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short52Suns: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);

// =============================================================================
// CUES — all spoken words (global frames; there are no local-frame scenes here).
// =============================================================================
const REW = F(2.45); // the hook's second sun folds back in: "Earth today"
const TWO = wAt(1, 'two');
const TWICE = wAt(1, 'twice');
const VENUS = wAt(2, 'venus');
const TEN = wAt(3, 'ten');
const BOIL = wAt(3, 'boil');
const QUIZ_IN = F(14.0);
const QUIZ_OUT = F(16.6);
const SUNLIGHT = wAt(5, 'sunlight');
const SQUARE = wAt(5, 'square');
const MOVE = wAt(6, 'move');
const MARS = wAt(7, 'mars');
const PULL = wAt(8, 'pull');
const DAYS434 = wAt(8, '434');
const FICTION = wAt(9, 'fiction');
const KEPLER = wAt(10, 'kepler');
const DAYS229 = wAt(10, '229');
const JUST = wAt(11, 'just');
const TITLE_BACK = F(40.3);
const GROW = F(39.6);

// =============================================================================
// THE SYSTEMS
// =============================================================================
const SUN: Star = { m: 1, L: 1, r: 26, core: '#ffe9a8', glow: '#f5d76e' };
// Kepler-16 (Doyle et al. 2011): K dwarf 0.690 Msun, R 0.649, 4450 K; M dwarf 0.203 Msun, R 0.226, 3311 K
const K16A: Star = { m: 0.69, L: lum(0.6489, 4450), r: 20, core: '#ffc98a', glow: '#f0a35e' };
const K16B: Star = { m: 0.203, L: lum(0.2262, 3311), r: 11, core: '#ff9a7e', glow: '#e0605a' };
const SOL = (bIn: number, a: number): Sys => ({ A: SUN, B: SUN, bIn, abin: 0.3, a });
const K16: Sys = { A: K16A, B: K16B, bIn: 1, abin: 0.2243, a: 0.7048 };

const MOVE_LEN = 60;
const MORPH = 36;
const kepler = (f: number) => EASE_INOUT(prog(f, FICTION, FICTION + MORPH)) * (1 - EASE_INOUT(prog(f, JUST, JUST + MORPH)));
const SWAP = FICTION + MORPH + 4; // while Kepler-16 fills the frame, the hidden solar system resets to 1 AU

const sysAt = (f: number): Sys => {
  const bIn = Math.max(0, Math.min(1, 1 - EASE_OUT(prog(f, REW, REW + 14)) + EASE_INOUT(prog(f, TWO, TWO + 26))));
  const moved = f < SWAP ? EASE_INOUT(prog(f, MOVE, MOVE + MOVE_LEN)) : 0;
  return mixSys(SOL(bIn, mix(1, SQRT2, moved)), K16, kepler(f));
};

const PH = integratePhases(sysAt, END, 3);

// the claims on the voice track, checked against the formulas that draw the picture
{
  const near = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;
  if (!near(fluxOf(SOL(1, 1)), 2, 1e-9)) throw new Error('Short52Suns: two suns must give twice the sunlight');
  if (!near(1361 * 1.911, 2601, 1)) throw new Error('Short52Suns: Venus gets ~1.91x (2601 / 1361 W/m^2)');
  if (!near(distanceFor(2), 1.414, 0.001)) throw new Error('Short52Suns: "one point four times farther"');
  if (Math.round(periodDays(SQRT2, 2)) !== 434) throw new Error('Short52Suns: the year must compute to 434 days');
  if (Math.round(yearOf(K16)) !== 229) throw new Error('Short52Suns: Kepler-16b must compute to 229 days');
  if (!(1 / 0.3 > circumbinaryLimit(0.5))) throw new Error('Short52Suns: Earth at 1 AU must be a stable circumbinary orbit');
  if (!(K16.a / K16.abin > circumbinaryLimit(K16B.m / (K16A.m + K16B.m)))) throw new Error('Short52Suns: Kepler-16b must be stable');
  if (!(SQRT2 < 1.524)) throw new Error('Short52Suns: "almost out to Mars" needs sqrt2 inside Mars (1.524 AU)');
  if (MOVE + MOVE_LEN > MARS) throw new Error('Short52Suns: Earth must arrive before "Mars"');
  if (!(SWAP < JUST)) throw new Error('Short52Suns: the reset must happen while Kepler-16 is on screen');
  const last = VO[VO.length - 1];
  if (last.end + 0.8 > END / 30 - 0.4) throw new Error('Short52Suns: the last caption must clear before the loop');
}

const pulse = (f: number, at: number, len = 22) => Math.sin(Math.PI * prog(f, at - 2, at + len));
const span = (f: number, a: number, b: number) => EASE_OUT(prog(f, a - 2, a + 8)) * (1 - prog(f, b - 8, b));

// =============================================================================
// THE SHOT — one star system, top down. No cuts.
// =============================================================================
const CX = 540;
const CY = 785;
const PX = 268; // px per AU
const THETA0 = (200 * Math.PI) / 180;

const lightColor = (fl: number) =>
  mixHex(mixHex('#4db8a8', '#f5d76e', prog(fl, 0.95, 1.15)), '#e8879f', prog(fl, 1.15, 1.9));

export default function Short52Suns() {
  const f = useCurrentFrame();
  const s = sysAt(f);
  const k = kepler(f);
  const solar = 1 - k;
  const px = PX * (1 + 0.35 * k);
  const fl = fluxOf(s);
  const heat = prog(fl, 1.0, 1.91) * solar;

  // the binary about its barycentre; B slides out of A as it arrives
  const M = massOf(s);
  const phi = PH.binary[f] + 0.6;
  const rA = (s.abin * s.B.m * s.bIn) / M;
  const rB = (s.abin * s.A.m) / M;
  const ax = CX - Math.cos(phi) * rA * px;
  const ay = CY - Math.sin(phi) * rA * px;
  const bx = CX + Math.cos(phi) * rB * px * s.bIn;
  const by = CY + Math.sin(phi) * rB * px * s.bIn;

  const th = THETA0 + PH.planet[f];
  const pr = s.a * px;
  const ex = CX + Math.cos(th) * pr;
  const ey = CY + Math.sin(th) * pr;

  const venusA = (2 * Math.PI * 5 * f) / END + 1.1;
  const marsO = span(f, MARS, SWAP) * solar;
  const marsA = (2 * Math.PI * 2 * f) / END + 2.2;
  const movedRing = Math.min(1, Math.abs(s.a - 1) / 0.05);

  const scale = f < GROW ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, GROW, END - 1)));
  const titleO = f < GROW ? 1 - prog(f, REW - 6, REW + 2) : EASE_OUT(prog(f, TITLE_BACK, TITLE_BACK + 24));

  const km = Math.floor(SQRT2 * 149.598);
  const light = lightColor(fl);

  return (
    <AbsoluteFill style={{ background: '#07090f' }}>
      <ShortsBackdrop base="#07090f" glow="#141a28" />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `${CX}px ${CY}px` }}>
        {/* the light itself: the whole sky warms with total luminosity */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${CX}px ${CY}px, rgba(245,215,110,${0.1 + 0.08 * Math.min(2, s.A.L + s.B.L * s.bIn)}) 0%, transparent 42%)`,
          }}
        />
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Starfield frame={f} loop={END} />

          {/* the solar neighbourhood: Venus, today's orbit, Mars */}
          <OrbitRing cx={CX} cy={CY} r={0.723 * px} color="#e8c07a" o={(0.32 + 0.5 * span(f, VENUS, TEN + 20)) * solar} label="VENUS" labelO={span(f, VENUS, FICTION)} />
          <OrbitRing
            cx={CX}
            cy={CY}
            r={1 * px}
            color="#4db8a8"
            dashed
            o={0.7 * solar}
            label={f < JUST ? 'EARTH TODAY' : 'WHERE WE STAND'}
            labelAt="bottom"
            labelO={f < JUST ? span(f, MOVE, SWAP) : span(f, JUST + 30, F(40.5))}
          />
          <OrbitRing cx={CX} cy={CY} r={1.524 * px} color="#e8879f" o={0.7 * marsO} label="MARS" labelO={marsO} />
          <OrbitRing cx={CX} cy={CY} r={pr} color="#ffffff" o={0.5 * Math.max(movedRing * solar, k)} width={2.5} />

          {solar > 0.01 ? (
            <g opacity={solar}>
              <circle cx={CX + Math.cos(venusA) * 0.723 * px} cy={CY + Math.sin(venusA) * 0.723 * px} r={11} fill="#e8c07a" />
              {marsO > 0.01 ? <circle cx={CX + Math.cos(marsA) * 1.524 * px} cy={CY + Math.sin(marsA) * 1.524 * px} r={9} fill="#d9694f" opacity={marsO} /> : null}
            </g>
          ) : null}

          <SunDisc id="sunA" x={ax} y={ay} star={s.A} />
          <SunDisc id="sunB" x={bx} y={by} star={s.B} o={Math.min(1, s.bIn * 1.6)} />

          <Planet x={ex} y={ey} r={22 + 5 * k} heat={heat} giant={k} spin={th * 6} />
        </svg>

        <Tag x={ex} y={ey - 62} text="KEPLER-16b" color="#b39ddb" o={span(f, FICTION + 20, JUST + 10)} />
      </AbsoluteFill>

      {/* the instrument: distance, year and sunlight, each a formula read back */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 1190,
          width: 940,
          height: 250,
          borderRadius: 24,
          background: 'rgba(16,20,28,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ position: 'absolute', left: 20, top: 16, display: 'flex' }}>
          <Readout w={300} label="DISTANCE" value={`${s.a.toFixed(2)} AU`} pop={pulse(f, MOVE + MOVE_LEN - 6, 26)} />
          <Readout w={300} label="YEAR" value={`${Math.round(yearOf(s))} d`} color={ACCENT} pop={Math.max(pulse(f, DAYS434), pulse(f, DAYS229))} />
          <Readout w={300} label="SUNLIGHT" value={`${fl.toFixed(2)}×`} color={light} pop={Math.max(pulse(f, TWICE), pulse(f, VENUS))} />
        </div>
        <SunGauge
          x={40}
          y={126}
          w={860}
          value={fl}
          max={2.2}
          color={light}
          marks={[
            { v: 1, label: 'EARTH TODAY 1×', color: '#4db8a8', side: 'below', o: 1 },
            { v: 1.1, label: 'RUNAWAY', color: '#e8879f', side: 'above', o: EASE_OUT(prog(f, TEN - 2, TEN + 8)) * (f < GROW ? 1 : 1 - prog(f, GROW, END - 20)), pop: pulse(f, TEN) },
            { v: 1.91, label: 'VENUS 1.9×', color: '#e8c07a', side: 'above', o: 1, pop: pulse(f, VENUS) },
          ]}
          danger={{ from: 1.1, o: EASE_OUT(prog(f, TEN - 2, TEN + 8)) * (f < GROW ? 1 : 1 - prog(f, GROW, END - 20)) }}
        />
      </div>

      {/* chips under the kicker, landing on their words */}
      <Tag x={540} y={290} text="SUNLIGHT ∝ 1 / DISTANCE²" color="#8f93f7" o={span(f, SQUARE, MOVE)} />
      <Tag x={540} y={290} text="2 SUNS → √2 = 1.41 AU" color="#4db8a8" o={span(f, MOVE, MARS)} />
      <Tag x={540} y={290} text={`${km} MILLION KM OUT`} color="#e8879f" o={span(f, MARS, PULL)} />
      <Tag x={540} y={290} text={`ONE SUN THIS FAR OUT: ${Math.round(periodDays(SQRT2, 1))} d`} color={ACCENT} o={span(f, PULL, FICTION)} />
      <Tag x={540} y={290} text="REAL · FOUND IN 2011" color="#b39ddb" o={span(f, KEPLER, JUST)} />

      <Stamp text="OCEANS BOIL" at={BOIL} until={QUIZ_IN} color="#e8879f" x={540} y={430} size={62} />

      {/* the beat, named as the narration names it */}
      <Kicker text="Earth today" color="#4db8a8" y={170} at={REW + 4} until={TWO + 4} />
      <Kicker text="Twice the sunlight" color={ACCENT} y={170} at={TWO + 4} until={TEN} />
      <Kicker text="Runaway greenhouse" color="#e8879f" y={170} at={TEN} until={QUIZ_IN} />
      <Kicker text="Inverse-square law" color="#8f93f7" y={170} at={SUNLIGHT} until={MOVE} />
      <Kicker text="The fix: move out" color="#4db8a8" y={170} at={MOVE} until={PULL} />
      <Kicker text="Two suns pull harder" color={ACCENT} y={170} at={PULL} until={FICTION} />
      <Kicker text="Kepler-16" color="#b39ddb" y={170} at={FICTION} until={JUST + 10} />

      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard title="HOW FAR?" subtitle="to get back to 1× sunlight" durSec={(QUIZ_OUT - QUIZ_IN) / 30} y={560} />
      </Sequence>

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={86} y={140} lines={[{ text: 'What if Earth' }, { text: 'had two suns?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
