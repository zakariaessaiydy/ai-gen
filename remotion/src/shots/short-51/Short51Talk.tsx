import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, prog, timeWords } from '../../lib/shorts';
import { AXIS, Band, CallCard, EARS, EASE_INOUT, EASE_OUT, HR, HearChart, heardShare, logMix, mix } from '../../lib/hear';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short51Talk',
  durationInSeconds: 43.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const ACCENT = HR.translator;
const F = (s: number) => Math.round(s * 30);
const END = F(43.5);

// every cue is a spoken word — retimes itself when the real voice lands in vo.gen.ts
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const word = (line: number, w: string, nth = 0) => {
  const x = timeWords(VO[line]).filter((y) => key(y.w) === w)[nth];
  if (!x) throw new Error(`Short51Talk: no word "${w}" (#${nth}) in VO line ${line} ("${VO[line].text}")`);
  return x;
};
const wAt = (line: number, w: string, nth = 0) => F(word(line, w, nth).start);

// =============================================================================
// CUES — all spoken words.
// =============================================================================
const FIRST = wAt(1, 'first');
const HEAR = wAt(1, 'hear');
const TWENTY = wAt(2, 'twenty');
const HERTZ = wAt(2, 'hertz');
const RATS = wAt(3, 'rats');
const LAUGH = wAt(3, 'laugh');
const FIFTY = wAt(3, 'fifty');
const MICE = wAt(4, 'mice');
const SING = wAt(4, 'sing');
const ELE = wAt(5, 'elephants');
const RUMBLE = wAt(5, 'rumble');
const KM = wAt(5, 'kilometers');
const NOISES = wAt(6, 'noises');
const VERVET = wAt(7, 'vervet');
const LEOPARDS = wAt(7, 'leopards');
const EAGLES = wAt(7, 'eagles');
const SNAKES = wAt(7, 'snakes');
const DOLPHINS = wAt(8, 'dolphins');
const NAMES = wAt(8, 'names');
const ANSWER = wAt(8, 'answer');
const SO = wAt(9, 'so');
const EARS_W = wAt(10, 'ears');
const THEY = wAt(11, 'they');

// =============================================================================
// THE BANDS — every "% heard" is computed from these against the window.
// =============================================================================
const BANDS: Band[] = [
  { id: 'ele', name: 'Elephant', call: 'rumble', lo: 14, hi: 35, color: '#b39ddb' },
  { id: 'you', name: 'You', call: 'speech', lo: 85, hi: 8_000, color: '#e6edf3' },
  { id: 'dol', name: 'Dolphin', call: 'whistle', lo: 3_000, hi: 24_000, color: '#7fb8e6' },
  { id: 'rat', name: 'Rat', call: 'laugh', lo: 35_000, hi: 70_000, color: '#e8879f' },
  { id: 'mouse', name: 'Mouse', call: 'song', lo: 30_000, hi: 110_000, color: '#f5d76e' },
];
const band = (id: string) => BANDS.find((b) => b.id === id)!;
const fullyHeard = (lo: number, hi: number) => BANDS.filter((b) => heardShare(b, lo, hi) >= 0.999).length;

{
  const e = (b: string) => heardShare(band(b), EARS.lo, EARS.hi);
  if (e('rat') !== 0) throw new Error('Short51Talk: the rat laugh must be fully out of range');
  if (e('mouse') !== 0) throw new Error('Short51Talk: "way too high for you" but the mouse song is partly heard');
  if (!(band('ele').lo < EARS.lo && e('ele') > 0)) throw new Error('Short51Talk: the elephant band must dip "below twenty hertz"');
  if (band('rat').lo > 50_000 || band('rat').hi < 50_000) throw new Error('Short51Talk: the rat band must contain "fifty kilohertz"');
  if (e('you') !== 1) throw new Error('Short51Talk: you must hear yourself');
  if (fullyHeard(EARS.lo, EARS.hi) !== 1) throw new Error('Short51Talk: the readout says only you are heard in full');
  if (fullyHeard(AXIS.lo, AXIS.hi) !== BANDS.length) throw new Error('Short51Talk: the translator must hear every band');
  if (EARS_W + 26 > THEY) throw new Error('Short51Talk: the translator must finish opening before "They"');
}

