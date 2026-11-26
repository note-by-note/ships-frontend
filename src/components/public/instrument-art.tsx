// Drawings of each instrument, made for this site so they all match: navy
// outlines with round ends, filled with the site's own colours. Each drawing
// is a group in a 120 × 90 space (the 4:3 cards), so scenes can reuse them.
// No outside images, so nothing to credit and no watermarks.

import type { ReactNode } from 'react';

const C = 'var(--color-cream)';
const G = 'var(--color-gold)';
const K = 'var(--color-coral)';
const S = 'var(--color-sky)';
const N = 'var(--color-navy)';
const W = '#ffffff';

/** Computed points rounded, so the server and the browser draw exactly the same numbers. */
const r2 = (n: number) => Math.round(n * 100) / 100;

/** The frame every drawing shares: outlines in the current text colour. */
export function ArtSvg({ children, viewBox = '0 0 120 90', className }: { children: ReactNode; viewBox?: string; className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-full w-full'}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** A metal tube: an outline with the colour inside, drawn as two strokes. */
function Tube({ d, width = 6, fill = G }: { d: string; width?: number; fill?: string }) {
  return (
    <>
      <path d={d} strokeWidth={width + 3.5} />
      <path d={d} stroke={fill} strokeWidth={width} />
    </>
  );
}

/** A note head with a stem, for sheet music and floating notes. */
export function Note({ x, y, size = 1, fill = N }: { x: number; y: number; size?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cx="0" cy="0" rx="3.4" ry="2.5" transform="rotate(-20)" fill={fill} />
      <path d="M3 -1 V-13 Q6 -11 8 -7" />
    </g>
  );
}

// --- Keys --------------------------------------------------------------------------

function Piano() {
  const white = 12;
  const keyWidth = 92 / white;
  const blacks = [1, 2, 4, 5, 6, 8, 9, 11];
  return (
    <g>
      <rect x="16" y="8" width="88" height="6" rx="2" fill={N} />
      <rect x="20" y="13" width="80" height="42" rx="3" fill={N} />
      <rect x="45" y="20" width="30" height="21" rx="1.5" fill={W} stroke={W} />
      <path d="M49 26h22M49 30h22M49 34h22" stroke={N} strokeWidth={0.8} />
      <Note x={55} y={31} size={0.55} />
      <Note x={64} y={29} size={0.55} />
      <rect x="20" y="66" width="80" height="12" fill={N} />
      <rect x="14" y="54" width="92" height="14" rx="2" fill={W} />
      {Array.from({ length: white - 1 }, (_, i) => (
        <path key={i} d={`M${r2(14 + (i + 1) * keyWidth)} 54v14`} strokeWidth={1} />
      ))}
      {blacks.map((i) => (
        <rect key={i} x={r2(14 + i * keyWidth - 2.3)} y="54" width="4.6" height="8.5" rx="0.8" fill={N} strokeWidth={1} />
      ))}
      <path d="M14 82h92M52 78v3M60 78v3M68 78v3" />
    </g>
  );
}

// --- Bowed strings ------------------------------------------------------------------

const BOWED_BODY =
  'M0 -32 C-10 -32 -16 -28 -15 -20 C-15 -15 -11 -13 -11 -9 C-11 -5 -18 -3 -18 8 C-18 22 -10 32 0 32 C10 32 18 22 18 8 C18 -3 11 -5 11 -9 C11 -13 15 -15 15 -20 C16 -28 10 -32 0 -32 Z';

function BowedBody({ endpin = false }: { endpin?: boolean }) {
  return (
    <g>
      {endpin ? <path d="M0 32 V46" strokeWidth={2.5} /> : null}
      <path d={BOWED_BODY} fill={K} />
      <rect x="-3.5" y="-62" width="7" height="34" rx="1.5" fill={K} />
      <path d="M-3 -62 C-6 -66 -1 -72 3 -69 C6 -67 3 -63 0 -64" fill={K} />
      <path d="M-4 -56 h-3 M-4 -50 h-3 M4 -56 h3 M4 -50 h3" strokeWidth={2.4} />
      <rect x="-3.2" y="-48" width="6.4" height="50" rx="1.5" fill={N} />
      <path d="M-9 -4 C-6 0 -11 4 -8 9 M9 -4 C6 0 11 4 8 9" strokeWidth={1.5} />
      <path d="M-6 12 H6" strokeWidth={2.5} />
      <path d="M-4 18 L4 18 L2.5 28 L-2.5 28 Z" fill={N} />
      <path d="M-1.2 -60 V18 M1.2 -60 V18" stroke={W} strokeWidth={0.6} />
    </g>
  );
}

function Bow({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  return (
    <g>
      <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeWidth={2.2} />
      <path d={`M${x1 + 1.5} ${y1 + 3} L${x2 + 0.5} ${y2 + 2.5}`} strokeWidth={1} stroke={C} />
      <rect x={x1 - 2} y={y1 - 1} width="6" height="5" rx="1" fill={N} transform={`rotate(${r2((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI)} ${x1} ${y1})`} />
    </g>
  );
}

function Violin() {
  return (
    <g>
      <Bow from={[20, 80]} to={[104, 18]} />
      <g transform="translate(58 54) rotate(-24) scale(0.8)">
        <BowedBody />
      </g>
    </g>
  );
}

function Viola() {
  return (
    <g>
      <Bow from={[16, 20]} to={[102, 80]} />
      <g transform="translate(62 54) rotate(22) scale(0.82)">
        <BowedBody />
      </g>
    </g>
  );
}

function Cello() {
  return (
    <g>
      <Bow from={[12, 62]} to={[108, 54]} />
      <g transform="translate(60 47) scale(0.72)">
        <BowedBody endpin />
      </g>
    </g>
  );
}

function StringBass() {
  return (
    <g transform="translate(60 45) rotate(10) scale(0.76)">
      <BowedBody endpin />
    </g>
  );
}

// --- Plucked strings ----------------------------------------------------------------

const GUITAR_BODY =
  'M30 28 C18 28 10 34 10 45 C10 56 18 62 30 62 C37 62 40 58 45 58 C50 58 54 61 58 59 C63 56 64 50 64 45 C64 40 63 34 58 31 C54 29 50 32 45 32 C40 32 37 28 30 28 Z';

const ELECTRIC_BODY =
  'M14 34 C14 26 24 24 30 28 C36 31 40 30 46 28 C52 26 60 29 57 36 C55 40 58 42 62 42 L62 48 C58 48 55 50 57 54 C60 61 52 64 46 62 C40 60 36 59 30 62 C24 66 14 64 14 56 C11 50 11 40 14 34 Z';

function Strings({ from, to, count = 3 }: { from: number; to: number; count?: number }) {
  return (
    <path
      d={Array.from({ length: count }, (_, i) => `M${from} ${r2(43.6 + i * (2.8 / Math.max(1, count - 1)))} H${to}`).join(' ')}
      stroke={W}
      strokeWidth={0.6}
    />
  );
}

function Neck({ to = 100 }: { to?: number }) {
  return (
    <g>
      <rect x="62" y="42" width={to - 62} height="6" fill={N} />
      <path d={[68, 74, 80, 86, 92].filter((x) => x < to).map((x) => `M${x} 42v6`).join(' ')} stroke={W} strokeWidth={0.8} />
    </g>
  );
}

function AcousticGuitar({ classical = false }: { classical?: boolean }) {
  return (
    <g transform="rotate(-26 60 45) translate(-2 0)">
      <path d={GUITAR_BODY} fill={C} />
      {classical ? <circle cx="48" cy="45" r="8" stroke={K} strokeWidth={2.5} /> : null}
      <circle cx="48" cy="45" r="5.5" fill={N} />
      <rect x="19" y="39" width="4.5" height="12" rx="1" fill={N} />
      <Neck />
      {classical ? (
        <g>
          <rect x="98" y="39" width="17" height="12" rx="1.5" fill={K} />
          <path d="M101 42.5 H112 M101 47.5 H112" strokeWidth={2} stroke={N} />
          <path d="M103 38 v-2 M108 38 v-2 M103 52 v2 M108 52 v2" strokeWidth={2.2} />
        </g>
      ) : (
        <g>
          <path d="M98 40 L114 38 L114 52 L98 50 Z" fill={C} />
          <circle cx="103" cy="36.5" r="1.8" fill={W} />
          <circle cx="109" cy="36" r="1.8" fill={W} />
          <circle cx="103" cy="53.5" r="1.8" fill={W} />
          <circle cx="109" cy="54" r="1.8" fill={W} />
        </g>
      )}
      <Strings from={22} to={99} />
    </g>
  );
}

function ElectricGuitar({ bass = false }: { bass?: boolean }) {
  const neckEnd = bass ? 104 : 98;
  return (
    <g transform={`rotate(-26 60 45) ${bass ? 'translate(-6 0) scale(0.96)' : ''}`}>
      <path d={ELECTRIC_BODY} fill={bass ? S : K} />
      <path d="M22 36 C28 33 38 34 44 38 C48 41 46 52 40 54 C32 56 24 54 21 50 Z" fill={W} strokeWidth={1.4} />
      {bass ? (
        <rect x="34" y="40" width="5" height="10" rx="1.5" fill={N} />
      ) : (
        <g>
          <rect x="30" y="40" width="4" height="10" rx="1" fill={N} />
          <rect x="39" y="40" width="4" height="10" rx="1" fill={N} />
        </g>
      )}
      <rect x="20" y="41" width="4" height="8" rx="1" fill={N} />
      <circle cx="24" cy="58" r="1.8" fill={W} />
      <circle cx="30" cy="59.5" r="1.8" fill={W} />
      <Neck to={neckEnd} />
      <path d={`M${neckEnd - 1} 41 L${neckEnd + 13} 37 L${neckEnd + 15} 44 L${neckEnd + 1} 49 Z`} fill={C} />
      {Array.from({ length: bass ? 4 : 6 }, (_, i) => (
        <circle key={i} cx={r2(neckEnd + 2 + i * (bass ? 3.6 : 2.4))} cy={r2(38.6 - i * (bass ? 1 : 0.6))} r="1.2" fill={W} strokeWidth={1.2} />
      ))}
      <Strings from={22} to={neckEnd} count={bass ? 4 : 3} />
    </g>
  );
}

function Ukulele() {
  return (
    <g transform="translate(16 12) scale(0.78) rotate(-26 60 45)">
      <path d={GUITAR_BODY} fill={K} />
      <circle cx="48" cy="45" r="5.5" fill={N} />
      <rect x="19" y="40" width="4.5" height="10" rx="1" fill={N} />
      <rect x="62" y="42" width="26" height="6" fill={N} />
      <path d="M68 42v6M74 42v6M80 42v6" stroke={W} strokeWidth={0.8} />
      <path d="M86 40 L100 39 L100 51 L86 50 Z" fill={C} />
      <circle cx="91" cy="37.5" r="1.8" fill={W} />
      <circle cx="96" cy="37.2" r="1.8" fill={W} />
      <circle cx="91" cy="52.5" r="1.8" fill={W} />
      <circle cx="96" cy="52.8" r="1.8" fill={W} />
      <Strings from={22} to={87} count={4} />
    </g>
  );
}

function Banjo() {
  return (
    <g transform="rotate(-26 60 45)">
      <rect x="52" y="42" width="52" height="6" fill={N} />
      <path d="M62 42v6M70 42v6M78 42v6M86 42v6M94 42v6" stroke={W} strokeWidth={0.8} />
      <path d="M102 40 L116 38 L116 52 L102 50 Z" fill={C} />
      <circle cx="107" cy="36.5" r="1.8" fill={W} />
      <circle cx="112" cy="36" r="1.8" fill={W} />
      <circle cx="107" cy="53.5" r="1.8" fill={W} />
      <circle cx="112" cy="54" r="1.8" fill={W} />
      <circle cx="80" cy="40" r="1.6" fill={W} />
      <circle cx="32" cy="45" r="22" fill={G} strokeWidth={2.5} />
      <circle cx="32" cy="45" r="17" fill={W} />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={r2(32 + Math.cos(angle) * 19.5)} cy={r2(45 + Math.sin(angle) * 19.5)} r="0.9" fill={N} strokeWidth={0.8} />;
      })}
      <rect x="24" y="42.5" width="5" height="5" rx="1" fill={C} strokeWidth={1.4} />
      <path d="M14 42 L20 42 L20 48 L14 48" fill={N} />
      <Strings from={18} to={103} count={4} />
    </g>
  );
}

