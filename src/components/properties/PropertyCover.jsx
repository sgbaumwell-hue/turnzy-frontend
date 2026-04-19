import clsx from 'clsx';
import { paletteForId } from './propertyFixtures';

const SIZES = {
  sm: { w: 64, h: 80, mono: 16, radius: 10 },
  md: { w: 88, h: 110, mono: 22, radius: 12 },
  lg: { w: 112, h: 140, mono: 28, radius: 14 },
};

// The "book cover" for a property. Stacked gradient + warmth overlays +
// monogram, used in cards and detail views.
export function PropertyCover({ property, size = 'md', className }) {
  const s = SIZES[size] || SIZES.md;
  const palette = property?.cover || paletteForId(property?.id);
  const monogram = (property?.code || property?.name || '?').slice(0, 3).toUpperCase();

  return (
    <div
      className={clsx('relative flex-shrink-0 overflow-hidden', className)}
      style={{
        width: s.w,
        height: s.h,
        borderRadius: s.radius,
        background: `linear-gradient(155deg, ${palette.from} 0%, ${palette.via} 55%, ${palette.to} 100%)`,
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.08), 0 8px 20px -8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
      aria-hidden="true"
    >
      {/* Warmth overlay 1 — light glow, top-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.3,
          mixBlendMode: 'overlay',
          background:
            'radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.6), transparent 55%)',
        }}
      />
      {/* Warmth overlay 2 — deep shadow, bottom-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.5,
          background:
            'radial-gradient(ellipse at 80% 100%, rgba(0,0,0,0.35), transparent 60%)',
        }}
      />
      {/* Hairline frame */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)' }}
      />
      {/* Monogram */}
      <span
        className="absolute font-serif font-black leading-none"
        style={{
          left: 12,
          bottom: 10,
          fontSize: s.mono,
          letterSpacing: '-0.04em',
          color: 'rgba(255,255,255,0.95)',
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
        }}
      >
        {monogram}
      </span>
    </div>
  );
}
