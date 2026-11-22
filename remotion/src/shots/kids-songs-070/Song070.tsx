// TINY SPARKS · Day 70 · 🎵 Educational Songs #10 — "Counting Backwards Song" (LONG 16:9, original song, ACE-Step vocal)
// kids-shorts/tiny-sparks/songs/day-070-counting-backwards-song. One file, any take: KidsSongs070A/B/C pass their take
// (SONG_FORM = the sections in the order the take sings them).
// THE ROCKET (top left) waits on its pad, rumbles before the countdown and LAUNCHES on every "blast off!", then floats
// back down. The COUNTDOWN CARD shows the number being sung (10 → 1, 20 → 1). The space verse + the 20-countdown happen
// on the moon. BUBBLES: 5 bubbles pop down to 0. QUIZ ×4 (what comes before 5 / 10 / 3 / 20?), ACTIONS (crouch down
// low… jump up high, blast off!), KARAOKE chorus when the take leaves room, SLOW countdown, CHORUS.
import React from 'react';
import { Star, useT } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { Vol } from '../../lib/kids/depth';
import { EASE_INOUT, EASE_OUT, prog, timeWords, type VoLine } from '../../lib/shorts';
import {
  Card, Cast, LEFT, NUMW, QuizCard, SF, SlowCard, SongOverlays, SongStage, Txt, buildShow, keyAt, lineIn, popIn, wordKeys,
  type FormSpec, type Move, type Seg,
} from '../../lib/kids/song-show';

const QUIZ = [
  { parts: ['?', '→', '5'], a: '4' }, { parts: ['?', '→', '10'], a: '9' },
  { parts: ['?', '→', '3'], a: '2' }, { parts: ['?', '→', '20'], a: '19' },
];
const ACTW: Record<string, Move> = { crouch: 'crouch', wait: 'crouch', jump: 'jump', blast: 'cheer' };
const COUNT_SEGS = ['chorus', 'cd10', 'cd20', 'actions', 'slow'];

