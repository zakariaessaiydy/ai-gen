import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, StatChip, prog } from '../../lib/shorts';
import {
  CensusStrip,
  CloudPuff,
  Drops,
  FarHill,
  Focus,
  LoopArrow,
  Mountain,
  RESIDENCE_DAYS,
  RainVeil,
  RiverBed,
  SeaBody,
  SkyBg,
  StageLabel,
  Sun,
  TAU,
  Trees,
  WATER_GEOM,
  census,
  makeDrops,
} from '../../lib/cycle';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short13Water',
  durationInSeconds: 42.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const SUN = '#f5d76e'; // the engine of the whole cycle — and this short's accent
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const END = F(42.5); // 1275

// =============================================================================
// THE ENGINE
// A particle sits at frac(u_i + TURNS * f / END) on a closed path. There is no spawn and no
// despawn in lib/cycle.tsx, so the population is a structural invariant — which is exactly
// the claim this video makes, and why the census below is a MEASUREMENT rather than a label.
//
// It also buys the loop outright. TURNS is an integer and every ambient animation is driven
// by f/END times an integer, so frame END is frame 0 to the pixel. This video does not fake
// its loop with a dissolve: it loops because the water cycle loops.
// =============================================================================
const N_DROPS = 160;
const TURNS = 4; // 4 laps over 42.5s = one drop's round trip every 10.6s — followable by a child
const G = WATER_GEOM;
const DROPS = makeDrops(N_DROPS, 11);

// =============================================================================
// CUES — estimated VO word times (beats.json). Retime against vo.gen.ts once the real
// ElevenLabs alignment exists: every stage label and every focus move fires on a word.
// =============================================================================
const HOOK_OUT = F(7.3); // after "...still falls today." @ 7.00
const EVAP_IN = F(7.45); // "Watch." @ 7.45
const EVAP_OUT = F(13.35);
const COND_IN = F(13.4); // "Up high" @ 13.40
const COND_OUT = F(19.9);
const QUIZ_FROM = F(19.95); // "Pause." @ 19.95
const QUIZ_DUR = F(3.95);
const PRECIP_IN = F(24.1); // "It rains." @ 24.10
const PRECIP_OUT = F(28.95);
const COLLECT_IN = F(29.05); // "and every river" @ 29.05
const COLLECT_OUT = F(33.0);
const CENSUS_IN = F(33.15); // "Count the drops." @ 33.15
const DAYS_IN = F(38.3); // "nine" @ ~38.30
const LOOP = F(41.4); // after the payoff — the title dissolves back in

// THE FOCUS PATH. Not a cut: a soft radial dim closes onto the active stage while the cycle
// keeps running underneath. It also solves the problem an always-running cycle creates —
// rain is falling from frame 0, which would give the quiz away, so the mountain stays dimmed
// until "It rains." Open at frame 0 AND at the last frame, which is what lets the loop close.
const FK = [0, 219, 246, 401, 420, 597, 723, 741, 869, 890, 990, 995, 1035, END];
const F_AMT = [0, 0, 0.66, 0.66, 0.66, 0.66, 0.62, 0.6, 0.6, 0.58, 0.58, 0.56, 0, 0];
const F_CX = [540, 540, 262, 262, 520, 520, 520, 720, 720, 450, 450, 450, 540, 540];
const F_CY = [880, 880, 1000, 1000, 590, 590, 590, 880, 880, 1150, 1150, 1150, 880, 880];
const F_R = [900, 900, 440, 440, 430, 430, 430, 460, 460, 470, 470, 470, 900, 900];

