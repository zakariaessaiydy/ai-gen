import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY } from '../../fonts';
import type { Link } from '../../lib/flow';
import {
  BranchLabel,
  CompareBars,
  EJ,
  FLOW_COLORS,
  FLOW_GEOM,
  FlowBackdrop,
  FlowCard,
  Loupe,
  Packets,
  Readout,
  Ribbon,
  RibbonLabel,
  SunCap,
  Vignette,
  fmtInt,
  fmtPct,
  linkPoint,
  magFor,
  solarJoules,
  solveLedger,
} from '../../lib/flow';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short15Sun',
  durationInSeconds: 43.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = FLOW_COLORS.accent;
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const END = F(43.0); // 1290
const G = FLOW_GEOM;

// =============================================================================
// THE LEDGER — solved once, at module level, from the shares and the physics.
//
// NOTHING below is a chosen width. The trunk is 1361 W/m^2 across Earth's shadow disc; every
// ribbon is trunkW * share; and HEAT is the REMAINDER of the absorbed stream, so the four
// branches sum to exactly the trunk however the shares are edited. Same ethos as prob.tsx's
// seeded trials, map.tsx's real Mercator, orbit.tsx's Verlet integrator, cycle.tsx's conserved
// particles and grow.tsx's one solver: never assert what the code can compute.
// =============================================================================
const L = solveLedger();

// The consequence, and the reason this video exists: an honest width mapping has no floor.
// 0.08% of 800px is 0.64px — the branch the whole short is about CANNOT BE DRAWN. A log width
// scale would fix that by lying about the proportion, which is the one claim the diagram makes.
// So the width stays true and a loupe magnifies it, at a factor derived from the width itself.
const LOUPE_TARGET_PX = 28;
const MAG = magFor(L.life.w, LOUPE_TARGET_PX); // 28 / 0.64 -> x44, derived and printed on the glass

// The four links. Each carries its own width from the ledger; the source x of the three lower
// branches is where they sit packed inside the absorbed stream, so nothing crosses.
const BEAM: Link = { x0: G.sunX, y0: G.beamY, w0: G.beamW, x1: G.trunkX, y1: G.trunkY, w1: L.trunkW };
const REFL_X0 = 260; // the reflected share's centre while it is still inside the trunk

/**
 * A SPLIT IS A MOVING POINT, not a fading overlay.
 *
 * `s` (0..1) is how far the split has happened. The split point rises from `parkY` (where the
 * undivided stream would otherwise end) up to `splitY`, and each child fills the gap it leaves
 * — so the stream ALWAYS ends exactly where its children begin. Fading children in over a
 * stream that still ran past them left a coloured bar stranded 150px inside the column, and a
 * half-drawn violet ribbon hanging above the trunk's cut end (QA f200 / f450).
 * At s = 0 every child is degenerate (zero length, zero displacement) and draws nothing.
 */
const splitPoint = (s: number, splitY: number, parkY: number) => splitY + (parkY - splitY) * (1 - s);
const child = (s: number, sy: number, srcX: number, w: number, dstX: number, dstY: number): Link => ({
  x0: srcX,
  y0: sy,
  w0: w,
  x1: srcX + (dstX - srcX) * s,
  y1: sy + (dstY - sy) * s,
  w1: w,
});

// The two bars of the one-hour comparison. 625 EJ against ~630 EJ: they are drawn the same
// length because they ARE the same length, which is the whole point of the beat.
const HOUR_EJ = solarJoules(1) / EJ; // 625
const HUMAN_EJ = 630; // world primary energy, ~620 (2023) to ~640 (2024) EJ — see beats.json facts
const BAR_MAX = Math.max(HOUR_EJ, HUMAN_EJ) * 1.06;

// =============================================================================
// CUES — retimed against the REAL ElevenLabs alignment in vo.gen.ts, not the estimates.
// Every label, bar and readout fires on a spoken word; the word it fires on is in the comment.
// =============================================================================
const HOOK_OUT = F(4.6); // "This" @ 4.85
const HOUR_IN = F(9.9); // "One hour" @ 9.90
const HOUR_OUT = F(14.05); // clears just before "Thirty" @ 14.20
const QUIZ_FROM = F(17.8); // "ice." ends 17.72
const QUIZ_DUR = F(2.6); // out at 20.4, "Most" @ 20.50
const TWIST_IN = F(34.2); // "fuel" @ 34.18
const LOOP = F(38.3); // in the gap after 'old.' ends 38.03, before "Nothing" @ 38.40

