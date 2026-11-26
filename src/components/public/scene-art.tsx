// Small scenes for the photo-style frames on the public pages, drawn in the
// same style as the instrument drawings (instrument-art.tsx) and reusing them.
// Each scene sits in a 160 × 120 space, the frames' 4:3 shape.

import type { ReactNode } from 'react';
import { ArtSvg, Note, instrumentDrawing } from './instrument-art';

const C = 'var(--color-cream)';
const G = 'var(--color-gold)';
const K = 'var(--color-coral)';
const S = 'var(--color-sky)';
const N = 'var(--color-navy)';
const W = '#ffffff';

export type SceneName =
  | 'teaching'
  | 'first-student'
  | 'lesson-day'
  | 'pick-instrument'
  | 'first-lesson'
  | 'practice'
  | 'online'
  | 'together';

/** An instrument drawing, moved and sized inside a scene. */
function Place({ instrument, x, y, scale }: { instrument: string; x: number; y: number; scale: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>{instrumentDrawing(instrument)}</g>;
}

/** Head and shoulders, with no face, so anyone can see themselves in it. */
function Person({ x, y, shirt = S, scale = 1 }: { x: number; y: number; shirt?: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-14 22 C-14 8 14 8 14 22 Z" fill={shirt} />
      <circle cx="0" cy="0" r="8" fill={C} />
      <path d="M-8 -1 C-8 -9 8 -10 8 -2 C4 -6 -3 -6 -8 -1 Z" fill={N} strokeWidth={1.4} />
    </g>
  );
}

function Laptop({ children }: { children: ReactNode }) {
  return (
    <g>
      <rect x="28" y="14" width="104" height="72" rx="5" fill={N} />
      <rect x="34" y="20" width="92" height="60" rx="2" fill={C} />
      {children}
      <path d="M18 88 H142 L134 98 H26 Z" fill={C} />
      <path d="M70 92 H90" strokeWidth={1.6} />
    </g>
  );
}

const SCENES: Record<SceneName, () => ReactNode> = {
  /** A big instrument and a small one: students teaching students. */
  teaching: () => (
    <g>
      <Place instrument="Acoustic Guitar" x={-10} y={18} scale={1.08} />
      <Place instrument="Ukulele" x={56} y={30} scale={0.98} />
      <Note x={122} y={24} size={1.2} />
      <Note x={138} y={36} />
      <Note x={106} y={16} size={0.8} />
    </g>
  ),

  /** A new request on the mentor's dashboard. */
  'first-student': () => (
    <g>
      <rect x="24" y="16" width="112" height="86" rx="7" fill={W} />
      <rect x="24" y="16" width="112" height="16" rx="7" fill={G} />
      <path d="M24 26 V32 H136 V26" fill={G} stroke="none" />
      <path d="M24 32 H136" />
      <circle cx="34" cy="24" r="2" fill={W} strokeWidth={1.2} />
      <circle cx="54" cy="56" r="13" fill={S} />
      <g transform="translate(54 52) scale(0.62)">
        <Person x={0} y={0} shirt={K} />
      </g>
      <path d="M76 50 H122 M76 58 H108" strokeWidth={3.5} stroke={N} opacity={0.25} />
      <rect x="36" y="78" width="46" height="14" rx="7" fill={G} />
      <path d="M52 85 L56 89 L65 80" strokeWidth={2.4} />
      <rect x="88" y="78" width="36" height="14" rx="7" fill={C} />
      <Note x={142} y={14} size={1.1} fill={K} />
      <Note x={16} y={100} size={0.9} fill={K} />
    </g>
  ),

  /** A calendar page with lesson day marked, and a clock. */
  'lesson-day': () => (
    <g>
      <rect x="30" y="16" width="80" height="84" rx="6" fill={W} />
      <path d="M30 22 C30 18 33 16 36 16 H104 C107 16 110 18 110 22 V36 H30 Z" fill={K} />
      <rect x="47" y="9" width="5" height="14" rx="2.5" fill={N} />
      <rect x="88" y="9" width="5" height="14" rx="2.5" fill={N} />
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={42 + col * 14} cy={48 + row * 14} r="2" fill={N} opacity={0.35} stroke="none" />
        )),
      )}
      <circle cx="84" cy="62" r="8" fill={G} />
      <Note x={82.5} y={65} size={0.7} />
      <circle cx="122" cy="84" r="18" fill={C} />
      <circle cx="122" cy="84" r="13.5" fill={W} strokeWidth={1.4} />
      <path d="M122 84 V75 M122 84 L129 88" strokeWidth={2.4} />
      <circle cx="122" cy="84" r="1.6" fill={N} />
    </g>
  ),

  /** A few instruments to choose from. */
  'pick-instrument': () => (
    <g>
      <Place instrument="Violin" x={-6} y={18} scale={0.82} />
      <Place instrument="Trumpet" x={62} y={2} scale={0.8} />
      <Place instrument="Snare Drum" x={72} y={58} scale={0.62} />
    </g>
  ),

  /** A piano with the first notes floating up. */
  'first-lesson': () => (
    <g>
      <Place instrument="Piano" x={14} y={24} scale={0.9} />
      <Note x={126} y={26} size={1.2} fill={G} />
      <Note x={140} y={40} fill={G} />
      <Note x={114} y={14} size={0.8} fill={G} />
    </g>
  ),

  /** A music stand with a page of music, and a metronome. */
  practice: () => (
    <g>
      <path d="M64 70 V108 M64 108 L50 116 M64 108 L78 116 M64 108 V116" strokeWidth={2.4} />
      <path d="M30 22 L98 18 L100 66 L32 70 Z" fill={W} />
      <path d="M28 70 L102 66" strokeWidth={3} />
      {[30, 36, 42, 48, 54].map((y, i) => (
        <path key={y} d={`M40 ${y + 0.4 - i * 0.2} L90 ${y - 2.6 - i * 0.2}`} strokeWidth={0.9} />
      ))}
      <Note x={50} y={46} size={0.8} />
      <Note x={62} y={41} size={0.8} />
      <Note x={76} y={44} size={0.8} />
      <path d="M112 108 L120 52 L136 52 L144 108 Z" fill={G} />
      <rect x="117" y="48" width="22" height="6" rx="2" fill={G} />
      <path d="M128 100 L121 62" strokeWidth={2.2} />
      <rect x="120" y="70" width="7" height="5" rx="1" transform="rotate(-10 123.5 72.5)" fill={W} strokeWidth={1.4} />
      <circle cx="128" cy="100" r="2.4" fill={N} />
      <path d="M110 108 H146" strokeWidth={2.4} />
    </g>
  ),

  /** A video lesson: the student with their instrument, and their mentor. */
  online: () => (
    <g>
      <Laptop>
        <rect x="38" y="26" width="40" height="48" rx="3" fill={S} />
        <rect x="82" y="26" width="40" height="48" rx="3" fill={G} />
        <Person x={58} y={50} shirt={K} />
        <Person x={102} y={50} shirt={W} />
        <g transform="translate(62 46) scale(0.28)">{instrumentDrawing('Violin')}</g>
      </Laptop>
      <path d="M118 6 H148 Q152 6 152 10 V24 Q152 28 148 28 H132 L126 34 L127 28 H118 Q114 28 114 24 V10 Q114 6 118 6 Z" fill={W} />
      <Note x={130} y={21} size={0.75} />
      <Note x={139} y={19} size={0.75} />
    </g>
  ),

  /** A school with music coming out of it: working with schools. */
  together: () => (
    <g>
      <path d="M80 22 V6" strokeWidth={1.8} />
      <path d="M80 6 L96 10 L80 15 Z" fill={G} />
      <rect x="40" y="46" width="80" height="58" fill={C} />
      <path d="M32 48 L80 20 L128 48 Z" fill={K} />
      <circle cx="80" cy="36" r="6" fill={W} />
      <path d="M80 36 V32 M80 36 L83 38" strokeWidth={1.4} />
      <rect x="71" y="76" width="18" height="28" rx="2" fill={G} />
      <rect x="49" y="58" width="14" height="12" rx="1.5" fill={W} />
      <rect x="97" y="58" width="14" height="12" rx="1.5" fill={W} />
      <rect x="49" y="80" width="14" height="12" rx="1.5" fill={W} />
      <rect x="97" y="80" width="14" height="12" rx="1.5" fill={W} />
      <path d="M20 104 H140" strokeWidth={2.4} />
      <Note x={22} y={36} size={1.1} />
      <Note x={138} y={34} size={1.1} />
      <Note x={30} y={64} size={0.8} />
      <Note x={132} y={66} size={0.8} />
    </g>
  ),
};

/** One scene, as a picture that fills its frame. */
export function SceneArt({ scene, className }: { scene: SceneName; className?: string }) {
  return (
    <ArtSvg viewBox="0 0 160 120" className={className}>
      {SCENES[scene]()}
    </ArtSvg>
  );
}
