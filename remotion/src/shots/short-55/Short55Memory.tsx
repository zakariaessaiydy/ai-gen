import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, EASE_INOUT, EASE_OUT, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog, timeWords } from '../../lib/shorts';
import { DAY_MS, DayMeter, LifeGrid, WEEKDAYS, fmtDate, makeLife, utc, weekday } from '../../lib/days';
import { Tag } from '../../lib/suns';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short55Memory',
  durationInSeconds: 40.3,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = '#f5d76e';
const TEAL = '#4db8a8';
const PINK = '#e8879f';
const INDIGO = '#8f93f7';
const F = (s: number) => Math.round(s * 30);
const END = F(40.3);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short55Memory: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);

// =============================================================================
// THE LIFE — 30 calendar years, one cell per real day, drawn as contribution-graph blocks.
// =============================================================================
const LIFE = makeLife({
  from: utc(1996, 1, 1),
  years: 30,
  x0: 164,
  y0: 372,
  pitch: 6.6,
  size: 5.2,
  cols: 2,
  colGap: 40,
  rowGap: 10,
  landmarksPerYear: 9,
  recentDays: 21,
  badShare: 0.05,
  stag: 8,
  seed: 55,
});
const LAST = LIFE.to - DAY_MS;

// "a random Tuesday from three years ago": the Tuesday on/before three years back, that a
// normal memory did NOT keep (so it really goes dark on "Gone")
const tuesday = (() => {
  let t = LAST - 3 * 365 * DAY_MS;
  t -= ((weekday(t) - 1 + 7) % 7) * DAY_MS;
  while (LIFE.cells[LIFE.index(t)].cls !== 'plain') t -= 7 * DAY_MS;
  return t;
})();
// "Name a date": the ring hops, then lands; the weekday is computed off the calendar
const HOPS = [utc(2003, 7, 19), utc(1999, 12, 31), utc(2011, 3, 14)];
const LANDED = HOPS[HOPS.length - 1];

// =============================================================================
// CUES — spoken words, global frames (the only <Sequence> is the PauseCard).
// =============================================================================
const HOOK_OUT = F(word(0, 'life').end) + 4;
const SWEEP = wAt(1, 'eleven');
const TUES = wAt(2, 'tuesday');
const GONE = wAt(2, 'gone');
const HSAM = wAt(3, 'hsam');
const EVERY = wAt(3, 'every');
const NAME = wAt(4, 'name');
const WEEKDAY = wAt(4, 'weekday');
const WEATHER = wAt(4, 'weather');
const DID = wAt(4, 'did');
const EXAM = wAt(5, 'exam');
const QUIZ_IN = F(VO[5].end + 0.15);
const QUIZ_OUT = F(VO[6].start - 0.1);
const NO = wAt(6, 'no');
const PAIRS = wAt(6, 'pairs');
const EVERYONE = wAt(6, 'everyone');
const SWITCH = wAt(7, 'and');
const BAD = wAt(7, 'bad');
const SHARP = wAt(7, 'sharp');
const FIRST = wAt(8, 'first');
const Q_WORDS = [wAt(8, 'nonstop'), wAt(8, 'uncontrollable'), wAt(8, 'totally')];
const FORGET = wAt(9, 'forgetting');
const FILTER = wAt(9, 'filter');
const RELIGHT = F(VO[9].end) + 2;
const HOP_AT = [NAME, NAME + 9, NAME + 18];

// the claims on the voice track, checked against the calendar that draws the picture
{
  if (!(LIFE.n > 10900 && LIFE.n < 11000)) throw new Error(`Short55Memory: "almost eleven thousand days" (calendar ${LIFE.n})`);
  if (new Date(LAST).getUTCFullYear() - LIFE.y1 + 1 !== 30) throw new Error('Short55Memory: "thirty years"');
  if (weekday(tuesday) !== 1) throw new Error('Short55Memory: the random day must be a Tuesday');
  const back = (LAST - tuesday) / DAY_MS / 365.25;
  if (back < 2.9 || back > 3.2) throw new Error(`Short55Memory: "three years ago" (${back.toFixed(2)} y)`);
  if (WEEKDAYS[weekday(LANDED)] !== 'MONDAY') throw new Error('Short55Memory: Mar 14, 2011 was a Monday');
  if (QUIZ_OUT - QUIZ_IN < 60) throw new Error('Short55Memory: the quiz needs ~2 s of silence');
  if (!(RELIGHT + 8 * 3 + 12 < END - 4)) throw new Error('Short55Memory: the relight must finish before the loop frame');
  const last = VO[VO.length - 1];
  if (last.end + 0.8 > END / 30 - 0.3) throw new Error('Short55Memory: the last caption must clear before the loop');
}

