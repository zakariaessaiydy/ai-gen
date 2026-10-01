import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import {
  EASE_INOUT,
  EASE_OUT,
  FLUID_COLORS as C,
  Cup,
  FluidDefs,
  GlassBack,
  GlassFront,
  Graduations,
  Liquid,
  Stream,
  TAU,
  columnPx,
  cupLip,
  mix,
  pourD,
  quietBy,
  simulateSurface,
  wallsAt,
} from '../../lib/fluid';
import type { Band, CupKind, Splash, Vessel } from '../../lib/fluid';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short30Drink',
  durationInSeconds: 36.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = C.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(compositionConfig.durationInSeconds);

// =============================================================================
// CUES — read from the word times in vo.gen.ts, never typed (short-29's rule). Before the voice
// exists, timeWords() estimates them from the line windows, so QA frames are still representative.
// A key missing from its line throws.
// =============================================================================
const key = (w: string) => w.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9'-]/g, '');
const wAt = (line: number, word: string, edge: 'start' | 'end' = 'start') => {
  const w = timeWords(VO[line]).find((x) => key(x.w).startsWith(word));
  if (!w) throw new Error(`Short30Drink: no word "${word}" in VO line ${line} ("${VO[line].text}")`);
  return F(w[edge]);
};
const lineStart = (i: number) => F(VO[i].start);
const lineEnd = (i: number) => F(VO[i].end);

// VO lines: 0 hook · 1 eight/number · 2 remember · 3 tie · 4 wake,coffee,lunch,home · 5 trigger ·
//           6 ninety-four studies · 7 coffee counts · 8 same eight glasses
const HOOK_OUT = lineStart(1) - 6;
const REWIND_A = wAt(1, 'eight'); // the day un-pours, last glass first
const LIFT_A = Math.max(wAt(1, 'number'), REWIND_A + 42); // cups leave their triggers
const SWEEP_A = wAt(2, 'remember');
const SWEEP_B = Math.max(SWEEP_A + 30, wAt(2, 'own', 'end'));
const QUIZ_A = lineEnd(2);
const QUIZ_B = lineStart(3) - 3;
const LAND_A = wAt(3, 'tie'); // cups back on their triggers
const WAKE_W = wAt(4, 'wake');
const COFFEE_W = wAt(4, 'coffee');
const LUNCH_W = wAt(4, 'lunch');
const HOME_W = wAt(4, 'home');
const TEETH_W = wAt(5, 'remembering');
const PLATE_A = lineStart(6);
const BEAT_W = wAt(6, 'beat');
const PLATE_SWAP = lineStart(7);
const COFFEE_T = wAt(7, 'coffee');
const WATER_W = wAt(7, 'water');
const TITLE_A = lineStart(8) - 8;
const PLATE_B = TITLE_A;
const EIGHT_W = wAt(8, 'eight');
const PUNCH_A = lineStart(8);

// =============================================================================
// THE MODEL — one day, eight triggers, eight 250 mL cups, one glass.
// =============================================================================
const GLASS_L = 0.25;
const LITRE_PX = 250;
const BAND_PX = GLASS_L * LITRE_PX;
const VESSEL: Vessel = { cx: 540, top: 650, bottom: 1245, wTop: 380, wBot: 330, wall: 10, base: 22 };

type Anchor = { id: string; label: string; h: number; kind: CupKind };
const ANCHORS: Anchor[] = [
  { id: 'wake', label: 'WAKE', h: 7, kind: 'glass' },
  { id: 'coffee', label: 'COFFEE', h: 8.5, kind: 'mug' },
  { id: 'desk', label: 'DESK', h: 10.5, kind: 'glass' },
  { id: 'lunch', label: 'LUNCH', h: 12.5, kind: 'glass' },
  { id: 'break', label: 'BREAK', h: 15, kind: 'glass' },
  { id: 'home', label: 'HOME', h: 18, kind: 'glass' },
  { id: 'dinner', label: 'DINNER', h: 19.5, kind: 'glass' },
  { id: 'teeth', label: 'TEETH', h: 22.5, kind: 'glass' },
];
const hOf = (id: string) => {
  const a = ANCHORS.find((x) => x.id === id);
  if (!a) throw new Error(`Short30Drink: no trigger ${id}`);
  return a.h;
};
const TOTAL_L = ANCHORS.length * GLASS_L; // 2.00, and the readout reads it back off the bands