// --- Woodwinds ----------------------------------------------------------------------

function Flute() {
  return (
    <g transform="rotate(-16 60 45)">
      <rect x="8" y="41" width="104" height="8" rx="4" fill={W} />
      <rect x="8" y="41" width="10" height="8" rx="3" fill={C} />
      <ellipse cx="26" cy="40.5" rx="4.5" ry="2.4" fill={C} />
      <path d="M38 41v8M100 41v8" strokeWidth={1.4} />
      <path d="M44 39 H98" strokeWidth={1.2} />
      {[48, 56, 64, 74, 82, 90].map((x) => (
        <circle key={x} cx={x} cy="45" r="2.6" fill={C} strokeWidth={1.5} />
      ))}
    </g>
  );
}

function ClarinetLike({ reed = false, slim = false }: { reed?: boolean; slim?: boolean }) {
  const w = slim ? 4.5 : 6.5;
  const x = 60 - w / 2;
  return (
    <g transform="rotate(30 60 45)">
      {reed ? (
        <path d="M59 0 L61 0 L60.6 9 L59.4 9 Z" fill={G} strokeWidth={1.4} />
      ) : (
        <path d="M57.5 4 L62.5 4 L62 13 L58 13 Z" fill={N} />
      )}
      {!reed ? <rect x="56.5" y="13" width="7" height="8" rx="1.5" fill={N} /> : null}
      <rect x={x} y={reed ? 9 : 21} width={w} height={reed ? 62 : 48} fill={N} />
      <path d={reed ? 'M57.8 71 L62.2 71 L64.5 80 L55.5 80 Z' : 'M56.8 69 L63.2 69 L68.5 81 L51.5 81 Z'} fill={N} />
      <path d="M57 28 h6 M57 50 h6" stroke={W} strokeWidth={1.2} />
      {[32, 38, 44, 56, 62].map((y) => (
        <circle key={y} cx="60" cy={y} r={slim ? 1.3 : 1.8} fill={W} strokeWidth={1} />
      ))}
      <path d={`M${x + w + 1} 34 V60`} stroke={W} strokeWidth={1.2} />
    </g>
  );
}