const pulse = (f: number, at: number, len = 22) => Math.sin(Math.PI * prog(f, at - 2, at + len));
const span = (f: number, a: number, b: number) => EASE_OUT(prog(f, a - 2, a + 8)) * (1 - prog(f, b - 8, b));

// ---- colour helpers (hex → mixed hex)
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], t))).join(',')})`;
};

// ---- the memory model per cell group: two forget/relight cycles, a sweep, the bad days
const TARGET = { plain: 0.05, bad: 0.05, landmark: 0.9, recent: 0.85 } as const;
const forgetP = (f: number, s: number, at: number) => EASE_INOUT(prog(f, at + s * 2, at + s * 2 + 16));
const relightP = (f: number, s: number, at: number) => EASE_OUT(prog(f, at + s * 3, at + s * 3 + 12));
const forgotten = (f: number, sR: number, sC: number) =>
  Math.max(forgetP(f, sR, GONE) * (1 - relightP(f, sC, HSAM)), forgetP(f, sR, FORGET) * (1 - relightP(f, sC, RELIGHT)));
const badT = (f: number, sR: number) => EASE_OUT(prog(f, BAD + sR * 2, BAD + sR * 2 + 10)) * (1 - prog(f, FORGET, FORGET + 16));
const brightOf = (f: number, g: (typeof LIFE.groups)[number]) => {
  const amt = forgotten(f, g.sR, g.sC);
  let b = mix(1, TARGET[g.cls], amt);
  if (g.cls === 'bad') b = Math.max(b, badT(f, g.sR) * (0.8 + 0.2 * Math.sin((f - BAD) / 5 + g.sR)));
  else b *= 1 - 0.55 * span(f, BAD, FORGET); // everything else steps back so the bad days read
  return b;
};

const cellCenter = (ms: number): [number, number] => {
  const c = LIFE.cells[LIFE.index(ms)];
  return [c.x + LIFE.o.size / 2, c.y + LIFE.o.size / 2];
};
const PC: [number, number] = [540, 790];

// =============================================================================
// CARDS
// =============================================================================
const Card: React.FC<{ y: number; o: number; accent: string; children: React.ReactNode }> = ({ y, o, accent, children }) =>
  o > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        left: 150,
        width: 780,
        top: y,
        opacity: o,
        transform: `translateY(${(1 - o) * 18}px)`,
        background: 'rgba(12,15,22,0.985)',
        border: `2px solid ${accent}66`,
        borderLeft: `10px solid ${accent}`,
        borderRadius: 20,
        padding: '26px 34px',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
      }}
    >
      {children}
    </div>
  ) : null;

const Row: React.FC<{ label: string; value: string; o: number; color?: string }> = ({ label, value, o, color = '#fff' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
    <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color, opacity: 0.15 + 0.85 * o, transform: `translateX(${(1 - o) * 14}px)` }}>
      {o > 0.01 ? value : '…'}
    </div>
  </div>
);

const PAIRS_LIST = [
  ['APPLE', 'RIVER'],
  ['CHAIR', 'CLOUD'],
  ['LAMP', 'TIGER'],
  ['SALT', 'PENCIL'],
];

export default function Short55Memory() {
  const f = useCurrentFrame();

  const punch = f < RELIGHT ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, RELIGHT, END - 1)));
  const quizDim = span(f, QUIZ_IN, QUIZ_OUT);
  const cardDim = Math.max(span(f, NO, SWITCH), 0.6 * span(f, FIRST + 4, FORGET));
  const gridO = 1 - Math.max(0.5 * quizDim, 0.7 * cardDim);
  const titleO = f < RELIGHT ? 1 - prog(f, HOOK_OUT - 6, HOOK_OUT + 2) : EASE_OUT(prog(f, RELIGHT + 4, RELIGHT + 26));

  // the sweep on "eleven thousand": a bright wave runs through the years in order
  const style = (g: (typeof LIFE.groups)[number]) => {
    const b = brightOf(f, g);
    const wave = pulse(f, SWEEP + g.sC * 3, 12);
    const base = g.cls === 'bad' ? mixHex(TEAL, PINK, badT(f, g.sR)) : TEAL;
    return { o: b, fill: wave > 0.01 ? mixHex(base.startsWith('#') ? base : TEAL, '#d8fff6', wave * 0.8) : base };
  };

  // the meter reads the grid: a day counts once its cell is more lit than not
  const replay = LIFE.groups.reduce((s, g) => s + (brightOf(f, g) > 0.5 || (g.cls === 'bad' && badT(f, g.sR) > 0.5) ? g.n : 0), 0);
  const illustrative = Math.max(forgotten(f, 0, 0), forgotten(f, 7, 7), span(f, BAD, FORGET));

  // the ring: the Tuesday, then the hops
  const hopI = HOP_AT.filter((a) => f >= a).length - 1;
  const ringMs = f < NAME ? tuesday : HOPS[Math.max(0, hopI)];
  const ringO = f < NAME ? span(f, TUES, HSAM) : span(f, NAME, QUIZ_IN);
  const [rx, ry] = cellCenter(ringMs);
  const ringPop = f < NAME ? pulse(f, TUES, 14) : pulse(f, HOP_AT[Math.max(0, hopI)], 10);
  const toScreen = ([x, y]: [number, number]): [number, number] => [PC[0] + punch * (x - PC[0]), PC[1] + punch * (y - PC[1])];
  const [sx, sy] = toScreen([rx, ry]);

  return (
    <AbsoluteFill style={{ background: '#07090f' }}>
      <ShortsBackdrop base="#07090f" glow="#10202a" />

      {/* THE CANVAS — every day of a 30-year life */}
      <AbsoluteFill style={{ opacity: gridO }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(${PC[0]} ${PC[1]}) scale(${punch}) translate(${-PC[0]} ${-PC[1]})`}>
            <LifeGrid life={LIFE} style={style} />
            {[0, LIFE.perCol].map((yr) => {
              const b = LIFE.blockOrigin(yr);
              return (
                <text key={yr} x={b.x} y={b.y - 12} fill="rgba(255,255,255,0.45)" fontFamily={FONT_MONO} fontWeight={700} fontSize={20} letterSpacing={2}>
                  {`${LIFE.y1 + yr} →`}
                </text>
              );
            })}
            <text x={LIFE.blockOrigin(LIFE.o.years - 1).x + LIFE.blockW} y={LIFE.blockOrigin(LIFE.o.years - 1).y + LIFE.blockH + 30} textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily={FONT_MONO} fontWeight={700} fontSize={20} letterSpacing={2}>
              {`TODAY`}
            </text>
          </g>
          {ringO > 0.01 ? (
            <g opacity={ringO}>
              <circle cx={sx} cy={sy} r={20 + 10 * ringPop} fill="none" stroke={ACCENT} strokeWidth={4} />
              <rect x={sx - 4} y={sy - 4} width={8} height={8} fill={ACCENT} />
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>

      {/* the Tuesday nobody kept */}
      <Card y={430} o={span(f, TUES + 4, HSAM)} accent={f >= GONE ? PINK : ACCENT}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: 'rgba(255,255,255,0.5)' }}>A RANDOM DAY</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: ACCENT, marginTop: 6 }}>{`${WEEKDAYS[weekday(tuesday)]} · ${fmtDate(tuesday)}`}</div>
        <Row label="WHAT YOU DID" value="???" o={EASE_OUT(prog(f, GONE, GONE + 8))} color={PINK} />
      </Card>

      {/* the date an HSAM mind answers */}
      <Card y={880} o={span(f, NAME + 20, QUIZ_IN)} accent={ACCENT}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: 'rgba(255,255,255,0.5)' }}>NAME A DATE</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: ACCENT, marginTop: 6 }}>{fmtDate(LANDED)}</div>
        <Row label="WEEKDAY" value={WEEKDAYS[weekday(LANDED)]} o={EASE_OUT(prog(f, WEEKDAY, WEEKDAY + 8))} color={TEAL} />
        <Row label="WEATHER" value="LIGHT RAIN" o={EASE_OUT(prog(f, WEATHER, WEATHER + 8))} />
        <Row label="WHAT THEY DID" value="FIRST DAY, NEW JOB" o={EASE_OUT(prog(f, DID, DID + 8))} />
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 20, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>EXAMPLE ANSWERS</div>
      </Card>

      {/* the test */}
      <Card y={560} o={span(f, NO + 4, SWITCH)} accent={INDIGO}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: 'rgba(255,255,255,0.5)' }}>MEMORY TEST · WORD PAIRS</div>
        {PAIRS_LIST.map(([a, b], i) => {
          const o = EASE_OUT(prog(f, PAIRS + i * 4, PAIRS + i * 4 + 8));
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 18, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 44, color: '#fff', opacity: 0.15 + 0.85 * o }}>
              <span style={{ width: 220, textAlign: 'right' }}>{a}</span>
              <span style={{ color: INDIGO }}>→</span>
              <span style={{ width: 220 }}>{b}</span>
            </div>
          );
        })}
        <div style={{ height: 30 }} />
      </Card>
      <Stamp text="AVERAGE" at={EVERYONE} until={SWITCH} color={PINK} x={540} y={1040} size={90} />

      {/* the first case, in her words */}
      <Card y={600} o={span(f, FIRST + 4, FORGET)} accent={PINK}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: 'rgba(255,255,255,0.5)' }}>HER OWN WORDS</div>
        {['“Non-stop,', 'uncontrollable,', 'and totally exhausting.”'].map((t, i) => {
          const o = EASE_OUT(prog(f, Q_WORDS[i], Q_WORDS[i] + 8));
          return (
            <div key={i} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, lineHeight: 1.12, marginTop: i === 0 ? 14 : 4, color: i === 2 ? PINK : '#fff', opacity: 0.12 + 0.88 * o, transform: `translateY(${(1 - o) * 10}px)` }}>
              {t}
            </div>
          );
        })}
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>JILL PRICE · THE FIRST HSAM CASE, 2006</div>
      </Card>

      {/* the instrument: what the grid says you can replay */}
      <div style={{ position: 'absolute', left: 110, right: 110, top: 1262, opacity: 1 - 0.5 * quizDim }}>
        <DayMeter label="DAYS YOU CAN REPLAY" value={replay} total={LIFE.n} color={replay > LIFE.n / 2 ? TEAL : PINK} note="ILLUSTRATIVE" noteO={illustrative} />
      </div>

      {/* chips under the kicker, landing on their words */}
      <Tag x={540} y={300} text={`30 YEARS = ${LIFE.n.toLocaleString('en-US')} DAYS`} color={TEAL} o={span(f, SWEEP, TUES)} />
      <Tag x={540} y={300} text="HIGHLY SUPERIOR AUTOBIOGRAPHICAL MEMORY" color={ACCENT} o={span(f, HSAM + 4, NAME)} />
      <Tag x={540} y={300} text={`${WEEKDAYS[weekday(LANDED)]}: READ OFF THE CALENDAR`} color={TEAL} o={span(f, WEEKDAY + 4, QUIZ_IN)} />
      <Tag x={540} y={300} text="LEPORT ET AL., 2012" color={INDIGO} o={span(f, PAIRS, SWITCH)} />
      <Tag x={540} y={300} text="SAME DAYS, ON REPEAT" color={PINK} o={span(f, SHARP, FIRST)} />
      <Tag x={540} y={300} text="PARKER, CAHILL & MCGAUGH, 2006" color={PINK} o={span(f, FIRST + 4, FORGET)} />

      {/* the beat, named as the narration names it */}
      <Kicker text="Your life, in days" color={TEAL} y={170} at={SWEEP} until={TUES} />
      <Kicker text="Normal memory" color={PINK} y={170} at={TUES} until={HSAM} />
      <Kicker text="HSAM" color={ACCENT} y={170} at={HSAM} until={QUIZ_IN} />
      <Kicker text="The test" color={INDIGO} y={170} at={NO} until={SWITCH} />
      <Kicker text="No off switch" color={PINK} y={170} at={SWITCH} until={FORGET} />
      <Kicker text="The filter" color={TEAL} y={170} at={FORGET} until={RELIGHT} />

      <Sequence from={QUIZ_IN} durationInFrames={QUIZ_OUT - QUIZ_IN}>
        <PauseCard title="ACE EVERY EXAM?" subtitle="they remember every day" durSec={(QUIZ_OUT - QUIZ_IN) / 30} y={790} />
      </Sequence>

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={64} y={150} lines={[{ text: 'What if you remembered' }, { text: 'every single day?', color: TEAL }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}

// unused-cue guard: keeps the named words honest if a line is rewritten
void [EVERY, EXAM, FILTER];
