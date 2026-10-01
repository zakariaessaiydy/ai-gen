import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import {
  AlarmIcon,
  Bed,
  EASE_INOUT,
  EASE_OUT,
  Floor,
  Furniture,
  GhostRoute,
  P,
  PhoneIcon,
  Pt,
  ROUTE_COLORS as C,
  ReachRing,
  RoomLabel,
  RouteLine,
  SinkIcon,
  StopPin,
  View,
  Walker,
  Walls,
  WindowLight,
  dist,
  fmtM,
  lerpPt,
  litAt,
  pathLen,
  placeStops,
  pointAt,
  toPx,
  walkAt,
} from '../../lib/route';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short28Morning',
  durationInSeconds: 42.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = C.accent;
const F = (s: number) => Math.round(s * 30);
const END = F(42.0); // 1260

// =============================================================================
// THE MODEL — one flat, in metres. Every number on screen is read back off it.
//
// The route starts IN BED. Stops are given the object they belong to; placeStops() projects each
// object onto the route, so their order, the count before the phone and the metres walked are
// all the route's own arithmetic. Move KITCHEN next to the bed and the video re-argues itself.
// =============================================================================
const V: View = { ox: 99, oy: 440, k: 98 }; // 9 m x 8.5 m -> 882 x 833 px
const PLAN_W = 9;
const PLAN_H = 8.5;
const WALLS: [Pt, Pt][] = [
  [P(0, 0), P(9, 0)],
  [P(9, 0), P(9, 8.5)],
  [P(9, 8.5), P(0, 8.5)],
  [P(0, 8.5), P(0, 0)],
  [P(5.2, 0), P(5.2, 4.2)], // bedroom | bath
  [P(0, 4.2), P(3.7, 4.2)], // bedroom door 3.7-4.7
  [P(4.7, 4.2), P(6.0, 4.2)], // bath door 6.0-6.9
  [P(6.9, 4.2), P(9, 4.2)],
];

const IN_BED = P(1.7, 0.85); // where the day starts
const NIGHTSTAND = P(2.23, 0.52);
const KITCHEN = P(7.5, 8.18); // the charger, far end of the counter
const ARM = 0.75; // arm's reach from the pillow, drawn — not a claim the video states

const ROUTE: Pt[] = [IN_BED, P(4.35, 2.35), P(3.7, 0.62), P(4.2, 3.3), P(4.2, 4.9), P(2.8, 7.45), P(7.5, 7.6)];

const STOPS = placeStops(ROUTE, [
  { id: 'alarm', label: 'ALARM', sub: 'across the room', at: P(4.85, 2.35), color: C.violet },
  { id: 'light', label: 'LIGHT', sub: 'curtains', at: P(3.7, 0.05), color: C.accent },
  { id: 'water', label: 'WATER', sub: 'the tap', at: P(2.8, 8.18), color: C.teal },
  { id: 'phone', label: 'PHONE', sub: '', at: KITCHEN, color: C.pink },
]);
const stop = (id: string) => STOPS.find((s) => s.id === id)!;
const S_ALARM = stop('alarm').s;
const S_LIGHT = stop('light').s;
const S_WATER = stop('water').s;
const S_PHONE = stop('phone').s;
const IN_REACH = dist(IN_BED, NIGHTSTAND);

// The shot asserts its own premises, so an edit that breaks the argument fails loudly.
if (Math.abs(S_PHONE - pathLen(ROUTE)) > 1e-6 || stop('phone').order !== STOPS.length) {
  throw new Error('Short28Morning: the phone must be the LAST stop on the route');
}
if (IN_REACH >= ARM) throw new Error('Short28Morning: the nightstand phone must be inside arm\'s reach');

const LABELS: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  alarm: { dx: -34, dy: 40, anchor: 'end' },
  light: { dx: 34, dy: 6, anchor: 'start' },
  water: { dx: -34, dy: 6, anchor: 'end' },
  phone: { dx: 0, dy: -58, anchor: 'middle' },
};
const subOf = (id: string, sub: string) => (id === 'phone' ? `last · ${fmtM(S_PHONE)}` : sub);

// =============================================================================
// CUES — GLOBAL frames. The canvas is mounted at the root on global time, so none of these
// are ever converted to a Sequence's local time. Each lands on a word (see beats.json).
// =============================================================================
// Retimed onto the REAL word times from gen_voice (beats.json vo[].words).
const HOOK_OUT = F(3.4); // L0 ends 3.08
const SETUP_OUT = F(12.7); // L2 ends 12.51
const QUIZ_OUT = F(15.2); // L3 starts 15.30
const REVEAL_OUT = F(28.7); // L6 "Move" 28.90
const TWIST_OUT = F(38.3); // L8 starts 38.55

