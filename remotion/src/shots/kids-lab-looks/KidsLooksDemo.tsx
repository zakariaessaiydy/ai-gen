// TINY SPARKS · LOOKS TEST (lab, 16:9) — a side-by-side for the user (options 1 + 2 of "how to enhance the
// characters"): four painted places, each split in two. LEFT = the cast as they are today. RIGHT =
//   1. SCENE LIGHT — the characters take the painting's light: a colour tint (cool at night, golden on the
//      beach, warm in the kitchen) + a soft rim of light on the side the light comes from, so they sit IN
//      the painting instead of on top of it. Pure SVG filter around the character, no rig change.
//   2. OUTFITS — place/story wardrobe on the SAME faces, hair and colours family: pyjamas + nightcap at
//      bedtime, raincoat + boots + rain hat + umbrella in the rain, sundress + sun hat + sunglasses at the
//      beach, apron + chef hat in the kitchen. Spec variants + the rigs' optional `wear` (headwear) slot.
// Feet on the painted floor via standY. If the user likes the right side, the light moves into the kit
// (one prop on KidsStage / Backdrop) and the outfits become cast specs in cast/tiny-sparks.ts.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Kid, type KidSpec } from '../../lib/kids/kid';
import { Critter, type CritterSpec } from '../../lib/kids/critter';
import { BOBO, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, standY, type Place } from '../../lib/kids/places';
import { FONT_TOON } from '../../lib/kids/kit';
import { K3DDefs } from '../../lib/kids/depth';
import { KINK, kst, type KExpr } from '../../lib/kids/face';

export const compositionConfig = { id: 'KidsLooksDemo', durationInSeconds: 18, fps: 30, width: 1920, height: 1080 };

const PW = 960;
const H = 1080;
const SCENE_S = 4.5;
const SC = 0.66;

