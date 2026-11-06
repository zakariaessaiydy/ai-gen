// TINY SPARKS · Day 77 · 🎵 Educational Songs #11 — "Addition Song" (LONG 16:9, original song, ACE-Step vocal)
// kids-shorts/tiny-sparks/songs/day-077-addition-song. One file, any take: KidsSongs077A/B/C pass their take
// (SONG_FORM = the sections in the order the take sings them).
// THE ADDING TABLE (top left): each verse puts group A on the table, then group B joins ("one more too!"), the
// cast counts them all (a rainbow badge pops on each object as its number is sung) and the EQUATION CARD builds
// a + b = c. Verses: 1 + 1 apples · 2 + 1 ducks · 2 + 2 balls · 3 + 2 stars · 5 + 5 fingers. QUIZ ×4 (1+1, 2+2, 3+1,
// 4+1 with apples on the table), ACTIONS (clap, stomp, jump — counted), KARAOKE chorus, SLOW pass, CHORUS.
import React from 'react';
import { Confetti, RAINBOW, useT } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';
import { timeWords, type VoLine } from '../../lib/shorts';
import { Badge, Item, Table, groupLayout, type ItemKind } from '../../lib/kids/count-items';
import {
  Card, Cast, LEFT, NUMW, QuizCard, SlowCard, SongOverlays, SongStage, Txt, buildShow, keyAt, lineIn, norm, popIn, wordKeys,
  type FormSpec, type Move, type Seg, type Show,
} from '../../lib/kids/song-show';

type Verse = { a: number; b: number; item: ItemKind; bSlot: number; bAfter?: string };
const VERSES: Record<string, Verse> = {
  v1: { a: 1, b: 1, item: 'apple', bSlot: 0, bAfter: 'apple' },
  v2: { a: 2, b: 1, item: 'duck', bSlot: 1 },
  v3: { a: 2, b: 2, item: 'ball', bSlot: 0, bAfter: 'and' },
  v4: { a: 3, b: 2, item: 'star', bSlot: 0, bAfter: 'and' },
  v5: { a: 5, b: 5, item: 'finger', bSlot: 1 },
};
const QUIZ = [{ a: 1, b: 1 }, { a: 2, b: 2 }, { a: 3, b: 1 }, { a: 4, b: 1 }];
const ACTW: Record<string, Move> = { clap: 'clap', stomp: 'stomp', jump: 'jump', makes: 'cheer' };
const TX = LEFT[0];
const TY = 300;
const GA = TX - 190;
const GB = TX + 190;

const wordTime = (song: VoLine[], show: Show, seg: Seg, slot: number, after?: string): number => {
  const i = seg.slots.indexOf(slot);
  if (i < 0) return show.at(seg, slot);
  const ws = timeWords(song[seg.lines[i]]);
  if (!after) return ws[0].start;
  const k = ws.findIndex((w) => norm(w.w) === after);
  return k >= 0 && k + 1 < ws.length ? ws[k + 1].start : ws[0].start;
};

/** two groups on the table: A pops at aAt, B at bAt; badge i shows once count >= i+1 */
const Groups: React.FC<{ t: number; a: number; b: number; item: ItemKind; aAt: number; bAt: number; count: number; plusAt: number }> = ({ t, a, b, item, aAt, bAt, count, plusAt }) => {
  const sm = Math.min(groupLayout(a, 0, 0, 270)[0].s, groupLayout(b, 0, 0, 270)[0].s); // one object size for both groups
  const A = groupLayout(a, GA, TY, 270).map((p) => ({ ...p, s: sm }));
  const B = groupLayout(b, GB, TY, 270).map((p) => ({ ...p, s: sm }));
  const all = [...A.map((p, i) => ({ ...p, at: aAt + i * 0.15, i })), ...B.map((p, i) => ({ ...p, at: bAt + i * 0.15, i: a + i }))];
  return (
    <g>
      <Table x={TX} y={TY} />
      {t >= plusAt && <g transform={`translate(${TX},${TY}) scale(${popIn(t, plusAt)})`}><Txt size={110} color="#ff595e" stroke={12} text="+" /></g>}
      {all.map((p) => {
        const s = popIn(t, p.at);
        if (s <= 0) return null;
        return (
          <g key={p.i} transform={`translate(${p.x},${p.y + Math.sin(t * 3 + p.i) * 4}) scale(${p.s * s})`}>
            <Item kind={item} i={p.i} t={t} />
            {count > p.i && <g transform="translate(0,-115)"><Badge n={p.i + 1} s={1.2} /></g>}
          </g>
        );
      })}
    </g>
  );
};

const Equation: React.FC<{ t: number; a: number; b: number; c?: number; at: number; cAt: number; big?: boolean }> = ({ t, a, b, c, at, cAt, big }) => {
  const sz = big ? 130 : 110;
  const parts = [String(a), '+', String(b), '=', t >= cAt ? String(c) : '?'];
  return (
    <g transform={`scale(${popIn(t, at)})`}>
      {parts.map((p, i) => (
        <g key={i} transform={`translate(${(i - 2) * 92},40) scale(${i === 4 && t >= cAt ? popIn(t, cAt) : 1})`}>
          <Txt size={sz} color={i % 2 ? KINK : i === 4 ? '#ff595e' : RAINBOW[i + 3]} stroke={i % 2 ? 0 : 11} text={p} />
        </g>
      ))}
    </g>
  );
};