const ramp = (f: number, xs: number[], ys: number[]) =>
  interpolate(f, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const Short15Sun: React.FC = () => {
  const f = useCurrentFrame();

  const punch = f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---------------------------------------------------------------------------
  // THE REWIND EARNS THE LOOP (short-10/11/14). Frame 0 is the FINISHED ledger; the setup
  // un-draws every one of these in reverse construction order; the reveal re-draws them to the
  // same numbers. Nothing is choreographed twice, and the last frame is frame 0 by construction.
  // ---------------------------------------------------------------------------
  const splitA = ramp(f, [0, 210, 262, 429, 483, END], [1, 1, 0, 0, 1, 1]); // 'Thirty percent' @ 14.20
  const splitB = ramp(f, [0, 156, 216, 618, 678, END], [1, 1, 0, 0, 1, 1]); // 'rest' @ 20.98
  const labRefl = ramp(f, [0, 144, 174, 450, 468, END], [1, 1, 0, 0, 1, 1]); // 'bounces' @ 14.97
  const labHeat = ramp(f, [0, 144, 174, 639, 657, END], [1, 1, 0, 0, 1, 1]); // 'warms' @ 21.21
  const labWater = ramp(f, [0, 148, 178, 729, 747, END], [1, 1, 0, 0, 1, 1]); // 'quarter' @ 24.30
  const labLife = ramp(f, [0, 152, 182, 842, 860, END], [1, 1, 0, 0, 1, 1]); // 'zero' @ 28.03
  const readout = ramp(f, [0, 138, 168, 929, 947, END], [1, 1, 0, 0, 1, 1]); // 'chart,' @ 30.91
  // the glass follows the measurement by half a second, not by a second and a half: at 970 the
  // readout was claiming a x44 magnification with no lens on screen for 1.3s (QA f961)
  const loupe = ramp(f, [0, 138, 162, 944, 980, END], [1, 1, 0, 0, 1, 1]); // 'less' @ 31.91

  // A stream is never left hanging in mid-air. Each split point rises out of the head line as
  // its split happens, the parent ends exactly there, and the children fill the gap it leaves —
  // so the picture is complete at every frame of the rewind and of the re-draw.
  const syB = splitPoint(splitB, G.splitBY, G.headY);
  const syA = splitPoint(splitA, G.splitAY, syB);
  const TRUNK: Link = { x0: G.trunkX, y0: G.trunkY, w0: L.trunkW, x1: G.trunkX, y1: syA, w1: L.trunkW };
  const REFL = child(splitA, syA, REFL_X0, L.refl.w, G.reflX, G.midY);
  const ABS = child(splitA, syA, G.absAX, L.abs.w, G.absBX, syB);
  const WATER = child(splitB, syB, L.water.src, L.water.w, G.waterX, G.headY);
  const HEAT = child(splitB, syB, L.heat.src, L.heat.w, G.heatX, G.headY);
  const LIFE = child(splitB, syB, L.life.src, L.life.w, G.lifeX, G.headY);
  const reflMid = linkPoint(REFL, 0.5);

  // EXACTLY an integer number of laps across the composition. A per-frame rate leaves the
  // stream out of phase at the wrap — invisible beat-by-beat, and short-13/14 both measured it
  // as several percent of changed channels against ~0.1% for an ordinary frame step.
  const cyc = f / END;
  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 24) + prog(f, 1153, END - 6));
  const hourOp = prog(f, HOUR_IN, HOUR_IN + 18) * (1 - prog(f, HOUR_OUT - 18, HOUR_OUT));
  // OUT BEFORE THE TITLE IS IN. Sharing the band with a cross-fading title put the twist card
  // at 33% under a 9% headline for half a second — two blocks of type in the same 190px (QA
  // f1161). The card holds through 'old.' (ends 38.03 = f1141), clears by 1153, and the title
  // starts at 1153 — the band is briefly empty between them, which is what a handoff looks like.
  const twistOp = prog(f, TWIST_IN, TWIST_IN + 18) * (1 - prog(f, 1139, 1153));
  // the gold pulse on 'the same sliver' @ 34.70 — brightens what is already there, widens nothing
  const surge = prog(f, 1042, 1060) * (1 - prog(f, 1090, 1130));

  return (
    <AbsoluteFill style={{ background: FLOW_COLORS.space }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <FlowBackdrop />
          <SunCap spin={cyc * 360} pulse={cyc * Math.PI * 2 * 3} />

          {/* ---- the trunk: 1361 W/m^2 across Earth's shadow disc ----
              Opaque, not 0.92: during the rewind the retracting trunk and the drawing absorbed
              stream overlap for ~1.7s, and two 0.92 alphas stack into a visible bright seam
              across the column (QA f216). Full opacity makes the overlap invisible. */}
          <Ribbon link={BEAM} color="url(#flowBeamG)" />
          <Ribbon link={TRUNK} color="url(#flowBeamG)" glow={surge} />
          <Packets link={BEAM} phase={cyc * 5} n={9} r={6} seed={11} opacity={0.9} />
          <Packets link={TRUNK} phase={cyc * 6} n={14} r={6} seed={5} opacity={0.9 + 0.1 * surge} />

          {/* ---- split A: 30% never gets absorbed at all ----
              OPAQUE, and never partially drawn: fading a ribbon in by alpha put a half-
              transparent grey stub across the column mid-transition (QA f450 / f624), and
              trimming its length left it hanging above the parent's cut end (QA f200). The
              children are always whole; what animates is where the split HAPPENS.
              The packets only join once the split has arrived, or they ride a zero-length path. */}
          <Ribbon link={REFL} color={FLOW_COLORS.reflected} />
          <Ribbon link={ABS} color="url(#flowBeamG)" />
          <Packets link={REFL} phase={cyc * 4} n={7} r={5} seed={21} opacity={prog(splitA, 0.85, 1) * 0.7} color="#efe6ff" />
          <Packets link={ABS} phase={cyc * 5} n={11} r={6} seed={31} opacity={prog(splitA, 0.85, 1) * 0.9} />

          {/* ---- split B: the absorbed stream, packed left to right, widths from the ledger ---- */}
          <Ribbon link={WATER} color={FLOW_COLORS.water} />
          <Ribbon link={HEAT} color={FLOW_COLORS.heat} />
          <Ribbon link={LIFE} color={FLOW_COLORS.life} />
          <Packets link={WATER} phase={cyc * 4} n={6} r={4} seed={41} opacity={prog(splitB, 0.85, 1) * 0.6} color="#dfe3ff" />
          <Packets link={HEAT} phase={cyc * 4} n={9} r={4} seed={51} opacity={prog(splitB, 0.85, 1) * 0.6} color="#ffe6ec" />

          {/* the trunk states its own quantity, computed — not a caption about it */}
          <RibbonLabel
            x={G.trunkX}
            y={492}
            top={`${fmtInt(L.total / 1e12)} TW`}
            bottom="SUNLIGHT INTERCEPTED BY EARTH"
            on={1}
          />

          {/* the violet branch carries its label inside itself: outside, it would crowd the
              water branch's head below. Sized to the ribbon's own 240px, not to taste. */}
          <RibbonLabel
            x={reflMid[0]}
            y={reflMid[1] - 6}
            top={fmtPct(L.refl.share)}
            bottom="BOUNCES BACK"
            on={labRefl}
            size={52}
            bottomSize={21}
          />
          <g opacity={labRefl}>
            <polygon points="150,796 137,818 163,818" fill={FLOW_COLORS.reflected} />
            <text
              x={176}
              y={818}
              fill={FLOW_COLORS.reflected}
              fontFamily={FONT_BODY}
              fontWeight={600}
              fontSize={27}
              letterSpacing={3}
            >
              TO SPACE
            </text>
          </g>

          {/* ---- the three heads. LIFE has no ribbon to point at, so it gets a leader. ---- */}
          <BranchLabel
            x={G.waterX}
            y={G.labelY}
            name="WATER"
            pct={fmtPct(L.water.share)}
            gloss="clouds, rain, rivers"
            color={FLOW_COLORS.water}
            on={labWater}
          />
          <BranchLabel
            x={G.heatX}
            y={G.labelY}
            name="HEAT"
            pct={fmtPct(L.heat.share)}
            gloss="warms, then escapes"
            color={FLOW_COLORS.heat}
            on={labHeat}
          />
          {/* no gloss and no room for one: LIFE's siblings are 184px and 375px wide and point at
              themselves, while this one is a dashed leader down to a tick on an invisible ribbon */}
          <BranchLabel
            x={G.lifeX}
            y={G.labelY}
            name="LIFE"
            pct={fmtPct(L.life.share)}
            color={FLOW_COLORS.life}
            on={labLife}
            leaderTo={G.headY}
          />

          {/* ---- the measurement, and the honest way to see a sub-pixel ribbon ----
              The readout carries the magnification instead of the glass (QA: the label above
              the loupe, the LIFE percentage and a tether all wanted the same 60px), so the
              lens itself stays unobstructed and the row reads left to right. */}
          <Readout
            x={740}
            y={1226}
            on={readout}
            lines={[
              { text: `${L.life.w.toFixed(2)} px WIDE`, color: FLOW_COLORS.life, size: 40 },
              { text: `= ${fmtInt(L.life.watts / 1e12)} TW`, color: FLOW_COLORS.dim, size: 30 },
              { text: `MAGNIFIED x${MAG}`, color: ACCENT, size: 30 },
            ]}
          />
          <Loupe
            x={G.loupeX}
            y={G.loupeY}
            r={G.loupeR}
            widthPx={L.life.w}
            mag={MAG}
            color={FLOW_COLORS.life}
            on={loupe}
            phase={cyc * 4}
            label={false}
          />
          {surge > 0.01 ? (
            <circle
              cx={G.loupeX}
              cy={G.loupeY}
              r={G.loupeR}
              fill="none"
              stroke="#ffffff"
              strokeWidth={6}
              opacity={0.5 * surge * loupe}
            />
          ) : null}

          {/* ---- the band under the sun: bars, then the twist card ---- */}
          <CompareBars
            y={262}
            on={hourOp}
            note="THE SAME BAR"
            rows={[
              { label: 'SUNLIGHT ON EARTH · ONE HOUR', value: `${Math.round(HOUR_EJ)} EJ`, frac: HOUR_EJ / BAR_MAX, color: ACCENT },
              { label: 'HUMANITY · ONE YEAR', value: `~${HUMAN_EJ} EJ`, frac: HUMAN_EJ / BAR_MAX, color: FLOW_COLORS.heat },
            ]}
          />
          <FlowCard
            y={228}
            on={twistOp}
            kicker="COAL · OIL · GAS"
            lines={['The same 0.08 percent,', 'buried 300 million years ago.']}
            color={FLOW_COLORS.life}
          />
        </svg>

        <Vignette amount={0.42} />

        {/* the hook title sits over the beam — it needs its own scrim to read */}
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(4,7,13,0.74) 0%, rgba(4,7,13,0.68) 18%, rgba(4,7,13,0.26) 30%, rgba(4,7,13,0) 38%)',
            opacity: titleOp,
          }}
        />
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'EVERYTHING ALIVE RUNS', color: '#ffffff' },
              { text: 'ON 0.08% OF THIS.', color: ACCENT },
            ]}
            subtitle="You cannot even see it on this chart."
            y={222}
            size={62}
            warm
          />
        </div>
      </AbsoluteFill>

      {/* the quiz lives up in the band, where it covers no part of the diagram — and the three
          lower branches have not been drawn yet, so the answer is not on screen */}
      <Sequence from={QUIZ_FROM} durationInFrames={QUIZ_DUR}>
        <PauseCard title="PAUSE" subtitle="how much reaches living things?" durSec={2.6} accent={ACCENT} y={318} />
      </Sequence>

      <Captions lines={VO} y={1400} accent={ACCENT} plate />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
};

export default Short15Sun;