// ── 1. SCENE LIGHT ───────────────────────────────────────────────────────────────────────────────
type Light = { id: string; tint: [number, number, number]; lift?: number; rim: string; rimO: number; dir: [number, number]; rimW?: number };
// tint = per-channel multiply (1 = unchanged); lift = a little of the light colour added into the shadows;
// dir = where the light comes FROM (screen direction), rim on that side
const LightDefs: React.FC<{ l: Light }> = ({ l }) => {
  const w = l.rimW ?? 9;
  const [r, g, b] = l.tint;
  const k = l.lift ?? 0;
  return (
    <defs>
      <filter id={l.id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values={`${r} 0 0 0 ${k * r * 0.1}  0 ${g} 0 0 ${k * g * 0.1}  0 0 ${b} 0 ${k * b * 0.1}  0 0 0 1 0`} result="tint" />
        <feOffset in="SourceAlpha" dx={-l.dir[0] * w} dy={-l.dir[1] * w} result="off" />
        <feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
        <feGaussianBlur in="edge" stdDeviation={w * 0.45} result="edgeB" />
        <feComposite in="edgeB" in2="SourceAlpha" operator="in" result="edgeIn" />
        <feFlood floodColor={l.rim} floodOpacity={l.rimO} />
        <feComposite in2="edgeIn" operator="in" result="rimC" />
        <feMerge>
          <feMergeNode in="tint" />
          <feMergeNode in="rimC" />
        </feMerge>
      </filter>
    </defs>
  );
};

// ── 2. OUTFITS (headwear in HEAD space: centre 0,0, head radius ~175) ─────────────────────────────
const NightCap: React.FC<{ c: string; t: number }> = ({ c, t }) => {
  const sw = Math.sin(t * 2.2) * 6;
  return (
    <g>
      <path d={`M -168,-96 Q -170,-236 10,-244 Q 150,-246 ${226 + sw},-150 Q ${200 + sw},-120 150,-150 Q 120,-180 60,-170 Q 150,-150 168,-96 Z`} fill={c} {...kst(8)} />
      <rect x={-180} y={-128} width={360} height={52} rx={26} fill="#ffffff" {...kst(8)} />
      <circle cx={232 + sw} cy={-138} r={30} fill="#ffffff" {...kst(7)} />
      {[[-80, -190], [0, -215], [70, -196]].map(([x, y], i) => (
        <path key={i} d="M 0,-10 L 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3 Z" transform={`translate(${x},${y}) scale(1.4)`} fill="#ffe066" />
      ))}
    </g>
  );
};
const RainHat: React.FC = () => (
  <g>
    <path d="M -150,-118 Q -150,-262 0,-262 Q 150,-262 150,-118 Z" fill="#ffd23f" {...kst(8)} />
    <path d="M -236,-104 Q 0,-170 236,-104 Q 250,-64 196,-70 Q 0,-110 -196,-70 Q -250,-64 -236,-104 Z" fill="#ffc300" {...kst(8)} />
    <path d="M -60,-240 Q 0,-252 60,-240" fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
  </g>
);
const SunHat: React.FC = () => (
  <g>
    <ellipse cx={0} cy={-118} rx={270} ry={58} fill="#f6d68e" {...kst(8)} />
    <path d="M -140,-124 Q -140,-250 0,-250 Q 140,-250 140,-124 Z" fill="#f6d68e" {...kst(8)} />
    <path d="M -140,-150 Q 0,-130 140,-150 L 140,-124 Q 0,-104 -140,-124 Z" fill="#ff8fab" {...kst(6)} />
    <circle cx={110} cy={-140} r={22} fill="#ffffff" {...kst(6)} />
    <circle cx={110} cy={-140} r={8} fill="#ffd166" />
  </g>
);
const ChefHat: React.FC = () => (
  <g>
    <circle cx={-82} cy={-250} r={74} fill="#ffffff" {...kst(8)} />
    <circle cx={82} cy={-250} r={74} fill="#ffffff" {...kst(8)} />
    <circle cx={0} cy={-286} r={90} fill="#ffffff" {...kst(8)} />
    <rect x={-128} y={-206} width={256} height={84} rx={18} fill="#ffffff" {...kst(8)} />
    <path d="M -60,-200 L -60,-130 M 0,-200 L 0,-130 M 60,-200 L 60,-130" stroke="#e6e6ef" strokeWidth={8} />
  </g>
);
const Shades: React.FC<{ y?: number; dx?: number }> = ({ y = -8, dx = 64 }) => (
  <g>
    {[-1, 1].map((k) => (
      <g key={k}>
        <ellipse cx={k * dx} cy={y} rx={56} ry={44} fill="#2b2d42" {...kst(8)} />
        <path d={`M ${k * dx - 30},${y - 18} Q ${k * dx - 10},${y - 30} ${k * dx + 14},${y - 24}`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      </g>
    ))}
    <path d={`M -10,${y - 10} Q 0,${y - 20} 10,${y - 10}`} fill="none" {...kst(8)} />
  </g>
);
const Umbrella: React.FC<{ t: number }> = ({ t }) => (
  // held at the paw (hold pose): a long shaft so the canopy opens ABOVE the head, not behind it
  <g transform={`rotate(${10 + Math.sin(t * 1.6) * 3})`}>
    <line x1={0} y1={30} x2={0} y2={-560} stroke={KINK} strokeWidth={12} strokeLinecap="round" />
    <path d="M -250,-540 Q 0,-760 250,-540 Q 208,-572 166,-540 Q 125,-572 83,-540 Q 42,-572 0,-540 Q -42,-572 -83,-540 Q -125,-572 -166,-540 Q -208,-572 -250,-540 Z" fill="#ff595e" {...kst(9)} />
    <path d="M 0,-690 Q -44,-640 -83,-540 M 0,-690 Q 44,-640 83,-540" fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.5} />
    <path d="M 0,30 Q 0,60 -26,60" fill="none" stroke={KINK} strokeWidth={12} strokeLinecap="round" />
  </g>
);

const MILA_PJ: KidSpec = { ...MILA, id: 'mila-pj', top: 'stripes', topColor: '#c3b1ff', topColor2: '#ffffff', pants: '#c3b1ff', shoes: '#ff8fab' };
const LEO_PJ: KidSpec = { ...LEO, id: 'leo-pj', top: 'tee', topColor: '#7ec8e3', pants: '#7ec8e3', shoes: '#4cc9f0' };
const LEO_RAIN: KidSpec = { ...LEO, id: 'leo-rain', top: 'tee', topColor: '#ffd23f', pants: '#3a5a8c', shoes: '#ffc300' };
const MILA_BEACH: KidSpec = { ...MILA, id: 'mila-beach', top: 'dress', topColor: '#4cc9f0', topColor2: '#ffffff', shoes: '#ff8fab' };
const LEO_CHEF: KidSpec = { ...LEO, id: 'leo-chef', top: 'overalls', topColor: '#4cc9f0', topColor2: '#ffffff', pants: '#3a5a8c' };

// ── the four scenes ──────────────────────────────────────────────────────────────────────────────
type Actor =
  | { kind: 'kid'; spec: KidSpec; better?: KidSpec; wear?: (t: number) => React.ReactNode; x: number; expr?: KExpr; armR?: 'wave' | 'down' | 'hold'; holdR?: (t: number) => React.ReactNode }
  | { kind: 'critter'; spec: CritterSpec; better?: CritterSpec; wear?: (t: number) => React.ReactNode; x: number; expr?: KExpr; armL?: 'wave' | 'down' | 'hold'; holdR?: (t: number) => React.ReactNode; armR?: 'hold' | 'down' };
type Scene = { title: string; place: Place; light: Light; actors: Actor[] };

const SCENES: Scene[] = [
  {
    title: 'Bedtime',
    place: 'bedroom',
    light: { id: 'lt-night', tint: [0.74, 0.8, 1.02], rim: '#ffd59e', rimO: 0.75, dir: [-1, -0.35] },
    actors: [
      { kind: 'kid', spec: MILA, better: MILA_PJ, x: 290, expr: 'smile' },
      { kind: 'kid', spec: LEO, better: LEO_PJ, wear: (t) => <NightCap c="#4cc9f0" t={t} />, x: 650, expr: 'sleepy' },
    ],
  },
  {
    title: 'Rainy day',
    place: 'rainy-street',
    light: { id: 'lt-rain', tint: [0.9, 0.93, 1.03], rim: '#eaf2ff', rimO: 0.55, dir: [0, -1] },
    actors: [
      { kind: 'kid', spec: LEO, better: LEO_RAIN, wear: () => <RainHat />, x: 300, expr: 'happy', armR: 'wave' },
      { kind: 'critter', spec: BOBO, x: 660, expr: 'smile', armR: 'hold', holdR: (t) => <Umbrella t={t} /> },
    ],
  },
  {
    title: 'Beach day',
    place: 'beach',
    light: { id: 'lt-sun', tint: [1.05, 1.0, 0.9], rim: '#fff3c4', rimO: 0.85, dir: [0.8, -1] },
    actors: [
      { kind: 'kid', spec: MILA, better: MILA_BEACH, wear: () => <SunHat />, x: 300, expr: 'happy', armR: 'wave' },
      { kind: 'critter', spec: BOBO, wear: () => <Shades />, x: 660, expr: 'laugh' },
    ],
  },
  {
    title: 'Cooking',
    place: 'kitchen',
    light: { id: 'lt-kitchen', tint: [1.04, 0.99, 0.92], rim: '#fff0d0', rimO: 0.7, dir: [0, -1] },
    actors: [
      { kind: 'kid', spec: LEO, better: LEO_CHEF, wear: () => <ChefHat />, x: 330, expr: 'happy' },
      { kind: 'critter', spec: HOOT, x: 600, expr: 'smile', armL: 'wave' },
    ],
  },
];

const Half: React.FC<{ scene: Scene; better: boolean; t: number }> = ({ scene, better, t }) => {
  const actors = scene.actors.map((a, i) => {
    if (a.kind === 'kid') {
      const y = standY(scene.place, a.x, PW, H, { halfW: 150 * SC });
      // the umbrella (props that only make sense with the outfit) stays on the right side
      return (
        <Kid key={i} spec={better && a.better ? a.better : a.spec} x={a.x} y={y} scale={SC} expr={a.expr} armR={a.armR} wear={better && a.wear ? a.wear(t) : undefined} />
      );
    }
    const y = standY(scene.place, a.x, PW, H, { halfW: 140 * SC });
    return (
      <Critter
        key={i}
        spec={better && a.better ? a.better : a.spec}
        x={a.x}
        y={y}
        scale={SC}
        expr={a.expr}
        armL={a.armL}
        armR={better && a.holdR ? a.armR : 'down'}
        holdR={better && a.holdR ? a.holdR(t) : undefined}
        wear={better && a.wear ? a.wear(t) : undefined}
      />
    );
  });
  return (
    <g>
      <Backdrop place={scene.place} w={PW} h={H} t={t} />
      {better ? (
        <>
          <LightDefs l={scene.light} />
          {actors.map((el, i) => (
            <g key={i} filter={`url(#${scene.light.id})`}>
              {el}
            </g>
          ))}
        </>
      ) : (
        actors
      )}
      <g>
        <rect x={PW / 2 - 290} y={30} width={580} height={86} rx={43} fill={better ? '#8ac926' : '#ffffff'} stroke={KINK} strokeWidth={6} />
        <text x={PW / 2} y={90} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>
          {better ? `NEW · ${scene.title}` : `TODAY · ${scene.title}`}
        </text>
      </g>
    </g>
  );
};

export default function KidsLooksDemo() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const scene = SCENES[Math.min(SCENES.length - 1, Math.floor(t / SCENE_S))];
  return (
    <AbsoluteFill style={{ background: '#fff8e7' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <K3DDefs />
        <svg x={0} y={0} width={PW} height={H} viewBox={`0 0 ${PW} ${H}`} overflow="hidden">
          <Half scene={scene} better={false} t={t} />
        </svg>
        <svg x={PW} y={0} width={PW} height={H} viewBox={`0 0 ${PW} ${H}`} overflow="hidden">
          <Half scene={scene} better t={t} />
        </svg>
        <rect x={PW - 5} y={0} width={10} height={H} fill={KINK} />
      </svg>
    </AbsoluteFill>
  );
}
