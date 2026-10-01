import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import {
  Cotyledons,
  D2R,
  Damp,
  GROW_COLORS,
  GROW_GEOM,
  Ground,
  Leaf,
  MassLedger,
  Motes,
  NeedChips,
  Rain,
  RootSystem,
  Seed,
  SeedCutaway,
  Spot,
  StageWord,
  Stem,
  SunGlow,
  clamp01,
  growRootSystem,
  growShoot,
  tipOf,
  tropism,
} from '../../lib/grow';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short14Seed',
  durationInSeconds: 42.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = GROW_COLORS.accent;
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const END = F(42.5); // 1275
const G = GROW_GEOM;

// =============================================================================
// THE PLANT — solved once, at module level.
//
// Every organ below is lib/grow.tsx's ONE integrator under Sachs' sine law. The root system
// and the upside-down demo share k = 0.22, the same wander and the same seed; the only thing
// that differs between them is the initial angle, which is exactly the claim the video makes.
// The shoot is re-solved per frame because its apical hook has to ride the growing tip.
// =============================================================================
const ROOTS = growRootSystem({ x: G.seedX, y: G.rootY, seed: 7 });

// 300, not 258: the camera pans right during the shoot beat, and at 258 the demo's label
// was dragged off the left edge before it faded. Caught in QA at f830.
const FLIP_X = 300;
const FLIP_ROOT = tropism({
  x: FLIP_X,
  y: 1046, // an inverted seed's radicle leaves through what is now its TOP
  ang: D2R(-108), // pointing UP — the one changed number
  target: D2R(90),
  k: 0.22,
  wander: 0.075,
  steps: 26,
  step: 6.0,
  seed: 7,
});

// =============================================================================
// CUES — estimated VO word times (beats.json). Retime against vo.gen.ts once the real
// alignment exists: every stage word, chip and ledger fires on a word.
// =============================================================================
const HOOK_OUT = F(3.5); // "Rewind." @ 3.60
const SEED_IN = F(6.3); // "Inside" @ 6.30
const SEED_OUT = F(9.8);
const GERM_IN = F(9.9); // "Water soaks in." @ 9.90
const GERM_OUT = F(16.5);
const CHIPS_IN = F(13.35); // "All it needs" @ 13.389
const NO_IN = F(16.6); // "No" @ 16.689
const CHIPS_OUT = F(18.3);
const QUIZ_FROM = F(18.4);
const QUIZ_DUR = F(2.6);
const ROOT_IN = F(21.2); // "The root." @ 21.30
const ROOT_OUT = F(27.2);
const FLIP_IN = F(24.3); // "Flip the seed over." @ 24.30
const FLIP_OUT = F(27.8); // 'wins.' ends 27.028 — gone before the camera pans away
const SHOOT_IN = F(27.3); // "Then the shoot lifts" @ 27.40
const SHOOT_OUT = F(32.8);
const CUT2_IN = F(30.5); // "Now the packed lunch is gone." @ 30.50
const CUT2_OUT = F(32.85);
const PHOTO_IN = F(32.9); // "The leaves pull" @ 33.00
const LEDGER_IN = F(37.0); // lands ON "ninety" @ 37.138
const LOOP = F(39.9); // in the gap after "water." ends 39.537, before "Almost" @ 40.089