function BassClarinet() {
  return (
    <g>
      <Tube d="M56 22 C56 12 50 7 40 9" width={3} fill={W} />
      <path d="M33 6 L40 7.5 L40 11 L33 12 Z" fill={N} />
      <rect x="51.5" y="20" width="9" height="50" rx="1.5" fill={N} />
      <Tube d="M56 69 C56 79 62 83 72 80" width={8} fill={W} />
      <path d="M70 75 C78 74 84 68 86 60 L96 64 C93 76 84 84 72 86 Z" fill={W} />
      <path d="M86 60 L96 64" strokeWidth={2.4} />
      {[28, 35, 42, 49, 56, 63].map((y) => (
        <circle key={y} cx="56" cy={y} r="1.9" fill={W} strokeWidth={1} />
      ))}
    </g>
  );
}

function Bassoon() {
  return (
    <g transform="rotate(8 60 45)">
      <rect x="50" y="68" width="22" height="12" rx="4" fill={K} />
      <rect x="61" y="24" width="9" height="50" rx="2" fill={K} />
      <rect x="51" y="10" width="9.5" height="62" rx="2" fill={K} />
      <rect x="50.5" y="5" width="10.5" height="7" rx="1.5" fill={C} />
      <path d="M51 30 h9.5 M61 46 h9" stroke={C} strokeWidth={1.4} />
      <Tube d="M61 32 C54 26 44 25 36 30" width={1.8} fill={W} />
      <path d="M31 31 L36.5 29 L37.5 32 L32 34 Z" fill={G} strokeWidth={1.2} />
      {[40, 48, 56].map((y) => (
        <circle key={y} cx="55.7" cy={y} r="1.7" fill={C} strokeWidth={1} />
      ))}
      {[56, 64].map((y) => (
        <circle key={y} cx="65.5" cy={y} r="1.7" fill={C} strokeWidth={1} />
      ))}
    </g>
  );
}

