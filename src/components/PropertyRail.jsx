// Full-height warm rail — shared across BookingDetail, Notifications,
// Account, Properties, Cleaners. Cream background, sparse 22px warm
// dot grid, inset shadow on the left edge, 120px cream fades at top
// and bottom so the pattern feels anchored rather than graph-paper.
//
// Smart-sizing rule: the rail is pure decoration and MUST yield width
// to its sibling content column whenever the viewport gets tight. We
// use `flex: 1 1 0` with `min-width: 0` so the rail grows to fill
// whatever space is left after the content column takes its ideal
// width — and shrinks all the way to 0 when the viewport can't spare
// any. Pair it with a content column sized as `flex: 0 1 {idealMax}`
// (basis = ideal max, shrink OK, no grow).

const WARM_50 = '#F9F8F6';

export function PropertyRail() {
  return (
    <aside
      aria-hidden="true"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        alignSelf: 'stretch',
        minHeight: 360,
        background: `radial-gradient(circle at 1px 1px, rgba(130,90,60,0.22) 1px, transparent 1.5px), ${WARM_50}`,
        backgroundSize: '22px 22px',
        boxShadow: 'inset 14px 0 28px -14px rgba(68,44,28,0.14)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 120,
          background: `linear-gradient(to bottom, ${WARM_50} 0%, rgba(251,245,238,0) 100%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: `linear-gradient(to top, ${WARM_50} 0%, rgba(251,245,238,0) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </aside>
  );
}
