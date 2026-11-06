// TINY SPARKS · Day 84 · 🎵 Educational Songs #12 — "Subtraction Song" (LONG 16:9, original song, ACE-Step vocal)
// kids-shorts/tiny-sparks/songs/day-084-subtraction-song. One file, any take: KidsSongs084A/B/C pass their take
// (SONG_FORM = the sections in the order the take sings them).
// THE TAKE-AWAY TABLE (top left): each verse puts n objects on the table and ONE goes away on the sung word —
// a cupcake gets eaten, a frog jumps off, a balloon pops, a bird flies away, the last cookie gets eaten — the
// cast counts what's left (rainbow badges) and the EQUATION CARD builds n − 1 = n−1 (down to 1 − 1 = 0). QUIZ ×4
// (3−1, 5−2, 4−4, 2−1: the taken ones fade out), ACTIONS (five fingers fold down one by one: the hand card + the kids'
// fingers), KARAOKE chorus, SLOW pass, CHORUS.
import React from 'react';
import { Apple, Confetti, RAINBOW, useT } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';
import { EASE_OUT, prog, timeWords, type VoLine } from '../../lib/shorts';
import { Badge, Hand, Item, Table, groupLayout, type ItemKind } from '../../lib/kids/count-items';
import {
  Card, Cast, LEFT, NUMW, QuizCard, SlowCard, SongOverlays, SongStage, Txt, buildShow, keyAt, lineIn, norm, popIn, wordKeys,
  type FormSpec, type Seg,
} from '../../lib/kids/song-show';

type How = 'eat' | 'jump' | 'pop' | 'fly';
type Verse = { n: number; item: ItemKind; word: string; how: How };
const VERSES: Record<string, Verse> = {
  v1: { n: 5, item: 'cupcake', word: 'ate', how: 'eat' },
  v2: { n: 4, item: 'frog', word: 'jumped', how: 'jump' },
  v3: { n: 3, item: 'balloon', word: 'pop', how: 'pop' },
  v4: { n: 2, item: 'bird', word: 'flew', how: 'fly' },
  v5: { n: 1, item: 'cookie', word: 'ate', how: 'eat' },
};
const QUIZ = [{ a: 3, b: 1 }, { a: 5, b: 2 }, { a: 4, b: 4 }, { a: 2, b: 1 }];
const TX = LEFT[0];
const TY = 300;

/** the gone object's transform at d seconds after it leaves (null = gone) */
const leave = (how: How, d: number): { dx: number; dy: number; s: number; o: number; burst: number } | null => {
  if (d < 0) return { dx: 0, dy: 0, s: 1, o: 1, burst: 0 };
  switch (how) {
    case 'eat': return d < 0.8 ? { dx: 0, dy: 0, s: 1 - EASE_OUT(prog(d, 0.1, 0.8)), o: 1, burst: 0 } : null;
    case 'jump': return d < 1.0 ? { dx: d * 420, dy: -Math.sin(Math.min(1, d) * Math.PI) * 260 + d * 120, s: 1, o: 1 - prog(d, 0.7, 1.0), burst: 0 } : null;
    case 'pop': return d < 0.45 ? { dx: 0, dy: 0, s: d < 0.08 ? 1.15 : 0, o: 1, burst: d } : null;
    default: return d < 1.2 ? { dx: d * 380, dy: -d * 360, s: 1, o: 1 - prog(d, 0.9, 1.2), burst: 0 } : null;
  }
};

const Burst: React.FC<{ d: number }> = ({ d }) => (
  <g opacity={1 - d / 0.45}>
    {Array.from({ length: 10 }, (_, k) => {
      const a = (k / 10) * Math.PI * 2;
      const r0 = 40 + d * 260;
      return <path key={k} d={`M ${Math.cos(a) * r0},${Math.sin(a) * r0} L ${Math.cos(a) * (r0 + 34)},${Math.sin(a) * (r0 + 34)}`} stroke="#ffca3a" strokeWidth={12} strokeLinecap="round" />;
    })}
  </g>
);

