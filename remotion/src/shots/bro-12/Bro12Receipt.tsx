// BRO THINKS HE'S HIM · EP 12 — "Bro tried to return something without a receipt"
// toon-shorts/bro/ep-12-receipt. Every cue derives from the VO line times (S(i)/E(i)).
// Mini Mart checkout: "I know my rights" · "I am the receipt." · "Never used. Brand new." →
// a BURNT toast pops out (silent) · "It came pre-toasted." · the BANNED poster with his face
// (planted from the first wide) · "That's a fan poster." · he buys a SECOND toaster · bro math
// (1 = mistake, 2 = collection, 3 = museum) · "Receipt?" "...Keep it. I'll be back."
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Toon, faceAt, type ArmPose, type Expr } from '../../lib/toon/rig';
import { BRO, DEE, SERIES, SPEAKER_COLORS, extra } from '../../lib/toon/series/bro';
import { POSTER_AT, Receipt, STORE_COUNTER_Y, Smoke, Store, StoreCounter, Toaster } from '../../lib/toon/sets';
import {
  BroMath,
  Cut,
  DialogueCaptions,
  SignatureStamp,
  Sparkles,
  Stage,
  TitleBar,
  camAt,
  lipSync,
  shakeAt,
  signatureFilter,
  talking,
  useT,
  type CamKey,
} from '../../lib/toon/comedy';
import { EASE_INOUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';

export const compositionConfig = {
  id: 'Bro12Receipt',
  durationInSeconds: 34.8,
  fps: 30,
  width: 1080,
  height: 1920,
};

// PAM — the Mini Mart cashier. Has seen everything, impressed by nothing. Episode extra.
const PAM = extra('pam', {
  skin: '#f1c9a5',
  skinShade: '#d6a57d',
  hair: 'bun',
  hairColor: '#7f5539',
  top: 'shirt',
  topColor: '#2a9d8f',
  topShade: '#1f7a6f',
  pants: '#2b2d42',
  lashes: true,
  bodyW: 0.92,
});
const COLORS = { ...SPEAKER_COLORS, pam: '#ffb4a2' };

// 0 return this, my rights · 1 phone number · 2 rights are easier · 3 receipt? · 4 I am the receipt ·
// 5 trust me · 6 has it been used · 7 never, brand new · 8 pre-toasted · 9 you're banned ·
// 10 fan poster · 11 buy another one · 12 why · 13 mistake / collection · 14 receipt? · 15 keep it ·
// 16 I got this
const S = (i: number) => VO[i].start;
const E = (i: number) => VO[i].end;

const INSERT: [number, number] = [E(7) + 0.25, S(8) - 0.5];
const POP = INSERT[0] + 0.45;
const REVEAL: [number, number] = [E(9) + 0.1, S(10) - 0.05];
const NEW_TOASTER = S(11) + 0.55;
const SIG = E(15) + 0.6;
const TOTAL = compositionConfig.durationInSeconds;

const DEE_AT = { x: 165, y: 1500, s: 0.95 };
const BRO_AT = { x: 430, y: 1490 };
const PAM_AT = { x: 715, y: 1470, s: 0.95 };
const TOASTER_X = 670;
const TOASTER2_X = 830;

const [bfx, bfy] = faceAt(BRO_AT.x, BRO_AT.y);
const [pfx, pfy] = faceAt(PAM_AT.x, PAM_AT.y, PAM_AT.s);
const [dfx, dfy] = faceAt(DEE_AT.x, DEE_AT.y, DEE_AT.s);
const MUG_S = 0.4;
const MUG_Y = POSTER_AT[1] + 12 - faceAt(0, 0, MUG_S)[1];

type F = { z: number; x: number; y: number; rot?: number };
const shot = (t1: number, t2: number, a: F, b: F = a): CamKey[] => [
  { t: t1, ...a, cut: true },
  { t: t2 - 0.01, ...b },
];
const WIDE: F = { z: 1, x: 540, y: 960 };
const BRO_CU: F = { z: 1.75, x: bfx + 30, y: bfy + 90 };
const PAM_CU: F = { z: 1.7, x: pfx + 70, y: pfy + 100 };
const TWO: F = { z: 1.3, x: 590, y: 1010 };
const MATH: F = { z: 1.05, x: bfx + 110, y: bfy + 60 };

const CAM: CamKey[] = [
  ...shot(0, S(1) - 0.05, { ...BRO_CU, z: 1.7 }, { ...BRO_CU, z: 1.8 }),
  ...shot(S(1) - 0.05, S(2) - 0.05, WIDE),
  ...shot(S(2) - 0.05, S(3) - 0.05, BRO_CU),
  ...shot(S(3) - 0.05, S(4) - 0.05, PAM_CU),
  ...shot(S(4) - 0.05, S(5) - 0.1, { z: 1.55, x: bfx + 20, y: bfy + 160 }),
  ...shot(S(5) - 0.1, S(6) - 0.05, { z: 1.62, x: bfx, y: bfy + 170 }, { z: 1.7, x: bfx, y: bfy + 170 }),
  ...shot(S(6) - 0.05, INSERT[0], TWO, { ...TWO, z: 1.36 }),
  ...shot(INSERT[0], INSERT[1], { z: 1.8, x: TOASTER_X + 30, y: 1040 }, { z: 1.9, x: TOASTER_X + 30, y: 1040 }),
  ...shot(INSERT[1], S(9) - 0.05, { z: 1.85, x: bfx + 40, y: bfy + 80 }, { z: 1.95, x: bfx + 40, y: bfy + 80 }),
  ...shot(S(9) - 0.05, REVEAL[0], { z: 1.4, x: pfx + 120, y: pfy + 140 }),
  ...shot(REVEAL[0], REVEAL[1], { z: 2.5, x: POSTER_AT[0] - 30, y: POSTER_AT[1] + 30 }, { z: 2.7, x: POSTER_AT[0] - 30, y: POSTER_AT[1] + 30 }),
  ...shot(REVEAL[1], S(11) - 0.1, { z: 1.9, x: bfx + 40, y: bfy + 80 }),
  ...shot(S(11) - 0.1, S(12) - 0.05, TWO),
  ...shot(S(12) - 0.05, S(13) - 0.05, { z: 1.8, x: dfx + 60, y: dfy + 90 }),
  ...shot(S(13) - 0.05, S(14) - 0.1, MATH, { ...MATH, z: 1.09 }),
  ...shot(S(14) - 0.1, S(15) - 0.05, { z: 1.45, x: pfx - 40, y: pfy + 190 }),
  ...shot(S(15) - 0.05, SIG, { ...BRO_CU, z: 1.65 }, { ...BRO_CU, z: 1.72 }),
  { t: SIG, z: 1.6, x: bfx, y: bfy + 160, cut: true },
  { t: SIG + 0.9, z: 1.85, x: bfx, y: bfy + 120 },
  { t: TOTAL, z: 1.95, x: bfx, y: bfy + 120 },
];

// the toast: down, then POP (overshoot), then it settles half out
const toastPop = (t: number) => {
  if (t < POP) return 0;
  const p = prog(t, POP, POP + 0.5);
  return 140 * Math.min(1, p * 3.2) + 70 * Math.sin(Math.min(1, p) * Math.PI) - 25 * EASE_INOUT(p);
};

export default function Bro12Receipt() {
  const t = useT();
  const cam = camAt(t, CAM);
  const shake = [shakeAt(t, S(5) - 0.1, 16), shakeAt(t, POP, 10), shakeAt(t, REVEAL[0], 18), shakeAt(t, INSERT[1], 8)].reduce(
    (a, b) => [a[0] + b[0], a[1] + b[1]] as [number, number],
    [0, 0] as [number, number],
  );
  const smoke = t < POP || t > S(9) ? 0 : 0.7 * (1 - prog(t, S(8), S(9)));

  const bp =
    t < S(1) - 0.05 ? 'rights'
    : t < S(2) - 0.05 ? 'phone'
    : t < S(3) - 0.05 ? 'easier'
    : t < S(4) - 0.05 ? 'receipt'
    : t < S(5) - 0.1 ? 'iam'
    : t < S(6) - 0.05 ? 'catch'
    : t < INSERT[1] ? 'used'
    : t < S(9) - 0.05 ? 'pretoast'
    : t < REVEAL[1] ? 'banned'
    : t < S(11) - 0.1 ? 'fan'
    : t < S(12) - 0.05 ? 'another'
    : t < S(13) - 0.05 ? 'why'
    : t < S(14) - 0.1 ? 'math'
    : t < S(15) - 0.05 ? 'receipt2'
    : t < SIG ? 'keep'
    : 'sig';

  const onToaster: ArmPose = { to: [-(TOASTER_X - (BRO_AT.x + 108) - 20), STORE_COUNTER_Y - 150 - (BRO_AT.y - 590)] };
  const broExpr: Expr =
    bp === 'sig' || bp === 'pretoast' || bp === 'fan' ? 'deadpan'
    : bp === 'phone' || bp === 'banned' ? 'shock'
    : bp === 'catch' || bp === 'iam' || bp === 'math' ? 'confident'
    : 'smug';
  const broArmR: ArmPose =
    bp === 'rights' || (bp === 'used' && t < INSERT[0]) ? onToaster
    : bp === 'catch' ? 'gun'
    : bp === 'math' || bp === 'another' ? 'present'
    : bp === 'keep' ? 'gun'
    : bp === 'sig' || (bp === 'used' && t >= INSERT[0]) ? 'cross'
    : 'hip';
  const broArmL: ArmPose = bp === 'iam' ? 'thumb' : bp === 'used' && t >= INSERT[0] ? 'cross' : bp === 'math' ? 'point-up' : bp === 'easier' ? 'point-up' : bp === 'sig' ? 'cross' : 'hip';

  const pamArmR: ArmPose = bp === 'banned' && t < REVEAL[0] ? { to: [-70, -170] } : bp === 'receipt2' ? { to: [-80, -60] } : 'down';
  const pamArmL: ArmPose = bp === 'another' && t < NEW_TOASTER + 0.4 ? { to: [-40, 120] } : 'down';
  const toaster2X = TOASTER2_X + 60 * (1 - EASE_INOUT(prog(t, NEW_TOASTER - 0.2, NEW_TOASTER + 0.3)));

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Stage cam={cam} shake={shake} filter={signatureFilter(t, SIG)}>
        <Store
          wanted={<Toon spec={BRO} x={POSTER_AT[0]} y={MUG_Y} scale={MUG_S} expr="smug" shadow={false} />}
          banned={['BANNED', 'DO NOT SERVE', 'THIS MAN']}
        />
        <Toon
          spec={PAM}
          x={PAM_AT.x}
          y={PAM_AT.y}
          scale={PAM_AT.s}
          expr={bp === 'banned' || bp === 'receipt2' ? 'deadpan' : 'annoyed'}
          look={bp === 'banned' ? [0.8, -0.4] : [-0.8, 0]}
          mouth={lipSync(VO, 'pam', t)}
          armL={pamArmL}
          armR={pamArmR}
          handR={bp === 'banned' && t < REVEAL[0] ? 'point' : undefined}
          holdR={bp === 'receipt2' ? <Receipt len={260} /> : undefined}
          shadow={false}
        />
        <StoreCounter />
        <Toaster x={TOASTER_X} y={STORE_COUNTER_Y} pop={toastPop(t)} burnt={0.8} />
        {t >= NEW_TOASTER - 0.2 && <Toaster x={toaster2X} y={STORE_COUNTER_Y} toast={false} />}
        <Smoke x={TOASTER_X - 30} y={STORE_COUNTER_Y - 200} t={t} amount={smoke * 0.5} />
        <Toon
          spec={DEE}
          x={DEE_AT.x}
          y={DEE_AT.y}
          scale={DEE_AT.s}
          expr={bp === 'why' ? 'shock' : bp === 'fan' || bp === 'pretoast' ? 'side-eye' : 'annoyed'}
          look={[0.8, 0]}
          mouth={lipSync(VO, 'dee', t)}
          armL={bp === 'why' ? 'shrug' : 'cross'}
          armR={bp === 'why' ? 'shrug' : talking(VO, 'dee', t) ? 'point' : 'cross'}
        />
        <Toon
          spec={BRO}
          x={BRO_AT.x}
          y={BRO_AT.y}
          expr={broExpr}
          look={bp === 'phone' || bp === 'why' ? [-0.8, 0] : bp === 'banned' ? [0.9, -0.3] : bp === 'sig' || bp === 'pretoast' || bp === 'fan' || bp === 'catch' ? [0, 0] : [0.8, 0]}
          mouth={lipSync(VO, 'bro', t)}
          armL={broArmL}
          armR={broArmR}
          tilt={bp === 'iam' ? -4 : bp === 'math' ? 4 : 0}
          sweat={bp === 'banned'}
        />
        <BroMath
          x={bfx}
          y={bfy}
          t={t}
          to={S(14) - 0.1}
          size={56}
          lines={[
            { text: '1 = MISTAKE', dx: -30, dy: -300, at: S(13) + 0.2, rot: -5 },
            { text: '2 = COLLECTION', dx: 300, dy: -255, at: S(13) + 1.7, rot: 4 },
            { text: '3 = MUSEUM', dx: 20, dy: 250, at: S(13) + 3.1, rot: -3, color: '#ffd23f' },
          ]}
        />
        <Sparkles x={bfx + 40} y={bfy - 20} t={t} at={S(5) + 0.5} spread={190} />
        <Sparkles x={TOASTER2_X} y={STORE_COUNTER_Y - 80} t={t} at={NEW_TOASTER + 0.2} spread={120} />
      </Stage>
      <Cut from={0} to={SIG}>
        <TitleBar title="Bro tried to return a toaster" series={SERIES.name} ep={12} accent={SERIES.accent} />
      </Cut>
      <SignatureStamp at={SIG} stampAt={S(16) + 0.25} text="I GOT THIS." accent={SERIES.accent} />
      {t < SIG && <DialogueCaptions lines={VO} colors={COLORS} y={1385} />}
    </AbsoluteFill>
  );
}