export const makeSong077 = (SONG: VoLine[], BEAT: number, DUR: number, FORM: FormSpec) => {
  const show = buildShow(SONG, BEAT, DUR, FORM);
  const numKeys = (lines: number[]) => wordKeys(SONG, lines, (w) => (w in NUMW && NUMW[w] <= 10 ? NUMW[w] : undefined));
  const V = new Map<Seg, { v: Verse; aAt: number; bAt: number; cAt: number; count: [number, number][] }>();
  show.segs.filter((g) => g.name in VERSES).forEach((g) => {
    const v = VERSES[g.name];
    const c = v.a + v.b;
    const aAt = show.at(g, 0);
    const bAt = Math.max(aAt + 0.5, wordTime(SONG, show, g, v.bSlot, v.bAfter));
    const i1 = g.slots.indexOf(1);
    const cK = i1 >= 0 ? numKeys([g.lines[i1]]).filter(([, n]) => n === c).pop() : undefined;
    const cAt = cK ? cK[0] : show.endOf(g, 1) - 0.3;
    const i2 = g.slots.indexOf(2);
    const count = i2 >= 0 ? numKeys([g.lines[i2]]) : [];
    V.set(g, { v, aAt, bAt, cAt, count });
  });
  const actLines = show.all('actions').flatMap((g) => g.lines);
  const AM = wordKeys(SONG, actLines, (w) => ACTW[w]);
  const AN = numKeys(actLines);

  return function KidsSongs077() {
    const t = useT();
    const seg = show.segAt(t);
    const k = lineIn(show, seg, t);
    const qi = /^q\d$/.test(seg.name) ? Number(seg.name.slice(1)) - 1 : -1;
    const vd = V.get(seg);
    let move: Move = 'dance';
    const act = seg.name === 'actions' ? keyAt(AM.filter(([a]) => a >= seg.t0), t) : undefined;
    if (seg.name === 'actions') move = act?.[1] ?? 'clap';
    if (vd && k === 3) move = 'cheer';
    const an = seg.name === 'actions' ? keyAt(AN.filter(([a]) => a >= seg.t0), t) : undefined;

    return (
      <>
        <SongStage t={t} show={show} place="kitchen">
          {vd && (() => {
            const ck = keyAt(vd.count, t);
            const count = k >= 3 ? vd.v.a + vd.v.b : ck ? ck[1] : 0;
            return <Groups t={t} a={vd.v.a} b={vd.v.b} item={vd.v.item} aAt={vd.aAt} bAt={vd.bAt} count={k >= 2 ? count : 0} plusAt={vd.bAt - 0.1} />;
          })()}
          {vd && (
            <Card t={t} at={vd.aAt} tint={RAINBOW[(Number(seg.name.slice(1)) + 2) % RAINBOW.length]}>
              <Txt y={-130} size={46} color={KINK} stroke={0} text={k >= 2 ? (k >= 3 ? 'ALL TOGETHER!' : 'COUNT THEM ALL!') : 'ADD THEM UP!'} />
              {t < vd.bAt ? (
                <g transform={`scale(${popIn(t, vd.aAt)})`}><Txt y={40} size={200} color={RAINBOW[3]} stroke={15} text={vd.v.a} /></g>
              ) : (
                <Equation t={t} a={vd.v.a} b={vd.v.b} c={vd.v.a + vd.v.b} at={vd.bAt} cAt={vd.cAt} big={k >= 3} />
              )}
            </Card>
          )}
          {(seg.name === 'chorus' || seg.name === 'karaoke') && (
            <Card t={t} at={seg.t0 + 0.35} tint="#ffca3a">
              <Txt y={-120} size={52} color={KINK} stroke={0} text="PLUS MEANS MORE!" />
              <g transform={`rotate(${Math.sin(t * 2) * 8}) scale(${1 + Math.abs(Math.sin(t * 3)) * 0.08})`}><Txt y={50} size={230} color="#ff595e" stroke={16} text="+" /></g>
            </Card>
          )}
          {qi >= 0 && (() => {
            const q = QUIZ[qi];
            const ans = show.at(seg, 1) - 0.05;
            return (
              <>
                <Groups t={t} a={q.a} b={q.b} item="apple" aAt={show.at(seg, 0)} bAt={show.at(seg, 0) + 0.4} count={t >= ans ? q.a + q.b : 0} plusAt={show.at(seg, 0) + 0.3} />
                <QuizCard t={t} show={show} seg={seg} title="ADD IT UP!" parts={[String(q.a), '+', String(q.b), '=', '?']} answer={String(q.a + q.b)} />
              </>
            );
          })()}
          {seg.name === 'actions' && (
            <Card t={t} at={seg.t0 + 0.35} tint="#8ac926">
              <Txt y={-130} size={48} color={KINK} stroke={0} text="MOVE AND ADD!" />
              {act && act[1] === 'cheer' ? (
                <g transform={`translate(0,0) scale(${popIn(t, act[0])})`}><Equation t={t} a={2} b={2} c={4} at={act[0]} cAt={act[0]} /></g>
              ) : (
                <g>
                  <Txt y={-40} size={80} color="#ff6fa5" stroke={9} text={act ? `${act[1].toUpperCase()}!` : 'CLAP!'} />
                  {an && <g key={an[0]} transform={`translate(0,90) scale(${popIn(t, an[0], 0.25)})`}><Txt size={130} color="#1982c4" stroke={12} text={an[1]} /></g>}
                </g>
              )}
            </Card>
          )}
          <SlowCard t={t} show={show} items={['1 + 1', '1 + 1 = 2', '2 + 2', '2 + 2 = 4']} color="#ff595e" />

          <Cast t={t} show={show} move={move} present={!!vd && k < 3} xs={[230, 860, 1290, 1700]} />
        </SongStage>
        <SongOverlays t={t} show={show} endText="YOU CAN ADD!" />
        {[...V.entries()].filter(([g]) => show.has(g, 3)).map(([g], i) => <Confetti key={i} t={t} at={show.endOf(g, 3)} y={360} dur={1.2} />)}
      </>
    );
  };
};
