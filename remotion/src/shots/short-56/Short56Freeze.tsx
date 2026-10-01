import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, EASE_INOUT, EASE_OUT, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog, timeWords } from '../../lib/shorts';
import { Globe, LoopLabel, Ray, SunRays, View, Volcano, hexMix, iceFraction, oceanAbsorbs, surfaceAt } from '../../lib/globe';
import { Readout, Starfield, SunGauge, Tag } from '../../lib/suns';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short56Freeze',
  durationInSeconds: 47.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = '#9fd8ff';
const F = (s: number) => Math.round(s * 30);
const END = F(47.0);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short56Freeze: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);

// =============================================================================
// CUES — all spoken words (global frames; the only Sequence is the PauseCard).
// =============================================================================
const REW = F(VO[0].end) + 2; // the hook's ice rewinds to Earth today
const SEVENTY = wAt(1, 'seventyone');
const NINETY = wAt(2, 'ninety');
const FREEZE = wAt(3, 'freeze');
const BOUNCES = wAt(4, 'bounces');
const QUIZ_IN = F(VO[5].end) + 4;
const QUIZ_OUT = F(VO[6].start) - 3;
const LESS = wAt(6, 'less');
const COLDER = wAt(6, 'colder');
const MORE = wAt(7, 'more');
const FIFTEEN = wAt(8, 'fifteen');
const FIFTY = wAt(8, 'fifty');
const REALLY = wAt(9, 'really');
const SEVEN = wAt(10, 'seven');
const SNOWBALL = wAt(10, 'snowball');
const VOLCANIC = wAt(11, 'volcanic');
const THAW = wAt(11, 'thaw');
const FROZE2 = wAt(12, 'froze');
const STAY = wAt(12, 'stay');
const GROW = STAY;
const TITLE_BACK = STAY + 16;

// =============================================================================
// THE STATE — ice edge e (deg), land snow 0..1, temperature (C), all keyframed on words
// =============================================================================
const E_TODAY = 70; // today's sea-ice edge: 1 - sin 70 = 6% of the ocean (NSIDC: ~7% on average)
const E_THAWED = 62;
const T_TODAY = 15;
const T_SNOWBALL = -50;

const REW_LEN = 30;
const FREEZE_LEN = 44;
const edgeAt = (f: number) => {
  if (f < FREEZE) return mix(0, E_TODAY, EASE_INOUT(prog(f, REW, REW + REW_LEN)));
  if (f < THAW - 20) return mix(E_TODAY, 0, EASE_INOUT(prog(f, FREEZE, FREEZE + FREEZE_LEN)));
  if (f < FROZE2) return mix(0, E_THAWED, EASE_INOUT(prog(f, THAW - 20, THAW + 30)));
  return mix(E_THAWED, 0, EASE_INOUT(prog(f, FROZE2, STAY + 6)));
};
const snowAt = (f: number) => {
  if (f < COLDER) return 1 - EASE_INOUT(prog(f, REW, REW + REW_LEN));
  if (f < THAW - 20) return EASE_INOUT(prog(f, COLDER, FIFTY + 6));
  if (f < FROZE2) return 1 - EASE_INOUT(prog(f, THAW - 20, THAW + 30));
  return EASE_INOUT(prog(f, FROZE2, STAY + 6));
};
const tempAt = (f: number) => {
  if (f < COLDER) return mix(T_SNOWBALL, T_TODAY, EASE_INOUT(prog(f, REW, REW + REW_LEN)));
  if (f < THAW - 20) return mix(T_TODAY, T_SNOWBALL, EASE_INOUT(prog(f, COLDER, FIFTY + 6)));
  if (f < FROZE2) return mix(T_SNOWBALL, T_TODAY, EASE_INOUT(prog(f, THAW - 20, THAW + 30)));
  return mix(T_TODAY, T_SNOWBALL, EASE_INOUT(prog(f, FROZE2, STAY + 6)));
};

// the claims on the voice track, checked against the formulas that draw the picture
{
  const near = (a: number, b: number, eps: number) => Math.abs(a - b) < eps;
  if (!near(oceanAbsorbs(90), 0.94, 1e-9)) throw new Error('Short56Freeze: open ocean must absorb 94% ("over ninety percent")');
  if (!(oceanAbsorbs(0) < 0.5)) throw new Error('Short56Freeze: frozen ocean must bounce "most of that light"');
  if (!near(iceFraction(E_TODAY), 0.06, 0.01)) throw new Error("Short56Freeze: today's sea ice ~6-7% of the ocean");
  if (FREEZE + FREEZE_LEN > BOUNCES + 12) throw new Error('Short56Freeze: the ocean must be frozen by "bounces"');
  if (!(QUIZ_OUT > QUIZ_IN + 60)) throw new Error('Short56Freeze: the quiz needs ~2.5s');
  if (edgeAt(0) !== 0 || edgeAt(END) !== 0 || snowAt(END) !== 1 || tempAt(END) !== T_SNOWBALL) throw new Error('Short56Freeze: last frame must equal frame 0');
  const last = VO[VO.length - 1];
  if (last.end + 0.8 > END / 30 - 0.2) throw new Error('Short56Freeze: the last caption must clear before the loop');
}

