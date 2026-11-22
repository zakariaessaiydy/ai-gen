// TINY SPARKS · ACTING + DETAIL TEST (lab, 16:9) — side-by-side for the user (options 3 + 4 of "how to
// enhance the characters"): the same voiced kitchen scene twice (Kokoro voices, the locked cast).
// LEFT = today: lipSync (the mouth only opens and shuts) and the nearest existing poses.
// RIGHT = 4. ACTING — speechAt (lips shaped by the sounds: ah / ee / oh / oo / m-b-p / f-v), brows that lift
//         with the voice, new poses (thumbs up, hands on cheeks, hands over the mouth, pumping cheer)
//         + 3. DETAIL POLISH — thumbs on the hands, hair strands, collars + cuffs, shoe laces, hems,
//         a fur tuft, toes, scarf knit + fringe.
// Both sides share the approved kit (smooth timelines, scene light, feet on the floor).
// kids-shorts/tiny-sparks/lab/acting-demo (beats.json → voice via gen_voice --engine kokoro).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Kid, type KArm } from '../../lib/kids/kid';
import { Critter, type CArm } from '../../lib/kids/critter';
import { BOBO, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { Backdrop, PlaceLight, standY } from '../../lib/kids/places';
import { FONT_TOON, lipSync } from '../../lib/kids/kit';
import { K3DDefs } from '../../lib/kids/depth';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { exprAt, poseAt, type Keys } from '../../lib/kids/smooth';
import { speechAt } from '../../lib/kids/acting';
import { hopAt } from '../../lib/kids/energy';
import { VO } from './vo.gen';

export const compositionConfig = { id: 'KidsActingDemo', durationInSeconds: 16.5, fps: 30, width: 1920, height: 1080 };

const PW = 960;
const H = 1080;
const PLACE = 'kitchen' as const;
const SK = 0.5; // kids
const SC = 0.56; // Bobo

// ── the scene's timeline (from the VO line starts)
const MILA_R: Keys<KArm> = [[0, 'down'], [0.5, 'wave'], [1.7, 'present'], [3.0, 'down'], [9.4, 'cheeks'], [11.8, 'down'], [13.1, 'cover']];
const MILA_L: Keys<KArm> = [[0, 'hold'], [13.1, 'cover']];
const MILA_E: Keys<KExpr> = [[0, 'smile'], [0.5, 'happy'], [3.0, 'smile'], [9.4, 'surprised'], [11.6, 'oops'], [13.1, 'laugh']];
const LEO_R: Keys<KArm> = [[0, 'down'], [3.3, 'wave'], [4.4, 'thumbs'], [6.0, 'down'], [13.1, 'cover']];
const LEO_L: Keys<KArm> = [[0, 'down'], [13.1, 'cover']];
const LEO_E: Keys<KExpr> = [[0, 'smile'], [3.3, 'wow'], [4.2, 'happy'], [6.0, 'smile'], [9.4, 'surprised'], [13.1, 'laugh']];
const BOBO_A: Keys<CArm> = [[0, 'down'], [6.2, 'cheeks'], [8.6, 'down'], [12.2, 'cheeks'], [13.4, 'cheer'], [15.4, 'down']];
const BOBO_E: Keys<KExpr> = [[0, 'smile'], [6.2, 'happy'], [8.6, 'smile'], [9.4, 'oops'], [13.4, 'laugh']];
const BOBO_HOP = [13.5, 14.2];
const CAKE_GONE = 9.4;

// today's nearest pose for each new acting pose
const OLD_K: Partial<Record<string, KArm>> = { thumbs: 'present', cheeks: 'think', cover: 'hold', cheer: 'up' };
const OLD_C: Partial<Record<string, CArm>> = { cheeks: 'think', cheer: 'up' };
const oldKeys = <T,>(keys: Keys<T>, map: Partial<Record<string, T>>): Keys<T> =>
  keys.map(([t, v]) => [t, typeof v === 'string' && map[v] !== undefined ? (map[v] as T) : v]);

const Cake: React.FC<{ gone: boolean }> = ({ gone }) => (
  <g transform="translate(0,-36) scale(1.15)">
    <ellipse cx={0} cy={30} rx={92} ry={20} fill="#ffffff" {...kst(6)} />
    {gone ? (
      <g fill="#c98a5e">
        {[[-30, 24], [10, 28], [34, 22], [-6, 20]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} />)}
      </g>
    ) : (
      <g>
        <rect x={-62} y={-30} width={124} height={56} rx={14} fill="#ffb3c6" {...kst(6)} />
        <rect x={-48} y={-74} width={96} height={48} rx={14} fill="#fff1e6" {...kst(6)} />
        <path d="M -62,-10 Q -40,4 -20,-10 Q 0,4 20,-10 Q 40,4 62,-10" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />
        <circle cx={0} cy={-86} r={14} fill="#ff595e" {...kst(5)} />
      </g>
    )}
  </g>
);

