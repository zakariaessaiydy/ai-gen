// TINY SPARKS — WARDROBE (user request, Nov 2026: "add the outfits to the characters"). Place/story outfits
// for the LOCKED cast: same faces, hair, eyes and colour family, so a kid still knows who is who — only the
// clothes and the headwear change. The everyday specs in tiny-sparks.ts stay the default.
//
//   const m = dress('mila', 'rain');           // { spec, wear }
//   <Kid spec={m.spec} wear={m.wear} … />       // Kid or Critter, same two props
//   <Critter spec={dress('bobo', 'rain').spec} wear={dress('bobo', 'rain').wear} armR="hold" holdR={<Umbrella />} />
//
// Pick the outfit from the place/story (bedroom → pajamas, rainy-street → rain, beach/tropical-island →
// beach, kitchen/bakery → chef, snow → winter, party → party, construction-site → builder). One outfit per
// character per scene; never mix the hero outfits (HERO specs) with these.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { KidSpec } from '../kid';
import type { CritterSpec } from '../critter';
import { KINK, kst } from '../face';
import { BOBO, HOOT, LEO, MILA } from './tiny-sparks';

// ── HEADWEAR — drawn in HEAD space (centre 0,0, head radius ~175), passed as the rigs' `wear` prop ──
export const NightCap: React.FC<{ c?: string }> = ({ c = '#4cc9f0' }) => {
  const sw = Math.sin((useCurrentFrame() / 30) * 2.2) * 6; // the floppy tip sways
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
export const RainHat: React.FC<{ c?: string; c2?: string }> = ({ c = '#ffd23f', c2 = '#ffc300' }) => (
  <g>
    <path d="M -150,-118 Q -150,-262 0,-262 Q 150,-262 150,-118 Z" fill={c} {...kst(8)} />
    <path d="M -236,-104 Q 0,-170 236,-104 Q 250,-64 196,-70 Q 0,-110 -196,-70 Q -250,-64 -236,-104 Z" fill={c2} {...kst(8)} />
    <path d="M -60,-240 Q 0,-252 60,-240" fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
  </g>
);
export const SunHat: React.FC<{ band?: string }> = ({ band = '#ff8fab' }) => (
  <g>
    <ellipse cx={0} cy={-118} rx={270} ry={58} fill="#f6d68e" {...kst(8)} />
    <path d="M -140,-124 Q -140,-250 0,-250 Q 140,-250 140,-124 Z" fill="#f6d68e" {...kst(8)} />
    <path d="M -140,-150 Q 0,-130 140,-150 L 140,-124 Q 0,-104 -140,-124 Z" fill={band} {...kst(6)} />
    <circle cx={110} cy={-140} r={22} fill="#ffffff" {...kst(6)} />
    <circle cx={110} cy={-140} r={8} fill="#ffd166" />
  </g>
);
export const ChefHat: React.FC = () => (
  <g>
    <circle cx={-82} cy={-250} r={74} fill="#ffffff" {...kst(8)} />
    <circle cx={82} cy={-250} r={74} fill="#ffffff" {...kst(8)} />
    <circle cx={0} cy={-286} r={90} fill="#ffffff" {...kst(8)} />
    <rect x={-128} y={-206} width={256} height={84} rx={18} fill="#ffffff" {...kst(8)} />
    <path d="M -60,-200 L -60,-130 M 0,-200 L 0,-130 M 60,-200 L 60,-130" stroke="#e6e6ef" strokeWidth={8} />
  </g>
);
export const Beanie: React.FC<{ c?: string; c2?: string }> = ({ c = '#ff595e', c2 = '#ffffff' }) => (
  <g>
    <path d="M -166,-100 Q -170,-250 0,-252 Q 170,-250 166,-100 Z" fill={c} {...kst(8)} />
    {[-110, -55, 0, 55, 110].map((x) => (
      <path key={x} d={`M ${x},-238 Q ${x * 1.08},-170 ${x * 1.12},-112`} fill="none" stroke="#000000" strokeOpacity={0.12} strokeWidth={8} />
    ))}
    <rect x={-176} y={-130} width={352} height={50} rx={22} fill={c2} {...kst(8)} />
    <circle cx={0} cy={-268} r={40} fill={c2} {...kst(7)} />
  </g>
);
export const PartyHat: React.FC<{ c?: string }> = ({ c = '#ff006e' }) => (
  <g transform="rotate(12)">
    <path d="M -74,-140 L 0,-330 L 74,-140 Z" fill={c} {...kst(8)} />
    {[-200, -260].map((y, i) => <path key={i} d={`M ${-((y + 330) / 190) * 74},${y} L ${((y + 330) / 190) * 74},${y}`} stroke="#ffd166" strokeWidth={14} />)}
    <circle cx={0} cy={-336} r={22} fill="#ffd166" {...kst(6)} />
  </g>
);
export const HardHat: React.FC = () => (
  <g>
    <path d="M -150,-112 Q -150,-262 0,-262 Q 150,-262 150,-112 Z" fill="#ffca3a" {...kst(8)} />
    <rect x={-20} y={-262} width={40} height={150} rx={14} fill="#ffb703" />
    <path d="M -206,-112 L 206,-112 Q 214,-80 180,-82 L -180,-82 Q -214,-80 -206,-112 Z" fill="#ffb703" {...kst(8)} />
  </g>
);
// sunglasses: kid eyes sit at (±68, 20) in head space, critter eyes at (±64, -8)
export const Shades: React.FC<{ who?: 'kid' | 'critter' }> = ({ who = 'kid' }) => {
  const [dx, y] = who === 'kid' ? [68, 20] : [64, -8];
  return (
    <g>
      {[-1, 1].map((k) => (
        <g key={k}>
          <ellipse cx={k * dx} cy={y} rx={58} ry={46} fill="#2b2d42" {...kst(8)} />
          <path d={`M ${k * dx - 30},${y - 18} Q ${k * dx - 10},${y - 30} ${k * dx + 14},${y - 24}`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        </g>
      ))}
      <path d={`M -10,${y - 10} Q 0,${y - 20} 10,${y - 10}`} fill="none" {...kst(8)} />
    </g>
  );
};

// ── PROPS that go with an outfit (pass as holdR / holdL with arm "hold") ──────────────────────────
// a long shaft so the canopy opens ABOVE the head (a short one hides behind it)
export const Umbrella: React.FC<{ c?: string }> = ({ c = '#ff595e' }) => {
  const t = useCurrentFrame() / 30;
  return (
    <g transform={`rotate(${10 + Math.sin(t * 1.6) * 3})`}>
      <line x1={0} y1={30} x2={0} y2={-560} stroke={KINK} strokeWidth={12} strokeLinecap="round" />
      <path d="M -250,-540 Q 0,-760 250,-540 Q 208,-572 166,-540 Q 125,-572 83,-540 Q 42,-572 0,-540 Q -42,-572 -83,-540 Q -125,-572 -166,-540 Q -208,-572 -250,-540 Z" fill={c} {...kst(9)} />
      <path d="M 0,-690 Q -44,-640 -83,-540 M 0,-690 Q 44,-640 83,-540" fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.5} />
      <path d="M 0,30 Q 0,60 -26,60" fill="none" stroke={KINK} strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};

// ── THE OUTFITS ──────────────────────────────────────────────────────────────────────────────────
export type Who = 'mila' | 'leo' | 'bobo' | 'hoot';
export type Outfit = 'everyday' | 'pajamas' | 'rain' | 'beach' | 'chef' | 'winter' | 'party' | 'builder';
export const OUTFITS: Outfit[] = ['everyday', 'pajamas', 'rain', 'beach', 'chef', 'winter', 'party', 'builder'];
type Look<S> = { spec: S; wear?: React.ReactNode };

const kid = (base: KidSpec, id: string, o: Partial<KidSpec>, wear?: React.ReactNode): Look<KidSpec> => ({ spec: { ...base, ...o, id: `${base.id}-${id}` }, wear });
const crit = (base: CritterSpec, id: string, o: Partial<CritterSpec>, wear?: React.ReactNode): Look<CritterSpec> => ({ spec: { ...base, ...o, id: `${base.id}-${id}` }, wear });

const KIDS: Record<'mila' | 'leo', Record<Outfit, Look<KidSpec>>> = {
  mila: {
    everyday: { spec: MILA },
    pajamas: kid(MILA, 'pj', { top: 'stripes', topColor: '#c3b1ff', topColor2: '#ffffff', pants: '#c3b1ff', shoes: '#ff8fab' }),
    rain: kid(MILA, 'rain', { top: 'dress', topColor: '#ff8fab', topColor2: '#ffffff', shoes: '#ff595e' }, <RainHat c="#ff8fab" c2="#ff6fa5" />),
    beach: kid(MILA, 'beach', { top: 'dress', topColor: '#4cc9f0', topColor2: '#ffffff', shoes: '#ff8fab' }, <SunHat />),
    chef: kid(MILA, 'chef', { top: 'overalls', topColor: '#ffca3a', topColor2: '#ffffff', pants: '#ff8fab', shoes: '#ff595e' }, <ChefHat />),
    winter: kid(MILA, 'winter', { top: 'tee', topColor: '#ff595e', pants: '#3a5a8c', shoes: '#8d5524' }, <Beanie c="#ff6fa5" />),
    party: kid(MILA, 'party', { top: 'dress', topColor: '#ff6fa5', topColor2: '#ffd166' }, <PartyHat c="#8338ec" />),
    builder: kid(MILA, 'builder', { top: 'overalls', topColor: '#ffca3a', topColor2: '#ff924c', pants: '#ff924c', shoes: '#8d5524' }, <HardHat />),
  },
  leo: {
    everyday: { spec: LEO },
    pajamas: kid(LEO, 'pj', { top: 'tee', topColor: '#7ec8e3', pants: '#7ec8e3', shoes: '#4cc9f0' }, <NightCap c="#4cc9f0" />),
    rain: kid(LEO, 'rain', { top: 'tee', topColor: '#ffd23f', pants: '#3a5a8c', shoes: '#ffc300' }, <RainHat />),
    beach: kid(LEO, 'beach', { top: 'tee', topColor: '#ff924c', pants: '#4cc9f0', shoes: '#ffca3a' }, <Shades />),
    chef: kid(LEO, 'chef', { top: 'overalls', topColor: '#4cc9f0', topColor2: '#ffffff', pants: '#3a5a8c' }, <ChefHat />),
    winter: kid(LEO, 'winter', { top: 'tee', topColor: '#2a9d8f', pants: '#3a5a8c', shoes: '#8d5524' }, <Beanie c="#ffca3a" c2="#ffffff" />),
    party: kid(LEO, 'party', { top: 'stripes', topColor: '#8ac926', topColor2: '#ffffff' }, <PartyHat c="#4cc9f0" />),
    builder: kid(LEO, 'builder', { top: 'overalls', topColor: '#4cc9f0', topColor2: '#ff924c', pants: '#ff924c', shoes: '#8d5524' }, <HardHat />),
  },
};
const CRITTERS: Record<'bobo' | 'hoot', Record<Outfit, Look<CritterSpec>>> = {
  bobo: {
    everyday: { spec: BOBO },
    pajamas: crit(BOBO, 'pj', { scarf: undefined }, <NightCap c="#ff8fab" />),
    rain: crit(BOBO, 'rain', {}, <RainHat c="#8ac926" c2="#6aa61e" />),
    beach: crit(BOBO, 'beach', { scarf: undefined }, <Shades who="critter" />),
    chef: crit(BOBO, 'chef', {}, <ChefHat />),
    winter: crit(BOBO, 'winter', {}, <Beanie c="#4cc9f0" />),
    party: crit(BOBO, 'party', { hat: 'party' }),
    builder: crit(BOBO, 'builder', {}, <HardHat />),
  },
  // Hoot's cap + glasses ARE his identity: he keeps them in every outfit except pyjamas
  hoot: {
    everyday: { spec: HOOT },
    pajamas: crit(HOOT, 'pj', { hat: 'none' }, <NightCap c="#b197fc" />),
    rain: { spec: HOOT },
    beach: { spec: HOOT },
    chef: { spec: HOOT },
    winter: crit(HOOT, 'winter', { scarf: '#b197fc' }),
    party: { spec: HOOT },
    builder: { spec: HOOT },
  },
};

export function dress(who: 'mila' | 'leo', outfit: Outfit): Look<KidSpec>;
export function dress(who: 'bobo' | 'hoot', outfit: Outfit): Look<CritterSpec>;
export function dress(who: Who, outfit: Outfit): Look<KidSpec> | Look<CritterSpec> {
  return who === 'mila' || who === 'leo' ? KIDS[who][outfit] : CRITTERS[who][outfit];
}