function SopranoSax() {
  return (
    <g transform="rotate(30 60 45)">
      <path d="M58 2 L62 2 L61.6 11 L58.4 11 Z" fill={N} />
      <path d="M58.4 11 L61.6 11 L64.5 64 L55.5 64 Z" fill={G} />
      <path d="M55.5 64 L64.5 64 L72 82 L48 82 Z" fill={G} />
      <ellipse cx="60" cy="82" rx="12" ry="2.6" fill={G} />
      {[22, 30, 38, 46, 54].map((y) => (
        <circle key={y} cx={60} cy={y} r="2" fill={W} strokeWidth={1} />
      ))}
    </g>
  );
}

function Saxophone({ tenor = false }: { tenor?: boolean }) {
  return (
    <g transform={tenor ? 'translate(-6 -4) scale(1.08)' : undefined}>
      <Tube d={tenor ? 'M36 16 C40 6 48 10 50 16 C52 21 54 22 55 25' : 'M38 12 C45 12 51 15 55 23'} width={3.4} />
      <path d={tenor ? 'M29 15 L36 14 L37 18 L30 19 Z' : 'M30 10 L38 10 L38 14 L30 14 Z'} fill={N} />
      <Tube d="M56 24 L56 62" width={8} />
      <Tube d="M56 60 Q56 76 67 76 Q78 76 78 64 L78 52" width={10} />
      <path d="M71 54 L64 35 L92 35 L85 54 Z" fill={G} />
      <ellipse cx="78" cy="35" rx="14" ry="3.6" fill={G} />
      {[30, 38, 46, 54].map((y) => (
        <circle key={y} cx="56" cy={y} r="2.4" fill={W} strokeWidth={1.1} />
      ))}
      <circle cx="78" cy="58" r="2" fill={W} strokeWidth={1.1} />
    </g>
  );
}