// ── the rocket (origin = bottom centre of the body, ~360 px tall)
const Rocket: React.FC<{ t: number; flame: number }> = ({ t, flame }) => (
  <g>
    {flame > 0 && (
      <g transform={`translate(0,10) scale(1,${flame * (1 + Math.sin(t * 40) * 0.12)})`}>
        <path d="M -40,0 Q 0,170 40,0 Z" fill="#ff924c" {...kst(5)} />
        <path d="M -22,0 Q 0,100 22,0 Z" fill="#ffca3a" />
      </g>
    )}
    <Vol><path d="M -70,-40 L -120,20 L -60,10 Z" fill="#ff595e" {...kst(6)} /></Vol>
    <Vol><path d="M 70,-40 L 120,20 L 60,10 Z" fill="#ff595e" {...kst(6)} /></Vol>
    <Vol kind="tube"><path d="M -70,10 L -70,-200 Q -70,-300 0,-360 Q 70,-300 70,-200 L 70,10 Z" fill="#f4f1f8" {...kst(8)} /></Vol>
    <path d="M -46,-300 Q 0,-340 46,-300" fill="#ff595e" stroke="none" />
    <Vol><circle cx={0} cy={-190} r={40} fill="#4cc9f0" {...kst(7)} /></Vol>
    <circle cx={-12} cy={-202} r={10} fill="#ffffff" opacity={0.7} />
    <rect x={-70} y={-70} width={140} height={26} fill="#1982c4" {...kst(5)} />
    <path d="M -40,10 L -30,30 L 30,30 L 40,10 Z" fill="#8d99ae" {...kst(5)} />
  </g>
);
const Pad: React.FC = () => (
  <g>
    <rect x={-150} y={0} width={300} height={34} rx={10} fill="#8d99ae" {...kst(6)} />
    <rect x={120} y={-260} width={22} height={260} fill="#ffca3a" {...kst(5)} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M 120,${-230 + i * 60} L 142,${-200 + i * 60}`} stroke={KINK} strokeWidth={4} />)}
  </g>
);
const Smoke: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const d = t - at;
  if (d < 0 || d > 2.2) return null;
  return (
    <g opacity={1 - d / 2.2}>
      {[-1, 1].flatMap((s) => [0, 1, 2].map((i) => (
        <circle key={`${s}${i}`} cx={s * (40 + d * (80 + i * 60))} cy={-10 - i * 14} r={34 + d * 30 + i * 6} fill="#ffffff" {...kst(4)} />
      )))}
    </g>
  );
};

const BubbleRow: React.FC<{ t: number; n: number; popAt: number; popped: number }> = ({ t, n, popAt, popped }) => (
  <g>
    {Array.from({ length: 5 }, (_, i) => {
      const x = (i - 2) * 92;
      const y = Math.sin(t * 2 + i) * 10 + 20;
      if (i < n) return (
        <g key={i} transform={`translate(${x},${y})`}>
          <circle r={40} fill="#9be7ff" opacity={0.55} {...kst(5)} />
          <ellipse cx={-14} cy={-14} rx={9} ry={13} fill="#ffffff" opacity={0.85} />
        </g>
      );
      const d = t - popAt;
      if (i >= n && i < popped && d >= 0 && d < 0.45) return (
        <g key={i} transform={`translate(${x},${y})`} opacity={1 - d / 0.45}>
          {Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2;
            const r0 = 30 + d * 160;
            return <path key={k} d={`M ${Math.cos(a) * r0},${Math.sin(a) * r0} L ${Math.cos(a) * (r0 + 22)},${Math.sin(a) * (r0 + 22)}`} stroke="#4cc9f0" strokeWidth={7} strokeLinecap="round" />;
          })}
        </g>
      );
      return null;
    })}
  </g>
);

export const makeSong070 = (SONG: VoLine[], BEAT: number, DUR: number, FORM: FormSpec) => {
  const show = buildShow(SONG, BEAT, DUR, FORM);
  const linesOf = (names: string[]) => show.segs.filter((g) => names.includes(g.name)).flatMap((g) => g.lines);
  const NK = wordKeys(SONG, linesOf(COUNT_SEGS), (w) => (w in NUMW && NUMW[w] <= 20 ? NUMW[w] : undefined));
  const BLAST = wordKeys(SONG, show.segs.flatMap((g) => g.lines), (w) => (w === 'blast' ? 1 : undefined)).map(([a]) => a);
  const AM = wordKeys(SONG, linesOf(['actions']), (w) => ACTW[w]);
  // bubbles: 5 → pop → 4 … → 0, per bubbles seg
  const BK = new Map<Seg, [number, number][]>();
  show.all('bubbles').forEach((g) => {
    let c = 5;
    const keys: [number, number][] = [[g.t0, 5]];
    g.lines.forEach((li) => timeWords(SONG[li]).forEach((w) => {
      const x = w.w.toLowerCase().replace(/[^a-z]/g, '');
      const v = x === 'pop' ? Math.max(0, c - 1) : x in NUMW && NUMW[x] <= 5 && NUMW[x] < c ? NUMW[x] : undefined;
      if (v !== undefined && v !== c) { c = v; keys.push([w.start, v]); }
    }));
    BK.set(g, keys);
  });

  const rocketY = (t: number) => {
    let L = -1e9;
    for (const b of BLAST) if (b <= t) L = b;
    const d = t - L;
    if (d < 0.25) return { y: 0, flame: d >= 0 ? 0.6 : 0, shake: d >= 0 ? Math.sin(t * 60) * 4 : 0 };
    if (d < 1.9) return { y: -EASE_INOUT(prog(d, 0.25, 1.9)) * 1100, flame: 1.2, shake: 0 };
    if (d < 3.6) return { y: -1100, flame: 0, shake: 0 };
    if (d < 5.0) return { y: -1100 * (1 - EASE_OUT(prog(d, 3.6, 5.0))), flame: 0.5, shake: 0 };
    return { y: 0, flame: 0, shake: 0 };
  };

  return function KidsSongs070() {
    const t = useT();
    const seg = show.segAt(t);
    const k = lineIn(show, seg, t);
    const qi = /^q\d$/.test(seg.name) ? Number(seg.name.slice(1)) - 1 : -1;
    const space = seg.name === 'space' || seg.name === 'cd20';
    const r = rocketY(t);
    const rumble = seg.name === 'rocket' ? Math.sin(t * 50) * 3 : 0;
    const lastBlast = BLAST.filter((b) => b <= t && b >= seg.t0).pop();
    const nk = keyAt(NK.filter(([a]) => a >= seg.t0), t);
    const showCount = COUNT_SEGS.includes(seg.name) && seg.name !== 'slow' && (seg.name !== 'chorus' || k >= 2) && nk;
    let move: Move = 'dance';
    if (seg.name === 'actions') move = keyAt(AM.filter(([a]) => a >= seg.t0), t)?.[1] ?? 'crouch';
    if (lastBlast !== undefined && t - lastBlast < 2.0) move = 'cheer';

    return (
      <>
        <SongStage t={t} show={show} place={space ? 'space-moon' : 'park'} fx={space ? ['stars'] : ['birds']}>
          <g transform={`translate(${LEFT[0] + rumble + r.shake},${SF - 300})`}>
            {!space && <Pad />}
            <g transform={`translate(0,${space ? -120 + Math.sin(t * 1.5) * 20 : r.y})`}><Rocket t={t} flame={space ? 0.8 : r.flame} /></g>
            {!space && BLAST.map((b, i) => <Smoke key={i} t={t} at={b} />)}
            {seg.name === 'rocket' && <Smoke t={t} at={t - ((t - seg.t0) % 1.4)} />}
          </g>

          {(seg.name === 'chorus' || seg.name === 'karaoke') && !showCount && (
            <Card t={t} at={seg.t0 + 0.35} tint="#ff924c">
              <Txt y={-110} size={52} color={KINK} stroke={0} text="COUNT IT BACKWARDS!" />
              <Txt y={40} size={150} color="#ff595e" stroke={13} text="10 → 1" />
            </Card>
          )}
          {showCount && nk && (
            <Card t={t} at={seg.t0 + 0.35} tint="#4cc9f0">
              <Txt y={-130} size={48} color={KINK} stroke={0} text="COUNTDOWN!" />
              {lastBlast !== undefined && lastBlast >= nk[0] ? (
                <g transform={`scale(${popIn(t, lastBlast, 0.3)})`}><Txt y={30} size={110} color="#ff595e" stroke={12} text="BLAST OFF!" /></g>
              ) : (
                <g key={nk[0]} transform={`scale(${popIn(t, nk[0], 0.25)})`}><Txt y={40} size={210} color="#1982c4" stroke={16} text={nk[1]} /></g>
              )}
            </Card>
          )}
          {seg.name === 'rocket' && (
            <Card t={t} at={seg.t0 + 0.35} tint="#ffca3a">
              <Txt y={-80} size={70} color="#ff595e" stroke={9} text="ROCKET" />
              <Txt y={40} size={70} color="#ff595e" stroke={9} text="READY?" />
              <Txt y={140} size={44} color={KINK} stroke={0} text={k >= 2 ? 'BUCKLE IN!' : 'RUMBLE...'} />
            </Card>
          )}
          {seg.name === 'space' && (
            <Card t={t} at={seg.t0 + 0.35} tint="#6a4c93">
              {[[-160, -110], [150, -120], [-130, 120], [170, 110]].map(([x, y], i) => <g key={i} transform={`translate(${x},${y}) scale(${0.4 + Math.abs(Math.sin(t * 2 + i)) * 0.15})`}><Star /></g>)}
              <Txt y={0} size={92} color="#ffca3a" stroke={10} text="IN SPACE!" />
            </Card>
          )}
          {seg.name === 'bubbles' && (() => {
            const keys = BK.get(seg)!;
            const cur = keyAt(keys, t)!;
            const prev = keys[keys.indexOf(cur) - 1];
            return (
              <Card t={t} at={seg.t0 + 0.35} tint="#9be7ff">
                <Txt y={-130} size={48} color={KINK} stroke={0} text="POP THE BUBBLES!" />
                <BubbleRow t={t} n={cur[1]} popAt={cur[0]} popped={prev ? prev[1] : 5} />
                <g key={cur[1]} transform={`translate(0,130) scale(${popIn(t, cur[0], 0.25)})`}><Txt size={84} color="#1982c4" stroke={9} text={cur[1]} /></g>
              </Card>
            );
          })()}
          {qi >= 0 && <QuizCard t={t} show={show} seg={seg} title="WHAT COMES BEFORE?" parts={QUIZ[qi].parts} answer={QUIZ[qi].a} color="#ff924c" />}
          <SlowCard t={t} show={show} items={['5', '4', '3, 2', '1, BLAST OFF!']} color="#ff924c" />

          <Cast t={t} show={show} move={move} xs={[230, 830, 1290, 1700]} place={space ? 'space-moon' : 'park'} />
        </SongStage>
        <SongOverlays t={t} show={show} endText="3, 2, 1… YOU DID IT!" />
      </>
    );
  };
};