const Equation: React.FC<{ t: number; parts: string[]; at: number; ansAt?: number }> = ({ t, parts, at, ansAt }) => (
  <g transform={`scale(${popIn(t, at)})`}>
    {parts.map((p, i) => (
      <g key={i} transform={`translate(${(i - (parts.length - 1) / 2) * 92},40) scale(${i === 4 && ansAt !== undefined ? popIn(t, ansAt) : 1})`}>
        <Txt size={120} color={i % 2 ? KINK : i === 4 ? '#ff595e' : RAINBOW[i + 4]} stroke={i % 2 ? 0 : 11} text={p} />
      </g>
    ))}
  </g>
);

export const makeSong084 = (SONG: VoLine[], BEAT: number, DUR: number, FORM: FormSpec) => {
  const show = buildShow(SONG, BEAT, DUR, FORM);
  const numKeys = (lines: number[]) => wordKeys(SONG, lines, (w) => (w in NUMW && NUMW[w] <= 10 ? NUMW[w] : undefined));
  const V = new Map<Seg, { v: Verse; aAt: number; goAt: number; count: [number, number][] }>();
  show.segs.filter((g) => g.name in VERSES).forEach((g) => {
    const v = VERSES[g.name];
    const aAt = show.at(g, 0);
    const i1 = g.slots.indexOf(1);
    let goAt = show.has(g, 1) ? show.at(g, 1) + 0.8 : show.at(g, 2) - 0.7; // line skipped: leave before the count
    if (i1 >= 0) {
      const w = timeWords(SONG[g.lines[i1]]).find((x) => norm(x.w) === v.word);
      if (w) goAt = w.start;
    }
    const i2 = g.slots.indexOf(2);
    V.set(g, { v, aAt, goAt: Math.max(aAt + 0.6, goAt), count: i2 >= 0 ? numKeys([g.lines[i2]]) : [] });
  });
  // the finger hand: five → fold … → zero ("fold ONE down / ONE more" is not a count)
  const FK = wordKeys(SONG, show.all('actions').flatMap((g) => g.lines), (w, next) =>
    w in NUMW && NUMW[w] <= 5 && !(w === 'one' && (next === 'down' || next === 'more')) ? NUMW[w] : undefined);

  return function KidsSongs084() {
    const t = useT();
    const seg = show.segAt(t);
    const k = lineIn(show, seg, t);
    const qi = /^q\d$/.test(seg.name) ? Number(seg.name.slice(1)) - 1 : -1;
    const vd = V.get(seg);
    const fk = seg.name === 'actions' ? keyAt(FK.filter(([a]) => a >= seg.t0), t) : undefined;
    const fingers = fk ? fk[1] : 5;

    return (
      <>
        <SongStage t={t} show={show} place="party">
          {vd && (() => {
            const { v, aAt, goAt } = vd;
            const pos = groupLayout(v.n, TX, TY, 520);
            const ck = keyAt(vd.count, t);
            const count = k >= 3 ? v.n - 1 : k >= 2 && ck ? Math.min(ck[1], v.n - 1) : 0;
            return (
              <g>
                <Table x={TX} y={TY} />
                {pos.map((p, i) => {
                  const s0 = popIn(t, aAt + i * 0.15);
                  if (s0 <= 0) return null;
                  const gone = i === v.n - 1;
                  const L = gone ? leave(v.how, t - goAt) : { dx: 0, dy: 0, s: 1, o: 1, burst: 0 };
                  if (!L) return null;
                  return (
                    <g key={i} transform={`translate(${p.x + L.dx},${p.y + L.dy + Math.sin(t * 3 + i) * 4})`} opacity={L.o}>
                      {L.burst > 0 && <Burst d={L.burst} />}
                      <g transform={`scale(${p.s * s0 * L.s})`}>
                        <Item kind={v.item} i={i} t={gone && t > goAt ? t * 3 : t} />
                        {count > i && <g transform="translate(0,-115)"><Badge n={i + 1} s={1.2} /></g>}
                      </g>
                    </g>
                  );
                })}
                {v.n === 1 && k >= 2 && <g transform={`translate(${TX},${TY}) scale(${popIn(t, show.at(seg, 2))})`}><Txt size={170} color="#ff595e" stroke={14} text="0" /></g>}
              </g>
            );
          })()}
          {vd && (
            <Card t={t} at={vd.aAt} tint={RAINBOW[(Number(seg.name.slice(1)) + 4) % RAINBOW.length]}>
              <Txt y={-130} size={46} color={KINK} stroke={0} text={k >= 3 ? "WHAT'S LEFT?" : t >= vd.goAt ? 'TAKE ONE AWAY!' : 'HOW MANY?'} />
              {t < vd.goAt ? (
                <g transform={`scale(${popIn(t, vd.aAt)})`}><Txt y={40} size={200} color={RAINBOW[4]} stroke={15} text={vd.v.n} /></g>
              ) : (
                <Equation t={t} parts={k >= 3 ? [String(vd.v.n), '-', '1', '=', String(vd.v.n - 1)] : [String(vd.v.n), '-', '1', '=', '?']} at={vd.goAt} ansAt={k >= 3 ? show.at(seg, 3) : undefined} />
              )}
            </Card>
          )}
          {(seg.name === 'chorus' || seg.name === 'karaoke') && (
            <Card t={t} at={seg.t0 + 0.35} tint="#4cc9f0">
              <Txt y={-120} size={56} color={KINK} stroke={0} text="TAKE AWAY!" />
              <g transform={`scale(${1 + Math.abs(Math.sin(t * 3)) * 0.08})`}><Txt y={40} size={230} color="#1982c4" stroke={16} text="−" /></g>
            </Card>
          )}
          {qi >= 0 && (() => {
            const q = QUIZ[qi];
            const ans = show.at(seg, 1) - 0.05;
            const pos = groupLayout(q.a, TX, TY, 520);
            return (
              <>
                <Table x={TX} y={TY} />
                {pos.map((p, i) => {
                  const taken = i >= q.a - q.b;
                  const fade = taken && t >= ans ? 1 - prog(t, ans, ans + 0.5) * 0.75 : 1;
                  return (
                    <g key={i} transform={`translate(${p.x},${p.y}) scale(${p.s * popIn(t, show.at(seg, 0) + i * 0.12)})`} opacity={fade}>
                      <Apple />
                      {taken && t >= ans && <path d="M -60,-60 L 60,60 M 60,-60 L -60,60" stroke="#ff595e" strokeWidth={16} strokeLinecap="round" />}
                      {!taken && t >= ans && <g transform="translate(0,-115)"><Badge n={i + 1} s={1.2} /></g>}
                    </g>
                  );
                })}
                <QuizCard t={t} show={show} seg={seg} title="TAKE AWAY!" parts={[String(q.a), '-', String(q.b), '=', '?']} answer={String(q.a - q.b)} color="#1982c4" />
              </>
            );
          })()}
          {seg.name === 'actions' && (
            <Card t={t} at={seg.t0 + 0.35} tint="#ffca3a">
              <g transform="translate(-110,60) scale(0.95)"><Hand n={fingers} /></g>
              <g key={fingers} transform={`translate(140,30) scale(${fk ? popIn(t, fk[0], 0.25) : 1})`}><Txt size={190} color="#ff595e" stroke={15} text={fingers} /></g>
            </Card>
          )}
          <SlowCard t={t} show={show} items={['3 - 1', '3 - 1 = 2', '2 - 1', '2 - 1 = 1']} color="#1982c4" />

          <Cast t={t} show={show} move={seg.name === 'actions' ? 'fingers' : vd && k === 3 ? 'cheer' : 'dance'} fingers={fingers} present={!!vd && k < 3} xs={[230, 860, 1290, 1700]} />
        </SongStage>
        <SongOverlays t={t} show={show} endText="YOU CAN TAKE AWAY!" />
        {[...V.entries()].filter(([g]) => show.has(g, 3)).map(([g], i) => <Confetti key={i} t={t} at={show.endOf(g, 3)} y={360} dur={1.2} />)}
      </>
    );
  };
};
