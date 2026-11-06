// TINY SPARKS · Day 63 · 🎵 Educational Songs #9 — "Numbers 1–100 Song" (LONG 16:9, original song, ACE-Step vocal)
// kids-shorts/tiny-sparks/songs/day-063-numbers-1-100-song. One file, any take: KidsSongs063A/B/C pass their take.
// THE HUNDRED CHART (top left, 10 × 10) fills cell by cell as each number is sung — row colours, the number being sung
// pops big on the card (with its name), and every ten ends on a CHEER the cast does (clap · stomp · jump · wiggle ·
// half way · spin · touch your nose · wave · almost · hooray!). Then COUNT BY TENS (the last column lights up), QUIZ ×4
// (what comes after 19 / 39 / 50 / 99?), ACTIONS (clap for ten, stomp for twenty…), KARAOKE chorus, SLOW tens, CHORUS.
import React from 'react';
import { Confetti, RAINBOW, useT } from '../../lib/kids/kit';
import { KINK, kst } from '../../lib/kids/face';
import { timeWords, type VoLine } from '../../lib/shorts';
import {
  Card, Cast, LEFT, QuizCard, SlowCard, SongOverlays, SongStage, Txt, buildShow, keyAt, lineIn, popIn, wordKeys,
  type FormSpec, type Move, type Seg,
} from '../../lib/kids/song-show';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const nameOf = (n: number) => (n === 100 ? 'one hundred' : n < 10 ? ONES[n] : n < 20 ? TEENS[n - 10] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''));
const wordCount = (n: number) => (n === 100 ? 2 : n <= 20 || n % 10 === 0 ? 1 : 2);
const TENW: Record<string, number> = { ten: 10, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };

const CHEER: { move: Move; label: string }[] = [
  { move: 'clap', label: 'CLAP!' }, { move: 'stomp', label: 'STOMP!' }, { move: 'jump', label: 'JUMP!' }, { move: 'wiggle', label: 'WIGGLE!' },
  { move: 'cheer', label: 'HALF WAY!' }, { move: 'spin', label: 'SPIN!' }, { move: 'nose', label: 'NOSE!' }, { move: 'wave', label: 'WAVE!' },
  { move: 'cheer', label: 'ALMOST!' }, { move: 'cheer', label: 'HOORAY!' },
];
const QUIZ = [
  { parts: ['19', '→', '?'], a: '20' }, { parts: ['39', '→', '?'], a: '40' },
  { parts: ['50', '→', '?'], a: '51' }, { parts: ['99', '→', '?'], a: '100' },
];
const ACTW: Record<string, Move> = { clap: 'clap', stomp: 'stomp', jump: 'jump', spin: 'spin', wave: 'wave', nifty: 'cheer' };

// ── the hundred chart
const CELL = 50;
const Chart: React.FC<{ t: number; T: number[]; cur: number; lit: Set<number> }> = ({ t, T, cur, lit }) => (
  <g transform={`translate(${LEFT[0] - CELL * 5},${LEFT[1] - CELL * 5})`}>
    <rect x={-16} y={-16} width={CELL * 10 + 32} height={CELL * 10 + 32} rx={26} fill="#ffffff" {...kst(9)} />
    {Array.from({ length: 100 }, (_, i) => {
      const n = i + 1;
      const on = t >= T[n];
      const hot = n === cur || lit.has(n);
      const s = hot ? 1.25 : on ? popIn(t, T[n], 0.3) || 1 : 1;
      const cx = (i % 10) * CELL + CELL / 2;
      const cy = Math.floor(i / 10) * CELL + CELL / 2;
      return (
        <g key={n} transform={`translate(${cx},${cy}) scale(${s})`}>
          <rect x={-CELL / 2 + 2} y={-CELL / 2 + 2} width={CELL - 4} height={CELL - 4} rx={9} fill={hot ? '#ffca3a' : on ? RAINBOW[Math.floor(i / 10)] : '#f4f1f8'} stroke={hot ? KINK : on ? KINK : '#d8d2e0'} strokeWidth={hot ? 4 : 2} />
          <text y={8} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={n === 100 ? 17 : 21} fill={on || hot ? '#ffffff' : '#b9b0c6'} stroke={on || hot ? KINK : 'none'} strokeWidth={on || hot ? 2.5 : 0} paintOrder="stroke">{n}</text>
        </g>
      );
    })}
  </g>
);