// The day strip.
const H0 = 6;
const H1 = 23.5;
const X0 = 110;
const X1 = 900;
const AX_Y = 522;
const CUP_Y = 504;
const ROW_Y = 486;
const xOf = (h: number) => X0 + ((h - H0) / (H1 - H0)) * (X1 - X0);
const rowX = (i: number) => 540 + (i - (ANCHORS.length - 1) / 2) * 60;

// THE CURSOR — the time of day, as keyframes. The reveal chain is LINEAR and pinned to the spoken
// words, so the cursor reaches WAKE on "Wake", COFFEE on "coffee", LUNCH on "lunch", HOME on "home";
// the triggers between them pour wherever the cursor happens to cross them.
type Key = [number, number, boolean]; // frame, hour, ease into this key
const KEYS: Key[] = [
  [0, H1, false],
  [REWIND_A, H1, false],
  [REWIND_A + 24, H0, true],
  [SWEEP_A, H0, false],
  [SWEEP_B, H1, true],
  [LAND_A, H1, false],
  [LAND_A + 30, H0, true],
  [WAKE_W - 12, H0, false],
  [WAKE_W, hOf('wake'), false],
  [COFFEE_W, hOf('coffee'), false],
  [LUNCH_W, hOf('lunch'), false],
  [HOME_W, hOf('home'), false],
  [TEETH_W, hOf('teeth'), false],
  [TEETH_W + 30, H1, true],
  [END, H1, false],
];
KEYS.forEach((k, i) => {
  if (i && k[0] <= KEYS[i - 1][0]) throw new Error(`Short30Drink: cursor key ${i} (f${k[0]}) is not after key ${i - 1} (f${KEYS[i - 1][0]})`);
});
const cursorH = (f: number) => {
  for (let i = 1; i < KEYS.length; i++) {
    const [fa, ha] = KEYS[i - 1];
    const [fb, hb, ease] = KEYS[i];
    if (f <= fb) {
      const t = prog(f, fa, fb);
      return mix(ha, hb, ease ? EASE_INOUT(t) : t);
    }
  }
  return H1;
};

// A cup pours on the frame the reveal's cursor CROSSES its trigger — scanned, not typed.
const POUR_AT = ANCHORS.map((a) => {
  for (let f = LAND_A + 30; f < END; f++) if (cursorH(f) >= a.h - 1e-6) return f - 2;
  throw new Error(`Short30Drink: the cursor never reaches ${a.id}`);
});
const REWIND_AT = ANCHORS.map((_, i) => REWIND_A + (ANCHORS.length - 1 - i) * 3); // last-poured first
const LAND_FRAC = ANCHORS.map((a) => 0.22 + 0.56 * ((xOf(a.h) - X0) / (X1 - X0)));

// =============================================================================
// THE SCALARS — each is the same value at frame 0 and frame END-1 by construction.
// =============================================================================
/** How full cup i is. 0 at both ends: frame 0 is the day already drunk. */
const fillAt = (i: number, f: number) =>
  f < POUR_AT[i] - 4 ? EASE_INOUT(prog(f, REWIND_AT[i] + 2, REWIND_AT[i] + 16)) : 1 - prog(f, POUR_AT[i] + 2, POUR_AT[i] + 16);
/** 1 = on its trigger, 0 = in the SOMETIME TODAY row. */
const anchoredAt = (i: number, f: number) =>
  f < LAND_A
    ? 1 - EASE_INOUT(prog(f, LIFT_A + i * 3, LIFT_A + i * 3 + 16))
    : EASE_INOUT(prog(f, LAND_A + i * 4, LAND_A + i * 4 + 18));
const labelAt = (i: number, f: number) =>
  f < LAND_A ? 1 - prog(f, LIFT_A - 4, LIFT_A + 8) : prog(f, LAND_A + i * 4 + 12, LAND_A + i * 4 + 22);
const bump = (f: number, a: number, b: number) => Math.sin(Math.PI * prog(f, a, b));
/** How far a cup is tipped (0..1), for a pour or a rewind starting at s. */
const tipAt = (f: number, s: number) => EASE_INOUT(prog(f, s - 5, s + 3)) * (1 - EASE_INOUT(prog(f, s + 16, s + 24)));

const bandsAt = (f: number): Band[] =>
  ANCHORS.map((a, i) => ({
    px: (1 - fillAt(i, f)) * BAND_PX,
    color: a.kind === 'mug' ? C.coffee : i % 2 ? C.waterAlt : C.water,
    glow: a.kind === 'mug' ? bump(f, COFFEE_T - 4, WATER_W + 30) : 0,
  }));

