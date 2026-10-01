import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, prog, timeWords } from '../../lib/shorts';
import { Tally } from '../../lib/page';
import {
  Bar,
  BloodLoop,
  EASE_INOUT,
  EASE_OUT,
  Fish,
  Flask,
  GL,
  HeatWisps,
  Ocean,
  PHYS,
  Swimmer,
  WaterStream,
  bodyWeightSeconds,
  flowNeeded,
  heatLostW,
  heatMadeW,
  mix,
  o2Ratio,
  tempColor,
} from '../../lib/gill';
import { FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short48Gills',
  durationInSeconds: 40.3,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = GL.gold;
const F = (s: number) => Math.round(s * 30);
const END = F(40.3);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short48Gills: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);
const wEnd = (line: number, w: string, nth = 0) => F(word(line, w, nth).end);

// =============================================================================
// CUES — all spoken words.
// =============================================================================
const SAY = wAt(1, 'say');
const GILLS = wAt(1, 'gills');
const PROB = wAt(2, 'problem');
const AIR = wAt(2, 'air');
const THIRTY = wAt(2, 'thirty');
const TIMES = wAt(2, 'times');
const WATER = wAt(2, 'water');
const SO = wAt(3, 'so');
const STILL = wAt(3, 'still');
const PUMP = wAt(3, 'pump');
const LITERS = wAt(3, 'liters');
const BODY = wAt(4, 'body');
const SECONDS_END = wEnd(4, 'seconds');
const BUT = wAt(5, 'but');
const HEAT = wAt(5, 'heat');
const BLOOD = wAt(6, 'blood');
const LEAVE = wAt(6, 'leave');
const TEMP_END = wEnd(6, 'temperature');
const LOSE = wAt(7, 'lose');
const SIXTY = wAt(7, 'sixty');
const TIMES2 = wAt(7, 'times');
const BODY2 = wAt(7, 'body');
const WHY = wAt(8, 'why');
const G3 = wAt(9, 'gills');
const WARM = wAt(9, 'warm');
const LOOP = Math.min(END - 30, F(VO[9].end + 0.3));

// =============================================================================
// THE NUMBERS — computed by the engine, checked against what the VO says.
// =============================================================================
const RATIO = Math.round(o2Ratio()); // "about thirty times"
const FLOW = flowNeeded(); // "about fifty liters … every minute"
const BW_SEC = bodyWeightSeconds(); // "every ninety seconds"
const LOST = heatLostW(); // W
const MADE = heatMadeW(); // W
const HEAT_X = Math.round(LOST / MADE); // "over sixty times faster"

// =============================================================================
// THE STATE — one body, rewound on "Say", rebuilt problem by problem.
// =============================================================================
const REW = SAY - 6;
const hookOn = (f: number) => 1 - prog(f, REW, REW + 10);

const gillOpen = (f: number, i: number) =>
  f < GILLS ? hookOn(f) * (1 - prog(f, REW, REW + 8)) : EASE_OUT(prog(f, GILLS + 2 + i * 4, GILLS + 14 + i * 4));

// blood leaving the gills: sea-cold on the hook, back to core on the rewind, cooled on "leave … temperature"
const tOutAt = (f: number) => {
  if (f < LEAVE) return mix(PHYS.sea, PHYS.core, EASE_INOUT(prog(f, REW, REW + 18)));
  return mix(PHYS.core, PHYS.sea, EASE_INOUT(prog(f, LEAVE, TEMP_END)));
};

// liters per minute shown pumping: full on the hook, zero after the rewind, counted up on "pump"
const pumpedAt = (f: number) => {
  if (f < PUMP) return FLOW * hookOn(f);
  return FLOW * EASE_OUT(prog(f, PUMP, LITERS + 6));
};

// how hard the water visibly moves (0..1): a trickle once the gills open, the pump beyond that
const flowVis = (f: number) => Math.max(pumpedAt(f) / FLOW, 0.3 * gillOpen(f, 1));

// the stream's phase — integrated speed, normalised so the whole video runs a whole number of passes
const STREAM_D: number[] = [0];
for (let f = 1; f <= END; f++) STREAM_D.push(STREAM_D[f - 1] + 0.002 + 0.011 * flowVis(f - 1));
const STREAM_LAPS = Math.max(1, Math.round(STREAM_D[END]));
const streamPhase = (f: number) => (STREAM_D[Math.max(0, Math.min(END, f))] / STREAM_D[END]) * STREAM_LAPS;

// the school: crosses behind the swimmer on "That's why …", gone before the loop
const FISH = [
  { y: 430, s: 1.1, d: 0, tag: true },
  { y: 540, s: 0.8, d: 7, tag: false },
  { y: 1000, s: 1.0, d: 3, tag: true },
  { y: 470, s: 0.7, d: 14, tag: false },
  { y: 930, s: 0.75, d: 11, tag: false },
  { y: 620, s: 0.9, d: 20, tag: true },
];
const FISH_V = 12;
const fishX = (f: number, d: number) => 1200 - (f - (WHY - 8 + d)) * FISH_V;

