import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreHorizontal,
  MapPin,
  Bed,
  Bath,
  Users,
  Link2,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import clsx from 'clsx';
import { PropertyCover } from './PropertyCover';
import { Avatar } from '../ui/Avatar';

// Small stat used in each card's stats strip. Block-level so `sub` wraps
// cleanly beneath the value.
export function Stat({ label, value, sub }) {
  return (
    <div className="min-w-0">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] leading-none text-warm-400">
        {label}
      </div>
      <div className="mt-1.5">
        <div className="block font-serif font-black text-[18px] leading-none tabular-nums tracking-[-0.02em] text-warm-800 whitespace-nowrap">
          {value}
        </div>
        {sub && (
          <div className="block mt-1 text-[11px] text-warm-400 truncate">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// Maps our `nextTurnover.tone` to `Pill` bg/text classes.
const TONE_PILL = {
  urgent:    { bg: 'bg-danger-50',  text: 'text-danger-600', dot: 'bg-danger-600' },
  pending:   { bg: 'bg-amber-50',   text: 'text-amber-600',  dot: 'bg-amber-600' },
  confirmed: { bg: 'bg-sage-50',    text: 'text-sage-600',   dot: 'bg-sage-600' },
  queued:    { bg: 'bg-warm-100',   text: 'text-warm-600',   dot: 'bg-warm-400' },
};

function StatusPill({ tone, label }) {
  const t = TONE_PILL[tone] || TONE_PILL.queued;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10.5px] font-bold uppercase tracking-wide',
        t.bg,
        t.text,
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', t.dot)} />
      {label}
    </span>
  );
}

export function PropertyCard({ property, onOpen }) {
  const navigate = useNavigate();
  const handleOpen = () => {
    if (onOpen) onOpen(property);
    else navigate(`/properties/${property.id}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKey}
      className="group relative cursor-pointer bg-white border border-warm-200 rounded-[14px] overflow-hidden transition-all duration-150 ease-out hover:border-warm-300 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_12px_28px_-16px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2"
      aria-label={`Open ${property.name}`}
    >
      {/* ── Header ── */}
      <div className="flex gap-4 p-4 pb-3.5">
        <PropertyCover property={property} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate font-serif font-black text-[19px] leading-[1.15] tracking-[-0.025em] text-warm-800">
              {property.name}
            </h3>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  aria-label="Property actions"
                  className="p-1.5 -mr-1 -mt-0.5 rounded-lg text-warm-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-warm-100 transition-opacity duration-150"
                >
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  onClick={(e) => e.stopPropagation()}
                  className="z-50 min-w-[160px] rounded-lg border border-warm-200 bg-white p-1 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)]"
                >
                  <DropdownMenu.Item
                    onSelect={() => navigate(`/properties/${property.id}/edit`)}
                    className="cursor-pointer rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-warm-800 outline-none data-[highlighted]:bg-warm-50"
                  >
                    Edit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => {/* stub */}}
                    className="cursor-pointer rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-warm-800 outline-none data-[highlighted]:bg-warm-50"
                  >
                    Duplicate
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-warm-100" />
                  <DropdownMenu.Item
                    onSelect={() => {/* stub */}}
                    className="cursor-pointer rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-warm-600 outline-none data-[highlighted]:bg-warm-50"
                  >
                    Archive
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {property.address && (
            <div className="mt-1 flex items-center gap-1 text-[12px] text-warm-600 truncate">
              <MapPin size={12} className="text-warm-400 flex-shrink-0" />
              <span className="truncate">{property.address}</span>
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-3 text-[12px] text-warm-600">
            <span className="inline-flex items-center gap-1">
              <Bed size={13} className="text-warm-400" />
              {property.beds} bd
            </span>
            <span className="w-px h-3 bg-warm-200" aria-hidden="true" />
            <span className="inline-flex items-center gap-1">
              <Bath size={13} className="text-warm-400" />
              {property.baths} ba
            </span>
            <span className="w-px h-3 bg-warm-200" aria-hidden="true" />
            <span className="inline-flex items-center gap-1">
              <Users size={13} className="text-warm-400" />
              Sleeps {property.sleeps}
            </span>
          </div>

          {property.sources?.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {property.sources.map((src) => (
                <span
                  key={src}
                  className="inline-flex items-center gap-1 bg-warm-100 border border-warm-200 rounded-md px-2 py-0.5 text-[10.5px] font-semibold text-warm-600"
                >
                  <Link2 size={10} />
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div
        className="mx-4 border-t border-dashed"
        style={{ borderColor: '#EDE7D7' }}
      />
      <div className="px-4 py-3.5 grid grid-cols-4 gap-3">
        <Stat
          label="Next"
          value={property.nextTurnover?.date ?? '—'}
          sub={property.nextTurnover?.status}
        />
        <Stat label="YTD" value={property.ytdTurnovers} sub="turnovers" />
        <Stat label="Hours" value={property.ytdHours} sub="cleaned" />
        <Stat label="Last" value={property.lastCleaned ?? '—'} />
      </div>

      {/* ── Footer ── */}
      <div
        className="px-4 py-3 bg-warm-50 border-t flex items-center justify-between gap-3"
        style={{ borderColor: '#EDE7D7' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={property.defaultCleaner?.name} size="sm" />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-warm-800 truncate">
              {property.defaultCleaner?.name}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-warm-400">
              <Star
                size={9}
                className="text-amber-600"
                fill="currentColor"
                strokeWidth={0}
              />
              <span className="tabular-nums">
                {property.defaultCleaner?.rate?.toFixed(1)}
              </span>
              <span>·</span>
              <span>{property.defaultCleaner?.jobs} jobs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {property.flagged && property.nextTurnover && (
            <StatusPill
              tone={property.nextTurnover.tone}
              label={property.nextTurnover.status}
            />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-warm-800 hover:text-coral-400 transition-colors duration-150"
          >
            Open
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