const REW_A = F(3.2); // the finished walk runs backwards into bed
const REW_B = F(4.2);
const AL_OUT_A = F(3.4); // the alarm clock leaves: the phone IS the alarm now
const AL_OUT_B = F(4.0);
const PH_BACK_A = F(3.6); // the phone slides back to the nightstand...
const PH_BACK_B = F(4.4);
const RING_A = F(4.4); // ...and rings as "alarm," lands (4.30-4.80)
const RING_B = F(7.6); // silent after "off." (7.51)
const REACH_A = F(5.55); // arm's reach, on "pick" (5.68)
const TOUCH_A = F(9.0); // "touch" (9.12)
const KEEP_A = F(11.1); // "keep" (11.25)
const PH_GO_A = F(15.8); // on "kitchen" (15.96)
const PH_GO_B = F(16.6);
const AL_IN_A = F(17.5); // "alarm" (17.55) ...
const AL_IN_B = F(18.3); // ... lands on "room" (18.35)
const PINS_A = F(18.6);
const PINS_B = F(19.4);
const WALK_A = F(19.5); // leaves the bed as L3 closes, so "Now" (20.10) finds it moving
const AT_ALARM = F(20.4);
const AT_LIGHT = F(21.7); // on "curtains" (21.68)
const AT_WATER = F(22.75); // on "tap" (22.70)
const AT_PHONE = F(27.0); // on "way" (26.98)
const PLATE_A = F(28.9); // "Move" (28.90)
const PLATE_B = F(34.5); // out after "way." (33.37-34.05)
const LAST_A = F(37.1); // on "last" (37.10)
const TITLE_A = F(38.3);
const TITLE_B = F(39.3);
const MORNING_A = F(38.9); // "morning" (38.95) ... "phone" (40.00)
const MORNING_B = F(40.9);
const PUNCH_A = F(40.3);

const WALK_KEYS: [number, number][] = [
  [WALK_A, 0],
  [AT_ALARM, S_ALARM],
  [AT_LIGHT, S_LIGHT],
  [AT_WATER, S_WATER],
  [AT_PHONE, S_PHONE],
];

// =============================================================================
// THE SCALARS — each is the same value at frame 0 and frame END-1 by construction.
// =============================================================================
/** Metres walked. S_PHONE at both ends: frame 0 is the finished walk, the setup rewinds it. */
const walkedAt = (f: number) => {
  if (f < REW_A) return S_PHONE;
  if (f < REW_B) return S_PHONE * (1 - EASE_INOUT(prog(f, REW_A, REW_B)));
  if (f < WALK_A) return 0;
  return walkAt(WALK_KEYS, f);
};

const phoneAt = (f: number): Pt => {
  if (f < PH_BACK_A) return KITCHEN;
  if (f < PH_BACK_B) return lerpPt(KITCHEN, NIGHTSTAND, EASE_INOUT(prog(f, PH_BACK_A, PH_BACK_B)));
  if (f < PH_GO_A) return NIGHTSTAND;
  if (f < PH_GO_B) return lerpPt(NIGHTSTAND, KITCHEN, EASE_INOUT(prog(f, PH_GO_A, PH_GO_B)));
  return KITCHEN;
};

/** 1 -> fades out over [outA,outB] -> 0 -> fades in over [inA,inB] -> 1. */
const outIn = (f: number, outA: number, outB: number, inA: number, inB: number) =>
  f < inA ? 1 - EASE_INOUT(prog(f, outA, outB)) : EASE_OUT(prog(f, inA, inB));

const bump = (f: number, a: number, b: number) => Math.sin(Math.PI * prog(f, a, b));

