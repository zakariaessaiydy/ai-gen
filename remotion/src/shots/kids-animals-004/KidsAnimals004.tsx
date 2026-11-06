// TINY SPARKS · Day 4 · 🦁 Animal Stories #1 — "Rory the Lion Who Was Afraid of the Dark" (LONG 16:9)
// kids-shorts/tiny-sparks/animals/day-004-rory-the-lion-who-was-afraid-of-the-dark. Cues from VO via K.
// GUESS WHO (tail behind the tree) → MEET → SOUND (roar + "your turn" pause) → 3 TRUE FACTS (savanna,
// pride, 5-mile roar) → STORY: sunset → night, scared → moon, fireflies, stars, deep breath → brave →
// lesson → LET'S REMEMBER (5-min memory round: roar ×3 with your-turn pauses, fact quiz with think
// timers + say-it-with-me, night-sky quiz, breathe in/out together, brave words ×3) → good night.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter, critterFaceAt, type CritterSpec } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsAnimals004', durationInSeconds: 299.9, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const S = (k: keyof typeof K) => VO[K[k]].start;
const E = (k: keyof typeof K) => VO[K[k]].end;
const COLORS = { ...CAPTION_COLORS, rory: '#ffb703', narrator: '#ffffff' };
void Kid;

const RORY: CritterSpec = { id: 'rory', species: 'lion', fur: '#ffc857', fur2: '#fff1c1', dark: '#d2691e' };
const PRIDE: CritterSpec[] = [
  { id: 'p1', species: 'lion', fur: '#f4b942', fur2: '#fff1c1', dark: '#b5541c' },
  { id: 'p2', species: 'lion', fur: '#ffd27a', fur2: '#fff6dc', dark: '#c76a2a' },
  { id: 'p3', species: 'lion', fur: '#ffc857', fur2: '#fff1c1', dark: '#a0471a' },
];

const TITLE_END = 1.6;
const REVEAL = S('reveal') + 0.9; // Rory pops out of the tree
const RORY_X = 1060;
const BOBO_X = 640;
const TREE_X = 192;
const NIGHT0 = S('scared') - 0.6;
const NIGHT1 = S('scared') + 2.6;
const MOON = S('moon') - 0.3;
const FIREFLIES = S('fireflies_r') - 0.6;
const STARS = S('stars') - 0.2;

// Rory's x: hidden by the tree → hop out → walk to centre
const roryX = (t: number) => {
  if (t < REVEAL) return TREE_X + 70;
  return TREE_X + 70 + (RORY_X - TREE_X - 70) * EASE_INOUT(prog(t, REVEAL + 0.3, S('hello') - 0.2));
};

const [rfx, rfy] = critterFaceAt(RORY_X, f, 0.62);

const CAM: CamKey[] = [
  { t: 0, z: 1, x: W / 2, y: H / 2 },
  { t: S('guess') - 0.4, z: 1.35, x: 420, y: 640, cut: true },
  { t: REVEAL, z: 1.35, x: 420, y: 640 },
  { t: S('hello') - 0.2, z: 1, x: W / 2, y: H / 2 },
  { t: S('roar1') - 0.4, z: 1.45, x: rfx, y: rfy + 140, cut: true },
  { t: E('roar2') + 1.2, z: 1.45, x: rfx, y: rfy + 140 },
  { t: E('roar2') + 1.2, z: 1, x: W / 2, y: H / 2, cut: true },
  { t: S('scared') - 0.2, z: 1, x: W / 2, y: H / 2 },
  { t: S('scared') - 0.2, z: 1.4, x: rfx, y: rfy + 160, cut: true },
  { t: E('scared') + 0.8, z: 1.4, x: rfx, y: rfy + 160 },
  { t: E('scared') + 0.8, z: 1, x: W / 2, y: H / 2, cut: true },
  { t: S('brave') - 0.3, z: 1, x: W / 2, y: H / 2 },
  { t: S('brave') - 0.3, z: 1.35, x: rfx, y: rfy + 170, cut: true },
  { t: E('brave') + 0.8, z: 1.35, x: rfx, y: rfy + 170 },
  { t: E('brave') + 0.8, z: 1, x: W / 2, y: H / 2, cut: true },
  { t: S('r_q') - 0.3, z: 1, x: W / 2, y: H / 2 },
  { t: S('r_q') - 0.3, z: 1.45, x: rfx, y: rfy + 140, cut: true },
  { t: E('r_c') + 1.0, z: 1.45, x: rfx, y: rfy + 140 },
  { t: E('r_c') + 1.0, z: 1, x: W / 2, y: H / 2, cut: true },
  { t: S('l1') - 0.3, z: 1, x: W / 2, y: H / 2 },
  { t: S('l1') - 0.3, z: 1.35, x: rfx, y: rfy + 170, cut: true },
  { t: E('l3') + 0.6, z: 1.35, x: rfx, y: rfy + 170 },
  { t: E('l3') + 0.6, z: 1, x: W / 2, y: H / 2, cut: true },
];

