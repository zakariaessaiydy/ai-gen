import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, EASE_INOUT, EASE_OUT, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import {
  AltitudeScale,
  ClockKey,
  ESB,
  EmpireState,
  G,
  GravityField,
  Person,
  Readout,
  VT_SKYDIVER,
  altAt,
  clockAt,
  clockRate,
  kmh,
  makeSide,
  maxUpTo,
  peakOf,
  simulate,
  velAt,
} from '../../lib/fall';
import { Tag } from '../../lib/suns';
import { FONT_BODY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short54Fall',
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
  if (!x) throw new Error(`Short54Fall: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);

// =============================================================================
// THE PHYSICS — simulated once. 1 g UP for 10 s, then 1 g down; skydiver drag.
// =============================================================================
const FLIP = 10;
const gravity = (t: number) => (t < FLIP ? G : -G);
const OUT = simulate({ T: 30, gravity, vt: VT_SKYDIVER });
const PEAK = peakOf(OUT);
const ROOM_GAP = 0.9; // 2.7 m room, 1.8 m person: 0.9 m between head and ceiling
const PERSON_H = 1.8;
const IN = simulate({ T: 12, gravity, hi: ROOM_GAP });

// =============================================================================
// CUES — spoken words, global frames (the only <Sequence> is the PauseCard).
// =============================================================================
const REW = F(word(0, 'seconds').end) + 4; // the hook's peak rewinds to the ground
const FALLING = wAt(1, 'falling');
const UP = wAt(1, 'up');
const FIVE = wAt(2, 'five');
const M340 = wAt(3, '340');
const KMH180 = wAt(3, '180');
const BACK = wAt(4, 'back');
const QUIZ_IN = F(17.4);
const QUIZ_OUT = F(19.9);
const COAST = wAt(5, 'you');
const PEAKW = wAt(6, 'peak');
const ROOF = wAt(6, 'higher');
const THEN = wAt(7, 'then');
const TWELVE = wAt(7, 'twelve');
const IMPACT = F(word(7, 'hour').end);
const INDOORS = wAt(8, 'unless');
const YOUD = wAt(8, 'youd');
const CEIL = wAt(8, 'ceiling');
const HOUR8 = wAt(8, 'hour');
const UNDER = wAt(9, 'under');
const ZOOM_LEN = 36;
const SNAP = INDOORS + ZOOM_LEN + 2; // the outdoor you resets to the peak while the house fills the frame
const TITLE_BACK = F(40.0);
const GROW = F(40.4);

// the two sim clocks: [frame, sim seconds]
const OUT_KEYS: ClockKey[] = [
  [0, PEAK.t],
  [REW, PEAK.t],
  [REW + 14, 0], // rewind
  [FALLING, 0],
  [FIVE, 1], // slow motion to one second
  [M340, FLIP], // fast to ten
  [COAST, FLIP], // frozen through "switches back" and the quiz
  [PEAKW, PEAK.t],
  [THEN, PEAK.t],
  [IMPACT, OUT.landed],
  [SNAP - 1, OUT.landed],
  [SNAP, PEAK.t],
];
const IN_KEYS: ClockKey[] = [
  [0, 0],
  [YOUD, 0],
  [CEIL + 6, IN.hitHi],
  [HOUR8, IN.hitHi],
  [HOUR8 + 30, 11],
];
const LANDED_IN = IN.landed;

// the claims on the voice track, checked against the simulation that draws the picture
{
  const near = (a: number, b: number, eps: number) => Math.abs(a - b) <= eps;
  if (!near(altAt(OUT, 1), 5, 0.2)) throw new Error('Short54Fall: "after one second, five meters up"');
  if (!near(altAt(OUT, FLIP), 340, 5)) throw new Error(`Short54Fall: "340 meters" (sim ${altAt(OUT, FLIP).toFixed(1)})`);
  if (!near(kmh(velAt(OUT, FLIP)), 180, 5)) throw new Error('Short54Fall: "180 kilometers an hour"');
  if (Math.round(PEAK.t - FLIP) !== 4) throw new Error('Short54Fall: "four more seconds" of coasting');
  if (!near(PEAK.y, 430, 5)) throw new Error(`Short54Fall: "Peak: 430 meters" (sim ${PEAK.y.toFixed(1)})`);
  if (!(PEAK.y > ESB.roof && PEAK.y < ESB.tip)) throw new Error('Short54Fall: peak must clear the roof');
  if (Math.round(OUT.landed - PEAK.t) !== 12) throw new Error('Short54Fall: "a twelve second fall"');
  if (!near(kmh(-OUT.landV), 190, 6)) throw new Error('Short54Fall: "about 190 kilometers an hour"');
  if (!near(kmh(IN.hiV), 15, 0.5)) throw new Error('Short54Fall: "hit the ceiling at fifteen"');
  if (!(LANDED_IN > FLIP && LANDED_IN < 11)) throw new Error('Short54Fall: indoor you must be back on the floor by the loop');
  if (!(QUIZ_IN > F(VO[4].end) && QUIZ_OUT < F(VO[5].start))) throw new Error('Short54Fall: the quiz must sit in the silence');
  if (!(SNAP < UNDER)) throw new Error('Short54Fall: the hidden reset must happen inside the house');
  const last = VO[VO.length - 1];
  if (last.end + 0.8 > END / 30 - 0.4) throw new Error('Short54Fall: the last caption must clear before the loop');
}

const pulse = (f: number, at: number, len = 22) => Math.sin(Math.PI * prog(f, at - 2, at + len));
const span = (f: number, a: number, b: number) => EASE_OUT(prog(f, a - 2, a + 8)) * (1 - prog(f, b - 8, b));

// =============================================================================
// THE SCENE — one side view, to scale (1.5 px per metre), camera dives into the house.
// =============================================================================
const S = makeSide(1130, 1.5);
const YOU_X = 470;
const ESB_X = 790;
const HOUSE_X = 330;
const HOUSE_W = 9;
const WALL = 3.0; // floor to the top of the ceiling slab
const ROOM = 2.7;
const HOUSE_FOCUS: [number, number] = [HOUSE_X, S.yOf(2.3)];
const MC: [number, number] = [540, 800];
const ZOOM = 52;

const camera = (zt: number, punch: number) => {
  const z = Math.pow(ZOOM, zt);
  const w = (1 - 1 / z) / (1 - 1 / ZOOM);
  const P: [number, number] = [mix(MC[0], HOUSE_FOCUS[0], w), mix(MC[1], HOUSE_FOCUS[1], w)];
  const s = z * punch;
  return {
    z,
    transform: `translate(${MC[0]} ${MC[1]}) scale(${s}) translate(${-P[0]} ${-P[1]})`,
    at: ([x, y]: [number, number]): [number, number] => [MC[0] + s * (x - P[0]), MC[1] + s * (y - P[1])],
  };
};

const rateLabel = (r: number) => (Math.abs(r) < 0.01 ? 'PAUSED' : r < 0 ? 'REWIND' : `${r.toFixed(1)}× SPEED`);

export default function Short54Fall() {
  const f = useCurrentFrame();

  const zt = EASE_INOUT(prog(f, INDOORS, INDOORS + ZOOM_LEN)) * (1 - EASE_INOUT(prog(f, UNDER, UNDER + ZOOM_LEN)));
  const punch = f < GROW ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, GROW, END - 1)));
  const cam = camera(zt, punch);
  const inside = zt > 0.5;

  // outdoor you
  const tOut = clockAt(OUT_KEYS, f);
  const yOut = altAt(OUT, tOut);
  const vOut = velAt(OUT, tOut);
  const trailTop = maxUpTo(OUT, tOut);
  // indoor you
  const tIn = clockAt(IN_KEYS, f);
  const yIn = altAt(IN, tIn);
  const vIn = velAt(IN, tIn);

  const reversed = (f >= FALLING && f < BACK) || (f >= YOUD && tIn > 0 && tIn < FLIP);
  const flipT = reversed ? 1 : 0;
  const rate = inside ? clockRate(IN_KEYS, f) : clockRate(OUT_KEYS, f);
  const showRate = f >= REW && f < UNDER;
  const t = inside ? tIn : tOut;
  const alt = inside ? yIn : yOut;
  const v = inside ? vIn : vOut;
  const impactO = f >= IMPACT && f < SNAP ? 1 - prog(f, IMPACT + 20, SNAP) : 0;
  const ring = prog(f, IMPACT, IMPACT + 24);

  const quizDim = span(f, QUIZ_IN, QUIZ_OUT);
  const titleO = f < TITLE_BACK ? 1 - prog(f, REW - 6, REW + 2) : EASE_OUT(prog(f, TITLE_BACK, TITLE_BACK + 24));
  const marksO = f < INDOORS ? 1 : 1 - prog(f, INDOORS, INDOORS + 10);

  const [yx, yy] = cam.at([YOU_X, S.yOf(yOut)]);
  const [rx, ry] = cam.at([ESB_X - 60, S.yOf(ESB.roof)]);
  const [cx, cy] = cam.at([HOUSE_X, S.yOf(ROOM)]);
  const youSize = 72; // the outdoor you is a marker, NOT to scale (a 1.8 m person is 3 px here)

  return (
    <AbsoluteFill style={{ background: '#07090f' }}>
      <ShortsBackdrop base="#07090f" glow="#121a2a" />

      <AbsoluteFill style={{ opacity: 1 - 0.45 * quizDim }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <GravityField frame={f} dir={reversed ? -1 : 1} o={(0.5 + 0.5 * flipT) * (1 - zt)} xs={[200, 620, 960]} top={380} bottom={1110} color={reversed ? PINK : INDIGO} />

          <g transform={cam.transform}>
            {/* ground */}
            <rect x={-2000} y={S.ground} width={5000} height={2000} fill="#141b27" />
            <line x1={-2000} x2={3000} y1={S.ground} y2={S.ground} stroke="#3a4a64" strokeWidth={2} vectorEffect="non-scaling-stroke" />

            <AltitudeScale s={S} x={70} max={450} o={1 - zt} />
            <EmpireState s={S} cx={ESB_X} />
            {/* the roof line the peak is measured against */}
            <line
              x1={YOU_X - 80}
              x2={ESB_X + 50}
              y1={S.yOf(ESB.roof)}
              y2={S.yOf(ESB.roof)}
              stroke={ACCENT}
              strokeWidth={2 + 2 * pulse(f, ROOF, 30)}
              strokeDasharray="10 10"
              opacity={0.55 + 0.45 * pulse(f, ROOF, 30)}
              vectorEffect="non-scaling-stroke"
            />

            {/* the house — to scale, a speck until the camera dives in */}
            <g>
              <rect x={HOUSE_X - HOUSE_W / 2 * S.pxm} y={S.yOf(WALL)} width={HOUSE_W * S.pxm} height={WALL * S.pxm} fill="#0e131c" stroke="#5b6f8f" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              <rect x={HOUSE_X - HOUSE_W / 2 * S.pxm} y={S.yOf(WALL)} width={HOUSE_W * S.pxm} height={(WALL - ROOM) * S.pxm} fill="#5b6f8f" />
              <polygon
                points={`${HOUSE_X - (HOUSE_W / 2 + 0.6) * S.pxm},${S.yOf(WALL)} ${HOUSE_X},${S.yOf(WALL + 2.2)} ${HOUSE_X + (HOUSE_W / 2 + 0.6) * S.pxm},${S.yOf(WALL)}`}
                fill="#2a3547"
                stroke="#5b6f8f"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              <Person x={HOUSE_X} yFeet={S.yOf(yIn)} h={PERSON_H * S.pxm} color={TEAL} />
            </g>

            {/* the trail and the moments the narrator names */}
            <line x1={YOU_X} x2={YOU_X} y1={S.ground} y2={S.yOf(trailTop)} stroke={ACCENT} strokeWidth={3} strokeDasharray="8 10" opacity={0.7 * (1 - zt)} vectorEffect="non-scaling-stroke" />
            {impactO > 0.01 ? (
              <ellipse cx={YOU_X} cy={S.ground} rx={20 + 90 * ring} ry={(20 + 90 * ring) * 0.22} fill="none" stroke={PINK} strokeWidth={3} opacity={impactO * (1 - ring * 0.7)} vectorEffect="non-scaling-stroke" />
            ) : null}
          </g>
        </svg>

        {/* the outdoor you: a marker, so it stays readable at 1.5 px per metre */}
        {zt < 0.98 ? (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 1 - zt }}>
            <Person x={yx} yFeet={yy} h={youSize} color={ACCENT} glow />
          </svg>
        ) : null}
        <Tag x={yx + 130} y={yy - youSize / 2} text={`YOU · ${Math.round(yOut)} m`} color={ACCENT} o={(1 - zt) * (1 - impactO)} />
        <Tag x={rx + 50} y={ry - 30} text={`ROOF ${ESB.roof} m`} color={ACCENT} o={(1 - zt) * (0.55 + 0.45 * pulse(f, ROOF, 30))} />
        <Tag x={cx + 250} y={cy + 40} text={`CEILING · ${kmh(IN.hiV).toFixed(0)} KM/H`} color={TEAL} o={span(f, CEIL + 6, UNDER)} />
        <Tag x={YOU_X + 120} y={S.ground - 40} text={`${Math.round(kmh(-OUT.landV))} KM/H`} color={PINK} o={impactO} />
        <Tag x={YOU_X - 150} y={S.yOf(altAt(OUT, 1)) - 30} text="1 s · 4.9 m" color="#e9ecf5" o={marksO * span(f, FIVE, THEN)} />
        <Tag x={YOU_X - 150} y={S.yOf(altAt(OUT, FLIP))} text={`10 s · ${Math.round(altAt(OUT, FLIP))} m`} color="#e9ecf5" o={marksO * span(f, M340, INDOORS)} />
      </AbsoluteFill>

      {/* the instrument: the sim clock and what it reads off the motion */}
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
        }}
      >
        <div style={{ position: 'absolute', left: 20, top: 22, display: 'flex' }}>
          <Readout w={300} label="CLOCK" value={`${t.toFixed(1)} s`} />
          <Readout w={300} label={inside ? 'OFF THE FLOOR' : 'ALTITUDE'} value={inside ? `${alt.toFixed(2)} m` : `${Math.round(alt)} m`} color={ACCENT} pop={Math.max(pulse(f, FIVE), pulse(f, M340), pulse(f, PEAKW))} />
          <Readout
            w={300}
            label="SPEED · KM/H"
            value={`${Math.abs(v) < 0.05 ? '' : v > 0 ? '↑ ' : '↓ '}${Math.round(kmh(Math.abs(v)))}`}
            color={v < -0.05 ? PINK : TEAL}
            pop={Math.max(pulse(f, KMH180), pulse(f, IMPACT))}
          />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center', gap: 18 }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 3,
              padding: '10px 22px',
              borderRadius: 999,
              color: reversed ? PINK : INDIGO,
              border: `2px solid ${reversed ? PINK : INDIGO}88`,
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            {reversed ? 'GRAVITY ↑ REVERSED' : 'GRAVITY ↓ NORMAL'}
          </div>
          {showRate ? (
            <div
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: 3,
                padding: '10px 22px',
                borderRadius: 999,
                color: 'rgba(255,255,255,0.7)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              {rateLabel(rate)}
            </div>
          ) : null}
        </div>
      </div>

      {/* chips under the kicker, landing on their words */}
      <Tag x={540} y={290} text="1 g UPWARD, FOR 10 SECONDS" color={PINK} o={span(f, UP, FIVE)} />
      <Tag x={540} y={290} text="AIR DRAG INCLUDED" color="#e9ecf5" o={span(f, FIVE + 6, M340)} />
      <Tag x={540} y={290} text="NO AIR? 490 m AT 353 KM/H" color="#e9ecf5" o={span(f, KMH180 + 10, QUIZ_IN)} />
      <Tag x={540} y={290} text={`PEAK ${Math.round(PEAK.y)} m · AT ${PEAK.t.toFixed(1)} s`} color={ACCENT} o={span(f, PEAKW + 6, THEN)} />
      <Tag x={540} y={290} text={`FALL: ${(OUT.landed - PEAK.t).toFixed(1)} s`} color={PINK} o={span(f, TWELVE, INDOORS)} />
      <Tag x={540} y={290} text={`${ROOM_GAP} m TO THE CEILING`} color={TEAL} o={span(f, YOUD, UNDER)} />

      {/* the beat, named as the narration names it */}
      <Kicker text="Falling up" color={PINK} y={170} at={FALLING} until={BACK} />
      <Kicker text="Gravity is back" color={INDIGO} y={170} at={BACK} until={QUIZ_IN} />
      <Kicker text="Still rising" color={TEAL} y={170} at={COAST} until={PEAKW} />
      <Kicker text="The peak" color={ACCENT} y={170} at={PEAKW} until={THEN} />
      <Kicker text="The fall" color={PINK} y={170} at={THEN} until={INDOORS} />
      <Kicker text="Indoors" color={TEAL} y={170} at={INDOORS} until={UNDER} />

      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard title="PEAK HEIGHT?" subtitle="gravity is back, time is frozen" durSec={(QUIZ_OUT - QUIZ_IN) / 30} y={780} />
      </Sequence>

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={64} y={150} lines={[{ text: 'What if gravity' }, { text: 'reversed for 10 seconds?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