// --- Brass --------------------------------------------------------------------------

function Trumpet() {
  return (
    <g transform="translate(0 4)">
      <Tube d="M14 36 L46 36" width={3} />
      <Tube d="M46 50 Q46 58 54 58 L62 58 Q68 58 68 50" width={3} />
      <Tube d="M66 36 L88 36" width={3.4} />
      <path d="M86 31.5 L108 22 L108 50 L86 40.5 Z" fill={G} />
      <ellipse cx="108" cy="36" rx="3.8" ry="14" fill={G} />
      <path d="M8 33 L14 35 L14 37 L8 39 Z" fill={W} />
      {[44, 51.5, 59].map((x) => (
        <g key={x}>
          <rect x={x} y="28" width="6" height="24" rx="1.2" fill={G} />
          <rect x={x + 1} y="22" width="4" height="6" rx="1" fill={W} />
        </g>
      ))}
    </g>
  );
}

function Trombone() {
  return (
    <g>
      <Tube d="M92 54 L20 54 Q14 54 14 59 Q14 64 20 64 L92 64" width={3} />
      <Tube d="M92 54 L98 54 Q106 54 106 45 Q106 36 98 36 L46 36" width={3.2} />
      <path d="M48 31 L22 21 L22 51 L48 41 Z" fill={G} />
      <ellipse cx="22" cy="36" rx="3.8" ry="15" fill={G} />
      <path d="M96 62 L103 60 L103 68 L96 66 Z" fill={W} />
      <path d="M62 36 V54 M78 36 V54" strokeWidth={2.2} />
    </g>
  );
}

function FrenchHorn() {
  return (
    <g>
      <Tube d="M58 20 A24 24 0 1 1 57.9 20" width={3.6} />
      <Tube d="M58 31 A13 13 0 1 1 57.9 31" width={3} />
      <path d="M74 56 C84 60 92 68 96 82 L114 74 C106 60 94 52 80 49 Z" fill={G} />
      <ellipse cx="105" cy="78" rx="10" ry="3.4" transform="rotate(-24 105 78)" fill={G} />
      <Tube d="M42 30 L22 17" width={2.4} />
      <path d="M15 13 L22 16 L20.5 19.5 L14 17 Z" fill={W} />
      {[51, 58, 65].map((x) => (
        <circle key={x} cx={x} cy="44" r="3.6" fill={W} />
      ))}
    </g>
  );
}

