// KIDS KIT reference/QA composition: every teaching overlay in one 12 s Short. Not an episode —
// frame it with frames.mjs when the kit changes (0.5 → captions, 2.5 → count, 5 → timer,
// 7 → word card + answer, 9.5 → sing-along, 11 → confetti).
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, HOOT, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { AnswerMark, Apple, Confetti, CountRow, KidsCaptions, KidsStage, PopText, SingAlong, ThinkTimer, WordCard, camAt, useT } from '../../lib/kids/kit';
import type { VoLine } from '../../lib/shorts';

export const compositionConfig = { id: 'KidsKitDemo', durationInSeconds: 12, fps: 30, width: 1080, height: 1920 };

const VO: VoLine[] = [{ speaker: 'mila', text: 'How many apples can you count?', start: 0.2, end: 1.9 }];
const SONG: VoLine[] = [
  { speaker: 'mila', text: 'One two three four five', start: 9, end: 11, words: [
    { w: 'One', start: 9, end: 9.4 }, { w: 'two', start: 9.4, end: 9.8 }, { w: 'three', start: 9.8, end: 10.2 }, { w: 'four', start: 10.2, end: 10.6 }, { w: 'five', start: 10.6, end: 11 }] },
];
const f = FLOOR(1920);

export default function KidsKitDemo() {
  const t = useT();
  const cam = camAt(t, [{ t: 0, z: 1, x: 540, y: 960 }]);
  const counting = t >= 2 && t < 4.5;
  return (
    <>
      <KidsStage cam={cam}>
        <Meadow t={t} />
        <Kid spec={MILA} x={250} y={f} expr={t < 2 ? 'happy' : 'wow'} armL={counting ? 'count' : 'wave'} fingersL={counting ? Math.min(5, Math.floor((t - 2) / 0.4) + 1) : 0} mouth={t < 1.9 ? 0.6 * Math.abs(Math.sin(t * 12)) : 0} />
        <Kid spec={LEO} x={830} y={f} scale={0.9} expr={t >= 5 && t < 7 ? 'think' : 'smile'} armR={t >= 5 && t < 7 ? 'think' : 'clap'} />
        <Critter spec={BOBO} x={540} y={f + 120} scale={0.8} expr="laugh" armL="up" armR="up" hop={Math.abs(Math.sin(t * 4)) * 30} />
        {counting && <CountRow t={t} times={[2, 2.4, 2.8, 3.2, 3.6]} item={() => <Apple />} x={540} y={760} gap={180} />}
        <WordCard t={t} at={6.8} until={9} x={540} y={760} word="apple" word2="la pomme">
          <g transform="scale(1.6)"><Apple /></g>
        </WordCard>
        <AnswerMark t={t} at={7.8} until={9} ok x={800} y={480} />
        <Critter spec={HOOT} x={940} y={f - 380} scale={0.45} expr="smile" armL="point" />
      </KidsStage>
      <PopText t={t} at={4} until={4.6} text="5" />
      <ThinkTimer t={t} from={4.6} to={6.8} />
      <KidsCaptions lines={VO} t={t} colors={CAPTION_COLORS} />
      <SingAlong t={t} lines={SONG} />
      <Confetti t={t} at={10.8} />
    </>
  );
}
