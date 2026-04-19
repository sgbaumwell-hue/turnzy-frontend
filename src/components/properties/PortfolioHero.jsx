import { Star, TrendingUp } from 'lucide-react';

function HeroStat({ label, value, valueClassName, trailing, sub }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-warm-400 leading-none">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={`font-serif font-black text-[26px] leading-none tabular-nums tracking-[-0.025em] ${
            valueClassName || 'text-warm-800'
          }`}
        >
          {value}
        </span>
        {trailing}
      </div>
      {sub && <div className="mt-1 text-[11.5px] text-warm-400">{sub}</div>}
    </div>
  );
}

// Portfolio overview hero card that opens the Properties screen.
// Editorial in tone: eyebrow + serif headline + tagline + 4-stat strip.
export function PortfolioHero({
  count,
  workspaceName = 'Your Workspace',
  ytdTurnovers = 0,
  ytdHours = 0,
  cleanerRating = 0,
  needsAttention = 0,
  totalProperties = count,
  deltaPercent = 0,
}) {
  const needsAttentionActive = needsAttention > 0;

  return (
    <section
      className="relative overflow-hidden bg-white border border-warm-200 p-6 pr-8"
      style={{ borderRadius: 16 }}
    >
      {/* Coral wash */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          right: -96,
          top: -96,
          width: 340,
          height: 340,
          opacity: 0.07,
          background:
            'radial-gradient(circle, #E85F34 0%, transparent 70%)',
        }}
      />
      {/* Ghost numeral */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute font-serif font-black select-none"
        style={{
          right: 32,
          top: 24,
          opacity: 0.045,
          fontSize: 200,
          lineHeight: 1,
          letterSpacing: '-0.08em',
          color: '#1F1D1A',
        }}
      >
        {count}
      </div>

      {/* Foreground */}
      <div className="relative">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-warm-400">
          Portfolio
        </div>
        <h1 className="mt-2 font-serif font-black text-warm-800 leading-none tracking-[-0.03em] text-[34px]">
          {count} {count === 1 ? 'property' : 'properties'}
        </h1>
        <div className="mt-2 text-[13.5px] text-warm-600">
          across {workspaceName}
        </div>
        <p className="mt-3 max-w-[520px] text-[13.5px] text-warm-600 leading-relaxed">
          Every home, every cleaner, every source — in one place. Turnzy watches
          the turnovers; you watch the year.
        </p>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-5 border-t"
          style={{ borderColor: '#EDE7D7' }}
        >
          <HeroStat
            label="Turnovers YTD"
            value={ytdTurnovers}
            trailing={
              deltaPercent > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sage-600">
                  <TrendingUp size={11} />
                  +{deltaPercent}%
                </span>
              ) : null
            }
          />
          <HeroStat label="Hours cleaned" value={ytdHours} />
          <HeroStat
            label="Cleaner rating"
            value={cleanerRating.toFixed ? cleanerRating.toFixed(1) : cleanerRating}
            trailing={
              <Star
                size={12}
                className="text-amber-600 -translate-y-[2px]"
                fill="currentColor"
                strokeWidth={0}
              />
            }
          />
          <HeroStat
            label="Needs attention"
            value={needsAttention}
            valueClassName={needsAttentionActive ? 'text-danger-600' : 'text-warm-800'}
            sub={`of ${totalProperties}`}
          />
        </div>
      </div>
    </section>
  );
}