const within = (t: number, a: number, b: number) => t >= a && t < b;
// memory round: the three "breathe" phases drive a growing / shrinking bubble
const breathAt = (t: number) => {
  const ph: [number, number, boolean][] = [
    [S('b_in'), S('b_out'), true], [S('b_out'), S('b_in2'), false],
    [S('b_in2'), S('b_out2'), true], [S('b_out2'), S('l_intro') - 0.4, false],
  ];
  for (const [a, b, up] of ph) if (within(t, a, b)) { const p = EASE_INOUT(prog(t, a, b)); return up ? p : 1 - p; }
  return -1;
};
const BreathBubble: React.FC<{ t: number }> = ({ t }) => {
  const b = breathAt(t);
  if (b < 0) return null;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={W / 2} cy={290} r={70 + b * 130} fill="#a0c4ff" opacity={0.55} {...kst(7)} />
    </svg>
  );
};

const Firefly: React.FC<{ x: number; y: number; t: number; i: number; a: number }> = ({ x, y, t, i, a }) => {
  const glow = 0.55 + 0.45 * Math.sin(t * 3 + i * 1.7);
  return (
    <g transform={`translate(${x + Math.sin(t * 0.8 + i) * 60},${y + Math.cos(t * 0.6 + i * 2) * 40})`} opacity={a}>
      <circle r={26} fill="#fff59d" opacity={0.25 * glow} />
      <circle r={9} fill="#fff59d" opacity={glow} />
    </g>
  );
};