export const makeSong063 = (SONG: VoLine[], BEAT: number, DUR: number, FORM: FormSpec) => {
  const show = buildShow(SONG, BEAT, DUR, FORM);
  // when each number is first sung (its block's slots 0-1); a block the take skipped fills with the next one sung
  const T: number[] = Array(102).fill(1e9);
  const blockTimes = (seg: Seg): number[] => {
    const out: number[] = Array(11).fill(1e9);
    const b = Number(seg.name.slice(1)) - 1;
    const ws = seg.lines.filter((_, i) => seg.slots[i] < 2).flatMap((li) => timeWords(SONG[li]));
    const firstSlot = seg.slots[0];
    let wi = 0;
    const n0 = firstSlot === 1 ? 6 : 1; // the take started the block on its 2nd line
    for (let m = n0; m <= 10; m++) {
      if (ws.length) out[m] = ws[Math.min(wi, ws.length - 1)].start;
      wi += wordCount(b * 10 + m);
    }
    for (let m = 1; m < n0; m++) out[m] = out[n0];
    return out;
  };
  const BT = new Map<Seg, number[]>();
  show.segs.filter((g) => /^n\d+$/.test(g.name)).forEach((g) => {
    const bt = blockTimes(g);
    BT.set(g, bt);
    const b = Number(g.name.slice(1)) - 1;
    for (let m = 1; m <= 10; m++) T[b * 10 + m] = Math.min(T[b * 10 + m], bt[m]);
  });
  for (let n = 99; n >= 1; n--) T[n] = Math.min(T[n], T[n + 1]); // a cell is on once it or any bigger number was sung
  const tensKeys = (segs: Seg[]) => wordKeys(SONG, segs.flatMap((g) => g.lines), (w) => TENW[w]);
  const TK = tensKeys(show.all('tens'));
  const SK = tensKeys(show.all('slow'));
  const AK = tensKeys(show.all('actions'));
  const AM = wordKeys(SONG, show.all('actions').flatMap((g) => g.lines), (w) => ACTW[w]);
  const cheers = show.segs.filter((g) => /^n\d+$/.test(g.name) && show.has(g, 2));

  return function KidsSongs063() {
    const t = useT();
    const seg = show.segAt(t);
    const k = lineIn(show, seg, t);
    const b = /^n\d+$/.test(seg.name) ? Number(seg.name.slice(1)) - 1 : -1;
    const qi = /^q\d$/.test(seg.name) ? Number(seg.name.slice(1)) - 1 : -1;
    let cur = -1;
    let curAt = 0;
    if (b >= 0) { const bt = BT.get(seg)!; for (let m = 1; m <= 10; m++) if (t >= bt[m]) { cur = b * 10 + m; curAt = bt[m]; } }
    const lit = new Set<number>();
    if (seg.name === 'tens') TK.forEach(([at, v]) => at <= t && lit.add(v));
    if (seg.name === 'slow') SK.forEach(([at, v]) => at <= t && lit.add(v));
    if (seg.name === 'actions') { const a = keyAt(AK, t); if (a) lit.add(a[1]); }
    if (qi >= 0) {
      lit.add(Number(QUIZ[qi].parts[0]));
      if (t >= show.at(seg, 1) - 0.05) lit.add(Number(QUIZ[qi].a));
    }
    const cheer = b >= 0 && k === 2;
    let move: Move = 'dance';
    if (cheer) move = CHEER[b].move;
    if (seg.name === 'actions') move = keyAt(AM, t)?.[1] ?? 'clap';
    const lastTen = keyAt((seg.name === 'tens' ? TK : seg.name === 'actions' ? AK : []).filter(([at]) => at >= seg.t0), t);

    return (
      <>
        <SongStage t={t} show={show} place="playroom">
          <Chart t={t} T={T} cur={cur} lit={lit} />

          {(seg.name === 'chorus' || seg.name === 'karaoke') && (
            <Card t={t} at={seg.t0 + 0.35} tint="#ffca3a">
              <Txt y={-110} size={56} color={KINK} stroke={0} text="LET'S COUNT TO" />
              <g transform={`scale(${1 + Math.abs(Math.sin(t * 3)) * 0.06})`}><Txt y={40} size={190} color="#ff595e" stroke={14} text="100" /></g>
            </Card>
          )}
          {b >= 0 && !cheer && (
            <Card t={t} at={show.at(seg, 0)} tint={RAINBOW[b]}>
              <Txt y={-140} size={44} color={KINK} stroke={0} text={`${b * 10 + 1} – ${b * 10 + 10}`} />
              {cur > 0 && (
                <g key={cur} transform={`scale(${popIn(t, curAt, 0.25)})`}>
                  <Txt y={10} size={190} color={RAINBOW[b]} stroke={15} text={cur} />
                  <Txt y={140} size={50} color={KINK} stroke={0} text={nameOf(cur)} />
                </g>
              )}
            </Card>
          )}
          {cheer && (
            <Card t={t} at={show.at(seg, 2)} tint="#ffca3a" rot={2}>
              <g transform={`scale(${popIn(t, show.at(seg, 2))})`}>
                <Txt y={-60} size={170} color={RAINBOW[b]} stroke={14} text={(b + 1) * 10} />
                <Txt y={110} size={CHEER[b].label.length > 8 ? 70 : 90} color="#ff6fa5" stroke={9} text={CHEER[b].label} />
              </g>
            </Card>
          )}
          {(seg.name === 'tens' || seg.name === 'actions') && (
            <Card t={t} at={seg.t0 + 0.35} tint="#4cc9f0">
              <Txt y={-130} size={48} color={KINK} stroke={0} text={seg.name === 'tens' ? 'COUNT BY TENS!' : 'MOVE AND COUNT!'} />
              {lastTen && (
                <g key={lastTen[1]} transform={`scale(${popIn(t, lastTen[0], 0.25)})`}>
                  <Txt y={40} size={180} color="#1982c4" stroke={14} text={lastTen[1]} />
                </g>
              )}
            </Card>
          )}
          {qi >= 0 && <QuizCard t={t} show={show} seg={seg} title="WHAT COMES NEXT?" parts={QUIZ[qi].parts} answer={QUIZ[qi].a} />}
          <SlowCard t={t} show={show} items={['10, 20', '30, 40', '50, 60', '70 … 100']} />

          <Cast t={t} show={show} move={move} present={b >= 0 && !cheer} xs={[230, 830, 1290, 1700]} />
        </SongStage>
        <SongOverlays t={t} show={show} endText="YOU CAN COUNT TO 100!" />
        {cheers.map((sg, i) => <Confetti key={i} t={t} at={show.at(sg, 2)} y={360} dur={1.2} />)}
      </>
    );
  };
};