const Half: React.FC<{ better: boolean; t: number }> = ({ better, t }) => {
  const mouth = (who: string) => (better ? speechAt(VO, who, t) : { mouth: lipSync(VO, who, t), viseme: undefined });
  const k = <T,>(keys: Keys<T>, map: Partial<Record<string, T>>) => poseAt(t, better ? keys : oldKeys(keys, map));
  const m = mouth('mila');
  const l = mouth('leo');
  const b = mouth('bobo');
  const bh = hopAt(t, BOBO_HOP, { h: 90 });
  const xs = { mila: 230, leo: 470, bobo: 720 };
  return (
    <g>
      <Backdrop place={PLACE} w={PW} h={H} t={t} />
      <PlaceLight place={PLACE}>
        <Critter
          spec={BOBO} x={xs.bobo} y={standY(PLACE, xs.bobo, PW, H, { halfW: 140 * SC })} scale={SC}
          expr={exprAt(t, BOBO_E)} mouth={b.mouth} viseme={b.viseme} acting={better} polish={better}
          armL={k(BOBO_A, OLD_C)} armR={k(BOBO_A, OLD_C)} hop={bh.hop} squash={bh.squash}
        />
        <Kid
          spec={LEO} x={xs.leo} y={standY(PLACE, xs.leo, PW, H, { halfW: 150 * SK })} scale={SK}
          expr={exprAt(t, LEO_E)} mouth={l.mouth} viseme={l.viseme} acting={better} polish={better}
          armR={k(LEO_R, OLD_K)} armL={k(LEO_L, OLD_K)}
        />
        <Kid
          spec={MILA} x={xs.mila} y={standY(PLACE, xs.mila, PW, H, { halfW: 150 * SK })} scale={SK}
          expr={exprAt(t, MILA_E)} mouth={m.mouth} viseme={m.viseme} acting={better} polish={better}
          armR={k(MILA_R, OLD_K)} armL={k(MILA_L, OLD_K)}
          holdL={t < 13.1 ? <Cake gone={t >= CAKE_GONE} /> : undefined}
        />
      </PlaceLight>
      <g>
        <rect x={PW / 2 - 300} y={30} width={600} height={86} rx={43} fill={better ? '#8ac926' : '#ffffff'} stroke={KINK} strokeWidth={6} />
        <text x={PW / 2} y={90} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>
          {better ? 'NEW · acting + details' : 'TODAY'}
        </text>
      </g>
    </g>
  );
};

export default function KidsActingDemo() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: '#fff8e7' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <K3DDefs />
        <svg x={0} y={0} width={PW} height={H} viewBox={`0 0 ${PW} ${H}`} overflow="hidden">
          <Half better={false} t={t} />
        </svg>
        <svg x={PW} y={0} width={PW} height={H} viewBox={`0 0 ${PW} ${H}`} overflow="hidden">
          <Half better t={t} />
        </svg>
        <rect x={PW - 5} y={0} width={10} height={H} fill={KINK} />
      </svg>
    </AbsoluteFill>
  );
}