// fact cards (screen space, top centre)
const FactCard: React.FC<{ t: number; at: number; until: number; n: number; text: string; children?: React.ReactNode }> = ({ t, at, until, n, text, children }) => {
  if (t < at || t >= until) return null;
  const s = EASE_OUT(prog(t, at, at + 0.4));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${W / 2},230) scale(${s})`}>
        <rect x={-430} y={-150} width={860} height={300} rx={40} fill="#ffffff" {...kst(9)} />
        <circle cx={-370} cy={-150} r={52} fill="#ff595e" {...kst(7)} />
        <text x={-370} y={-132} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={56} fill="#ffffff">{n}</text>
        <g transform="translate(-250,20)">{children}</g>
        <text x={90} y={30} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={64} fill={KINK}>{text}</text>
      </g>
    </svg>
  );
};

export default function KidsAnimals004() {
  const t = useT();
  const cam = camAt(t, CAM);
  const night = EASE_INOUT(prog(t, NIGHT0, NIGHT1));
  const roryTalks = VO.some((l) => l.speaker === 'rory' && t >= l.start && t < l.end);
  const boboTalks = VO.some((l) => l.speaker === 'bobo' && t >= l.start && t < l.end);
  const scared = t >= S('scared') - 0.2 && t < S('brave') - 0.3;
  const roarBig = t >= S('roar2') && t < E('roar2') + 0.4;
  const showRory = t >= REVEAL;
  const walking = t >= REVEAL + 0.3 && t < S('hello') - 0.2;
  const prideOn = within(t, S('fact2') + 1.0, S('fact3') - 0.4) || within(t, S('a2') + 0.2, S('q3') - 0.4);
  const prideT0 = t >= S('a2') ? S('a2') + 0.2 : S('fact2') + 1.0;
  const rings = within(t, S('fact3') + 2.2, S('secret') - 0.6) || within(t, S('a3') + 0.3, S('n_intro') - 0.4);
  const ringT0 = t >= S('a3') ? S('a3') + 0.3 : S('fact3') + 2.2;
  const roarLine = (['r_a', 'r_b', 'r_c', 'a3_r'] as const).some((k) => within(t, S(k), E(k) + 0.4));
  const braveLine = (['l1', 'l2', 'l3'] as const).some((k) => within(t, S(k), E(k) + 0.3));
  const breathing = within(t, S('b_in'), S('l_intro') - 0.4);
  const moonPulse = within(t, S('na1'), S('nq2')) ? 1 + 0.12 * Math.sin((t - S('na1')) * 6) : 1;

  const roryExpr =
    !showRory ? 'smile'
    : t < S('roar1') ? 'happy'
    : t < E('roar2') + 0.4 ? (roarBig ? 'laugh' : 'happy')
    : scared ? (t >= S('fireflies_r') ? 'wow' : t >= S('moon') ? 'surprised' : 'sad')
    : t >= S('breath') && t < S('brave') ? 'sleepy'
    : breathing ? 'sleepy'
    : roarLine || braveLine ? 'laugh'
    : 'happy';

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} sun={night < 0.5} />
        {/* the night falls: a soft blue veil, moon, stars */}
        {night > 0 && (
          <g>
            <rect width={W} height={H} fill="#1d2156" opacity={0.72 * night} />
            <rect width={W} height={H} fill="#ff924c" opacity={0.18 * Math.sin(Math.min(1, night) * Math.PI)} />
            {t >= STARS - 2 &&
              Array.from({ length: 30 }).map((_, i) => (
                <circle key={i} cx={(i * 263) % W} cy={30 + ((i * 131) % 420)} r={3 + (i % 3) * 2} fill="#ffffff"
                  opacity={night * (t >= STARS ? 0.6 + 0.4 * Math.sin(t * 3 + i) : 0.35)} />
              ))}
            {t >= MOON && (
              <g transform={`translate(1560,190) scale(${EASE_OUT(prog(t, MOON, MOON + 0.8)) * moonPulse})`}>
                <circle r={110} fill="#fff3b0" opacity={0.25} />
                <circle r={78} fill="#fff3b0" {...kst(6)} />
                <circle cx={-22} cy={-10} r={10} fill="#f1e29a" />
                <circle cx={20} cy={22} r={14} fill="#f1e29a" />
                <circle cx={-30} cy={2} r={6} fill={KINK} />
                <circle cx={6} cy={2} r={6} fill={KINK} />
                <path d="M -26,22 Q -12,34 4,22" fill="none" {...kst(5)} />
              </g>
            )}
          </g>
        )}
        {/* guess who: a lion tail poking out of the tree */}
        {!showRory && t >= S('guess') - 0.4 && (
          <g transform={`translate(${TREE_X + 40},${f - 60}) rotate(${Math.sin(t * 4) * 12})`}>
            <path d="M 0,0 Q 90,-10 110,-90" fill="none" stroke={KINK} strokeWidth={22} strokeLinecap="round" />
            <path d="M 0,0 Q 90,-10 110,-90" fill="none" stroke="#ffc857" strokeWidth={12} strokeLinecap="round" />
            <circle cx={114} cy={-100} r={30} fill="#d2691e" {...kst(6)} />
          </g>
        )}
        {/* the pride (fact 2) */}
        {prideOn &&
          PRIDE.map((p, i) => {
            const s = EASE_OUT(prog(t, prideT0 + i * 0.35, prideT0 + 0.4 + i * 0.35));
            return <Critter key={p.id} spec={p} x={1360 + i * 170} y={f + 10} scale={0.42 * s} expr={i === 1 ? 'laugh' : 'happy'} shadow={false} />;
          })}
        {/* the big roar: sound rings */}
        {rings &&
          [0, 1, 2].map((i) => {
            const p = ((t - ringT0) * 0.8 + i / 3) % 1;
            return <circle key={i} cx={RORY_X} cy={rfy + 60} r={80 + p * 700} fill="none" stroke="#ffca3a" strokeWidth={14 * (1 - p)} opacity={1 - p} />;
          })}
        {/* fireflies */}
        {t >= FIREFLIES &&
          Array.from({ length: 9 }).map((_, i) => (
            <Firefly key={i} x={700 + (i % 5) * 180} y={420 + Math.floor(i / 5) * 180} t={t} i={i} a={EASE_OUT(prog(t, FIREFLIES + i * 0.15, FIREFLIES + i * 0.15 + 0.6))} />
          ))}
        <Critter spec={BOBO} x={BOBO_X} y={f} scale={0.55} expr={boboTalks ? 'laugh' : scared ? 'smile' : 'happy'} look={[0.7, -0.2]}
          mouth={lipSync(VO, 'bobo', t)} armL={boboTalks && within(t, S('bobo_help'), S('lesson')) ? 'hug' : boboTalks ? 'wave' : 'down'}
          armR={t >= S('night') ? 'wave' : boboTalks ? 'point' : 'down'} />
        {showRory && (
          <Critter spec={RORY} x={roryX(t)} y={f} scale={0.62} expr={roryExpr} look={scared && t < S('moon') ? [-0.5, 0.6] : t >= MOON && t < S('breath') ? [0.6, -0.8] : [0, 0]}
            mouth={lipSync(VO, 'rory', t) * (roarBig || roarLine ? 1.4 : 1)} walking={walking} walk={t * 2}
            hop={t >= REVEAL && t < REVEAL + 0.4 ? Math.sin(prog(t, REVEAL, REVEAL + 0.4) * Math.PI) * 80 : 0}
            squash={scared && t < S('moon') ? 0.15 : 0}
            armL={t >= S('night') ? 'wave' : (t >= S('brave') && t < E('brave')) || roarLine || braveLine ? 'up' : scared && t < S('moon') ? 'hug' : 'down'}
            armR={(t >= S('brave') && t < E('brave')) || roarLine || braveLine ? 'up' : scared && t < S('moon') ? 'hug' : t >= S('hello') && t < E('hello') ? 'wave' : 'down'} />
        )}
      </KidsStage>
      <TitleCard t={t} from={0} to={TITLE_END} title="RORY THE LION" sub="who was afraid of the dark" />
      <ThinkTimer t={t} from={E('guess2') + 0.2} to={S('reveal') - 0.2} label="WHO?" />
      <PopText t={t} at={E('your_turn') - 0.4} until={S('roar2') - 0.1} text="YOUR TURN!" y={200} size={120} color="#ffca3a" />
      <PopText t={t} at={S('roar2')} until={E('roar2') + 1.0} text="ROAR!" y={220} size={170} color="#ff924c" />
      {([[S('fact1') - 0.2, S('fact2') - 0.4], [S('a1') - 0.2, S('q2') - 0.4]] as const).map(([a, b]) => (
      <FactCard key={a} t={t} at={a} until={b} n={1} text="the savanna">
        <g>
          <rect x={-90} y={10} width={180} height={50} rx={14} fill="#e9c46a" {...kst(5)} />
          <rect x={-8} y={-60} width={16} height={74} fill="#8d5a3b" {...kst(4)} />
          <ellipse cx={0} cy={-70} rx={80} ry={26} fill="#6a994e" {...kst(5)} />
          <circle cx={60} cy={-90} r={20} fill="#ffd166" {...kst(4)} />
        </g>
      </FactCard>
      ))}
      {([[S('fact2') - 0.2, S('fact3') - 0.4], [S('a2') - 0.2, S('q3') - 0.4]] as const).map(([a, b]) => (
      <FactCard key={a} t={t} at={a} until={b} n={2} text="a PRIDE of lions">
        <g transform="translate(0,60)"><Critter spec={RORY} x={0} y={0} scale={0.22} shadow={false} expr="happy" /></g>
      </FactCard>
      ))}
      {([[S('fact3') - 0.2, S('secret') - 0.6], [S('a3') - 0.2, S('n_intro') - 0.4]] as const).map(([a, b]) => (
      <FactCard key={a} t={t} at={a} until={b} n={3} text="ROAR = 5 miles!">
        <g>
          {[30, 55, 80].map((r) => (
            <path key={r} d={`M ${r * 0.6},${-r} A ${r},${r} 0 0,1 ${r * 0.6},${r}`} fill="none" stroke="#ff924c" strokeWidth={10} strokeLinecap="round" />
          ))}
          <circle cx={-20} cy={0} r={24} fill="#ffc857" {...kst(5)} />
        </g>
      </FactCard>
      ))}
      <PopText t={t} at={S('lesson') + 0.4} until={E('lesson') + 2.0} text="BE BRAVE!" y={200} size={150} color="#ffca3a" />
      {/* ── LET'S REMEMBER: the memory round ── */}
      <PopText t={t} at={S('again')} until={S('r_q') - 0.3} text="LET'S REMEMBER!" y={220} size={130} color="#ffca3a" />
      <ThinkTimer t={t} from={E('r_q') + 0.2} to={S('r_a') - 0.2} label="WHAT?" />
      {(['r_a', 'r_b', 'r_c'] as const).map((k) => (
        <PopText key={k} t={t} at={S(k)} until={E(k) + 1.0} text="ROAR!" y={220} size={170} color="#ff924c" />
      ))}
      <PopText t={t} at={E('r_turn') - 0.4} until={S('r_b') - 0.1} text="YOUR TURN!" y={200} size={120} color="#ffca3a" />
      <PopText t={t} at={E('r_more') - 0.4} until={S('r_c') - 0.1} text="YOUR TURN!" y={200} size={120} color="#ffca3a" />
      <ThinkTimer t={t} from={E('q1') + 0.2} to={S('a1') - 0.2} label="WHERE?" />
      <ThinkTimer t={t} from={E('q2') + 0.2} to={S('a2') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('q3') + 0.2} to={S('a3') - 0.2} label="HOW FAR?" />
      <PopText t={t} at={S('a3_say') + 0.3} until={S('a3_r')} text="5" x={1500} y={560} size={260} color="#ff595e" />
      <ThinkTimer t={t} from={E('nq1') + 0.2} to={S('na1') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('nq2') + 0.2} to={S('na2') - 0.2} label="WHAT?" />
      <ThinkTimer t={t} from={E('nq3') + 0.2} to={S('na3') - 0.2} label="WHAT?" />
      <PopText t={t} at={S('na1')} until={S('nq2') - 0.3} text="THE MOON!" y={200} size={130} color="#fff3b0" />
      <PopText t={t} at={S('na2')} until={S('nq3') - 0.3} text="FIREFLIES!" y={200} size={130} color="#fff59d" />
      <PopText t={t} at={S('na3')} until={S('b_intro') - 0.3} text="THE STARS!" y={200} size={130} color="#ffffff" />
      <BreathBubble t={t} />
      <PopText t={t} at={S('b_in')} until={S('b_out')} text="BREATHE IN..." y={290} size={90} color="#a0c4ff" />
      <PopText t={t} at={S('b_out')} until={S('b_in2')} text="...AND OUT" y={290} size={90} color="#ffffff" />
      <PopText t={t} at={S('b_in2')} until={S('b_out2')} text="BREATHE IN..." y={290} size={90} color="#a0c4ff" />
      <PopText t={t} at={S('b_out2')} until={S('l_intro') - 0.4} text="...AND OUT" y={290} size={90} color="#ffffff" />
      <PopText t={t} at={S('l1')} until={S('l_turn')} text="BE BRAVE!" y={200} size={150} color="#ffca3a" />
      <PopText t={t} at={E('l_turn') - 0.3} until={S('l2') - 0.1} text="YOUR TURN!" y={200} size={120} color="#ffca3a" />
      <PopText t={t} at={S('l2')} until={S('l_turn2')} text="BE BRAVE!" y={200} size={150} color="#ffca3a" />
      <PopText t={t} at={S('l_turn2')} until={S('night') - 0.4} text="ALL TOGETHER!" y={200} size={120} color="#ffca3a" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
