import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import {
  Bolt,
  Chip,
  Cloud,
  EASE_INOUT,
  EASE_OUT,
  PHYS,
  Person,
  Readout,
  Rings,
  Span,
  SpeedLadder,
  Tag,
  Volcano,
  WV,
  boltAt,
  delay,
  mix,
} from '../../lib/wave';
import { FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short50Thunder',
  durationInSeconds: 48.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = WV.light;
const F = (s: number) => Math.round(s * 30);
const END = F(48.0);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short50Thunder: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);
const wEnd = (line: number, w: string, nth = 0) => F(word(line, w, nth).end);

// =============================================================================
// CUES — all spoken words.
// =============================================================================
const RIGHT = wAt(1, 'right');
const STRIKES = wAt(1, 'strikes');
const LIGHT = wAt(3, 'light');
const NINE = wAt(3, 'nine');
const NOW = wAt(4, 'now');
const SPEED = wAt(4, 'speed');
const IT_END = wEnd(4, 'it');
const GAP = wAt(5, 'gap');
const MILLIONTHS = wAt(5, 'millionths');
const FLASH = wAt(6, 'flash');
const COUNTING = wAt(7, 'counting');
const STORM_END = wEnd(7, 'storm');
const KRAK = wAt(8, 'krakatoas');
const BLAST = wAt(8, 'blast');
const AWAY_END = wEnd(8, 'away');
const WOULD = wAt(9, 'would');
const ARRIVED = wAt(9, 'arrived');
const SIXTEEN = wAt(9, 'sixteen');
const BUT = wAt(10, 'but');
const TOPS = wAt(11, 'tops');
const THIRTY = wAt(11, 'thirtysix');
const SECOND_END = wEnd(11, 'second');
const SO = wAt(12, 'so');
const THUNDER = wAt(12, 'thunder');

// =============================================================================
// THE NUMBERS — computed, checked against what the VO says.
// =============================================================================
const STORM_M = 1_000;
const KRAK_M = 4_800_000;
const AIR_S = delay(STORM_M, PHYS.air); // "about three seconds"
const CRAWL = Math.round(AIR_S * 30); // the thunder crawls in REAL time
const LIGHT_S = delay(STORM_M, PHYS.c); // "three millionths of a second"
const KRAK_AIR_S = delay(KRAK_M, PHYS.air); // "nearly four hours"
const KRAK_LIGHT_S = delay(KRAK_M, PHYS.c); // "sixteen milliseconds"
const RATIO = Math.round(PHYS.c / PHYS.air / 1000) * 1000; // "nearly nine hundred thousand"

// =============================================================================
// THE STRIKES — the whole video is seven of them on one panel.
// =============================================================================
type Strike = { at: number; fast: boolean; krak: boolean; dur: number };
const S: Strike[] = [
  { at: -400, fast: false, krak: false, dur: CRAWL }, // the hook: long since arrived
  { at: STRIKES, fast: false, krak: false, dur: CRAWL },
  { at: GAP, fast: true, krak: false, dur: 0 },
  { at: FLASH, fast: true, krak: false, dur: 0 },
  { at: BLAST, fast: false, krak: true, dur: AWAY_END - BLAST }, // time-lapse: 3.9 h in one sentence
  { at: ARRIVED, fast: true, krak: true, dur: 0 },
  { at: THUNDER, fast: false, krak: false, dur: CRAWL }, // the loop
];
const strikeAt = (f: number) => S.filter((s) => s.at <= f).pop() ?? S[0];

