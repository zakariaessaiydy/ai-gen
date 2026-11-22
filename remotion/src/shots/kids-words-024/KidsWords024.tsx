// TINY SPARKS · Day 24 · 🔤 English/French Words #4 — "Family Members in English and French" (Short 9:16)
// kids-shorts/tiny-sparks/words/day-024-family-members-english-french. Line indices from plan.gen.ts.
// First episode with the TINY SPARKS HEROES outfits (Spark Girl + Super Bobo host).
// Word loop (PACING rule): the family member pops on a word card with a heart splash → Mila "Mom." · "Mom!"
// → YOUR TURN pause → French "Maman." · "Maman !" (FR word added on the card) → a tiny sentence.
// Recap: the 6 family cards in a 3×2 grid, lit as they are said, EN then FR. Goodbye hug.
import React from 'react';
import { Kid, type KidSpec } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, CAPTION_COLORS, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, FONT_TOON, KidsCaptions, KidsStage, PopText, TitleCard, WordCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords } from '../../lib/shorts';
import { VO } from './vo.gen';
import { PLAN } from './plan.gen';

export const compositionConfig = { id: 'KidsWords024', durationInSeconds: 113.0, fps: 30, width: 1080, height: 1920 };

const W = 1080;
const H = 1920;
const f = FLOOR(H);
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;
const COLORS = { ...CAPTION_COLORS, narrator_fr: '#4cc9f0' };
const CL = PLAN.colors;
const FR_SHOW: Record<string, string> = { 'la soeur': 'la sœur' };
const fr = (s: string) => FR_SHOW[s] ?? s;
const segStart = (k: number) => S(CL[k].en1) - 0.8;
const segEnd = (k: number) => E(CL[k].say) + 1.2;
const RECAP0 = S(PLAN.recapEn[0]) - 2.4;
const BYE0 = S(PLAN.bye) - 0.4;

// the family, drawn with the Kid rig (grown-ups = bigger scale + grown-up hair/clothes)
const FAM: Record<string, { spec: KidSpec; s: number }> = {
  mom: { spec: { id: 'mom', skin: '#c98b62', hair: 'ponytail', hairColor: '#3b2219', top: 'dress', topColor: '#ff6fa5', topColor2: '#ffffff', pants: '#c98b62', shoes: '#ff595e', lashes: true }, s: 0.5 },
  dad: { spec: { id: 'dad', skin: '#c98b62', hair: 'short', hairColor: '#2b1a12', top: 'tee', topColor: '#1982c4', pants: '#2b2d42', shoes: '#6b4226' }, s: 0.52 },
  sister: { spec: { id: 'sister', skin: '#f6d0b1', hair: 'bob', hairColor: '#e0a458', top: 'dress', topColor: '#ffca3a', topColor2: '#ffffff', pants: '#f6d0b1', shoes: '#8ac926', lashes: true, freckles: true }, s: 0.4 },
  brother: { spec: { id: 'brother', skin: '#8d5a3b', hair: 'spiky', hairColor: '#1a1010', top: 'stripes', topColor: '#8ac926', topColor2: '#ffffff', pants: '#3a5a8c', shoes: '#ff924c' }, s: 0.4 },
  grandma: { spec: { id: 'grandma', skin: '#f6d0b1', hair: 'bob', hairColor: '#d9d9e3', top: 'dress', topColor: '#b8a1e3', topColor2: '#ffffff', pants: '#f6d0b1', shoes: '#6a4c93', glasses: true, lashes: true }, s: 0.48 },
  grandpa: { spec: { id: 'grandpa', skin: '#c98b62', hair: 'short', hairColor: '#e9ecef', top: 'overalls', topColor: '#ffffff', topColor2: '#ff924c', pants: '#ff924c', shoes: '#6b4226', glasses: true }, s: 0.5 },
};
const Person: React.FC<{ kind: string; t: number; happy?: boolean; s?: number }> = ({ kind, happy, s = 1 }) => {
  const m = FAM[kind];
  return <Kid spec={m.spec} x={0} y={0} scale={m.s * s} expr={happy ? 'laugh' : 'happy'} armL={happy ? 'wave' : 'down'} armR="hip" shadow={false} />;
};

