// TINY SPARKS · Day 2 · 🔢 Numbers & Math #1 — "Learn Numbers 1–10 with Animals" (Short 9:16)
// kids-shorts/tiny-sparks/numbers/day-002-learn-numbers-1-10-with-animals. Cues derive from VO (S/E).
// Every number shown THREE ways at once: N animals popping in (rainbow badges count them), the big
// numeral + its word, and Mila's fingers (one hand to 5, both hands 6–10). Tag: the 10th bear is Bobo.
// Recap: count 1→10 together (numerals pop on the spoken word), confetti.
import React from 'react';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, type CritterSpec, type Species } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, CountRow, FONT_TOON, KidsCaptions, KidsStage, PopText, RAINBOW, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = { id: 'KidsNumbers002', durationInSeconds: 47.2, fps: 30, width: 1080, height: 1920 };

// 0 intro · 1..10 = the numbers · 11 recap count · 12 yay
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;
const f = FLOOR(1920);
const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const zoo: [Species, string, string, string][] = [
  ['lion', '#ffc857', '#fff1c1', '#d2691e'],
  ['pig', '#ffb3c6', '#ffd6e0', '#e5738f'],
  ['cat', '#ffb26b', '#fff1e0', '#d9772b'],
  ['fox', '#ff8c42', '#ffffff', '#7a3b12'],
  ['bunny', '#f8f9fa', '#ffe5ec', '#adb5bd'],
  ['mouse', '#c9cdd4', '#f1f3f5', '#868e96'],
  ['panda', '#ffffff', '#ffffff', '#2b2d42'],
  ['owl', '#9c7a64', '#f5e6d3', '#6d4c41'],
  ['frog', '#8ac926', '#e9f5c9', '#4f7d17'],
  ['bear', '#c98f5f', '#f3dcc0', '#7a4a2a'],
];
const specOf = (n: number, i: number): CritterSpec => {
  if (n === 10 && i === 9) return BOBO; // the tag: the tenth bear is Bobo
  const [species, fur, fur2, dark] = zoo[n - 1];
  return { id: `${species}${i}`, species, fur, fur2, dark };
};

// which number is on screen now (1..10), 0 before, 11 during the recap
const numberAt = (t: number) => {
  if (t < S(1) - 0.15) return 0;
  for (let n = 10; n >= 1; n--) if (t >= S(n) - 0.15) return n;
  return 0;
};
const recapT = S(11) - 0.15;

const recapTimes = () => {
  const w = timeWords(VO[11]);
  return Array.from({ length: 10 }, (_, k) => (w[4 + k] ? w[4 + k].start : S(11) + 1 + k * 0.35));
};

const MILA_X = 205;
const BOBO_X = 880;

const CAM: CamKey[] = [{ t: 0, z: 1, x: 540, y: 960 }];

export default function KidsNumbers002() {
  const t = useT();
  const cam = camAt(t, CAM);
  const n = t >= recapT ? 11 : numberAt(t);
  const segEnd = n >= 1 && n <= 10 ? (n < 10 ? S(n + 1) - 0.15 : recapT) : 0;
  const popTimes = n >= 1 && n <= 10 ? Array.from({ length: n }, (_, i) => S(n) + 0.15 + i * Math.min(0.32, 1.7 / n)) : [];
  const shown = n >= 1 && n <= 10 ? n : 0;
  // Mila's fingers: one hand to five, both hands from six
  const fL = shown ? Math.min(5, shown) : 0;
  const fR = shown > 5 ? shown - 5 : 0;
  const milaArmL: KArm = shown ? 'count' : t >= S(12) ? 'up' : 'wave';
  const milaArmR: KArm = shown > 5 ? 'count' : t >= S(12) ? 'up' : 'hip';
  const boboTalks = VO.some((l, i) => i >= 1 && i <= 10 && l.speaker === 'bobo' && t >= l.start && t < l.end);
  const itemScale = shown <= 5 ? 0.38 : 0.3;
  const gap = shown <= 5 ? 200 : 195;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow t={t} />
        {shown > 0 && (
          <CountRow
            key={shown}
            t={t}
            times={popTimes}
            until={segEnd}
            x={540}
            y={shown <= 5 ? 720 : 700}
            gap={gap}
            perRow={5}
            item={(i) => (
              <g transform={`translate(0,${620 * itemScale * 0.5}) `}>
                <Critter spec={specOf(shown, i)} x={0} y={0} scale={itemScale} expr={i % 3 === 0 ? 'happy' : 'smile'} shadow={false}
                  hop={Math.abs(Math.sin(t * 6 + i)) * 8} />
              </g>
            )}
          />
        )}
        {/* recap: numerals 1..10 pop on the spoken words */}
        {n === 11 && (
          <CountRow
            t={t}
            times={recapTimes()}
            x={540}
            y={640}
            gap={175}
            perRow={5}
            badges={false}
            item={(i) => (
              <g>
                <circle r={68} fill={RAINBOW[i % RAINBOW.length]} {...kst(8)} />
                <text y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={88} fill="#ffffff" stroke={KINK} strokeWidth={6} paintOrder="stroke">
                  {i + 1}
                </text>
              </g>
            )}
          />
        )}
        <Kid spec={MILA} x={MILA_X} y={f} scale={0.82} expr={t >= S(12) ? 'laugh' : shown ? 'happy' : 'smile'} look={[0.5, -0.3]}
          mouth={lipSync(VO, 'mila', t)} armL={milaArmL} armR={milaArmR} fingersL={fL} fingersR={fR}
          hop={t >= S(12) ? Math.abs(Math.sin((t - S(12)) * 6)) * 40 : 0} />
        {/* Bobo sits out the bear line: he IS the tenth bear in the row */}
        {!(shown === 10 && t >= S(10) + 0.15) && (
          <Critter spec={BOBO} x={BOBO_X} y={f} scale={0.7} expr={boboTalks || t >= S(12) ? 'laugh' : 'smile'} look={[-0.6, -0.3]}
            mouth={lipSync(VO, 'bobo', t)} armL={t < S(1) - 0.15 || t >= S(12) ? 'wave' : boboTalks ? 'up' : 'down'} armR={t >= S(12) ? 'up' : 'down'}
            hop={t >= S(12) ? Math.abs(Math.sin((t - S(12)) * 6 + 1)) * 40 : 0} />
        )}
      </KidsStage>
      {/* the numeral + its word for the current number */}
      {shown > 0 && <PopText t={t} at={S(shown) - 0.05} until={segEnd} text={String(shown)} y={210} size={230} color={RAINBOW[(shown - 1) % RAINBOW.length]} />}
      {shown > 0 && <PopText t={t} at={S(shown) + 0.2} until={segEnd} text={WORDS[shown - 1].toUpperCase()} y={372} size={84} color="#ffffff" rot={2} />}
      {n === 11 && <PopText t={t} at={S(11)} until={S(12) - 0.1} text="1 → 10" y={260} size={150} color="#ffca3a" />}
      {t < S(1) - 0.15 && <PopText t={t} at={0.3} text="1 → 10" y={360} size={200} color="#ffca3a" />}
      <Confetti t={t} at={S(12)} y={700} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
    </>
  );
}