const pulse = (f: number, at: number, len = 22) => Math.sin(Math.PI * prog(f, at - 2, at + len));
const span = (f: number, a: number, b: number) => EASE_OUT(prog(f, a - 2, a + 8)) * (1 - prog(f, b - 8, b));

// =============================================================================
// THE SHOT — one planet, one turn per loop. No cuts.
// =============================================================================
const CX = 540;
const CY = 800;
const R = 300;
const LAT0 = 18;
const LON0 = -30; // Atlantic first, then Africa/Europe, Asia, Pacific, Americas

const RAYS: Ray[] = [
  { x: -0.55, y: 0.35, phase: 0 },
  { x: -0.1, y: 0.62, phase: 0.43 },
  { x: 0.25, y: 0.15, phase: 0.14 },
  { x: -0.4, y: -0.25, phase: 0.71 },
  { x: 0.1, y: -0.45, phase: 0.29 },
  { x: 0.5, y: -0.1, phase: 0.57 },
  { x: -0.72, y: -0.05, phase: 0.86 },
];
const RAY_PERIOD = END / 12;

const VOLCANOES: [number, number][] = [
  [-19, 64], // Iceland
  [37, -3], // East African Rift
  [110, -7], // Java
  [160, 55], // Kamchatka
  [-155, 19], // Hawaii
  [-70, -22], // Andes
  [-122, 46], // Cascades
];

const tempColor = (t: number) => hexMix(hexMix('#cfeaff', '#4db8a8', prog(t, -50, 0)), '#f5d76e', prog(t, 0, 15));

