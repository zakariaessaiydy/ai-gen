import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import { Head, Tally } from '../../lib/page';
import {
  Dial,
  EASE_INOUT,
  EASE_OUT,
  EdgeDraw,
  NetLayer,
  NodeDraw,
  NodeLabel,
  Pose,
  PulseDraw,
  ShowerRain,
  SparkBadge,
  Spotlight,
  WD,
  alongPath,
  bendMid,
  hexMix,
  knnEdges,
  lerpPose,
  mix,
  nearest,
  packNodes,
  toScreen,
} from '../../lib/wander';
import { FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short46Shower',
  durationInSeconds: 45.0,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = WD.yellow;
const F = (s: number) => Math.round(s * 30);
const END = F(45.0);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const wAt = (line: number, word: string, nth = 0) => {
  const w = timeWords(VO[line]).filter((x) => key(x.w) === word)[nth];
  if (!w) throw new Error(`Short46Shower: no word "${word}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return F(w.start);
};

// =============================================================================
// CUES — all spoken words.
// =============================================================================
const REW = wAt(1, 'at');
const FOCUS = wAt(1, 'focus');
const RUN_CUES = [wAt(2, 'keeps'), wAt(2, 'over', 0), wAt(2, 'over', 1)];
const DEAD = wAt(3, 'dead');
const STEP = wAt(4, 'step');
const WARM = wAt(5, 'warm');
const LETS = wAt(6, 'lets');
const DEFAULT = wAt(6, 'default');
const WANDERS = wAt(7, 'wanders');
const TOUCH = wAt(8, 'touch');
const CLICK = wAt(8, 'click');
const BUT = wAt(9, 'but');
const REST = wAt(9, 'rest');
const BEST = wAt(9, 'best');
const STUDY = wAt(10, 'study');
const EASY = wAt(10, 'easy');
const BEAT = wAt(10, 'beat');
const IDEAS = wAt(10, 'ideas');
const ENOUGH = wAt(11, 'enough');
const WANDER2 = wAt(11, 'wander');
const LOOP = Math.min(END - 30, F(VO[11].end + 0.3));

// =============================================================================
// THE NETWORK — head space (page.tsx Head viewBox). Illustrative, not an atlas.
// =============================================================================
const NODES = packNodes(30, { x: 318, y: 272 }, 212, 176);
const BASE_EDGES = knnEdges(NODES, 2);
const LABELS = [
  { text: 'the problem', at: { x: 478, y: 236 } },
  { text: 'a trip', at: { x: 392, y: 118 } },
  { text: 'a song', at: { x: 236, y: 116 } },
  { text: 'physics class', at: { x: 400, y: 410 } },
  { text: 'grandma', at: { x: 216, y: 420 } },
  { text: 'Lego', at: { x: 122, y: 282 } },
];
const LABEL_NODES = LABELS.reduce<number[]>((used, l) => [...used, nearest(NODES, l.at, used).i], []);
const P = LABEL_NODES[0]; // the problem
const T = LABEL_NODES[5]; // the far-off memory it finally touches

// FOCUS: the same short path from the problem, three nodes deep, into a dead end
const FOCUS_PATH = [P];
while (FOCUS_PATH.length < 4) {
  const last = NODES[FOCUS_PATH[FOCUS_PATH.length - 1]];
  const cand = NODES.filter((n) => n.x > 360 && !FOCUS_PATH.includes(n.i) && !LABEL_NODES.includes(n.i));
  FOCUS_PATH.push(cand.reduce((b, n) => (Math.hypot(n.x - last.x, n.y - last.y) < Math.hypot(b.x - last.x, b.y - last.y) ? n : b)).i);
}
// WANDER: long hops region to region, through every labelled memory, ending at Lego
const MID = nearest(NODES, { x: 300, y: 262 }, LABEL_NODES).i;
const WANDER = [P, LABEL_NODES[1], LABEL_NODES[2], LABEL_NODES[3], MID, LABEL_NODES[4], T];
const N_HOPS = WANDER.length - 1;

// focus runs: one pulse down the path per cue, never overlapping
const RUN_DUR = 14;
const RUNS = RUN_CUES.reduce<number[]>((acc, c) => [...acc, Math.max(c, acc.length ? acc[acc.length - 1] + RUN_DUR + 2 : c)], []);
// wander hops: evenly spread from "wanders" until just before "touch"
const HOP = (TOUCH - 4 - WANDERS) / N_HOPS;
const hopStart = (i: number) => WANDERS + i * HOP;

// =============================================================================
// POSES + STATE — the single source for the drawing and the tallies.
// =============================================================================
const HOME: Pose = { cx: 486, cy: 870, s: 1.42 };
const TWIST: Pose = { cx: 500, cy: 700, s: 1.0 };
const poseAt = (f: number) =>
  f < LOOP ? lerpPose(HOME, TWIST, EASE_INOUT(prog(f, BUT, BUT + 22))) : lerpPose(TWIST, HOME, EASE_INOUT(prog(f, LOOP, LOOP + 24)));

const hookOff = (f: number) => 1 - prog(f, REW, REW + 14); // the finished state, rewound by "At"
const showerK = (f: number) => Math.max(1 - prog(f, REW, REW + 26), EASE_OUT(prog(f, STEP, STEP + 24)));
const focusK = (f: number) => EASE_OUT(prog(f, FOCUS - 6, FOCUS + 12)) * (1 - EASE_INOUT(prog(f, LETS, LETS + 26)));
const goldK = (f: number) => Math.max(hookOff(f), EASE_OUT(prog(f, TOUCH, TOUCH + 14)));
const ideaK = (f: number) => Math.max(hookOff(f), EASE_OUT(prog(f, CLICK, CLICK + 8)));
const runsDone = (f: number) => RUNS.filter((r) => f >= r + RUN_DUR).length;
const linksMade = (f: number) => (f < WANDERS ? 0 : Array.from({ length: N_HOPS }, (_, i) => i).filter((i) => f >= hopStart(i + 1)).length);

// module-load assertions: the VO's claims are the picture's counts
{
  if (runsDone(DEAD + 6) !== 3) throw new Error(`Short46Shower: "over and over" must be 3 runs by "dead end", got ${runsDone(DEAD + 6)}`);
  if (linksMade(TOUCH) !== N_HOPS) throw new Error(`Short46Shower: the wander must finish before "touch" (${linksMade(TOUCH)}/${N_HOPS})`);
  if (new Set(WANDER).size !== WANDER.length) throw new Error('Short46Shower: the wander revisits a node');
  if (HOP < 8) throw new Error(`Short46Shower: wander hops too fast (${HOP.toFixed(1)}f)`);
}

// =============================================================================
// THE SHOT — one head, one network, one shower. No cuts.
// =============================================================================
export default function Short46Shower() {
  const f = useCurrentFrame();
  const pose = poseAt(f);
  const S = (i: number) => toScreen(NODES[i], pose);
  const k = pose.s / HOME.s;

  // punch-in: frame 0 is at 1.06 and settles; the loop grows back to 1.06 so the wrap is seamless
  const scale = f < LOOP ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, LOOP, END - 1)));
  const titleO = f < LOOP ? 1 - prog(f, REW - 4, REW + 6) : EASE_OUT(prog(f, LOOP, LOOP + 12));
  const outro = 1 - prog(f, LOOP, LOOP + 12);

  const sh = showerK(f);
  const fk = focusK(f);
  const hk = hookOff(f);
  const deadK = prog(f, DEAD, DEAD + 6) * (1 - prog(f, STEP, STEP + 10));
  const calm = Math.min(sh, 1 - fk);

  // --- edges ------------------------------------------------------------------
  const edges: EdgeDraw[] = BASE_EDGES.map(([a, b]) => ({ a: S(a), b: S(b), color: 'rgba(255,255,255,1)', width: 2.5 * k, opacity: 0.13 }));
  // the focus path: lit indigo while it is being run, pink once it hits the dead end
  for (let j = 0; j < FOCUS_PATH.length - 1; j++) {
    const lit = RUNS.reduce((m, r) => Math.max(m, prog(f, r + (j * RUN_DUR) / 3, r + ((j + 1) * RUN_DUR) / 3)), 0);
    edges.push({
      a: S(FOCUS_PATH[j]),
      b: S(FOCUS_PATH[j + 1]),
      color: hexMix(WD.indigo, WD.pink, deadK),
      width: 6 * k,
      opacity: lit * fk,
      draw: 1,
      glow: 0.6,
    });
  }
  // wander trails: the links focus never made
  for (let i = 0; i < N_HOPS; i++) {
    const draw = f < REW + 14 ? 1 : EASE_OUT(prog(f, hopStart(i), hopStart(i + 1)));
    edges.push({ a: S(WANDER[i]), b: S(WANDER[i + 1]), color: WD.teal, width: 4.5 * k, opacity: 0.9 * (f < REW + 14 ? hk : 1), draw, bend: (i % 2 ? 1 : -1) * 34 * k });
  }
  const GOLD_BEND = -150 * k;
  edges.push({ a: S(P), b: S(T), color: ACCENT, width: 8 * k, opacity: goldK(f), draw: f < REW + 14 ? 1 : EASE_OUT(prog(f, TOUCH, TOUCH + 14)), bend: GOLD_BEND, glow: 1 });

  // --- nodes ------------------------------------------------------------------
  const visitedAt = (n: number) => {
    const w = WANDER.indexOf(n);
    return w < 0 ? -1 : w;
  };
  const nodes: NodeDraw[] = NODES.map((n) => {
    const w = visitedAt(n.i);
    const lit = w < 0 ? 0 : w === 0 ? Math.max(hk, prog(f, WANDERS - 6, WANDERS)) : Math.max(hk, prog(f, hopStart(w) - 2, hopStart(w) + 4));
    const isP = n.i === P;
    const isT = n.i === T;
    return {
      ...S(n.i),
      r: (isP || isT ? 13 : 9) * k,
      color: isP ? ACCENT : hexMix(hexMix(WD.node, WD.teal, lit), ACCENT, isT ? goldK(f) : 0),
      glow: isP ? 1 : Math.max(lit * 0.7, isT ? goldK(f) : 0),
      ring: isP ? 'rgba(245,215,110,0.55)' : undefined,
    };
  });

  // --- pulses -----------------------------------------------------------------
  const pulses: PulseDraw[] = [];
  const focusPts = FOCUS_PATH.map(S);
  RUNS.forEach((r) => {
    const u = prog(f, r, r + RUN_DUR);
    if (u > 0 && u < 1) pulses.push({ ...alongPath(focusPts, EASE_INOUT(u)), color: WD.indigo, r: 10 * k, opacity: fk });
  });
  if (f >= WANDERS && f < TOUCH) {
    const i = Math.min(N_HOPS - 1, Math.floor((f - WANDERS) / HOP));
    const u = EASE_INOUT(prog(f, hopStart(i), hopStart(i + 1)));
    pulses.push({ ...alongPath([S(WANDER[i]), S(WANDER[i + 1])], u), color: WD.teal, r: 10 * k, opacity: 1 });
  }
  // "free to wander" — one slow lap back through the links
  {
    const u = prog(f, WANDER2 - 4, LOOP + 6);
    if (u > 0 && u < 1) pulses.push({ ...alongPath(WANDER.map(S), EASE_INOUT(u)), color: WD.teal, r: 9 * k, opacity: Math.sin(Math.PI * u) });
  }

  // --- spotlight --------------------------------------------------------------
  const fc = { x: (focusPts[0].x + focusPts[3].x) / 2, y: (focusPts[0].y + focusPts[3].y) / 2 };
  const spotR = f < LETS ? mix(620, 175, EASE_OUT(prog(f, FOCUS - 6, FOCUS + 18))) : mix(175, 1300, EASE_INOUT(prog(f, LETS, LETS + 26)));

  // --- the idea ---------------------------------------------------------------
  const ideaAt = bendMid(S(P), S(T), GOLD_BEND);
  const burst = prog(f, CLICK, CLICK + 16);
  const tallyO = prog(f, RUNS[0] - 8, RUNS[0]) * (1 - prog(f, BUT - 4, BUT + 6));
  const inShower = f >= STEP;

  // --- twist dial -------------------------------------------------------------
  const dialO = EASE_OUT(prog(f, REST - 10, REST + 4)) * outro;
  const needleU = mix(5 / 6, 0.5, EASE_INOUT(prog(f, EASY, EASY + 22)));
  const midLit = Math.max(EASE_OUT(prog(f, BEAT, BEAT + 10)), 0.6 * EASE_OUT(prog(f, EASY + 10, EASY + 22)));
  const citeO = prog(f, STUDY - 4, STUDY + 8) * outro;
  const moreO = EASE_OUT(prog(f, IDEAS - 2, IDEAS + 8)) * outro;
  const enoughPop = Math.sin(Math.PI * prog(f, ENOUGH, ENOUGH + 12));

  return (
    <AbsoluteFill style={{ background: WD.ink }}>
      <ShortsBackdrop glow={hexMix('#1d2430', '#163644', sh)} />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '500px 880px' }}>
        <Head cx={pose.cx} cy={pose.cy} s={pose.s} calm={calm} noise={deadK * 0.8} t={f} />
        <NetLayer edges={edges} nodes={nodes} pulses={pulses} />
        {LABELS.map((l, i) => {
          const at = S(LABEL_NODES[i]);
          const isP = i === 0;
          return (
            <NodeLabel
              key={i}
              at={at}
              text={isP ? 'THE PROBLEM' : l.text}
              size={(isP ? 22 : 24) * k}
              pill={isP ? ACCENT : undefined}
              dy={isP ? -1.7 : i === 3 || i === 4 ? 1.2 : -1.1}
              opacity={isP ? 1 : 1 - 0.5 * fk}
            />
          );
        })}
        {deadK > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: focusPts[3].x,
              top: focusPts[3].y,
              transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * EASE_OUT(deadK)})`,
              opacity: deadK,
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 64 * k,
              color: WD.pink,
              textShadow: '0 0 24px rgba(232,135,159,0.7)',
            }}
          >
            ✕
          </div>
        ) : null}
        <Spotlight at={fc} r={spotR} k={fk} />
        <SparkBadge at={ideaAt} k={ideaK(f)} burst={burst} scale={k} />
      </AbsoluteFill>

      <ShowerRain f={f} period={END} k={sh} top={0} />

      {/* the mode, named as the narration names it */}
      <Kicker text="Focus mode" color={WD.indigo} y={170} at={FOCUS - 4} until={STEP + 4} />
      <Kicker text="Warm water" color={WD.water} y={170} at={STEP + 4} until={DEFAULT} />
      <Kicker text="Default mode" color={WD.teal} y={170} at={DEFAULT} until={BUT} />
      <Kicker text="The strange part" color={WD.pink} y={170} at={BUT} until={LOOP} />

      <Tally
        x={330}
        y={272}
        w={420}
        padLeft={34}
        label={inShower ? 'New links' : 'Same path'}
        value={inShower ? String(linksMade(f)) : `×${runsDone(f)}`}
        color={inShower ? WD.teal : deadK > 0.5 ? WD.pink : WD.indigo}
        opacity={tallyO}
        pop={Math.sin(Math.PI * prog(f, DEAD, DEAD + 12)) + Math.sin(Math.PI * prog(f, TOUCH - 4, TOUCH + 8))}
      />

      {/* TWIST — how busy should the mind be? */}
      <Dial
        x={120}
        y={1080}
        w={800}
        title="HOW BUSY IS YOUR MIND?"
        opacity={dialO}
        u={needleU}
        needle={hexMix('#ffffff', WD.teal, midLit)}
        zones={[
          { label: 'Hard task', sub: 'email, exams', color: WD.pink },
          { label: 'Just enough', sub: 'shower, walk', color: WD.teal },
          { label: 'Pure rest', sub: 'doing nothing', color: '#c9d1d9' },
        ]}
        zoneLit={[0, midLit + 0.4 * enoughPop, prog(f, REST, REST + 8) * (1 - prog(f, EASY, EASY + 12))]}
        zoneX={[0, 0, prog(f, BEST, BEST + 6)]}
      />
      {moreO > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 120 + 400,
            top: 1036,
            transform: `translate(-50%, 0) translateY(${(1 - moreO) * 12}px)`,
            opacity: moreO,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: 2,
            color: WD.ink,
            background: WD.teal,
            borderRadius: 999,
            padding: '8px 22px',
            whiteSpace: 'nowrap',
          }}
        >
          ▲ MORE NEW IDEAS
        </div>
      ) : null}
      {citeO > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 70,
            width: 860,
            top: 1318,
            textAlign: 'center',
            opacity: citeO,
            fontFamily: FONT_MONO,
            fontSize: 22,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.62)',
          }}
        >
          Baird et al., Psychological Science (2012)
        </div>
      ) : null}

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={84} y={170} lines={[{ text: 'Why ideas hit' }, { text: 'in the shower', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