// module-load assertions: the VO's claims are the picture's numbers
{
  if (RATIO < 28 || RATIO > 38) throw new Error(`Short48Gills: "about thirty times" but the ratio is ${RATIO}`);
  if (Math.abs(FLOW - 50) > 3) throw new Error(`Short48Gills: "about fifty liters" but the flow is ${FLOW.toFixed(1)}`);
  if (Math.abs(BW_SEC - 90) > 6) throw new Error(`Short48Gills: "every ninety seconds" but it is ${BW_SEC.toFixed(0)}s`);
  if (LOST / MADE <= 60 || LOST / MADE >= 70) throw new Error(`Short48Gills: "over sixty times faster" but the ratio is ${HEAT_X}`);
  if (pumpedAt(wEnd(3, 'minute')) !== FLOW) throw new Error('Short48Gills: the pump must be at full flow by "minute"');
  if (tOutAt(TEMP_END) !== PHYS.sea) throw new Error('Short48Gills: blood must leave at sea temperature by "temperature"');
  if (FISH.some((q) => fishX(LOOP, q.d) > -160)) throw new Error('Short48Gills: every fish must be off screen before the loop');
  if (gillOpen(0, 0) !== 1 || gillOpen(END - 1, 2) !== 1) throw new Error('Short48Gills: gills open on the first and last frame');
}

// =============================================================================
// THE SHOT — one swimmer, three readouts. No cuts.
// =============================================================================
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const PANEL_Y = 1100;

