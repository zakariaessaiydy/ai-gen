// Tiny Sparks YOUTUBE THUMBNAILS (1280x720). Frame i = the thumbnail of THUMBS[i] (thumbs.gen.ts, written by
// tools/kids_thumbs.py from kids-shorts/tiny-sparks/thumbs.json). Background = a frame of the PUBLISHED render
// (media/projects/kids-thumbs/frames/, extracted by the tool — so the thumbnail matches the video), zoomed onto
// the hero and colour-boosted; then a big 2-4 word title, an optional sticker and a small channel ribbon.
// Keep the bottom-right corner clear: YouTube puts the duration stamp there.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FONT_TOON, RAINBOW } from '../../lib/kids/kit';
import { KINK } from '../../lib/kids/face';
import { THUMBS, type Thumb } from './thumbs.gen';

export const compositionConfig = { id: 'KidsThumbs', durationInSeconds: 10, fps: 30, width: 1280, height: 720 };

const W = 1280;
const H = 720;
const SW = 1920;
const SH = 1080;
const PAD = 44;

const corner = (c: string, w: number, h: number): React.CSSProperties => ({
  position: 'absolute',
  ...(c.includes('t') ? { top: PAD - 8 } : { bottom: PAD + 8 }),
  ...(c.includes('l') ? { left: PAD - 12 } : { right: PAD - 12 }),
  width: w,
  height: h,
});

const Title: React.FC<{ d: Thumb }> = ({ d }) => {
  const size = d.size ?? 124;
  const at = d.at ?? 'right';
  const box: React.CSSProperties =
    at === 'left' ? { left: PAD, top: 0, bottom: 0, width: W * 0.56, justifyContent: 'center', alignItems: 'flex-start', textAlign: 'left' }
    : at === 'right' ? { right: PAD, top: 0, bottom: 0, width: W * 0.56, justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right' }
    : at === 'top' ? { left: PAD, right: PAD, top: PAD + 6, justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center' }
    : { left: PAD, right: PAD, bottom: PAD + 4, justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center' };
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', ...box, transform: `rotate(${d.rot ?? -4}deg)` }}>
      {d.lines.map((ln, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT_TOON, fontWeight: 700, fontSize: size * (d.scales?.[i] ?? 1), lineHeight: 0.98, whiteSpace: 'nowrap',
            color: d.colors?.[i] ?? (i % 2 ? '#ffffff' : '#ffca3a'), WebkitTextStroke: `${size * 0.15}px ${KINK}`, paintOrder: 'stroke fill',
            textShadow: `0 ${size * 0.08}px 0 rgba(59,42,74,0.6)`,
          }}
        >
          {ln}
        </div>
      ))}
    </div>
  );
};

const Sticker: React.FC<{ text: string; at: string; color: string }> = ({ text, at, color }) => (
  <div style={{ ...corner(at, 200, 200), display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(10deg)' }}>
    <svg width={200} height={200} style={{ position: 'absolute', inset: 0 }}>
      <polygon
        points={Array.from({ length: 24 }).map((_, k) => {
          const a = (k / 24) * Math.PI * 2;
          const r = k % 2 ? 86 : 97;
          return `${100 + Math.cos(a) * r},${100 + Math.sin(a) * r}`;
        }).join(' ')}
        fill={color}
        stroke={KINK}
        strokeWidth={9}
        strokeLinejoin="round"
      />
    </svg>
    <div style={{ position: 'relative', fontFamily: FONT_TOON, fontWeight: 700, fontSize: text.length > 5 ? 40 : 52, lineHeight: 1, color: '#ffffff', textAlign: 'center', WebkitTextStroke: `7px ${KINK}`, paintOrder: 'stroke fill', whiteSpace: 'pre' }}>
      {text}
    </div>
  </div>
);

// a row (or rows) of the episodes' number/letter bubbles — for a song whose best frame has none on screen
const Bubbles: React.FC<{ b: NonNullable<Thumb['bubbles']> }> = ({ b }) => {
  const r = b.r ?? 38;
  const per = b.perRow ?? b.items.length;
  const rows = Math.ceil(b.items.length / per);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {b.items.map((it, k) => {
        const row = Math.floor(k / per);
        const col = k % per;
        const n = Math.min(per, b.items.length - row * per);
        const cx = b.x + (col - (n - 1) / 2) * r * 2.35;
        const cy = b.y + (row - (rows - 1) / 2) * r * 2.35;
        return (
          <g key={k}>
            <circle cx={cx} cy={cy} r={r} fill={RAINBOW[k % RAINBOW.length]} stroke={KINK} strokeWidth={6} />
            <circle cx={cx} cy={cy} r={r - 7} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.85} />
            <text x={cx} y={cy + r * 0.36} textAnchor="middle" fontFamily={FONT_TOON} fontWeight={700} fontSize={r * (it.length > 1 ? 0.9 : 1.05)} fill="#ffffff" stroke={KINK} strokeWidth={5} paintOrder="stroke">{it}</text>
          </g>
        );
      })}
    </svg>
  );
};

const Ribbon: React.FC<{ at: string }> = ({ at }) => (
  <div style={{ ...corner(at, 270, 64), transform: `rotate(${at.includes('l') ? -3 : 3}deg)` }}>
    <svg width={270} height={64} style={{ position: 'absolute', inset: 0 }}>
      <path d="M 4,6 L 266,6 L 250,32 L 266,58 L 4,58 L 20,32 Z" fill="#ff595e" stroke={KINK} strokeWidth={6} strokeLinejoin="round" />
    </svg>
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TOON, fontWeight: 700, fontSize: 34, color: '#ffffff', WebkitTextStroke: `6px ${KINK}`, paintOrder: 'stroke fill' }}>
      TINY SPARKS
    </div>
  </div>
);

export default function KidsThumbs() {
  const i = useCurrentFrame();
  const d = THUMBS[i];
  if (!d) return <AbsoluteFill style={{ background: '#7ec8f8' }} />;
  const s = (W / SW) * d.z;
  const tx = Math.min(0, Math.max(W - SW * s, W / 2 - d.fx * s));
  const ty = Math.min(0, Math.max(H - SH * s, H / 2 - d.fy * s));
  return (
    <AbsoluteFill style={{ background: '#7ec8f8', overflow: 'hidden' }}>
      <Img
        src={staticFile(`projects/kids-thumbs/frames/${d.frame}`)}
        style={{ position: 'absolute', left: 0, top: 0, width: SW, height: SH, transformOrigin: '0 0', transform: `translate(${tx}px,${ty}px) scale(${s})`, filter: 'saturate(1.15) contrast(1.05)' }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(40,20,60,0.28) 100%)' }} />
      {d.bubbles && <Bubbles b={d.bubbles} />}
      <Title d={d} />
      {d.sticker && <Sticker text={d.sticker} at={d.stickerAt ?? 'tr'} color={d.stickerColor ?? '#ff595e'} />}
      {d.ribbon !== 'none' && <Ribbon at={d.ribbon ?? 'tl'} />}
    </AbsoluteFill>
  );
}