// =============================================================================
// THE CANVAS — one flat for the whole video, on GLOBAL time.
// =============================================================================
const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const walked = walkedAt(f);
  const you = pointAt(ROUTE, walked);
  const phone = phoneAt(f);

  const pinsOp = outIn(f, REW_A, REW_B, PINS_A, PINS_B);
  const alarmOp = outIn(f, AL_OUT_A, AL_OUT_B, AL_IN_A, AL_IN_B);
  const ring = EASE_OUT(prog(f, RING_A, RING_A + 8)) * (1 - prog(f, RING_B - 10, RING_B));
  const ringPhase = (((f - RING_A) / 22) % 1 + 1) % 1;
  const reachOp = EASE_OUT(prog(f, REACH_A, REACH_A + 12)) * (1 - EASE_INOUT(prog(f, PH_GO_A, PH_GO_A + 14)));
  const touchOp = EASE_OUT(prog(f, TOUCH_A, TOUCH_A + 12)) * (1 - prog(f, PH_GO_A - 6, PH_GO_A + 6));
  const keep = EASE_OUT(prog(f, KEEP_A, KEEP_A + 14)) * (1 - EASE_INOUT(prog(f, PH_GO_A, PH_GO_A + 20)));
  const lastPulse = bump(f, LAST_A, LAST_A + 26);
  const morning = bump(f, MORNING_A, MORNING_B);
  const youLabel = 1 - litAt(stop('phone'), walked, 1.2);

  const punch =
    f < 150 ? 1.06 + (1.0 - 1.06) * EASE_OUT(prog(f, 0, 90)) : 1.0 + (1.06 - 1.0) * EASE_INOUT(prog(f, PUNCH_A, END - 1));
  const cx = V.ox + (PLAN_W * V.k) / 2;
  const cy = V.oy + (PLAN_H * V.k) / 2;

  const ph = toPx(V, phone);
  const bed = toPx(V, IN_BED);
  const lbl = toPx(V, P(3.0, 1.8)); // setup labels: the open floor right of the bed, in plan metres
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(${cx} ${cy}) scale(${punch}) translate(${-cx} ${-cy})`}>
          <Floor v={V} w={PLAN_W} h={PLAN_H} />
          <WindowLight v={V} a={P(2.9, 0)} b={P(4.5, 0)} open={litAt(stop('light'), walked)} depth={2.6} />
          <Bed v={V} x={0.35} y={0.25} w={1.6} h={2.1} />
          <Furniture v={V} x={1.98} y={0.27} w={0.5} h={0.5} r={6} />
          <Furniture v={V} x={4.6} y={1.85} w={0.5} h={1.0} r={6} />
          <Furniture v={V} x={6.9} y={0.35} w={1.75} h={0.85} r={20} />
          <Furniture v={V} x={0.35} y={5.4} w={0.9} h={1.7} r={14} />
          <Furniture v={V} x={5.6} y={5.3} w={1.5} h={1.0} r={10} />
          <Furniture v={V} x={1.6} y={7.88} w={6.9} h={0.6} r={6} />
          <Walls v={V} segs={WALLS} />
          <RoomLabel v={V} at={P(1.15, 3.8)} text="BEDROOM" />
          <RoomLabel v={V} at={P(7.1, 2.25)} text="BATH" />
          <RoomLabel v={V} at={P(5.2, 7.15)} text="KITCHEN" />

          <ReachRing v={V} at={IN_BED} r={ARM} opacity={reachOp} color={C.pink} />
          <GhostRoute v={V} pts={ROUTE} opacity={pinsOp} />
          <RouteLine v={V} pts={ROUTE} to={walked} color={ACCENT} glow={morning} />

          <AlarmIcon v={V} at={P(4.85, 2.35)} opacity={alarmOp} />
          <SinkIcon v={V} at={P(2.8, 8.18)} lit={litAt(stop('water'), walked)} />
          <PhoneIcon v={V} at={phone} glow={keep} ring={ring} ringPhase={ringPhase} />

          <Walker v={V} at={you} labelOpacity={youLabel} />
          {STOPS.map((s) => (
            <StopPin
              key={s.id}
              v={V}
              stop={{ ...s, sub: subOf(s.id, s.sub) }}
              lit={litAt(s, walked)}
              opacity={pinsOp}
              pulse={s.id === 'phone' ? lastPulse : 0}
              {...LABELS[s.id]}
            />
          ))}

          {/* SETUP — what the nightstand phone is, said where it sits */}
          <g opacity={reachOp}>
            <text x={bed.x} y={bed.y + ARM * V.k + 34} textAnchor="middle" style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 24, letterSpacing: 3, fill: C.pink, stroke: C.stage, strokeWidth: 8, paintOrder: 'stroke' }}>
              ARM'S REACH
            </text>
            <text x={bed.x} y={bed.y + ARM * V.k + 64} textAnchor="middle" style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 24, fill: C.dim, stroke: C.stage, strokeWidth: 8, paintOrder: 'stroke' }}>
              phone {fmtM(IN_REACH)} away
            </text>
          </g>
          <g opacity={touchOp}>
            <line x1={ph.x + 20} y1={ph.y + 12} x2={lbl.x - 8} y2={lbl.y - 30} stroke={C.dim} strokeWidth={2.5} />
            <text x={lbl.x} y={lbl.y} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, fill: C.text, stroke: C.stage, strokeWidth: 10, paintOrder: 'stroke' }}>
              FIRST THING
            </text>
            <text x={lbl.x} y={lbl.y + 40} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, fill: C.text, stroke: C.stage, strokeWidth: 10, paintOrder: 'stroke' }}>
              YOU TOUCH
            </text>
          </g>
          <g opacity={keep}>
            <text x={lbl.x} y={lbl.y + 90} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, fill: C.pink, stroke: C.stage, strokeWidth: 10, paintOrder: 'stroke' }}>
              BUILT TO
            </text>
            <text x={lbl.x} y={lbl.y + 128} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, fill: C.pink, stroke: C.stage, strokeWidth: 10, paintOrder: 'stroke' }}>
              KEEP YOU
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** REVEAL readout — both numbers are the walk read back, never typed. */
const Readout: React.FC = () => {
  const f = useCurrentFrame();
  const op = EASE_OUT(prog(f, WALK_A - 10, WALK_A + 4)) * (1 - prog(f, PLATE_A - 12, PLATE_A));
  if (op <= 0.01) return null;
  const walked = walkedAt(f);
  const things = STOPS.filter((s) => s.id !== 'phone' && walked >= s.s).length;
  return (
    <div style={{ position: 'absolute', top: 262, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          background: 'rgba(12,14,20,0.84)',
          border: `2px solid ${ACCENT}44`,
          borderRadius: 22,
          padding: '14px 36px',
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: ACCENT, lineHeight: 1 }}>{things}</div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: C.text, lineHeight: 1.1 }}>
            THINGS BEFORE
            <br />
            THE PHONE
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: C.dim, marginTop: 6 }}>{fmtM(walked)} walked</div>
        </div>
      </div>
    </div>
  );
};

/** TWIST — the measured version of the same trick, with its gap to this video printed on it. */
const Evidence: React.FC = () => {
  const f = useCurrentFrame();
  const op = EASE_OUT(prog(f, PLATE_A, PLATE_A + 14)) * (1 - prog(f, PLATE_B - 12, PLATE_B));
  if (op <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 254, // kicker pill ends ~244; the plan's top wall is at 440 — the plate lives between them
        left: 70,
        right: 70,
        opacity: op,
        transform: `translateY(${(1 - op) * 12}px)`,
        background: 'rgba(12,14,20,0.9)',
        border: `2px solid ${C.teal}66`,
        borderLeft: `10px solid ${C.teal}`,
        borderRadius: 18,
        padding: '12px 26px',
      }}
    >
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 31, color: C.text, lineHeight: 1.12 }}>FOOD PLACED FARTHER AWAY</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 31, color: C.teal, lineHeight: 1.12 }}>GETS EATEN LESS</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: C.text, marginTop: 8, opacity: 0.85 }}>12 STUDIES · 1,098 PEOPLE · SMD −0.60</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: C.dim, marginTop: 4 }}>
        Cochrane review, Hollands et al. 2019 · food, not phones · low certainty
      </div>
    </div>
  );
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const op = f < TITLE_A ? 1 - prog(f, HOOK_OUT - 10, HOOK_OUT) : EASE_OUT(prog(f, TITLE_A, TITLE_B));
  if (op <= 0.01) return null;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <BigTitle
        warm
        y={110}
        size={80}
        lines={[{ text: 'START YOUR DAY' }, { text: 'WITHOUT YOUR PHONE', color: ACCENT }]}
        subtitle="don't resist it. move it."
      />
    </AbsoluteFill>
  );
};

// =============================================================================
// THE SHOT
// =============================================================================
export default function Short28Morning() {
  return (
    <AbsoluteFill style={{ background: C.stage }}>
      <ShortsBackdrop />
      <Canvas />
      <Readout />
      <Evidence />
      <Title />

      <Sequence from={HOOK_OUT} durationInFrames={SETUP_OUT - HOOK_OUT}>
        <Kicker text="IF YOUR PHONE IS YOUR ALARM" at={6} color={C.pink} />
      </Sequence>

      <Sequence from={SETUP_OUT} durationInFrames={QUIZ_OUT - SETUP_OUT}>
        <PauseCard subtitle="where should your phone sleep?" durSec={(QUIZ_OUT - SETUP_OUT) / 30} y={1350} accent={ACCENT} />
      </Sequence>

      <Sequence from={QUIZ_OUT} durationInFrames={REVEAL_OUT - QUIZ_OUT}>
        <Kicker text="MOVE THE PHONE, NOT YOUR WILL" at={8} />
      </Sequence>

      <Sequence from={REVEAL_OUT} durationInFrames={TWIST_OUT - REVEAL_OUT}>
        <Kicker text="THE SAME TRICK, MEASURED" at={6} until={PLATE_B - REVEAL_OUT} color={C.teal} />
      </Sequence>

      {/* GLOBAL */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
