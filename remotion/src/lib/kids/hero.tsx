// KIDS KIT — original superhero outfits for the Tiny Sparks cast ("Tiny Sparks Heroes").
// 100% our own designs: a cape, a domino mask, a chest emblem and a belt. NEVER copy a real
// franchise's costume, colours-plus-logo combo or emblem (Spider-Man, Batman, Superman, Teen
// Titans…) — trademark claims + YouTube's "Made for Kids" policy on famous characters.
import React from 'react';
import { KINK, kst } from './face';

export type Emblem = 'spark' | 'star' | 'honey' | 'gear' | 'heart' | 'moon';
export type HeroLook = {
  cape: string; // cape colour
  capeIn?: string; // cape lining
  mask?: string; // domino mask colour (omit = no mask)
  emblem: Emblem;
  emblemColor: string; // badge fill
  emblemInk?: string; // symbol colour
  belt?: string;
};

export const EmblemIcon: React.FC<{ kind: Emblem; ink: string }> = ({ kind, ink }) => {
  switch (kind) {
    case 'spark': return <path d="M 8,-30 L -14,4 L 2,4 L -8,30 L 16,-6 L 0,-6 Z" fill={ink} {...kst(3)} />;
    case 'star': return <path d="M 0,-28 L 8,-9 L 28,-8 L 12,5 L 18,26 L 0,14 L -18,26 L -12,5 L -28,-8 L -8,-9 Z" fill={ink} {...kst(3)} />;
    case 'heart': return <path d="M 0,22 C -34,0 -30,-26 -14,-26 C -5,-26 0,-18 0,-13 C 0,-18 5,-26 14,-26 C 30,-26 34,0 0,22 Z" fill={ink} {...kst(3)} />;
    case 'moon': return <path d="M 10,-26 A 26,26 0 1,0 10,26 A 20,20 0 1,1 10,-26 Z" fill={ink} {...kst(3)} />;
    case 'gear': return (
      <g>
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-5} y={-28} width={10} height={14} fill={ink} transform={`rotate(${i * 45})`} />)}
        <circle r={17} fill={ink} {...kst(3)} />
        <circle r={7} fill="#ffffff" />
      </g>
    );
    case 'honey': return (
      <g>
        <path d="M -20,-12 L 20,-12 L 24,22 Q 0,30 -24,22 Z" fill={ink} {...kst(3)} />
        <rect x={-24} y={-22} width={48} height={12} rx={4} fill={ink} {...kst(3)} />
        <path d="M -6,-12 Q -6,2 -2,6" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }
};

// the cape: hangs from the shoulders, behind the body; sways with time + flies up when hopping
export const Cape: React.FC<{ look: HeroLook; frame: number; top: number; bottom: number; half: number; lift?: number }> = ({ look, frame, top, bottom, half, lift = 0 }) => {
  const sway = Math.sin(frame / 9) * 16 + lift * 0.4;
  const hem = bottom - lift * 0.5;
  const d = `M ${-half * 0.55},${top} Q 0,${top - 14} ${half * 0.55},${top} L ${half + sway},${hem} Q ${sway * 0.5 + half * 0.5},${hem + 24} ${sway * 0.3},${hem - 4} Q ${-half * 0.5 + sway * 0.2},${hem + 24} ${-half + sway},${hem} Z`;
  return (
    <g>
      <path d={d} fill={look.cape} {...kst(8)} />
      <path d={`M ${-half * 0.4},${top + 30} Q 0,${top + 18} ${half * 0.4},${top + 30} L ${half * 0.7 + sway},${hem - 30} L ${-half * 0.7 + sway},${hem - 30} Z`} fill={look.capeIn ?? look.cape} opacity={0.45} />
    </g>
  );
};

// domino mask across the eyes (drawn UNDER the eyes so they stay visible)
export const Mask: React.FC<{ color: string; y: number; dx: number; r: number }> = ({ color, y, dx, r }) => (
  <path
    d={`M ${-dx - r * 1.7},${y - r * 0.2} Q ${-dx},${y - r * 1.55} ${-r * 0.2},${y - r * 0.55} Q 0,${y - r * 0.35} ${r * 0.2},${y - r * 0.55} Q ${dx},${y - r * 1.55} ${dx + r * 1.7},${y - r * 0.2} Q ${dx + r * 0.9},${y + r * 1.45} ${r * 0.3},${y + r * 0.55} Q 0,${y + r * 0.75} ${-r * 0.3},${y + r * 0.55} Q ${-dx - r * 0.9},${y + r * 1.45} ${-dx - r * 1.7},${y - r * 0.2} Z`}
    fill={color}
    {...kst(7)}
  />
);

export const ChestBadge: React.FC<{ look: HeroLook; x?: number; y: number; r?: number }> = ({ look, x = 0, y, r = 46 }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill={look.emblemColor} {...kst(7)} />
    <g transform={`scale(${r / 46})`}><EmblemIcon kind={look.emblem} ink={look.emblemInk ?? '#ffffff'} /></g>
  </g>
);

export const Belt: React.FC<{ color: string; y: number; half: number }> = ({ color, y, half }) => (
  <g>
    <rect x={-half} y={y - 14} width={half * 2} height={28} rx={10} fill={color} {...kst(6)} />
    <rect x={-20} y={y - 18} width={40} height={36} rx={8} fill="#ffd166" {...kst(5)} />
  </g>
);
void KINK;