// THE SURFACE — only the streams excite it: a pour pushes down where it lands, a rewind pulls up.
const SPLASHES: Splash[] = [
  ...POUR_AT.map((p, i) => ({ f: p + 7, dur: 10, x: LAND_FRAC[i], amp: 0.55 })),
  ...REWIND_AT.map((r, i) => ({ f: r + 2, dur: 8, x: LAND_FRAC[i], amp: -0.25 })),
];
const SIM = simulateSurface({ frames: END, splashes: SPLASHES });
// The loop contract, measured: the last splash must have died away before the wrap.
if (quietBy(SIM, END - 1) > 0.01) {
  throw new Error(`Short30Drink: surface still moving at the wrap (${quietBy(SIM, END - 1).toFixed(4)} of peak)`);
}
const WAVE_PX = 16;
const ambientAt = (f: number) => (i: number) =>
  1.4 * Math.sin(TAU * ((7 * f) / END) + i * 0.33) + 0.9 * Math.sin(TAU * ((-5 * f) / END) + i * 0.19 + 1.3);

const hhmm = (h: number) => {
  const m = Math.round((h * 60) / 5) * 5;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// =============================================================================
// THE CANVAS — one day, one glass, on GLOBAL time.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const bands = bandsAt(f);
  const total = columnPx(bands);
  const level = VESSEL.bottom - total;
  const [ml, mr] = wallsAt(VESSEL, level);
  const litres = total / LITRE_PX;
  const drunk = bands.filter((b) => b.px > BAND_PX * 0.98).length;
  const cur = cursorH(f);
  const curX = xOf(cur);
  const rowOp = 1 - Math.min(...ANCHORS.map((_, i) => anchoredAt(i, f)));
  const readGlow = bump(f, EIGHT_W - 4, EIGHT_W + 36);
  const coffeeOp = bump(f, COFFEE_T - 4, WATER_W + 30);

  const cups = ANCHORS.map((a, i) => {
    const w = anchoredAt(i, f);
    const ax = xOf(a.h);
    const x = mix(rowX(i), ax, w);
    const y = mix(ROW_Y, CUP_Y, w) - 46 * Math.sin(Math.PI * w);
    const dir = ax < VESSEL.cx ? 1 : -1;
    const tip = Math.max(tipAt(f, POUR_AT[i]), tipAt(f, REWIND_AT[i]));
    const tilt = dir * 108 * tip;
    const to = { x: mix(ml + 36, mr - 36, LAND_FRAC[i]), y: level + 6 };
    const d = pourD(cupLip(x, y, tilt, dir), to, VESSEL.top, 58);
    const p = POUR_AT[i];
    const r = REWIND_AT[i];
    const pouring = f >= p - 1 && f <= p + 20;
    const s0 = pouring ? prog(f, p + 10, p + 18) : 1 - EASE_OUT(prog(f, r, r + 8));
    const s1 = pouring ? EASE_OUT(prog(f, p, p + 8)) : 1 - prog(f, r + 10, r + 18);
    const streamOn = pouring || (f >= r && f <= r + 20);
    // "fired" = this cup has been drunk, read off its own fill: true at frame 0 AND at the wrap
    return { a, i, x, y, tilt, d, s0, s1, streamOn, fired: fillAt(i, f) < 0.5, fire: bump(f, p, p + 24) };
  });

  const punch =
    f < 150 ? 1.06 + (1.0 - 1.06) * EASE_OUT(prog(f, 0, 90)) : 1.0 + (1.06 - 1.0) * EASE_INOUT(prog(f, PUNCH_A, END - 1));
  const cx = 540;
  const cy = 860;
  const lbl = (i: number) => (i % 2 ? 418 : 448);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <FluidDefs vessel={VESSEL} />
        <g transform={`translate(${cx} ${cy}) scale(${punch}) translate(${-cx} ${-cy})`}>
          {/* THE DAY STRIP */}
          <line x1={X0} y1={AX_Y} x2={X1} y2={AX_Y} stroke={C.dim} strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
          {cups.map(({ a, i, fired, fire }) => {
            const op = labelAt(i, f);
            return (
              <g key={a.id}>
                <circle cx={xOf(a.h)} cy={AX_Y} r={7 + 4 * fire} fill={fired ? ACCENT : C.stage} stroke={ACCENT} strokeOpacity={0.3 + 0.7 * op} strokeWidth={3} />
                <g opacity={op}>
                  <text
                    x={xOf(a.h)}
                    y={lbl(i)}
                    textAnchor="middle"
                    style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 21, letterSpacing: 1, fill: fire > 0.05 ? ACCENT : C.text }}
                  >
                    {a.label}
                  </text>
                  <text x={xOf(a.h)} y={AX_Y + 34} textAnchor="middle" style={{ fontFamily: FONT_MONO, fontSize: 17, fill: C.dim }}>
                    {hhmm(a.h)}
                  </text>
                </g>
              </g>
            );
          })}
          {/* the cursor: the time of day */}
          <g>
            <line x1={curX} y1={396} x2={curX} y2={AX_Y + 12} stroke={ACCENT} strokeWidth={3} strokeOpacity={0.85} />
            <text
              x={Math.min(880, Math.max(130, curX))}
              y={386}
              textAnchor="middle"
              style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 21, fill: ACCENT, stroke: C.stage, strokeWidth: 6, paintOrder: 'stroke' }}
            >
              {hhmm(cur)}
            </text>
          </g>
          <text
            x={540}
            y={606}
            textAnchor="middle"
            opacity={rowOp}
            style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, fill: C.pink }}
          >
            8 GLASSES · SOMETIME TODAY
          </text>

          {/* THE GLASS */}
          <GlassBack vessel={VESSEL} />
          <Liquid vessel={VESSEL} bands={bands} heights={SIM.at(f)} amp={WAVE_PX} ambient={ambientAt(f)} />
          {cups.map((c) => (c.streamOn ? <Stream key={c.a.id} d={c.d} s0={c.s0} s1={c.s1} color={c.a.kind === 'mug' ? C.coffee : C.water} /> : null))}
          <GlassFront vessel={VESSEL} glow={readGlow} />
          <Graduations vessel={VESSEL} litrePx={LITRE_PX} step={0.5} max={TOTAL_L} />

          {cups.map((c) => (
            <Cup
              key={c.a.id}
              x={c.x}
              y={c.y}
              tilt={c.tilt}
              kind={c.a.kind}
              fill={fillAt(c.i, f)}
              color={c.a.kind === 'mug' ? C.coffee : C.water}
              glow={c.fire * 0.8}
            />
          ))}

          {/* READOUT — the bands, read back */}
          <g>
            <text x={752} y={790} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, fill: readGlow > 0.05 ? ACCENT : C.text }}>
              {litres.toFixed(2)} L
            </text>
            <text x={754} y={826} style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 20, letterSpacing: 1, fill: readGlow > 0.05 ? ACCENT : C.dim }}>
              {drunk} OF {ANCHORS.length} GLASSES
            </text>
          </g>
          <g opacity={coffeeOp}>
            <line x1={728} y1={VESSEL.bottom - 1.5 * BAND_PX} x2={750} y2={VESSEL.bottom - 1.5 * BAND_PX} stroke={C.coffee} strokeWidth={3} />
            <text x={758} y={VESSEL.bottom - 1.5 * BAND_PX - 4} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, fill: '#d9a877' }}>
              COFFEE
            </text>
            <text x={758} y={VESSEL.bottom - 1.5 * BAND_PX + 28} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, fill: C.teal }}>
              COUNTS ✓
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// =============================================================================
// TWIST PLATES
// =============================================================================
const Plate: React.FC<{ op: number; color: string; children: React.ReactNode }> = ({ op, color, children }) => (
  <div
    style={{
      position: 'absolute',
      top: 262,
      left: 70,
      right: 150,
      opacity: op,
      transform: `translateY(${(1 - op) * 12}px)`,
      background: 'rgba(12,14,20,0.94)',
      border: `2px solid ${color}66`,
      borderLeft: `10px solid ${color}`,
      borderRadius: 18,
      padding: '14px 24px 12px',
    }}
  >
    {children}
  </div>
);

