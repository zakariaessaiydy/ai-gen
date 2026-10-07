// KIDS KIT — stage, captions and the teaching/reward overlays every kids niche reuses.
// Works at any composition size (9:16 Shorts and 16:9 long videos): sizes come from
// useVideoConfig(). Rules baked in: big rounded type, high contrast, ONE idea on screen at a time,
// gentle easing (no strobe — at most ~3 flashes/second, and we never flash full screen).
import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { EASE_OUT, prog, timeWords, type VoLine } from '../shorts';
import { FONT_TOON, type Cam } from '../toon/comedy';
import { KINK, kst } from './face';

export { camAt, lipSync, talking, useT, Cut, type CamKey } from '../toon/comedy';
export { FONT_TOON };

// friendly rainbow used for counts, letters and rewards (always in this order)
export const RAINBOW = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6fa5', '#4cc9f0', '#52b788', '#f15bb5'];

const pop = (t: number, at: number, dur = 0.35) => {
  const p = prog(t, at, at + dur);
  if (p <= 0) return 0;
  return p >= 1 ? 1 : 1 + Math.sin(p * Math.PI) * 0.22 * (1 - p) + (EASE_OUT(p) - 1);
};

// the stage: one SVG at the composition size, camera transform on a group (z >= 1, clamped)
export const KidsStage: React.FC<{ cam: Cam; children: React.ReactNode; bg?: string }> = ({ cam, children, bg = '#ffffff' }) => {
  const { width: W, height: H } = useVideoConfig();
  const z = Math.max(1, cam.z);
  const hw = W / 2 / z;
  const hh = H / 2 / z;
  const cx = Math.min(W - hw, Math.max(hw, cam.x));
  const cy = Math.min(H - hh, Math.max(hh, cam.y));
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${W / 2 - cx * z},${H / 2 - cy * z}) scale(${z}) rotate(${cam.rot} ${cx} ${cy})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

