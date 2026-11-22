// TINY SPARKS · Day 15 · 🧠 Educational Stories #2 — "Mila Learns to Say Please and Thank You" (LONG 16:9)
// kids-shorts/tiny-sparks/stories/day-015-mila-learns-to-say-please-and-thank-you. Cues from VO via K.
// SCENE 1 (classroom): Mila draws an apple, GRABS Leo's red crayon → Leo sad → Bobo: the magic word?
// (YOUR TURN: "please!") → Mila gives it back, asks nicely → forgets → "thank you" (YOUR TURN) → the apple
// gets coloured, everyone happy → 3 STEPS cards (ask nicely · please · thank you).
// SCENE 2 (picnic): Mila asks Bobo for a cookie the right way → Leo GRABS one → "Can you help Leo?" (YOUR
// TURN) → Leo asks with please + thank you → chant "Please, and thank you!" ×2 → quiz (2 timers) → bye.
import React from 'react';
import { Kid } from '../../lib/kids/kid';
import { Critter } from '../../lib/kids/critter';
import { BOBO, CAPTION_COLORS, LEO, MILA } from '../../lib/kids/cast/tiny-sparks';
import { Classroom, FLOOR, Meadow } from '../../lib/kids/sets';
import { FONT_TOON, KidsCaptions, KidsStage, PopText, ThinkTimer, TitleCard, camAt, lipSync, useT, type CamKey } from '../../lib/kids/kit';
import { KINK, kst, type KExpr } from '../../lib/kids/face';
import { EASE_OUT, prog } from '../../lib/shorts';
import { VO } from './vo.gen';
import { K } from './keys.gen';

export const compositionConfig = { id: 'KidsStories015', durationInSeconds: 171.4, fps: 30, width: 1920, height: 1080 };

const W = 1920;
const H = 1080;
const f = FLOOR(H);
type Key = keyof typeof K;
const S = (k: Key) => VO[K[k]].start;
const E = (k: Key) => VO[K[k]].end;
const within = (t: number, a: number, b: number) => t >= a && t < b;
const COLORS = { ...CAPTION_COLORS, narrator: '#ffffff' };
const KID_S = 0.8;
const SCENE2 = S('later') - 0.2;

