// TINY SPARKS HEROES — model sheet: the cast in their original superhero outfits (16:9 still).
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { FONT_TOON, KidsStage, useT } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';

export const compositionConfig = { id: 'KidsHeroesSheet', durationInSeconds: 2, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const Name: React.FC<{ x: number; text: string }> = ({ x, text }) => (
  <text x={x} y={f + 110} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={52} fill="#ffffff" stroke={KINK} strokeWidth={8} paintOrder="stroke">{text}</text>
);

export default function KidsHeroesSheet() {
  const t = useT();
  return (
    <KidsStage cam={{ z: 1, x: W / 2, y: H / 2, rot: 0 }}>
      <Meadow w={W} h={H} t={t} />
      <text x={W / 2} y={120} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={96} fill="#ffca3a" stroke={KINK} strokeWidth={10} paintOrder="stroke">TINY SPARKS HEROES</text>
      <Kid spec={MILA_HERO} x={330} y={f} scale={0.8} expr="wow" armL="hip" armR="up" />
      <Kid spec={LEO_HERO} x={780} y={f} scale={0.8} expr="laugh" armL="up" armR="hip" />
      <Critter spec={BOBO_HERO} x={1200} y={f} scale={0.72} expr="smile" armL="up" armR="down" />
      <Critter spec={HOOT_HERO} x={1600} y={f} scale={0.66} expr="happy" armL="down" armR="point" />
      <Name x={330} text="SPARK GIRL" />
      <Name x={780} text="CAPTAIN LEO" />
      <Name x={1200} text="SUPER BOBO" />
      <Name x={1600} text="PROFESSOR HOOT" />
    </KidsStage>
  );
}