export default function Short56Freeze() {
  const f = useCurrentFrame();
  const e = edgeAt(f);
  const snow = snowAt(f);
  const temp = tempAt(f);
  const v: View = { lon0: LON0 + (360 * f) / END, lat0: LAT0, cx: CX, cy: CY, R };

  const ice = iceFraction(e);
  const absorbs = oceanAbsorbs(e);
  const tc = tempColor(temp);

  const scale = f < GROW ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, GROW, END - 1)));
  const titleO = f < GROW ? 1 - prog(f, REW - 8, REW + 2) : EASE_OUT(prog(f, TITLE_BACK, TITLE_BACK + 20));

  // the ice-albedo loop wraps the planet while the narration walks round it
  const loopO = span(f, LESS, REALLY + 10);
  const loopTurn = (f - LESS) * 2.2;
  const volcO = span(f, VOLCANIC, FROZE2 + 6);

  return (
    <AbsoluteFill style={{ background: '#070a12' }}>
      <ShortsBackdrop base="#070a12" glow="#122036" />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `${CX}px ${CY}px` }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Starfield frame={f} loop={END} />
          <Globe v={v} e={e} snow={snow} oceanGlow={pulse(f, SEVENTY, 40)} />
          {VOLCANOES.map(([lon, lat], i) => (
            <Volcano key={i} v={v} lon={lon} lat={lat} frame={f} o={volcO} />
          ))}
          <SunRays
            v={v}
            rays={RAYS}
            frame={f}
            period={RAY_PERIOD}
            surface={(lon, lat, at) => surfaceAt(lon, lat, edgeAt(at), snowAt(at))}
            o={1 - 0.7 * span(f, QUIZ_IN, QUIZ_OUT)}
          />

          {/* ice-albedo feedback: a ring of arrows running round the planet */}
          {loopO > 0.01 ? (
            <g opacity={loopO}>
              <circle
                cx={CX}
                cy={CY}
                r={R + 46}
                fill="none"
                stroke={ACCENT}
                strokeWidth={5}
                strokeDasharray="46 30"
                strokeDashoffset={-loopTurn}
                strokeLinecap="round"
                opacity={0.8}
              />
              {[0, 1, 2].map((k) => {
                const a = (loopTurn / (R + 46)) + (k * 2 * Math.PI) / 3 - Math.PI / 2;
                const x = CX + Math.cos(a) * (R + 46);
                const y = CY + Math.sin(a) * (R + 46);
                const deg = (a * 180) / Math.PI + 90;
                return <polygon key={k} points="-16,-12 16,0 -16,12" fill={ACCENT} transform={`translate(${x} ${y}) rotate(${deg - 90})`} />;
              })}
              <LoopLabel x={CX} y={CY - R - 46} text="LESS SUN ABSORBED" color="#f5d76e" o={span(f, LESS, REALLY + 10)} pop={pulse(f, LESS)} />
              <LoopLabel x={CX + 250} y={CY + R + 10} text="COLDER" color="#8fc9ff" o={span(f, COLDER, REALLY + 10)} pop={pulse(f, COLDER)} />
              <LoopLabel x={CX - 250} y={CY + R + 10} text="MORE ICE" color="#ffffff" o={span(f, MORE, REALLY + 10)} pop={pulse(f, MORE)} />
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>

      {/* the instrument: every number is the ice edge read back */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 1180,
          width: 940,
          height: 250,
          borderRadius: 24,
          background: 'rgba(14,18,28,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ position: 'absolute', left: 20, top: 16, display: 'flex' }}>
          <Readout w={300} label="SEA ICE" value={`${Math.round(ice * 100)}%`} color="#e6f0f8" pop={pulse(f, FREEZE + FREEZE_LEN - 6, 26)} />
          <Readout
            w={300}
            label="OCEAN ABSORBS"
            value={`${Math.round(absorbs * 100)}%`}
            color={hexMix('#ffffff', '#ffb14a', prog(absorbs, 0.2, 0.94))}
            pop={Math.max(pulse(f, NINETY), pulse(f, BOUNCES + 6))}
          />
          <Readout w={300} label="AVG TEMP" value={`${Math.round(temp)}°C`} color={tc} pop={Math.max(pulse(f, FIFTEEN), pulse(f, FIFTY))} />
        </div>
        <SunGauge
          x={40}
          y={126}
          w={860}
          value={temp + 60}
          max={80}
          color={tc}
          marks={[
            { v: 10, label: 'SNOWBALL −50°', color: '#cfeaff', side: 'below', o: 1, pop: pulse(f, FIFTY) },
            { v: 60, label: 'FREEZING 0°', color: '#8fc9ff', side: 'above', o: 1 },
            { v: 75, label: 'TODAY 15°', color: '#f5d76e', side: 'below', o: 1, pop: pulse(f, FIFTEEN) },
          ]}
        />
      </div>

      {/* chips under the kicker, landing on their words */}
      <Tag x={540} y={300} text="71% OF THE SURFACE IS OCEAN" color="#4aa3ff" o={span(f, SEVENTY, NINETY)} />
      <Tag x={540} y={300} text="DARK WATER KEEPS 94% OF SUNLIGHT" color="#ffb14a" o={span(f, NINETY, FREEZE)} />
      <Tag x={540} y={300} text="SNOW-COVERED ICE REFLECTS ~80%" color="#ffffff" o={span(f, BOUNCES, QUIZ_IN)} />
      <Tag x={540} y={300} text="≈ 700 MILLION YEARS AGO" color="#b39ddb" o={span(f, SEVEN, VOLCANIC)} />
      <Tag x={540} y={300} text="VOLCANIC CO₂ · MILLIONS OF YEARS" color="#ff8a5c" o={span(f, VOLCANIC, FROZE2)} />

      <Stamp text="SNOWBALL EARTH" at={SNOWBALL} until={VOLCANIC} color="#cfeaff" x={540} y={430} size={58} />

      {/* the beat, named as the narration names it */}
      <Kicker text="Earth today" color="#4aa3ff" y={170} at={REW + 4} until={FREEZE} />
      <Kicker text="Flash freeze" color="#cfeaff" y={170} at={FREEZE} until={QUIZ_IN} />
      <Kicker text="Ice-albedo feedback" color={ACCENT} y={170} at={LESS} until={REALLY} />
      <Kicker text="It already happened" color="#b39ddb" y={170} at={REALLY} until={VOLCANIC} />
      <Kicker text="The thaw" color="#ff8a5c" y={170} at={VOLCANIC} until={FROZE2} />
      <Kicker text="Locked in ice" color="#cfeaff" y={170} at={FROZE2} until={TITLE_BACK} />

      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard title="WOULD IT MELT?" subtitle="the Sun is still shining" durSec={(QUIZ_OUT - QUIZ_IN) / 30} accent={ACCENT} y={330} />
      </Sequence>

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={84} y={140} lines={[{ text: "What if Earth's" }, { text: 'oceans froze?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