const Crayon: React.FC = () => (
  <g transform="rotate(-30)">
    <rect x={-14} y={-70} width={28} height={110} rx={6} fill="#e63946" {...kst(5)} />
    <rect x={-14} y={-30} width={28} height={30} fill="#ffffff" opacity={0.6} />
    <path d="M -14,-70 L 0,-100 L 14,-70 Z" fill="#e63946" {...kst(5)} />
  </g>
);
const Cookie: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle r={34} fill="#e9c46a" {...kst(5)} />
    {[[-12, -10], [10, -14], [4, 10], [-14, 12], [16, 6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#6b4226" />)}
  </g>
);
const Basket: React.FC = () => (
  <g>
    <path d="M -70,0 Q 0,-110 70,0" fill="none" stroke="#a0673c" strokeWidth={12} />
    {[-30, 0, 30].map((x) => <g key={x} transform={`translate(${x},${-14})`}><Cookie s={0.6} /></g>)}
    <path d="M -80,0 L 80,0 L 60,70 L -60,70 Z" fill="#c98f5f" {...kst(6)} />
    {[-40, 0, 40].map((x) => <line key={x} x1={x} y1={4} x2={x * 0.8} y2={66} stroke="#a0673c" strokeWidth={6} />)}
  </g>
);

const StepCard: React.FC<{ t: number; at: number; until: number; x: number; n: number; label: string; children: React.ReactNode }> = ({ t, at, until, x, n, label, children }) => {
  if (t < at || t >= until) return null;
  const s = EASE_OUT(prog(t, at, at + 0.4));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${x},250) scale(${s})`}>
        <rect x={-180} y={-160} width={360} height={320} rx={40} fill="#ffffff" {...kst(8)} />
        <circle cx={-160} cy={-140} r={42} fill={['#ffca3a', '#ff924c', '#ff595e'][n - 1]} {...kst(6)} />
        <text x={-160} y={-124} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={48} fill="#ffffff">{n}</text>
        <g transform="translate(0,-30)">{children}</g>
        <text y={120} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill={KINK}>{label}</text>
      </g>
    </svg>
  );
};
const Speech: React.FC<{ text: string; c: string; size?: number }> = ({ text, c, size = 46 }) => (
  <g>
    <rect x={-130} y={-60} width={260} height={110} rx={44} fill={c} {...kst(6)} />
    <path d="M -40,46 L -70,90 L 0,46 Z" fill={c} {...kst(6)} />
    <text y={size * 0.35} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={size} fill="#ffffff">{text}</text>
  </g>
);

const CAM: CamKey[] = [{ t: 0, z: 1, x: W / 2, y: H / 2 }];

export default function KidsStories015() {
  const t = useT();
  const cam = camAt(t, CAM);
  const talks = (who: string) => VO.some((l) => l.speaker === who && t >= l.start && t < l.end);
  const scene2 = t >= SCENE2;
  const yourTurn = within(t, E('q_magic') + 0.2, S('bobo_please') - 0.2) || within(t, E('q2') + 0.2, S('m_thanks') - 0.2) || within(t, E('q3') + 0.2, S('leo_please') - 0.2) || within(t, E('ch_turn') + 0.1, S('ch2') - 0.1);

  // scene 1: who holds the red crayon
  const crayonMila = within(t, S('m_grab') + 0.3, S('m_back') + 0.6) || within(t, S('leo_yes') + 0.8, SCENE2);
  const crayonLeo = !scene2 && !crayonMila;
  const colour = EASE_OUT(prog(t, S('feel2') - 0.4, S('feel2') + 1.2));
  // scene 2: cookies
  const milaCookie = scene2 && t >= S('b_give') + 0.3;
  const leoCookie = within(t, S('leo_grab') + 0.2, S('m_help') + 1.2) || t >= S('b_give2') + 0.3;

  const milaX = scene2 ? 620 : 580;
  const leoX = scene2 ? 1380 : 1360;
  const boboX = scene2 ? 1000 : 290;

  const leoExpr: KExpr =
    scene2 ? (within(t, S('leo_grab'), S('m_help')) ? 'laugh' : within(t, S('m_help'), S('leo_please')) ? 'oops' : yourTurn ? 'smile' : 'happy')
    : within(t, S('m_grab') + 0.3, S('m_ask')) ? 'sad'
    : within(t, S('forgot'), S('m_thanks')) ? 'think'
    : 'happy';
  const milaExpr: KExpr =
    scene2 ? (within(t, S('leo_grab'), S('leo_please')) ? 'surprised' : 'happy')
    : within(t, S('m_grab'), S('feel')) ? 'proud'
    : within(t, S('feel'), S('m_ask')) ? 'oops'
    : within(t, S('forgot'), S('m_thanks')) ? 'think'
    : 'happy';
  const boboExpr: KExpr =
    scene2 ? (within(t, S('leo_grab'), S('m_help')) ? 'surprised' : talks('bobo') ? 'laugh' : 'happy')
    : within(t, S('m_grab'), S('bobo_tip')) ? 'surprised'
    : talks('bobo') ? 'laugh' : 'smile';
  const flash = 1 - Math.abs(prog(t, SCENE2 - 0.4, SCENE2 + 0.4) * 2 - 1);

  return (
    <>
      <KidsStage cam={cam}>
        {!scene2 ? <Classroom w={W} h={H} /> : <Meadow w={W} h={H} t={t} />}
        {/* scene 1: Mila's drawing pinned on the board */}
        {!scene2 && (
          <g transform="translate(960,350)">
            <rect x={-200} y={-150} width={400} height={300} rx={14} fill="#ffffff" {...kst(6)} transform="rotate(-2)" />
            <circle cx={0} cy={-150} r={14} fill="#ff595e" {...kst(4)} />
            <path d="M 0,-60 C -110,-110 -140,40 -40,100 C -15,112 15,112 40,100 C 140,40 110,-110 0,-60 Z"
              fill={colour > 0 ? '#e63946' : 'none'} fillOpacity={colour} {...kst(7)} />
            <path d="M 0,-60 Q 6,-100 24,-112" fill="none" stroke="#6b4226" strokeWidth={8} strokeLinecap="round" />
            <path d="M 10,-90 Q 50,-110 60,-80 Q 30,-70 10,-90 Z" fill="#52b788" {...kst(4)} />
          </g>
        )}
        {/* scene 2: picnic blanket + basket */}
        {scene2 && (
          <g>
            <ellipse cx={1000} cy={f + 50} rx={560} ry={70} fill="#ff595e" {...kst(6)} />
            {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={520 + i * 120} y1={f - 5} x2={540 + i * 120} y2={f + 110} stroke="#ffffff" strokeWidth={14} opacity={0.6} />)}
            <g transform={`translate(${boboX + 190},${f + 10})`}><Basket /></g>
          </g>
        )}
        <Critter spec={BOBO} x={boboX} y={f} scale={0.68} expr={boboExpr} look={scene2 ? [0.2, -0.2] : [0.6, -0.2]} mouth={lipSync(VO, 'bobo', t)}
          armL={talks('bobo') ? 'up' : t >= S('bye') ? 'wave' : 'down'}
          armR={within(t, S('b_give'), E('b_give') + 0.3) || within(t, S('b_give2'), E('b_give2') + 0.3) ? 'point' : within(t, S('ch3'), E('ch3')) ? 'up' : t >= S('bye') ? 'wave' : 'down'} />
        <Kid spec={MILA} x={milaX} y={f} scale={KID_S} expr={milaExpr} look={scene2 ? [0.5, -0.2] : [0.6, -0.2]} mouth={lipSync(VO, 'mila', t)}
          holdR={crayonMila ? <Crayon /> : milaCookie ? <Cookie s={0.8} /> : undefined}
          armR={crayonMila || milaCookie ? 'hold' : within(t, S('m_help'), E('m_help')) ? 'point' : t >= S('bye') ? 'wave' : 'hip'}
          armL={within(t, S('m_back'), E('m_back')) ? 'present' : within(t, S('ch1'), E('ch1')) || within(t, S('quiz_a'), E('quiz_a')) ? 'up' : t >= S('bye') ? 'wave' : 'down'} />
        <Kid spec={LEO} x={leoX} y={f} scale={KID_S} expr={leoExpr} look={[-0.6, -0.2]} mouth={lipSync(VO, 'leo', t)}
          holdR={crayonLeo ? <Crayon /> : leoCookie ? <Cookie s={0.8} /> : undefined}
          armR={crayonLeo || leoCookie ? 'hold' : t >= S('bye') ? 'wave' : 'hip'}
          armL={within(t, S('leo_yes'), E('leo_yes')) ? 'present' : within(t, S('ch2'), E('ch2')) || within(t, S('quiz2_a'), E('quiz2_a')) ? 'up' : t >= S('bye') ? 'wave' : 'down'} />
      </KidsStage>
      {/* scene change flash */}
      {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: '#ffffff', opacity: flash }} />}
      <TitleCard t={t} from={0} to={1.6} title="MAGIC WORDS" sub="please and thank you" />
      <PopText t={t} at={S('feel') + 0.4} until={S('bobo_tip') - 0.2} text="SAD" y={170} size={130} color="#4cc9f0" />
      {yourTurn && <PopText t={t} at={t >= E('ch_turn') ? E('ch_turn') + 0.1 : t >= E('q3') ? E('q3') + 0.2 : t >= E('q2') ? E('q2') + 0.2 : E('q_magic') + 0.2} text="YOUR TURN!" y={170} size={120} color="#ffca3a" />}
      <PopText t={t} at={S('bobo_please')} until={S('m_back') - 0.2} text="PLEASE!" y={170} size={150} color="#ff924c" />
      <PopText t={t} at={S('m_thanks')} until={S('feel2') - 0.2} text="THANK YOU!" y={170} size={140} color="#ff595e" />
      <StepCard t={t} at={S('st1') - 0.1} until={SCENE2 - 0.3} x={560} n={1} label="ask nicely"><Speech text="Can I…?" c="#4cc9f0" /></StepCard>
      <StepCard t={t} at={S('st2') - 0.1} until={SCENE2 - 0.3} x={960} n={2} label="say please"><Speech text="PLEASE" c="#ff924c" size={50} /></StepCard>
      <StepCard t={t} at={S('st3') - 0.1} until={SCENE2 - 0.3} x={1360} n={3} label="say thank you"><Speech text="THANK YOU" c="#ff595e" size={38} /></StepCard>
      <PopText t={t} at={S('m_thank2')} until={S('b_welcome') + 1.0} text="THANK YOU!" y={170} size={120} color="#ff595e" />
      <PopText t={t} at={S('leo_please')} until={S('b_give2') - 0.1} text="PLEASE!" y={170} size={140} color="#ff924c" />
      <PopText t={t} at={S('ch1')} until={S('ch_turn') - 0.1} text="PLEASE & THANK YOU!" y={170} size={100} color="#ffca3a" />
      <PopText t={t} at={S('ch2')} until={S('quiz') - 0.3} text="PLEASE & THANK YOU!" y={170} size={100} color="#ffca3a" />
      <ThinkTimer t={t} from={E('quiz') + 0.2} to={S('quiz_a') - 0.2} label="WHAT?" />
      <PopText t={t} at={S('quiz_a')} until={S('quiz2') - 0.3} text="PLEASE!" y={170} size={150} color="#ff924c" />
      <ThinkTimer t={t} from={E('quiz2') + 0.2} to={S('quiz2_a') - 0.2} label="WHAT?" />
      <PopText t={t} at={S('quiz2_a')} until={S('bye') - 0.3} text="THANK YOU!" y={170} size={140} color="#ff595e" />
      <KidsCaptions lines={VO} t={t} colors={COLORS} />
    </>
  );
}
