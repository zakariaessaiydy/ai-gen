// PAPERDOC lab · the crayon cast model sheet (16:9): every ready-made Doodle, a pose and an expression each,
// plus the props — the QA board for lib/paperdoc/doodle.tsx.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { DOODLES, Doodle, Prop, type DoodleExpr, type DoodlePose, type DoodleProp } from '../../lib/paperdoc/doodle';
import { CRAYON, CrayonDefs } from '../../lib/paperdoc/rough';
import { FONT_EDITORIAL } from '../../fonts';

export const compositionConfig = { id: 'PaperDocDoodleSheet', durationInSeconds: 4, fps: 30, width: 1920, height: 1080 };

const ROW: [keyof typeof DOODLES, DoodlePose, DoodleExpr, DoodleProp][] = [
  ['banker', 'point', 'smug', 'none'],
  ['trader', 'cheer', 'grin', 'none'],
  ['worker', 'shrug', 'worried', 'none'],
  ['merchant', 'present', 'happy', 'tulip'],
  ['investor', 'think', 'think', 'none'],
  ['kid', 'wave', 'happy', 'none'],
  ['king', 'hold', 'shock', 'money'],
  ['narrator', 'facepalm', 'sad', 'none'],
];

export default function DoodleSheet() {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{ background: CRAYON.paper }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <CrayonDefs />
        <text x={960} y={90} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={64} fill={CRAYON.ink}>The crayon cast</text>
        <g filter="url(#crayon)">
          {ROW.map(([k, pose, expr, prop], i) => (
            <g key={k}>
              <Doodle spec={DOODLES[k]} x={150 + i * 232} y={640} s={0.95} t={t} pose={pose} expr={expr} prop={prop} talk={i === 1 && t > 2} />
              <text x={150 + i * 232} y={690} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontWeight={700} fontSize={26} fill={CRAYON.ink}>{k}</text>
              <text x={150 + i * 232} y={720} textAnchor="middle" fontFamily={FONT_EDITORIAL} fontSize={20} fill="#6b604e">{pose} · {expr}</text>
            </g>
          ))}
          {(['money', 'coin', 'tulip', 'phone', 'briefcase', 'paper', 'chart'] as DoodleProp[]).map((p, i) => (
            <g key={p} transform={`translate(${330 + i * 210},930)`}>
              <Prop prop={p} seed={11 + i * 7 + Math.floor(t * 7.5)} s={1.3} />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
}
