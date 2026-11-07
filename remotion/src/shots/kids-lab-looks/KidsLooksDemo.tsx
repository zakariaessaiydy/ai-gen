// TINY SPARKS · LOOKS TEST (lab, 16:9) — side-by-side for the user: four painted places split in two.
// LEFT = the everyday cast with no scene light. RIGHT = the kit's SCENE LIGHT (<PlaceLight>, places.tsx)
// + the WARDROBE (dress(), cast/wardrobe.tsx). Now runs on the real kit — the reference for episodes.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { dress, Umbrella, type Outfit, type Who } from '../../lib/kids/cast/wardrobe';
import { Backdrop, PlaceLight, standY, type Place } from '../../lib/kids/places';
import { FONT_TOON } from '../../lib/kids/kit';
import { K3DDefs } from '../../lib/kids/depth';
import { KINK, type KExpr } from '../../lib/kids/face';

export const compositionConfig = { id: 'KidsLooksDemo', durationInSeconds: 18, fps: 30, width: 1920, height: 1080 };

const PW = 960;
const H = 1080;
const SCENE_S = 4.5;
const SC = 0.66;

// ── the four scenes ──────────────────────────────────────────────────────────────────────────────
type Actor = { who: Who; x: number; expr?: KExpr; arm?: 'wave' | 'hold'; umbrella?: boolean };
type Scene = { title: string; place: Place; outfit: Outfit; actors: Actor[] };

const SCENES: Scene[] = [
  { title: 'Bedtime', place: 'bedroom', outfit: 'pajamas', actors: [{ who: 'mila', x: 290 }, { who: 'leo', x: 650, expr: 'sleepy' }] },
  { title: 'Rainy day', place: 'rainy-street', outfit: 'rain', actors: [{ who: 'leo', x: 300, expr: 'happy', arm: 'wave' }, { who: 'bobo', x: 660, arm: 'hold', umbrella: true }] },
  { title: 'Beach day', place: 'beach', outfit: 'beach', actors: [{ who: 'mila', x: 300, expr: 'happy', arm: 'wave' }, { who: 'bobo', x: 660, expr: 'laugh' }] },
  { title: 'Cooking', place: 'kitchen', outfit: 'chef', actors: [{ who: 'leo', x: 330, expr: 'happy' }, { who: 'hoot', x: 600, arm: 'wave' }] },
];

const Half: React.FC<{ scene: Scene; better: boolean; t: number }> = ({ scene, better, t }) => {
  const outfit: Outfit = better ? scene.outfit : 'everyday';
  const actors = scene.actors.map((a, i) => {
    if (a.who === 'mila' || a.who === 'leo') {
      const d = dress(a.who, outfit);
      return <Kid key={i} spec={d.spec} wear={d.wear} x={a.x} y={standY(scene.place, a.x, PW, H, { halfW: 150 * SC })} scale={SC} expr={a.expr} armR={a.arm} />;
    }
    const d = dress(a.who, outfit);
    const umb = better && a.umbrella;
    return (
      <Critter key={i} spec={d.spec} wear={d.wear} x={a.x} y={standY(scene.place, a.x, PW, H, { halfW: 140 * SC })} scale={SC} expr={a.expr}
        armL={a.arm === 'wave' ? 'wave' : 'down'} armR={umb ? 'hold' : 'down'} holdR={umb ? <Umbrella /> : undefined} />
    );
  });
  return (
    <g>
      <Backdrop place={scene.place} w={PW} h={H} t={t} />
      <PlaceLight place={scene.place} on={better}>{actors}</PlaceLight>
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