// word-by-word captions: big rounded type, the spoken word grows + takes the speaker colour.
// Kids can't all read — captions SUPPORT the voice (and parents watching muted); max 4 words.
export const KidsCaptions: React.FC<{ lines: VoLine[]; t: number; colors: Record<string, string>; y?: number; size?: number; maxWords?: number }> = ({
  lines, t, colors, y, size, maxWords = 4,
}) => {
  const { width: W, height: H } = useVideoConfig();
  const yy = y ?? (H > W ? H * 0.71 : H * 0.88);
  const sz = size ?? (H > W ? 78 : 64);
  const line = lines.find((l) => t >= l.start - 0.05 && t < l.end + 0.5);
  if (!line) return null;
  const words = timeWords(line);
  // chunk into groups of maxWords and show the group holding the current word
  const groups: (typeof words)[] = [];
  words.forEach((w, i) => (i % maxWords === 0 ? groups.push([w]) : groups[groups.length - 1].push(w)));
  const g = groups.find((gr, i) => t < (groups[i + 1]?.[0].start ?? 1e9)) ?? groups[groups.length - 1];
  const color = colors[line.speaker ?? ''] ?? '#ffd166';
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: yy, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: sz * 0.28, transform: 'translateY(-50%)' }}>
      {g.map((w, i) => {
        const on = t >= w.start && t < w.end + 0.05;
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_TOON, fontWeight: 700, fontSize: sz, lineHeight: 1.15, color: on ? color : '#ffffff',
              WebkitTextStroke: `${sz * 0.17}px ${KINK}`, paintOrder: 'stroke fill', display: 'inline-block',
              transform: `scale(${on ? 1.14 : 1}) translateY(${on ? -6 : 0}px)`, textShadow: '0 6px 0 rgba(59,42,74,0.35)',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// a word / number / letter that POPS in (screen space). Use for the ONE thing being taught.
export const PopText: React.FC<{ t: number; at: number; until?: number; text: string; x?: number; y?: number; size?: number; color?: string; rot?: number }> = ({
  t, at, until = 1e9, text, x, y, size = 260, color = '#ffca3a', rot = -3,
}) => {
  const { width: W, height: H } = useVideoConfig();
  if (t < at || t >= until) return null;
  const s = pop(t, at, 0.4);
  return (
    <div
      style={{
        position: 'absolute', left: (x ?? W / 2) - 800, width: 1600, top: (y ?? H * 0.3) - size * 0.6, textAlign: 'center',
        fontFamily: FONT_TOON, fontWeight: 700, fontSize: size, lineHeight: 1.1, color, WebkitTextStroke: `${size * 0.09}px ${KINK}`,
        paintOrder: 'stroke fill', transform: `scale(${s}) rotate(${rot}deg)`, textShadow: `0 ${size * 0.05}px 0 rgba(59,42,74,0.35)`,
      }}
    >
      {text}
    </div>
  );
};

// N objects appear one by one (counting!). item(i) returns the SVG for one object (origin centre).
// Use inside the stage. Each pops at times[i] and gets a rainbow number badge.
export const CountRow: React.FC<{ t: number; times: number[]; item: (i: number) => React.ReactNode; x: number; y: number; gap?: number; perRow?: number; badges?: boolean; until?: number }> = ({
  t, times, item, x, y, gap = 190, perRow = 5, badges = true, until = 1e9,
}) => {
  if (t >= until) return null;
  const rows = Math.ceil(times.length / perRow);
  return (
    <g>
      {times.map((at, i) => {
        const s = pop(t, at, 0.35);
        if (s <= 0) return null;
        const r = Math.floor(i / perRow);
        const inRow = Math.min(perRow, times.length - r * perRow);
        const cx = x + (i % perRow - (inRow - 1) / 2) * gap;
        const cy = y + (r - (rows - 1) / 2) * gap * 1.1;
        return (
          <g key={i} transform={`translate(${cx},${cy}) scale(${s})`}>
            {item(i)}
            {badges && (
              <g transform="translate(0,-110)">
                <circle r={38} fill={RAINBOW[i % RAINBOW.length]} {...kst(6)} />
                <text y={16} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={46} fill="#ffffff" stroke={KINK} strokeWidth={3} paintOrder="stroke">
                  {i + 1}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

// reward burst: confetti + stars from a point (screen space). The "yay!" moment.
export const Confetti: React.FC<{ t: number; at: number; x?: number; y?: number; dur?: number }> = ({ t, at, x, y, dur = 1.6 }) => {
  const { width: W, height: H } = useVideoConfig();
  if (t < at || t > at + dur) return null;
  const p = (t - at) / dur;
  const ox = x ?? W / 2;
  const oy = y ?? H * 0.35;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2 + i;
          const v = 380 + (i % 5) * 90;
          const px = ox + Math.cos(a) * v * p;
          const py = oy + Math.sin(a) * v * p + 600 * p * p;
          const c = RAINBOW[i % RAINBOW.length];
          return i % 3 === 0 ? (
            <path key={i} d="M 0,-22 L 7,-7 L 22,-7 L 10,4 L 14,20 L 0,11 L -14,20 L -10,4 L -22,-7 L -7,-7 Z" fill="#ffd166" stroke={KINK} strokeWidth={3} transform={`translate(${px},${py}) rotate(${p * 400 + i * 20}) scale(${1.4 - p * 0.6})`} opacity={1 - p * 0.6} />
          ) : (
            <rect key={i} x={-9} y={-15} width={18} height={30} rx={4} fill={c} transform={`translate(${px},${py}) rotate(${p * 720 + i * 37})`} opacity={1 - p * 0.5} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// "Can you guess?" pause timer for puzzles / call-and-response (screen space). A ring that empties
// over [from, to] with the remaining whole seconds in the middle.
export const ThinkTimer: React.FC<{ t: number; from: number; to: number; x?: number; y?: number; r?: number; label?: string }> = ({ t, from, to, x, y, r = 120, label = 'THINK!' }) => {
  const { width: W, height: H } = useVideoConfig();
  if (t < from || t >= to) return null;
  const p = (t - from) / (to - from);
  const cx = x ?? W - r - 60;
  const cy = y ?? (H > W ? H * 0.17 : r + 60);
  const C = 2 * Math.PI * (r - 16);
  const left = Math.ceil(to - t);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${cx},${cy}) scale(${pop(t, from, 0.3)})`}>
          <circle r={r} fill="#ffffff" {...kst(8)} />
          <circle r={r - 16} fill="none" stroke="#e9ecef" strokeWidth={22} />
          <circle r={r - 16} fill="none" stroke={RAINBOW[(3 - left + 30) % 3]} strokeWidth={22} strokeDasharray={`${C * (1 - p)} ${C}`} transform="rotate(-90)" strokeLinecap="round" />
          <text y={r * 0.28} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={r * 0.85} fill={KINK}>
            {left}
          </text>
          <text y={r + 56} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={44} fill="#ffffff" stroke={KINK} strokeWidth={8} paintOrder="stroke">
            {label}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// big ✓ / ✗ stamp on an answer (stage space, origin = centre)
export const AnswerMark: React.FC<{ t: number; at: number; until?: number; ok: boolean; x: number; y: number; size?: number }> = ({ t, at, until = 1e9, ok, x, y, size = 1 }) => {
  const s = pop(t, at, 0.3);
  if (s <= 0 || t >= until) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${s * size})`}>
      <circle r={80} fill={ok ? '#52b788' : '#ff595e'} {...kst(8)} />
      {ok ? (
        <path d="M -40,0 L -10,32 L 44,-30" fill="none" stroke="#ffffff" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M -32,-32 L 32,32 M 32,-32 L -32,32" stroke="#ffffff" strokeWidth={22} strokeLinecap="round" />
      )}
    </g>
  );
};

// vocabulary flash card (stage space, origin = centre): picture slot + word + optional 2nd language
export const WordCard: React.FC<{ t: number; at: number; until?: number; x: number; y: number; word: string; word2?: string; lang?: string; lang2?: string; color?: string; children?: React.ReactNode; w?: number }> = ({
  t, at, until = 1e9, x, y, word, word2, lang = 'EN', lang2 = 'FR', color = '#4cc9f0', children, w = 640,
}) => {
  const s = pop(t, at, 0.4);
  if (s <= 0 || t >= until) return null;
  const hgt = w * 1.12;
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(-2)`}>
      <rect x={-w / 2} y={-hgt / 2} width={w} height={hgt} rx={48} fill="#ffffff" {...kst(10)} />
      <rect x={-w / 2 + 30} y={-hgt / 2 + 30} width={w - 60} height={hgt * 0.56} rx={32} fill={color} opacity={0.25} />
      <g transform={`translate(0,${-hgt / 2 + 30 + hgt * 0.28})`}>{children}</g>
      <text y={hgt * 0.2} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={w * 0.16} fill={KINK}>
        {word}
      </text>
      {word2 && (
        <g>
          <text y={hgt * 0.38} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={w * 0.12} fill={color} stroke={KINK} strokeWidth={4} paintOrder="stroke">
            {word2}
          </text>
          <text x={-w / 2 + 50} y={hgt * 0.2 - w * 0.02} fontFamily={FONT_TOON} fontWeight={700} fontSize={28} fill="#adb5bd">{lang}</text>
          <text x={-w / 2 + 50} y={hgt * 0.38 - w * 0.02} fontFamily={FONT_TOON} fontWeight={700} fontSize={28} fill="#adb5bd">{lang2}</text>
        </g>
      )}
    </g>
  );
};

// sing-along lyric bar with a bouncing ball over the words (screen space). Feed it the sung
// lines (word times from gen_voice / gen_song's beat map).
export const SingAlong: React.FC<{ t: number; lines: VoLine[]; y?: number; size?: number; ball?: string }> = ({ t, lines, y, size, ball = '#ff595e' }) => {
  const { width: W, height: H } = useVideoConfig();
  const line = lines.find((l) => t >= l.start - 0.3 && t < l.end + 0.4);
  if (!line) return null;
  const sz = size ?? (H > W ? 72 : 60);
  const yy = y ?? (H > W ? H * 0.71 : H * 0.86);
  const words = timeWords(line);
  const cur = words.findIndex((w) => t >= w.start && t < w.end);
  const k = cur >= 0 ? prog(t, words[cur].start, words[cur].end) : 0;
  return (
    <div style={{ position: 'absolute', left: 30, right: 30, top: yy, textAlign: 'center', transform: 'translateY(-50%)' }}>
      <div style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: sz * 0.3, background: 'rgba(255,255,255,0.88)', borderRadius: 40, padding: `${sz * 0.5}px ${sz * 0.5}px ${sz * 0.25}px`, border: `8px solid ${KINK}` }}>
        {words.map((w, i) => (
          <span key={i} style={{ position: 'relative', fontFamily: FONT_TOON, fontWeight: 700, fontSize: sz, color: i < cur ? '#8d99ae' : i === cur ? RAINBOW[i % RAINBOW.length] : KINK, display: 'inline-block' }}>
            {i === cur && (
              <span style={{ position: 'absolute', left: '50%', top: -sz * 0.55 - Math.sin(k * Math.PI) * sz * 0.35, width: sz * 0.36, height: sz * 0.36, marginLeft: -sz * 0.18, borderRadius: '50%', background: ball, border: `5px solid ${KINK}` }} />
            )}
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

// episode title card (screen space): bouncy title on a rainbow sunburst. Use for the first ~1.2s
// of LONG videos only — Shorts start on the action, not a card.
export const TitleCard: React.FC<{ t: number; from: number; to: number; title: string; sub?: string; color?: string }> = ({ t, from, to, title, sub, color = '#ffca3a' }) => {
  const { width: W, height: H } = useVideoConfig();
  if (t < from || t >= to) return null;
  const out = prog(t, to - 0.25, to);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <rect width={W} height={H} fill="#7ec8f8" />
        <g transform={`translate(${W / 2},${H / 2}) rotate(${(t - from) * 14})`}>
          {Array.from({ length: 16 }).map((_, i) => (
            <path key={i} d={`M 0,0 L ${-W},${-W * 3} L ${W},${-W * 3} Z`} fill={RAINBOW[i % 6]} opacity={0.35} transform={`rotate(${i * 22.5}) scale(0.2)`} />
          ))}
        </g>
      </svg>
      <PopText t={t} at={from + 0.05} text={title} y={H * 0.45} size={H > W ? 150 : 140} color={color} />
      {sub && <PopText t={t} at={from + 0.35} text={sub} y={H * 0.45 + (H > W ? 200 : 170)} size={H > W ? 70 : 64} color="#ffffff" rot={2} />}
    </AbsoluteFill>
  );
};

// speech bubble (stage space): tail points to (tx,ty)
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; tx: number; ty: number; text?: string; size?: number; children?: React.ReactNode }> = ({ x, y, w, h, tx, ty, text, size = 64, children }) => (
  <g>
    <path d={`M ${x - 40},${y + h / 2 - 10} L ${tx},${ty} L ${x + 40},${y + h / 2 - 10} Z`} fill="#ffffff" {...kst(8)} />
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h * 0.4} fill="#ffffff" {...kst(8)} />
    <rect x={x - 46} y={y + h / 2 - 20} width={92} height={24} fill="#ffffff" />
    {text && (
      <text x={x} y={y + size * 0.35} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={size} fill={KINK}>
        {text}
      </text>
    )}
    {children}
  </g>
);

// simple friendly objects for counting / vocabulary (origin = centre, ~160px)
export const Apple: React.FC<{ c?: string }> = ({ c = '#ff595e' }) => (
  <g>
    <path d="M 0,-50 Q -70,-90 -76,0 Q -70,80 0,70 Q 70,80 76,0 Q 70,-90 0,-50 Z" fill={c} {...kst(7)} />
    <path d="M 0,-50 Q 6,-80 20,-92" fill="none" {...kst(7)} />
    <path d="M 10,-70 Q 50,-100 60,-66 Q 30,-50 10,-70 Z" fill="#8ac926" {...kst(5)} />
    <ellipse cx={-30} cy={-20} rx={14} ry={22} fill="#ffffff" opacity={0.5} />
  </g>
);
export const Star: React.FC<{ c?: string; s?: number }> = ({ c = '#ffd166', s = 1 }) => (
  <path d="M 0,-80 L 23,-27 L 80,-25 L 36,12 L 51,70 L 0,37 L -51,70 L -36,12 L -80,-25 L -23,-27 Z" fill={c} {...kst(7)} transform={`scale(${s})`} />
);
export const Balloon: React.FC<{ c?: string }> = ({ c = '#4cc9f0' }) => (
  <g>
    <path d="M 0,70 Q -10,110 6,150" fill="none" stroke={KINK} strokeWidth={5} />
    <ellipse cx={0} cy={0} rx={62} ry={74} fill={c} {...kst(7)} />
    <path d="M -8,72 L 8,72 L 0,62 Z" fill={c} {...kst(5)} />
    <ellipse cx={-22} cy={-26} rx={12} ry={20} fill="#ffffff" opacity={0.5} />
  </g>
);

// beach ball (origin = centre, r = radius); rot spins it (pass a growing angle when it rolls)
export const Ball: React.FC<{ r?: number; rot?: number; colors?: string[] }> = ({ r = 70, rot = 0, colors = ['#ff595e', '#ffca3a', '#1982c4', '#8ac926'] }) => (
  <g transform={`rotate(${rot})`}>
    <circle r={r} fill="#ffffff" {...kst(7)} />
    {colors.map((c, i) => {
      const a0 = (i / colors.length) * Math.PI * 2;
      const a1 = a0 + Math.PI / colors.length;
      return <path key={i} d={`M 0,0 L ${Math.cos(a0) * r},${Math.sin(a0) * r} A ${r},${r} 0 0,1 ${Math.cos(a1) * r},${Math.sin(a1) * r} Z`} fill={c} />;
    })}
    <circle r={r} fill="none" {...kst(7)} />
    <circle r={r * 0.18} fill="#ffffff" {...kst(5)} />
    <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.18} ry={r * 0.1} fill="#ffffff" opacity={0.7} transform={`rotate(${-rot})`} />
  </g>
);