export default function Short48Gills() {
  const f = useCurrentFrame();
  const hk = hookOn(f);

  // punch-in: frame 0 is at 1.06 and settles; the loop grows back to 1.06 so the wrap is seamless
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP, END - 1)));
  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP + 12));

  // --- the body ------------------------------------------------------------------------------
  const tOut = tOutAt(f);
  const cool = (PHYS.core - tOut) / (PHYS.core - PHYS.sea);
  const gills = [0, 1, 2].map((i) => gillOpen(f, i));
  const bloodO = Math.max(hk, mix(0.3, 1, EASE_OUT(prog(f, HEAT - 4, HEAT + 10))));
  const beat = Math.max(0, Math.sin((2 * Math.PI * 40 * f) / END)) ** 3;
  const vis = flowVis(f);

  // --- panel 1: the flasks ----------------------------------------------------------------------
  const flaskO = EASE_OUT(prog(f, PROB, PROB + 10)) * (1 - prog(f, SO - 4, SO + 8));
  const airDots = RATIO * EASE_INOUT(prog(f, AIR, THIRTY + 10));
  const waterDot = prog(f, TIMES, TIMES + 6);
  const ratioO = EASE_OUT(prog(f, TIMES + 4, TIMES + 14));
  const airGlow = Math.sin(Math.PI * prog(f, AIR - 2, AIR + 24));
  const waterGlow = Math.sin(Math.PI * prog(f, WATER - 2, WATER + 24));

  // --- panel 2: the pump -----------------------------------------------------------------------
  const pumpO = EASE_OUT(prog(f, SO, SO + 10)) * (1 - prog(f, BUT - 4, BUT + 8));
  const needO = EASE_OUT(prog(f, STILL - 4, STILL + 8));
  const flowO = EASE_OUT(prog(f, PUMP - 4, PUMP + 6));
  const bwO = EASE_OUT(prog(f, BODY - 4, BODY + 6));
  const clock = BW_SEC * prog(f, BODY, SECONDS_END);
  const bwPop = Math.sin(Math.PI * prog(f, SECONDS_END - 4, SECONDS_END + 12));

  // --- panel 3: the heat (also the hook) -------------------------------------------------------
  const heatO = Math.max(hk, EASE_OUT(prog(f, BLOOD - 6, BLOOD + 6)));
  const lostGrow = Math.max(hk, EASE_OUT(prog(f, LOSE, SIXTY + 6)));
  const lostO = Math.max(hk, EASE_OUT(prog(f, LOSE - 6, LOSE + 4)));
  const madeO = Math.max(hk, EASE_OUT(prog(f, BODY2 - 4, BODY2 + 6)));
  const xO = Math.max(hk, EASE_OUT(prog(f, TIMES2, TIMES2 + 8)));
  const warmGlow = Math.sin(Math.PI * prog(f, WARM - 2, WARM + 26));
  const lostNow = heatLostW(tOut);

  return (
    <AbsoluteFill style={{ background: GL.deep }}>
      <Ocean phase={f / END} />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '540px 800px' }}>
        {/* the school — cold-blooded, body = sea */}
        {FISH.map((q, i) => {
          const x = fishX(f, q.d);
          if (x < -200 || x > 1250) return null;
          return <Fish key={i} x={x} y={q.y} s={q.s} color={GL.cold} tag={q.tag ? `${PHYS.sea}°C` : undefined} wag={Math.sin(f / 3 + i)} />;
        })}

        <WaterStream phase={streamPhase(f)} density={0.35 + 0.65 * vis} opacity={Math.min(1, vis * 2.5)} />
        <Swimmer gills={gills} glow={cool} />
        <BloodLoop tOut={tOut} phase={(16 * f) / END} opacity={bloodO} beat={beat} />
        <HeatWisps phase={(12 * f) / END} amount={cool * bloodO} />
      </AbsoluteFill>

      {/* PANEL 1 — a liter of each, its oxygen as dots (one dot = a liter of water's worth) */}
      <Flask x={140} y={PANEL_Y} w={320} h={300} label="1 L AIR" sub={`${PHYS.o2Air} mL O₂`} dots={RATIO} shown={airDots} color={GL.teal} tint="rgba(78,205,196,0.06)" opacity={flaskO} glow={airGlow} />
      <Flask x={600} y={PANEL_Y} w={300} h={300} label="1 L WATER" sub={`${PHYS.o2Water} mL O₂`} dots={1} shown={waterDot} color={GL.cold} tint="rgba(92,200,242,0.10)" opacity={flaskO} glow={waterGlow} />
      {flaskO * ratioO > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 470,
            width: 120,
            top: PANEL_Y + 120,
            textAlign: 'center',
            opacity: flaskO * ratioO,
            transform: `scale(${mix(0.9, 1, ratioO)})`,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 44,
            color: ACCENT,
          }}
        >
          ×{RATIO}
        </div>
      ) : null}

      {/* PANEL 2 — the pump, and what it adds up to */}
      {pumpO > 0.01 ? (
        <div style={{ position: 'absolute', inset: 0, opacity: pumpO }}>
          <Tally x={70} y={PANEL_Y} w={420} padLeft={28} label="O₂ at rest" value={`${PHYS.demand} mL/min`} color={GL.o2} opacity={needO} />
          <Tally
            x={510}
            y={PANEL_Y}
            w={410}
            padLeft={28}
            label="Water in"
            value={`${Math.round(pumpedAt(f))} L/min`}
            color={GL.cold}
            opacity={flowO}
            glow={pumpedAt(f) > FLOW - 0.5 ? 1 : 0}
          />
          <Bar
            x={70}
            y={PANEL_Y + 160}
            w={850}
            label={`Your body weight · ${PHYS.mass} kg`}
            value={mmss(clock)}
            fill={clock / BW_SEC}
            color={GL.cold}
            opacity={bwO}
            glow={bwPop}
          />
        </div>
      ) : null}

      {/* PANEL 3 — the heat budget: blood in, blood out, lost vs made */}
      {heatO > 0.01 ? (
        <div style={{ position: 'absolute', inset: 0, opacity: heatO }}>
          <Tally x={70} y={PANEL_Y} w={400} padLeft={28} label="Blood in" value={`${PHYS.core}°C`} color={GL.warm} />
          <Tally x={490} y={PANEL_Y} w={430} padLeft={28} label={`Out · sea ${PHYS.sea}°C`} value={`${Math.round(tOut)}°C`} color={tempColor(tOut)} glow={cool > 0.98 ? 1 : 0} />
          <Bar
            x={70}
            y={PANEL_Y + 150}
            w={850}
            label="Heat lost"
            value={`${(lostNow / 1000).toFixed(1)} kW`}
            fill={(lostNow / LOST) * lostGrow}
            color={GL.cold}
            opacity={lostO}
          />
          <Bar x={70} y={PANEL_Y + 230} w={850} label="Heat made" value={`${Math.round(MADE)} W`} fill={MADE / LOST} color={GL.warm} opacity={madeO} glow={warmGlow} />
          {xO > 0.01 ? (
            <div
              style={{
                position: 'absolute',
                left: 70 + 850 * (MADE / LOST) + 26,
                top: PANEL_Y + 230 + 42,
                opacity: xO * madeO,
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 1,
                color: GL.deep,
                background: ACCENT,
                borderRadius: 999,
                padding: '4px 16px',
                whiteSpace: 'nowrap',
                transform: `scale(${1 + 0.06 * warmGlow})`,
                transformOrigin: 'left center',
              }}
            >
              made {HEAT_X}× slower
            </div>
          ) : null}
        </div>
      ) : null}

      {/* the problem, named as the narration names it */}
      <Kicker text="Day one: gills" color={GL.teal} y={170} at={SAY + 2} until={PROB} />
      <Kicker text="Problem 1: oxygen" color={GL.o2} y={170} at={PROB} until={SO} />
      <Kicker text="The pump" color={GL.cold} y={170} at={SO} until={BUT} />
      <Kicker text="Problem 2: heat" color={GL.warm} y={170} at={BUT} until={WHY - 4} />
      <Kicker text="Body temp = sea temp" color={GL.cold} y={170} at={WHY - 4} until={G3} />
      <Kicker text="Staying warm" color={ACCENT} y={170} at={G3} until={LOOP} />

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={84} y={150} lines={[{ text: 'Breathe' }, { text: 'underwater?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