function LowBrass({ bell, body }: { bell: number; body: number }) {
  const top = 8;
  return (
    <g>
      <Tube d="M28 54 L28 62 Q28 68 36 68 L46 68" width={3.6} />
      <Tube d="M46 44 L22 28" width={2.6} />
      <path d="M15 24 L22 27 L20.5 30.5 L14 28 Z" fill={W} />
      <Tube d="M54 80 Q44 80 44 70 L44 40" width={body - 3} />
      <Tube d={`M54 80 Q68 80 68 66 L68 ${top + 24}`} width={body} />
      <path d={`M${68 - body / 2 - 1} ${top + 26} L${68 - bell} ${top} L${68 + bell} ${top} L${68 + body / 2 + 1} ${top + 26} Z`} fill={G} />
      <ellipse cx="68" cy={top} rx={bell} ry="3.4" fill={G} />
      {[24, 31, 38].map((x) => (
        <g key={x}>
          <rect x={x - 2.5} y="36" width="5" height="20" rx="1" fill={G} />
          <rect x={x - 1.6} y="30.5" width="3.2" height="5.5" rx="0.8" fill={W} />
        </g>
      ))}
    </g>
  );
}

// --- Percussion ---------------------------------------------------------------------

function Drum({ cx, cy, rx, ry, depth, shell = S }: { cx: number; cy: number; rx: number; ry: number; depth: number; shell?: string }) {
  return (
    <g>
      <path d={`M${cx - rx} ${cy} V${cy + depth} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + depth} V${cy}`} fill={shell} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={W} />
    </g>
  );
}

function SnareDrum() {
  return (
    <g>
      <path d="M36 22 L78 8 M84 22 L42 8" strokeWidth={3} />
      <circle cx="78" cy="8" r="1.8" fill={N} />
      <circle cx="42" cy="8" r="1.8" fill={N} />
      <Drum cx={60} cy={36} rx={32} ry={9} depth={24} />
      <path d="M38 43 V64 M49 45 V66 M60 45 V67 M71 45 V66 M82 43 V64" strokeWidth={1.4} />
      <path d="M28 40 A32 9 0 0 0 92 40" strokeWidth={2.4} />
      <path d="M28 56 A32 9 0 0 0 92 56" strokeWidth={2.4} />
    </g>
  );
}

function DrumSet() {
  return (
    <g>
      <path d="M18 38 V82 M12 82 L18 74 L24 82 M96 28 V82 M90 82 L96 74 L102 82" strokeWidth={1.6} />
      <ellipse cx="18" cy="38" rx="11" ry="2.4" fill={G} />
      <ellipse cx="18" cy="34.5" rx="11" ry="2.4" fill={G} />
      <ellipse cx="96" cy="27" rx="14" ry="3" transform="rotate(-10 96 27)" fill={G} />
      <Drum cx={30} cy={52} rx={12} ry={3.6} depth={9} />
      <Drum cx={90} cy={56} rx={11} ry={3.6} depth={18} shell={N} />
      <Drum cx={60} cy={30} rx={12} ry={4} depth={9} shell={N} />
      <circle cx="60" cy="60" r="20" fill={W} strokeWidth={3} />
      <circle cx="60" cy="60" r="7" fill={K} strokeWidth={1.4} />
      <path d="M44 78 L40 84 M76 78 L80 84" strokeWidth={2} />
    </g>
  );
}

function Timpani() {
  return (
    <g>
      <path d="M44 32 L22 14 M76 32 L98 14" strokeWidth={2} />
      <circle cx="22" cy="14" r="4.2" fill={C} />
      <circle cx="98" cy="14" r="4.2" fill={C} />
      <path d="M40 62 L34 82 M80 62 L86 82 M60 68 V82" strokeWidth={2.2} />
      <path d="M28 42 C28 72 92 72 92 42 Z" fill={G} />
      <ellipse cx="60" cy="42" rx="32" ry="8" fill={W} strokeWidth={2.6} />
      <path d="M32 48 C40 52 50 53 60 53" stroke={W} strokeWidth={1.2} />
    </g>
  );
}