/** d = 0.65 on Cohen's ruler — the effect size drawn, not translated into a percentage. */
const PlanPlate: React.FC = () => {
  const f = useCurrentFrame();
  const op = EASE_OUT(prog(f, PLATE_A, PLATE_A + 14)) * (1 - prog(f, PLATE_SWAP - 10, PLATE_SWAP));
  if (op <= 0.01) return null;
  const D = 0.65;
  const PX = 720; // per unit of d
  const X = 14;
  const grow = EASE_OUT(prog(f, BEAT_W - 8, BEAT_W + 14));
  return (
    <Plate op={op} color={C.teal}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: C.text, lineHeight: 1.1 }}>IF-THEN PLANS vs GOOD INTENTIONS</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 19, color: C.dim, marginTop: 4 }}>effect on actually doing it · 94 studies</div>
      <svg width={816} height={118} viewBox="0 0 816 118" style={{ display: 'block', marginTop: 10 }}>
        <rect x={X} y={20} width={PX} height={36} rx={8} fill="rgba(255,255,255,0.06)" />
        <rect x={X} y={20} width={Math.max(0, PX * D * grow)} height={36} rx={8} fill={C.teal} />
        {[
          [0.2, 'SMALL'],
          [0.5, 'MEDIUM'],
          [0.8, 'LARGE'],
        ].map(([v, t]) => (
          <g key={t as string}>
            <line x1={X + PX * (v as number)} y1={14} x2={X + PX * (v as number)} y2={62} stroke={C.text} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="4 4" />
            <text x={X + PX * (v as number)} y={86} textAnchor="middle" style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 17, fill: C.dim }}>
              {t} {(v as number).toFixed(1)}
            </text>
          </g>
        ))}
        <text
          x={X + PX * D * grow + 10}
          y={46}
          opacity={prog(f, BEAT_W + 6, BEAT_W + 14)}
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, fill: ACCENT, stroke: '#0c0e14', strokeWidth: 6, paintOrder: 'stroke' }}
        >
          d = {D.toFixed(2)}
        </text>
      </svg>
      <div style={{ fontFamily: FONT_BODY, fontSize: 19, color: C.dim, marginTop: 0 }}>Gollwitzer & Sheeran 2006 · meta-analysis · Adv Exp Soc Psychol</div>
    </Plate>
  );
};