// the listening window: translator (hook) -> your ears -> translator again (twist + loop)
const windowAt = (f: number) => {
  const shut = EASE_INOUT(prog(f, HEAR, HEAR + 20)) * (1 - EASE_INOUT(prog(f, EARS_W, EARS_W + 24)));
  return {
    lo: logMix(AXIS.lo, EARS.lo, shut),
    hi: logMix(AXIS.hi, EARS.hi, shut),
    translator: 1 - shut,
  };
};

const pulse = (f: number, at: number, len = 22) => Math.sin(Math.PI * prog(f, at - 2, at + len));
const span = (f: number, a: number, b: number) => EASE_OUT(prog(f, a - 2, a + 8)) * (1 - prog(f, b - 8, b));

// =============================================================================
// THE SHOT — one chart, flipped once to the vocabulary and back. No cuts.
// =============================================================================
const BOX = { x: 60, y: 345, w: 960, h: 980 };

export default function Short51Talk() {
  const f = useCurrentFrame();
  const win = windowAt(f);

  // chart <-> vocabulary
  const vocab = EASE_OUT(prog(f, NOISES - 2, NOISES + 10)) * (1 - EASE_OUT(prog(f, SO - 4, SO + 4)));
  const chartO = 1 - vocab;

  const focus = {
    rat: span(f, RATS, MICE),
    mouse: span(f, MICE, ELE),
    ele: span(f, ELE, NOISES + 4),
  };
  const tags = {
    rat: { text: 'LAUGHS WHEN TICKLED', o: span(f, LAUGH, NOISES + 4) },
    mouse: { text: 'LOVE SONG', o: span(f, SING, NOISES + 4) },
    ele: { text: 'HEARD KMS AWAY', o: span(f, KM, NOISES + 4) },
  };
  const edgePop = Math.max(pulse(f, TWENTY), pulse(f, HERTZ));
  const marker = { hz: 50_000, label: '50 kHz', o: span(f, FIFTY, MICE), color: band('rat').color };

  const heardN = fullyHeard(win.lo, win.hi);
  const nPop = Math.max(pulse(f, HEAR + 14), pulse(f, EARS_W + 18));

  // vocabulary cards
  const cardIn = (at: number) => EASE_OUT(prog(f, at - 3, at + 9));
  const vervetO = EASE_OUT(prog(f, VERVET - 3, VERVET + 9));
  const nameStamp = EASE_OUT(prog(f, NAMES - 2, NAMES + 8));
  const answerO = EASE_OUT(prog(f, ANSWER - 2, ANSWER + 10));

  // punch-in: frame 0 is at 1.06 and settles; the loop grows back to 1.06 so the wrap is seamless
  const scale = f < THEY ? mix(1.06, 1, EASE_OUT(prog(f, 0, 30))) : mix(1, 1.06, EASE_INOUT(prog(f, THEY, END - 1)));
  const titleO = f < THEY ? 1 - prog(f, FIRST - 4, FIRST + 6) : EASE_OUT(prog(f, THEY + 6, THEY + 24));

  return (
    <AbsoluteFill style={{ background: HR.bg }}>
      <ShortsBackdrop base={HR.bg} glow="#16202e" />

      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: '540px 840px' }}>
        {/* THE PANEL */}
        <div
          style={{
            position: 'absolute',
            left: BOX.x,
            top: BOX.y,
            width: BOX.w,
            height: BOX.h,
            borderRadius: 24,
            background: HR.panel,
            border: `1px solid ${HR.panelBorder}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, opacity: chartO }}>
            {chartO > 0.01 ? (
              <HearChart
                w={BOX.w}
                h={BOX.h}
                bands={BANDS}
                wLo={win.lo}
                wHi={win.hi}
                translator={win.translator}
                frame={f}
                loopFrames={END}
                focus={focus}
                tags={tags}
                edgePop={edgePop}
                marker={marker}
              />
            ) : null}
          </div>

          {/* THE VOCABULARY */}
          {vocab > 0.01 ? (
            <div style={{ position: 'absolute', inset: 0, opacity: vocab }}>
              <div style={{ position: 'absolute', left: 40, top: 46, opacity: vervetO, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, letterSpacing: 5, color: HR.dim }}>
                VERVET MONKEY · ALARM CALLS
              </div>
              <CallCard x={40} y={100} w={880} shape="bark" label="CALL A" meaning="Leopard" response="everyone runs up into the trees" color="#f5d76e" o={cardIn(LEOPARDS)} />
              <CallCard x={40} y={274} w={880} shape="cough" label="CALL B" meaning="Eagle" response="look up, dive into the bushes" color="#e8879f" o={cardIn(EAGLES)} />
              <CallCard x={40} y={448} w={880} shape="chutter" label="CALL C" meaning="Snake" response="stand tall, scan the ground" color="#b39ddb" o={cardIn(SNAKES)} />

              <div style={{ position: 'absolute', left: 40, top: 668, opacity: cardIn(DOLPHINS), fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, letterSpacing: 5, color: HR.dim }}>
                BOTTLENOSE DOLPHIN · SIGNATURE WHISTLE
              </div>
              <CallCard x={40} y={718} w={880} shape="whistle" label="ONE PER DOLPHIN" meaning="Its name" response={answerO > 0.5 ? 'play it back: that dolphin answers' : 'invented in its first months'} color="#7fb8e6" o={cardIn(DOLPHINS)} />
              {nameStamp > 0.01 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: 800,
                    top: 762,
                    transform: `translate(-50%, -50%) rotate(-6deg) scale(${1.5 - 0.5 * nameStamp})`,
                    opacity: nameStamp,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 34,
                    letterSpacing: 4,
                    color: '#7fb8e6',
                    border: '4px solid #7fb8e6',
                    borderRadius: 12,
                    padding: '4px 18px',
                    background: 'rgba(13,17,23,0.9)',
                  }}
                >
                  NAME
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* the readout: how many callers reach you in full */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1350, display: 'flex', justifyContent: 'center', opacity: chartO }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 22,
              padding: '14px 34px',
              borderRadius: 999,
              background: 'rgba(22,27,34,0.9)',
              border: `2px solid ${(win.translator > 0.5 ? HR.translator : HR.ears) + '66'}`,
              transform: `scale(${1 + 0.06 * nPop})`,
            }}
          >
            <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 26, letterSpacing: 4, color: HR.dim }}>HEARD IN FULL</span>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 48, color: heardN === BANDS.length ? HR.translator : '#e8879f' }}>
              {heardN} / {BANDS.length}
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* the beat, named as the narration names it */}
      <Kicker text="Your hearing range" color={HR.ears} y={170} at={FIRST + 4} until={RATS} />
      <Kicker text="Out of range" color="#e8879f" y={170} at={RATS} until={NOISES} />
      <Kicker text="Animal vocabulary" color="#f5d76e" y={170} at={NOISES} until={SO} />
      <Kicker text="The translator" color={ACCENT} y={170} at={SO} until={THEY} />

      {/* HOOK / LOOP title — the same words on frame 0 and the last frame */}
      <div style={{ position: 'absolute', inset: 0, opacity: titleO }}>
        <BigTitle warm size={84} y={140} lines={[{ text: 'Talk to' }, { text: 'animals?', color: ACCENT }]} />
      </div>

      <Captions lines={VO} accent={ACCENT} y={1500} />
      <ProgressBar color={ACCENT} />
    </AbsoluteFill>
  );
}