const ramp = (f: number, xs: number[], ys: number[]) =>
  interpolate(f, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

// THE CAMERA IS PART OF THE PAYOFF (short-11/12). A seed is 92px wide on a 1080px canvas: at
// world scale the whole germination happens in a thumbnail-sized patch of dirt. So the view
// pushes into the soil for the beats that live down there and PULLS BACK OUT with the rising
// shoot — the pull-back is the reveal, and it must LAND (scale 1) before the leaves open at
// f862, or the canopy rises behind the stage-word plate. Caught in QA at f864.
// It lands at scale 1 exactly when the plant needs
// the whole frame. Identity at frame 0 and at the last frame, which keeps the loop closed.
//
// cam(s, fx, fy) keeps world point (fx,fy) at screen ANCHOR; s=1 with focal=ANCHOR is identity.
const ANCHOR: [number, number] = [540, 700];
const CK = [0, 105, 195, 300, 330, 636, 680, 726, 770, 810, 834, 862, END];
const C_S = [1, 1, 1.75, 1.75, 1.45, 1.45, 1.9, 1.9, 1.5, 1.5, 1.25, 1, 1];
const C_FX = [540, 540, 540, 540, 540, 540, 540, 540, 420, 480, 540, 540, 540];
const C_FY = [700, 700, 1010, 1010, 985, 985, 1130, 1130, 1090, 1060, 880, 700, 700];

const Short14Seed: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const punch = f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---------------------------------------------------------------------------
  // THE REWIND EARNS THE LOOP (short-10/11). Frame 0 is the FINISHED plant; the setup runs
  // every one of these back to zero; the reveal regrows them to the same numbers. No growth
  // is choreographed twice, and the last frame is frame 0 by construction.
  // ---------------------------------------------------------------------------
  const rootP = ramp(f, [0, 140, 192, 639, 726, END], [1, 1, 0, 0, 1, 1]);
  const shootP = ramp(f, [0, 120, 172, 822, 840, 873, END], [1, 1, 0, 0, 0.28, 1, 1]); // 'shoot' 27.61, 'lifts' 27.93-28.43
  const leafP = ramp(f, [0, 105, 150, 862, 888, END], [1, 1, 0, 0, 1, 1]); // opens on 'leaves open.' 28.74-29.38
  const cotP = ramp(f, [0, 112, 158, 852, 873, END], [1, 1, 0, 0, 1, 1]);
  const food = ramp(f, [0, 130, 185, 822, 954, END], [0, 0, 1, 1, 0, 0]); // empty ON 'gone.' @ 31.78
  const split = ramp(f, [0, 118, 165, 366, 393, END], [1, 1, 0, 0, 1, 1]); // 'splits.' @ 12.15-12.76
  const swell = ramp(f, [0, 125, 175, 339, 378, END], [1, 1, 0, 0, 1, 1]);
  const warmth = ramp(f, [0, 90, 200, 819, 975, END], [1, 0.5, 0.12, 0.12, 1, 1]);

  // the hypocotyl hook relaxes as the seedling emerges into the light
  const relax = clamp01((shootP - 0.22) / 0.26);
  const shoot = growShoot({ x: G.seedX, y: G.shootY, p: shootP, relax });
  const tip = tipOf(shoot);
  // The cotyledons sit at a FIXED MATERIAL INDEX on the stem: they open at the tip while the
  // hook straightens, and the stem then elongates past them, which is where a real seedling's
  // seed leaves end up. The true leaves stay at the apex.
  const cotAt = shoot.length > 2 ? shoot[Math.min(shoot.length - 1, 34)] : [G.seedX, G.shootY];
  const cotAng = shoot.length > 2 ? Math.atan2(cotAt[1] - shoot[Math.max(0, Math.min(shoot.length - 2, 33))][1], cotAt[0] - shoot[Math.max(0, Math.min(shoot.length - 2, 33))][0]) : -Math.PI / 2;

  const camS = ramp(f, CK, C_S);
  const camX = ANCHOR[0] - camS * ramp(f, CK, C_FX);
  const camY = ANCHOR[1] - camS * ramp(f, CK, C_FY);
  const cam = `translate(${camX.toFixed(2)} ${camY.toFixed(2)}) scale(${camS.toFixed(4)})`;

  const flipP = prog(f, FLIP_IN + 6, FLIP_IN + 84);
  const flipOn = prog(f, FLIP_IN, FLIP_IN + 12) * (1 - prog(f, FLIP_OUT - 14, FLIP_OUT));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 24) + prog(f, LOOP, END - 6));
  const ledgerOp = prog(f, LEDGER_IN, LEDGER_IN + 14) * (1 - prog(f, LOOP, LOOP + 16));
  const motesOn = prog(f, PHOTO_IN + 4, PHOTO_IN + 22) * (1 - prog(f, LOOP, LOOP + 14));
  const rainOn = prog(f, GERM_IN, GERM_IN + 14) * (1 - prog(f, F(13.6), F(14.4)));

  return (
    <AbsoluteFill style={{ background: GROW_COLORS.skyLow }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform={cam}>
            <Ground warmth={warmth} />
            {/* EXACTLY one turn across the composition. A per-frame rate (f * 0.12) left the
                ray ring 153deg out of phase at the wrap — invisible beat-by-beat, and 4.24% of
                channels changed against 0.06% for an ordinary frame step. Measured, not eyeballed. */}
            <SunGlow on={warmth} spin={(f / END) * 360} />
            <Rain on={rainOn} t={t} />
            <Damp x={G.seedX} y={G.seedY + 10} r={300} on={prog(f, GERM_IN + 6, GERM_IN + 60) * (1 - prog(f, 840, 885))} />

            {/* ---- the plant itself: root, spent coat, stem, cotyledons, true leaves ---- */}
            <RootSystem branches={ROOTS} p={rootP} />
            <Stem pts={shoot} w0={16} w1={9} />
            <Seed x={G.seedX} y={G.seedY} swell={swell} split={split} food={food} />
            {shootP > 0.02 ? (
              <>
                <Cotyledons x={cotAt[0]} y={cotAt[1]} ang={cotAng} open={cotP} size={56} />
                <Leaf x={tip.x} y={tip.y} ang={-38} len={166} open={leafP} />
                <Leaf x={tip.x} y={tip.y} ang={218} len={166} open={leafP} />
              </>
            ) : null}

            {/* ---- the upside-down demo: the SAME solver, one changed initial angle ---- */}
            {flipOn > 0.01 ? (
              <g opacity={flipOn}>
                <RootSystem branches={[{ pts: FLIP_ROOT, w0: 8, w1: 2, t0: 0, t1: 1 }]} p={flipP} />
                <Seed x={FLIP_X} y={1078} rx={33} ry={24} tilt={168} swell={1} split={1} food={0.3} />
                {/* counter-scaled so the label stays 29px however far the camera is pushed in */}
                <g transform={`translate(${FLIP_X} 1006) scale(${(1 / camS).toFixed(4)})`}>
                  <path d="M -172 8 L 172 8" stroke={ACCENT} strokeWidth={2} strokeDasharray="10 10" opacity={0.5} />
                  <text x={0} y={-8} textAnchor="middle" fill="#f7ead2" fontFamily="Inter" fontWeight={700} fontSize={29} letterSpacing={2}>
                    PLANTED UPSIDE DOWN
                  </text>
                </g>
              </g>
            ) : null}

            {/* ---- photosynthesis: the two ingredients of the payoff, moving ---- */}
            <Motes from="sides" to={[G.seedX, 500]} on={motesOn} t={t} label="CO2" color="#3f7d92" n={8} />
            <Motes from="roots" to={[G.seedX, 660]} on={motesOn} t={t + 0.37} label="H2O" color={GROW_COLORS.water} n={6} />
          </g>

          {/* ---- the cutaways are INSETS, not world objects: they stay out of the camera ---- */}
          <SeedCutaway
            x={540}
            y={548}
            r={150}
            food={1}
            on={prog(f, SEED_IN + 4, SEED_IN + 20) * (1 - prog(f, SEED_OUT - 12, SEED_OUT))}
            label="INSIDE A SEED"
          />
          <SeedCutaway
            x={300}
            y={792}
            r={104}
            food={food}
            on={prog(f, CUT2_IN, CUT2_IN + 14) * (1 - prog(f, CUT2_OUT - 12, CUT2_OUT))}
          />
        </svg>

        {/* a constant, gentle vignette — never a moving dim: a radial hole travelling over a
            pale sky read as a fog blob in QA, and the camera does the focusing now */}
        <Spot x={540} y={980} r={1020} amount={0.34} />

        {/* the hook title sits over a pale sky — it needs its own scrim to read */}
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(10,26,20,0.52) 0%, rgba(10,26,20,0.24) 26%, rgba(10,26,20,0) 48%)',
            opacity: titleOp,
          }}
        />
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'A PLANT IS MOSTLY', color: '#ffffff' },
              { text: 'BUILT FROM AIR.', color: ACCENT },
            ]}
            subtitle="Almost none of it comes from the soil."
            y={158}
            size={82}
            warm
          />
        </div>

        <StageWord word="SEED" gloss="a tiny plant, asleep, with its lunch" on={prog(f, SEED_IN, SEED_IN + 10) * (1 - prog(f, SEED_OUT - 10, SEED_OUT))} />
        <StageWord word="GERMINATION" gloss="water wakes it up" on={prog(f, GERM_IN, GERM_IN + 10) * (1 - prog(f, GERM_OUT - 10, GERM_OUT))} />
        <StageWord word="RADICLE" gloss="the first root, and it always turns down" on={prog(f, ROOT_IN, ROOT_IN + 10) * (1 - prog(f, ROOT_OUT - 10, ROOT_OUT))} />
        <StageWord word="SHOOT" gloss="the stem carries the leaves up" on={prog(f, SHOOT_IN, SHOOT_IN + 10) * (1 - prog(f, SHOOT_OUT - 10, SHOOT_OUT))} />
        {/* hands the top band over to the ledger rather than fighting it for the same 200px */}
        <StageWord word="PHOTOSYNTHESIS" gloss="leaves build the plant out of air" on={prog(f, PHOTO_IN, PHOTO_IN + 10) * (1 - prog(f, LEDGER_IN - 14, LEDGER_IN))} />

        {/* headed TO SPROUT, never "to grow": sunlight is not needed to germinate, and IS
            needed once the leaves open — which the twist then says out loud. */}
        <NeedChips
          header="TO SPROUT"
          y={400}
          frame={f}
          on={prog(f, CHIPS_IN, CHIPS_IN + 10) * (1 - prog(f, CHIPS_OUT - 10, CHIPS_OUT))}
          items={[
            { text: 'WATER', at: F(13.95) },
            { text: 'AIR', at: F(14.9) },
            { text: 'WARMTH', at: F(15.12) },
            { text: 'SUN', at: F(16.75), struck: true },
            { text: 'SOIL', at: F(17.6), struck: true },
          ]}
        />

        {/* the number on the screen is the number on the track: "ninety five percent" */}
        <MassLedger on={ledgerOp} y={150} airPct={95} soilPct={5} />
      </AbsoluteFill>

      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle="which part comes out first?" durSec={2.6} accent={ACCENT} y={440} />
      </Sequence>

      {/* plate: this composition is a pale sky over pale soil — unplated white is mush */}
      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
};

export default Short14Seed;