{
  if (AIR_S < 2.8 || AIR_S > 3.1) throw new Error(`Short50Thunder: "about three seconds" but ${AIR_S}`);
  if (LIGHT_S < 3e-6 || LIGHT_S > 3.5e-6) throw new Error(`Short50Thunder: "three millionths" but ${LIGHT_S}`);
  if (KRAK_AIR_S / 3600 < 3.6 || KRAK_AIR_S / 3600 > 4) throw new Error(`Short50Thunder: "nearly four hours" but ${KRAK_AIR_S / 3600} h`);
  if (Math.round(KRAK_LIGHT_S * 1000) !== 16) throw new Error(`Short50Thunder: "sixteen milliseconds" but ${KRAK_LIGHT_S}`);
  if (RATIO < 850_000 || RATIO >= 900_000) throw new Error(`Short50Thunder: "nearly nine hundred thousand" but ${RATIO}`);
  if (THUNDER + CRAWL + 22 > END - 1) throw new Error('Short50Thunder: the loop thunder must land and settle before the last frame');
  if (STRIKES + CRAWL > NOW) throw new Error('Short50Thunder: the setup thunder must land before "Now"');
}

const fmtSpeed = (v: number) => (v < 1000 ? `${Math.round(v)} m/s` : `${Math.round(v / 1000).toLocaleString('en-US')} km/s`);
const fmtHours = (s: number) => {
  const m = Math.floor(s / 60);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
};

// the SOUND chip's speed: morphs on a log scale when the world flips
const logMix = (a: number, b: number, t: number) => 10 ** mix(Math.log10(a), Math.log10(b), t);
const soundAt = (f: number) => {
  if (f < KRAK) return logMix(PHYS.air, PHYS.c, EASE_INOUT(prog(f, SPEED, IT_END)));
  if (f < WOULD) return logMix(PHYS.c, PHYS.air, EASE_INOUT(prog(f, KRAK, KRAK + 10)));
  return logMix(PHYS.air, PHYS.c, EASE_INOUT(prog(f, WOULD, WOULD + 10)));
};

// =============================================================================
// THE SHOT — one panel, one listener. No cuts.
// =============================================================================
const BOX = { x: 60, y: 420, w: 960, h: 640 };
const GROUND = 540; // local
const SRC = 170; // local x of the strike
const LIS = 770; // local x of the listener
const D = LIS - SRC;
const PERSON = 'rgba(230,237,243,0.9)';

