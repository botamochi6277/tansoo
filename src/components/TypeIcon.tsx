import type { ReactElement } from 'react';
import { typeIcon } from '../clothTypes';

/** Glyphs the icon font lacks, drawn as outlines on a 24x24 grid. */
const SVG_ICONS: Record<string, ReactElement> = {
  Hat: (
    <>
      <path d="M5 15a7 7 0 0 1 14 0z" />
      <rect x="3" y="16" width="18" height="2.5" rx="1.25" />
    </>
  ),
  Eyewear: (
    <>
      <circle cx="6.5" cy="14" r="3.5" />
      <circle cx="17.5" cy="14" r="3.5" />
      <path d="M10 13.5q2-1.5 4 0" />
    </>
  ),
  Shoes: <path d="M2 7h5l1 3 5 2 6 1.5a3 3 0 0 1 3 3V19H2z" />,
  Suit: <>
      <path d="M8 3l4 4 4-4 4 3-2 4v11H6V10L4 6z" />
      <path d="M12 9l-1.5 2 1 8h1l1-8z" />
    </>,
  'One-piece': <path d="M9 2l3 3 3-2 1 5-1.5 3L19 22H5l4.5-12L8 8z" />,
  Loungewear: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5z" />,
};

/** Cloth icon: from the FontBotamochi icon font, or a drawn one where the font has no glyph. */
export default function TypeIcon({ type }: { type: string }) {
  const svg = SVG_ICONS[type];
  if (svg) {
    return (
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" style={{ verticalAlign: '-0.125em' }}>
        {svg}
      </svg>
    );
  }
  return <span className={`fb ${typeIcon(type)}`} aria-hidden="true" />;
}