/** Coffee vs the same volume of water: no difference in hydration markers. */
const CoffeePlate: React.FC = () => {
  const f = useCurrentFrame();
  const op = EASE_OUT(prog(f, PLATE_SWAP - 4, PLATE_SWAP + 10)) * (1 - prog(f, PLATE_B - 12, PLATE_B));
  if (op <= 0.01) return null;
  const eq = EASE_OUT(prog(f, WATER_W - 6, WATER_W + 8));
  return (
    <Plate op={op} color={C.coffee}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: C.text, lineHeight: 1.1 }}>4 CUPS OF COFFEE A DAY vs WATER</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 19, color: C.dim, marginTop: 4 }}>same volume · 3 days each · moderate intake</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 10 }}>
        <svg width={220} height={100} viewBox="0 0 220 100">
          <g transform="translate(40 92) scale(1.8)">
            <Cup x={0} y={0} fill={0.8} kind="glass" color={C.water} />
          </g>
          <text x={110} y={66} textAnchor="middle" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, fill: ACCENT }} opacity={eq}>
            =
          </text>
          <g transform="translate(176 92) scale(1.8)">
            <Cup x={0} y={0} fill={0.8} kind="mug" color={C.coffee} />
          </g>
        </svg>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: C.teal, lineHeight: 1.1, opacity: eq }}>
          NO DIFFERENCE
          <br />
          IN HYDRATION
        </div>
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 19, color: C.dim, marginTop: 8 }}>Killer et al. 2014 · PLoS ONE · 50 daily coffee drinkers</div>
    </Plate>
  );
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const op = f < TITLE_A ? 1 - prog(f, HOOK_OUT - 10, HOOK_OUT) : EASE_OUT(prog(f, TITLE_A, TITLE_A + 20));
  if (op <= 0.01) return null;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <BigTitle
        warm
        y={92}
        size={76}
        lines={[{ text: 'DRINK MORE WATER' }, { text: 'WITHOUT REMEMBERING', color: ACCENT }]}
        subtitle="give every glass a moment"
      />
    </AbsoluteFill>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short30Drink() {
  return (
    <AbsoluteFill style={{ background: C.stage }}>
      <ShortsBackdrop base={C.stage} glow={C.glow} />
      <Canvas />
      <PlanPlate />
      <CoffeePlate />
      <Title />

      <Sequence from={HOOK_OUT} durationInFrames={QUIZ_A - HOOK_OUT}>
        <Kicker text="A NUMBER HAS NO MOMENT" at={6} color={C.pink} />
      </Sequence>

      <Sequence from={QUIZ_A} durationInFrames={QUIZ_B - QUIZ_A}>
        <PauseCard subtitle="what makes you remember?" durSec={(QUIZ_B - QUIZ_A) / 30} y={470} accent={ACCENT} />
      </Sequence>

      <Sequence from={QUIZ_B} durationInFrames={PLATE_A - QUIZ_B}>
        <Kicker text="TIE IT TO A TRIGGER" at={6} />
      </Sequence>

      <Sequence from={PLATE_A} durationInFrames={TITLE_A - PLATE_A}>
        <Kicker text="MEASURED" at={6} until={PLATE_B - PLATE_A} color={C.teal} />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
