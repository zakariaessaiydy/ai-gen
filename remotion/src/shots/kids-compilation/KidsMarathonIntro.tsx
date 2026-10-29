// TINY SPARKS · the MARATHON intro (16:9, 9 s): the channel ident on the jingle (0–3.7 s), then the whole cast waves on
// the Meadow under "TINY SPARKS · KIDS CARTOON MARATHON" + "22 episodes · 1.5 hours", confetti, and a star iris that
// opens on the first episode. Used by the compilation of every long 16:9 episode (kids-shorts/tiny-sparks/compilations).
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO_HERO, HOOT_HERO, LEO_HERO, MILA_HERO } from '../../lib/kids/cast/tiny-sparks';
import { FLOOR, Meadow } from '../../lib/kids/sets';
import { Confetti, PopText, useT } from '../../lib/kids/kit';
import { ActionStage, INTRO_S, SparksIntro, StarWipe, directorCam, hopAt, type Shot } from '../../lib/kids/energy';

export const compositionConfig = { id: 'KidsMarathonIntro', durationInSeconds: 9, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
const T0 = INTRO_S; // the cast scene starts as the ident ends
const SHOTS: Shot[] = [
  { t: 0, z: 1.0, x: 960, y: 540, move: 'cut' },
  { t: T0, z: 1.12, x: 960, y: 600, move: 'cut', push: 0.012 },
];

export default function KidsMarathonIntro() {
  const t = useT();
  const cam = directorCam(t, SHOTS, [T0 + 0.6]);
  const hop = (k: number) => hopAt(t, [T0 + 0.5 + k * 0.15, T0 + 2.6 + k * 0.15], { h: 70, air: 0.36, pre: 0.06, land: 0.2 });
  return (
    <>
      <ActionStage cam={cam} blur={cam.blur}>
        <Meadow w={W} h={H} t={t} />
        {t >= T0 && (
          <g>
            <Critter spec={HOOT_HERO} x={330} y={f} scale={0.6} expr="happy" armL="wave" armR="up" hop={hop(0).hop} squash={hop(0).squash} look={[0.4, -0.3]} />
            <Kid spec={MILA_HERO} x={760} y={f} scale={0.66} expr="laugh" armL="wave" armR="up" hop={hop(1).hop} squash={hop(1).squash} look={[0.1, -0.3]} />
            <Kid spec={LEO_HERO} x={1160} y={f} scale={0.66} expr="laugh" armL="up" armR="wave" hop={hop(2).hop} squash={hop(2).squash} look={[-0.1, -0.3]} />
            <Critter spec={BOBO_HERO} x={1590} y={f} scale={0.64} expr="laugh" armL="up" armR="wave" hop={hop(3).hop} squash={hop(3).squash} look={[-0.4, -0.3]} />
          </g>
        )}
      </ActionStage>
      <PopText t={t} at={T0 + 0.25} text="KIDS CARTOON MARATHON!" y={170} size={120} color="#ffca3a" />
      <PopText t={t} at={T0 + 0.9} text="22 episodes · 1.5 hours of fun" y={300} size={66} color="#ffffff" rot={2} />
      <Confetti t={t} at={T0 + 0.6} y={300} />
      <SparksIntro t={t} at={0} cast={{ kids: [MILA_HERO, LEO_HERO], buddy: BOBO_HERO }} />
      <StarWipe t={t} at={8.2} dur={0.4} hold={1} color="#3b2a4a" />
    </>
  );
}