function Mallets({ head = K }: { head?: string }) {
  return (
    <g>
      <path d="M80 13 L104 26 M90 10 L110 26" strokeWidth={1.8} />
      <circle cx="78" cy="12" r="3.6" fill={head} />
      <circle cx="88" cy="9" r="3.6" fill={head} />
    </g>
  );
}

function BarInstrument({ bar, resonators, caseFill, small = false }: { bar: string; resonators?: string; caseFill?: string; small?: boolean }) {
  const count = small ? 9 : 8;
  const step = small ? 9 : 11;
  const width = small ? 6 : 8;
  const start = small ? 20 : 17;
  return (
    <g>
      {caseFill ? <rect x="10" y="24" width="100" height="40" rx="4" fill={caseFill} /> : null}
      {!caseFill ? (
        <g>
          <path d="M14 34 L106 38 M14 52 L106 48" strokeWidth={2.4} />
          <path d="M20 52 V80 M100 49 V80 M20 80 H100" strokeWidth={1.8} />
        </g>
      ) : null}
      {resonators
        ? Array.from({ length: count }, (_, i) => (
            <rect key={`r${i}`} x={r2(start + i * step + width / 2 - 2)} y={r2(54 - i * 0.6)} width="4" height={r2(22 - i * 2)} rx="2" fill={resonators} strokeWidth={1.2} />
          ))
        : null}
      {Array.from({ length: count }, (_, i) => {
        const h = (small ? 30 : 32) - i * (small ? 1.6 : 2);
        return <rect key={i} x={start + i * step} y={r2(43 - h / 2)} width={width} height={r2(h)} rx="1.5" fill={bar} strokeWidth={1.6} />;
      })}
      <Mallets head={bar === W ? K : C} />
    </g>
  );
}

function HandDrums() {
  return (
    <g>
      <path d="M30 26 C30 44 40 50 44 52 L40 80 L58 80 L54 52 C58 50 68 44 68 26" fill={G} />
      <path d="M32 30 L36 46 L40 31 L44 48 L49 31 L53 48 L58 31 L62 46 L66 30" stroke={K} strokeWidth={1.4} />
      <ellipse cx="49" cy="26" rx="19" ry="5" fill={W} strokeWidth={2.4} />
      <path d="M39 80 H59" strokeWidth={3} />
      <rect x="86" y="50" width="6" height="6" fill={N} />
      <Drum cx={80} cy={46} rx={10} ry={3.4} depth={14} shell={K} />
      <Drum cx={98} cy={50} rx={8} ry={2.8} depth={12} shell={K} />
    </g>
  );
}

function AuxiliaryPercussion() {
  return (
    <g>
      <circle cx="36" cy="44" r="22" fill={C} />
      <circle cx="36" cy="44" r="15" fill={W} />
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        const x = r2(36 + Math.cos(angle) * 18.5);
        const y = r2(44 + Math.sin(angle) * 18.5);
        return <ellipse key={i} cx={x} cy={y} rx="3.4" ry="2.2" transform={`rotate(${r2((angle * 180) / Math.PI + 90)} ${x} ${y})`} fill={G} strokeWidth={1.2} />;
      })}
      <path d="M92 22 V37" strokeWidth={1.2} />
      <path d="M78 70 L106 70 M108 66 L94 38 M90 38 L76 66" strokeWidth={3} />
      <path d="M100 52 L116 40" strokeWidth={2} />
      <ellipse cx="66" cy="74" rx="7" ry="9" transform="rotate(-20 66 74)" fill={S} />
    </g>
  );
}

/** "Percussion" in general: a snare drum, a tambourine and a triangle. */
function PercussionMix() {
  return (
    <g>
      <g transform="translate(-6 18) scale(0.78)">
        <SnareDrum />
      </g>
      <circle cx="92" cy="30" r="13" fill={C} />
      <circle cx="92" cy="30" r="8.5" fill={W} />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={[92, 105, 92, 79][i]} cy={[17, 30, 43, 30][i]} rx="2.6" ry="1.7" fill={G} strokeWidth={1} />
      ))}
      <path d="M86 80 L108 80 M110 76 L99 54 M95 54 L84 76" strokeWidth={2.6} />
      <path d="M97 46 V53" strokeWidth={1.2} />
    </g>
  );
}