const ramp = (f: number, xs: number[], ys: number[]) =>
  interpolate(f, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const Short13Water: React.FC = () => {
  const f = useCurrentFrame();
  const cyc = f / END; // 0..1 across the composition — every ambient motion rides this
  const turn = TURNS * cyc;

  const punch = f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // the cloud fills, sits at its heaviest under the quiz, then releases
  const heavy = ramp(f, [0, 270, COND_OUT, F(23.9), F(26.7), F(33), END], [0.35, 0.12, 0.95, 1.0, 0.5, 0.35, 0.35]);
  // decorative shower — scenery, never counted
  const veil = ramp(f, [0, HOOK_OUT, 300, 700, 741, 800, 990, END], [0.5, 0.5, 0.06, 0.06, 0.85, 1.0, 0.6, 0.5]);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 26) + prog(f, LOOP, END - 4));
  const censusOp = prog(f, CENSUS_IN, CENSUS_IN + 16) * (1 - prog(f, LOOP, LOOP + 20));
  const daysOp = prog(f, DAYS_IN, DAYS_IN + 12) * (1 - prog(f, LOOP, LOOP + 20));

  // THE MEASUREMENT — counted off the live particle array, this frame. The five cells churn;
  // TOTAL is DROPS.length and cannot move.
  const c = census(G, DROPS, turn, cyc);

  return (
    <AbsoluteFill style={{ background: '#cfeaf6' }}>
      <SkyBg />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Sun x={812} y={268} r={88} spin={cyc * 360} pulse={TAU * cyc * 4} color={SUN} />
          <FarHill color="#8f7fb8" />
          <Mountain face="#7d6aa8" shade="#5c4d82" />
          <RiverBed g={G} color="#5fd6ee" />
          <Trees color="#3f8f7e" />
          <SeaBody y={G.seaY} cyc={cyc} top="#3fb6c0" deep="#14606c" />

          <CloudPuff cx={520} cy={570} w={720} heavy={heavy} bob={10 * Math.sin(TAU * cyc * 3)} />

          {/* the loop, drawn along the very path the droplets ride */}
          <LoopArrow g={G} dash={-cyc * 8000} accent={SUN} />

          <RainVeil amount={veil} cyc={cyc} />
          <Drops g={G} drops={DROPS} turn={turn} cyc={cyc} />
        </svg>

        <Focus x={ramp(f, FK, F_CX)} y={ramp(f, FK, F_CY)} r={ramp(f, FK, F_R)} amount={ramp(f, FK, F_AMT)} />

        {/* scrim so the hook title reads over a bright sky. Kept light and short — at 0.5 it
            muddied the sun, which sits inside the title band, into olive. */}
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(8,32,58,0.38) 0%, rgba(8,32,58,0.18) 22%, rgba(8,32,58,0) 44%)',
            opacity: titleOp,
          }}
        />
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'EARTH NEVER MAKES', color: '#ffffff' },
              { text: 'NEW WATER.', color: SUN },
            ]}
            subtitle="The rain that fell on the dinosaurs falls today."
            y={150}
            size={80}
            warm
          />
        </div>

        {/* the curriculum word, with the kid gloss under it */}
        <StageLabel
          word="EVAPORATION"
          gloss="the sun lifts the water up"
          on={prog(f, EVAP_IN, EVAP_IN + 10) * (1 - prog(f, EVAP_OUT - 8, EVAP_OUT))}
          color={SUN}
        />
        <StageLabel
          word="CONDENSATION"
          gloss="vapour turns back into droplets"
          on={prog(f, COND_IN, COND_IN + 10) * (1 - prog(f, COND_OUT - 8, COND_OUT))}
          color={SUN}
        />
        <StageLabel
          word="PRECIPITATION"
          gloss="it falls as rain"
          on={prog(f, PRECIP_IN, PRECIP_IN + 10) * (1 - prog(f, PRECIP_OUT - 8, PRECIP_OUT))}
          color={SUN}
        />
        <StageLabel
          word="COLLECTION"
          gloss="rivers carry it back"
          on={prog(f, COLLECT_IN, COLLECT_IN + 10) * (1 - prog(f, COLLECT_OUT - 8, COLLECT_OUT))}
          color={SUN}
        />

        <CensusStrip
          cells={[
            { label: 'SEA', n: c.sea },
            { label: 'RISING', n: c.evap },
            { label: 'CLOUD', n: c.cloud },
            { label: 'RAIN', n: c.rain },
            { label: 'RIVER', n: c.river },
          ]}
          total={DROPS.length}
          on={censusOp}
          y={166}
          color={SUN}
          note="never changes"
        />

        {/* the number on the screen is the number on the track: the VO says "about nine days" */}
        <div style={{ opacity: daysOp }}>
          <StatChip
            label="a drop's time in the sky"
            value={`≈ ${Math.round(RESIDENCE_DAYS)} days — then round again`}
            color={SUN}
            x={240}
            y={384}
            w={600}
            at={DAYS_IN}
          />
        </div>
      </AbsoluteFill>

      {/* y960, over the dimmed mountain — the heavy cloud the question is about stays fully
          visible above it, and the sea drift stays visible below it */}
      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle="what happens when it gets too heavy?" durSec={3.95} accent={SUN} y={960} />
      </Sequence>

      {/* plate: this composition is a bright sky over a lit sea — unplated white is mush */}
      <Captions lines={VO} y={1400} accent={SUN} plate />
      <ProgressBar color={SUN} />
    </AbsoluteFill>
  );
};

export default Short13Water;