const Heart: React.FC<{ c: string; s: number }> = ({ c, s }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0,320 C -460,40 -390,-330 -170,-330 C -60,-330 0,-230 0,-170 C 0,-230 60,-330 170,-330 C 390,-330 460,40 0,320 Z" fill={c} opacity={0.85} {...kst(8)} />
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsWords024() {
  const t = useT();
  const cam = camAt(t, CAM);
  const k = CL.findIndex((_, i) => t >= segStart(i) && t < segEnd(i));
  const recap = t >= RECAP0 && t < BYE0;
  const bye = t >= BYE0;
  const c = k >= 0 ? CL[k] : null;
  const yourTurn = c ? t >= E(c.en2) + 0.2 && t < S(c.fr1) - 0.1 : false;
  const milaTalks = VO.some((l) => l.speaker === 'mila' && t >= l.start && t < l.end);
  const boboTalks = VO.some((l) => l.speaker === 'bobo' && t >= l.start && t < l.end);

  const said = (lines: readonly number[], name: (i: number) => string) => {
    for (let r = lines.length - 1; r >= 0; r--) {
      const li = lines[r];
      if (t < S(li)) continue;
      if (t > E(li) + 0.6) return -1;
      const w = timeWords(VO[li]);
      let wi = li === PLAN.recapFr[0] || li === PLAN.recapEn[0] ? 0 : 0;
      let item = -1;
      for (let n = 0; n < 3 && wi < w.length; n++) {
        if (t >= w[wi].start) item = r * 3 + n;
        wi += name(r * 3 + n).split(' ').length;
      }
      return item;
    }
    return -1;
  };
  const enItem = recap ? said(PLAN.recapEn, (i) => CL[i].en) : -1;
  const frItem = recap ? said(PLAN.recapFr, (i) => CL[i].fr) : -1;
  const frStarted = t >= S(PLAN.recapFr[0]) - 0.2;

  return (
    <>
      <KidsStage cam={cam}>
        <Meadow w={W} h={H} t={t} />
        {/* the family-member card on a heart */}
        {c && (
          <g>
            <g transform={`translate(${W / 2},640)`}>
              <Heart c={c.hex} s={EASE_OUT(prog(t, segStart(k), segStart(k) + 0.5)) * (1 - prog(t, segEnd(k) - 0.4, segEnd(k)))} />
            </g>
            <WordCard t={t} at={segStart(k) + 0.2} until={segEnd(k)} x={W / 2} y={640} w={600} word={c.en} word2={t >= S(c.fr1) ? fr(c.fr) : undefined} color={c.hex}>
              <g transform="translate(0,180)"><Person kind={c.obj} t={t} happy={t >= S(c.say)} s={1.15} /></g>
            </WordCard>
          </g>
        )}
        {/* recap grid: the 6 family members, lit as they are said */}
        {recap &&
          CL.map((cc, i) => {
            const x = 210 + (i % 3) * 330;
            const y = 340 + Math.floor(i / 3) * 385;
            const on = frStarted ? i === frItem : i === enItem;
            const s = EASE_OUT(prog(t, RECAP0 + i * 0.08, RECAP0 + i * 0.08 + 0.3)) * (on ? 1.12 : 1);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <rect x={-150} y={-180} width={300} height={370} rx={34} fill={on ? '#fff3b0' : '#ffffff'} {...kst(on ? 9 : 6)} />
                <g transform="translate(0,90) scale(0.8)"><Person kind={cc.obj} t={t} happy={on} /></g>
                <text y={140} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>{cc.en}</text>
                {frStarted && (frItem >= i || t > E(PLAN.recapFr[1])) && (
                  <text y={178} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={34} fill="#1982c4">{fr(cc.fr)}</text>
                )}
              </g>
            );
          })}
        <Kid spec={MILA_HERO} x={200} y={f} scale={0.66} expr={bye ? 'laugh' : yourTurn ? 'smile' : 'happy'} look={bye || yourTurn ? [0, 0] : [0.5, -0.5]}
          mouth={lipSync(VO, 'mila', t)} armR={bye ? 'hug' : c && t < E(c.en2) ? 'point' : milaTalks ? 'present' : 'down'} armL={bye ? 'hug' : 'hip'} />
        <Critter spec={BOBO_HERO} x={880} y={f} scale={0.6} expr={boboTalks || bye ? 'laugh' : 'smile'} look={yourTurn ? [0, 0] : [-0.5, -0.5]}
          mouth={lipSync(VO, 'bobo', t)} armL={bye ? 'hug' : boboTalks ? 'up' : 'down'} armR={bye ? 'hug' : 'down'}
          hop={boboTalks ? Math.abs(Math.sin(t * 8)) * 20 : 0} />
      </KidsStage>
      <TitleCard t={t} from={0} to={1.4} title="MY FAMILY" sub="in English & French" />
      {c && yourTurn && <PopText t={t} at={E(c.en2) + 0.2} text="YOUR TURN!" y={200} size={110} color="#ffca3a" />}
      <Confetti t={t} at={BYE0} x={W / 2} y={600} />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