// --- Theory -------------------------------------------------------------------------

function MusicTheory() {
  return (
    <g>
      <rect x="20" y="10" width="66" height="70" rx="3" fill={W} />
      <path d="M28 26h50M28 30h50M28 34h50M28 38h50M28 42h50" strokeWidth={0.9} />
      <path d="M28 56h50M28 60h50M28 64h50M28 68h50M28 72h50" strokeWidth={0.9} />
      <Note x={38} y={40} />
      <Note x={50} y={36} />
      <Note x={62} y={32} />
      <path d="M41 27 L53 23 M53 23 L65 19" strokeWidth={2.6} />
      <ellipse cx="44" cy="66" rx="3.4" ry="2.5" transform="rotate(-20 44 66)" fill={W} />
      <path d="M47 65 V53" />
      <path d="M58 60 h7 M58 64 h7 M60 57 v11 M63 56 v11" strokeWidth={1.2} />
      <g transform="rotate(-58 96 52)">
        <rect x="74" y="48" width="42" height="8" rx="1" fill={G} />
        <path d="M74 48 L65 52 L74 56 Z" fill={C} />
        <path d="M65 52 L68 50.7 L68 53.3 Z" fill={N} />
        <rect x="112" y="48" width="6" height="8" rx="1" fill={K} />
      </g>
    </g>
  );
}

// --- Which drawing for which instrument -----------------------------------------------

const DRAWINGS: Record<string, () => ReactNode> = {
  Piano: Piano,
  Violin: Violin,
  Viola: Viola,
  Cello: Cello,
  'String Bass': StringBass,
  Guitar: () => <AcousticGuitar />,
  'Acoustic Guitar': () => <AcousticGuitar />,
  'Classical Guitar': () => <AcousticGuitar classical />,
  'Electric Guitar': () => <ElectricGuitar />,
  'Bass Guitar': () => <ElectricGuitar bass />,
  Banjo: Banjo,
  Ukulele: Ukulele,
  Flute: Flute,
  Clarinet: () => <ClarinetLike />,
  'Bass Clarinet': BassClarinet,
  Oboe: () => <ClarinetLike reed slim />,
  Bassoon: Bassoon,
  'Soprano Saxophone': SopranoSax,
  'Alto Saxophone': () => <Saxophone />,
  'Tenor Saxophone': () => <Saxophone tenor />,
  Trumpet: Trumpet,
  'French Horn': FrenchHorn,
  Trombone: Trombone,
  Euphonium: () => <LowBrass bell={14} body={9} />,
  Tuba: () => <LowBrass bell={22} body={12} />,
  Percussion: PercussionMix,
  'Drum Set': DrumSet,
  'Snare Drum': SnareDrum,
  Timpani: Timpani,
  Xylophone: () => <BarInstrument bar={K} />,
  Marimba: () => <BarInstrument bar={K} resonators={N} />,
  Vibraphone: () => <BarInstrument bar={W} resonators={C} />,
  Glockenspiel: () => <BarInstrument bar={W} caseFill={N} small />,
  'Hand Drums': HandDrums,
  'Auxiliary Percussion': AuxiliaryPercussion,
  'Music Theory': MusicTheory,
};

/** The drawing's group, for placing inside another drawing. */
export function instrumentDrawing(instrument: string): ReactNode {
  const draw = DRAWINGS[instrument];
  return draw ? draw() : null;
}

export function hasInstrumentArt(instrument: string): boolean {
  return Boolean(DRAWINGS[instrument]);
}

/** One instrument, as a picture that fills its box. */
export function InstrumentArt({ instrument, className }: { instrument: string; className?: string }) {
  const drawing = instrumentDrawing(instrument);
  if (!drawing) return null;
  return <ArtSvg className={className}>{drawing}</ArtSvg>;
}