export default function Short50Thunder() {
  const f = useCurrentFrame();
  const s = strikeAt(f);
  const k = f - s.at; // frames since this strike
  const arrived = s.dur <= 0 ? k >= 0 : k >= s.dur;
  const travel = s.dur <= 0 ? 1 : Math.min(1, k / s.dur);

  // --- which world the panel shows ---------------------------------------------------------------
  const krak = f < KRAK ? 0 : f < SO ? EASE_OUT(prog(f, KRAK - 4, KRAK + 10)) : 1 - EASE_OUT(prog(f, SO - 2, SO + 10));
  const ladO = EASE_OUT(prog(f, BUT - 2, BUT + 10)) * (1 - EASE_OUT(prog(f, SO - 4, SO + 8)));
  const sceneO = 1 - ladO;

  // hook -> setup: the arrived thunder rewinds away on "Right"
  const rew = s === S[0] ? 1 - prog(f, RIGHT, RIGHT + 10) : 1;
  // between the ladder and the loop's strike there is no sound in the air
  const quiet = f >= BUT && f < THUNDER ? 0 : 1;
  const ringsO = rew * quiet;

  const bolt = s.krak ? 0 : boltAt(k);
  const flashO = boltAt(k) * (s.krak ? 0.2 : 0.28);
  const plume = f < BLAST ? 0 : EASE_OUT(prog(f, BLAST, BLAST + 40)) * (1 - prog(f, SO - 2, SO + 10));
  const soundColor = s.fast ? WV.fast : WV.air;

  // the listener: FLASH arrives at once, BOOM when the front lands
  const flashTag = k < 24 ? EASE_OUT(prog(k, 0, 4)) : 1 - prog(k, 24, 34);
  const kArr = k - Math.max(0, s.dur);
  const boomPop = arrived ? Math.sin(Math.PI * prog(kArr, 0, 20)) : 0;
  const boomO = (arrived ? EASE_OUT(prog(kArr, 0, 4)) : 0) * ringsO;

  // --- the readout --------------------------------------------------------------------------------
  let value: string;
  let rColor = soundColor;
  if (s === S[0] && f >= RIGHT) value = `${(AIR_S * (1 - EASE_INOUT(prog(f, RIGHT, RIGHT + 12)))).toFixed(2)} s`;
  else if (f >= SO && f < THUNDER) {
    value = '0.00 s';
    rColor = WV.air;
  } else if (s.krak) value = s.fast ? `${KRAK_LIGHT_S.toFixed(3)} s` : fmtHours(KRAK_AIR_S * travel);
  else value = s.fast ? `${LIGHT_S.toFixed(7)} s` : `${(AIR_S * travel).toFixed(2)} s`;
  const rLabel = f < SO && krak > 0.5 ? 'BLAST → HEARD' : 'FLASH → BOOM';
  const rPop = Math.max(boomPop * (s.fast ? 0 : 1), Math.sin(Math.PI * prog(f, MILLIONTHS - 2, MILLIONTHS + 22)), Math.sin(Math.PI * prog(f, SIXTEEN - 2, SIXTEEN + 22)));
  const timeLapse = s.krak && !s.fast && !arrived ? 'TIME-LAPSE' : undefined;

  // --- chips --------------------------------------------------------------------------------------
  const chipsO = EASE_OUT(prog(f, LIGHT - 2, LIGHT + 8)) * (1 - prog(f, BUT - 6, BUT + 2));
  const snd = soundAt(f);
  const sndFast = snd > 1e6;
  const sndPop = Math.max(Math.sin(Math.PI * prog(f, IT_END - 4, IT_END + 18)), Math.sin(Math.PI * prog(f, WOULD + 6, WOULD + 26)));
  const ratioO = EASE_OUT(prog(f, NINE - 2, NINE + 8)) * (1 - prog(f, NOW - 6, NOW + 2));
  const ruleO = EASE_OUT(prog(f, COUNTING - 2, COUNTING + 8)) * (1 - prog(f, KRAK - 8, KRAK));
  const ruleStrike = EASE_OUT(prog(f, STORM_END - 18, STORM_END));

  // --- ladder -------------------------------------------------------------------------------------
  const level = logMix(PHYS.air, PHYS.cap, EASE_INOUT(prog(f, TOPS, THIRTY)));
  const wall = EASE_OUT(prog(f, THIRTY - 4, THIRTY + 10));
  const wallPop = Math.sin(Math.PI * prog(f, THIRTY - 2, THIRTY + 20));
  const gap = EASE_OUT(prog(f, SECOND_END - 10, SECOND_END + 8));
  const steelO = EASE_OUT(prog(f, TOPS + 6, TOPS + 14));

  // punch-in: frame 0 is at 1.06 and settles; the loop grows back to 1.06 so the wrap is seamless
  const scale = f < THUNDER ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, THUNDER, END - 1)));
  const titleO = f < THUNDER ? 1 - prog(f, RIGHT - 4, RIGHT + 6) : EASE_OUT(prog(f, THUNDER + 6, THUNDER + 24));

  const headY = BOX.y + GROUND - 118;
  const lisX = BOX.x + LIS;

  return (
    <AbsoluteFill style={{ background: WV.bg }}>
      <ShortsBackdrop base={WV.bg} glow="#172030" />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '540px 760px' }}>
        {/* THE PANEL */}
        <div
          style={{
            position: 'absolute',
            left: BOX.x,
            top: BOX.y,
            width: BOX.w,
            height: BOX.h,
            borderRadius: 24,
            overflow: 'hidden',
            background: `linear-gradient(180deg, ${WV.skyHi}, ${WV.sky})`,
            border: `1px solid ${WV.panelBorder}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, opacity: sceneO }}>
            <svg width={BOX.w} height={BOX.h} style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <clipPath id="sky50">
                  <rect x={0} y={0} width={BOX.w} height={GROUND} />
                </clipPath>
              </defs>
              <Rings cx={SRC} cy={GROUND} r={D * travel} color={soundColor} opacity={ringsO} />
              <rect x={0} y={GROUND} width={BOX.w} height={BOX.h - GROUND} fill={WV.ground} />
              <rect x={0} y={GROUND} width={BOX.w} height={BOX.h - GROUND} fill={WV.sea} opacity={krak} />
              <ellipse cx={LIS} cy={GROUND + 4} rx={130} ry={20} fill={WV.sand} opacity={krak} />
              <Cloud x={SRC} y={110} opacity={1 - krak} lit={bolt} />
              <Bolt x={SRC} y0={150} y1={GROUND} b={bolt * (1 - krak)} />
              <Volcano x={SRC} groundY={GROUND} opacity={krak} plume={plume} />
              {/* the listener hears: a halo on arrival */}
              <circle cx={LIS} cy={GROUND - 118} r={34 + 26 * boomPop} fill="none" stroke={soundColor} strokeWidth={4} opacity={boomO * (0.35 + 0.65 * boomPop)} />
              <Person x={LIS} groundY={GROUND} color={PERSON} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, background: '#ffffff', opacity: flashO }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: ladO, background: WV.bg }}>
            {ladO > 0.01 ? <SpeedLadder w={BOX.w} h={BOX.h} level={level} wall={wall} gap={gap} pop={wallPop} steelO={steelO} /> : null}
          </div>
        </div>

        {/* labels under the ground */}
        <div style={{ opacity: sceneO }}>
          <Span x0={BOX.x + SRC} x1={BOX.x + LIS} y={BOX.y + GROUND + 18} label="1 KM" opacity={1 - krak} />
          <Span x0={BOX.x + SRC} x1={BOX.x + LIS} y={BOX.y + GROUND + 18} label="4,800 KM" opacity={krak} />
          {(
            [
              [BOX.x + SRC, 'LIGHTNING', 1 - krak],
              [BOX.x + SRC, 'KRAKATOA', krak],
              [lisX, 'YOU', 1 - krak],
              [lisX, 'RODRIGUES ISLAND', krak],
            ] as const
          ).map(([x, t, o]) =>
            o > 0.01 ? (
              <div key={t} style={{ position: 'absolute', left: x - 200, width: 400, top: BOX.y + GROUND + 64, textAlign: 'center', opacity: o, fontFamily: FONT_MONO, fontWeight: 500, fontSize: 24, letterSpacing: 3, color: WV.dim }}>
                {t}
              </div>
            ) : null,
          )}

          {/* the listener's senses */}
          <Tag x={lisX} y={headY - 136} text="FLASH" color={WV.light} opacity={flashTag * ringsO} />
          <Tag x={lisX} y={headY - 196} text="BOOM" color={soundColor} opacity={boomO} pop={boomPop} />
        </div>

        {/* chips: the two speeds */}
        <Chip anchor="right" x={84} y={450} color={WV.light} opacity={chipsO} text={`LIGHT  ${fmtSpeed(PHYS.c)}`} />
        <Chip anchor="right" x={84} y={522} color={sndFast ? WV.fast : WV.air} opacity={chipsO} pop={sndPop} text={`SOUND  ${fmtSpeed(snd)}`} />
        <Chip anchor="right" x={84} y={594} color={WV.ink} opacity={ratioO} text={`×${RATIO.toLocaleString('en-US')}`} />
        <Chip x={BOX.x + 60} y={BOX.y + 300} color={WV.ink} opacity={ruleO} strike={ruleStrike} text="COUNT: 3 s ≈ 1 km" />

        <Readout
          y={1110}
          label={rLabel}
          value={value}
          color={rColor}
          opacity={sceneO}
          pop={rPop}
          note={timeLapse}
        />
      </AbsoluteFill>

      {/* the world, named as the narration names it */}
      <Kicker text="Today: sound in air" color={WV.air} y={170} at={RIGHT + 2} until={NOW} />
      <Kicker text="Sound at light speed" color={WV.fast} y={170} at={NOW} until={KRAK} />
      <Kicker text="Krakatoa, 1883" color={WV.air} y={170} at={KRAK} until={BUT} />
      <Kicker text="The speed limit" color={ACCENT} y={170} at={BUT} until={SO} />

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={84} y={150} lines={[{ text: 'Sound at' }, { text: 'light speed?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
