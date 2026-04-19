import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Filter, Plus, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui/Button';

const FILTERS = ['All', 'Needs attention', 'Confirmed', 'Archived'];

export const SORT_OPTIONS = [
  { value: 'a-z',             label: 'A–Z' },
  { value: 'z-a',             label: 'Z–A' },
  { value: 'most-turnovers',  label: 'Most turnovers' },
  { value: 'needs-attention', label: 'Needs attention first' },
];

function FilterTab({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-[7px] text-[12.5px] font-semibold transition-colors duration-150',
        active
          ? 'bg-warm-800 text-white'
          : 'text-warm-600 hover:bg-warm-100',
      )}
    >
      {label}
      <span
        className={clsx(
          'text-[10.5px] tabular-nums',
          active ? 'text-white/60' : 'text-warm-400',
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function PropertiesToolbar({
  filter,
  onFilterChange,
  counts,
  sortBy,
  onSortChange,
  onAddProperty,
}) {
  const currentSort =
    SORT_OPTIONS.find((s) => s.value === sortBy) ?? SORT_OPTIONS[0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Segmented filter */}
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-warm-200 rounded-[10px]">
        {FILTERS.map((label) => (
          <FilterTab
            key={label}
            active={filter === label}
            onClick={() => onFilterChange(label)}
            label={label}
            count={counts[label] ?? 0}
          />
        ))}
      </div>

      {/* Sort + CTA */}
      <div className="flex items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] border border-warm-200 bg-white text-[12.5px] font-medium text-warm-600 transition-colors duration-150 hover:border-warm-300 hover:bg-warm-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-400"
            >
              <Filter size={13} />
              Sort · {currentSort.label}
              <ChevronDown size={12} className="text-warm-400" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[200px] rounded-lg border border-warm-200 bg-white p-1 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)]"
            >
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenu.Item
                  key={opt.value}
                  onSelect={() => onSortChange(opt.value)}
                  className="flex items-center justify-between cursor-pointer rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-warm-800 outline-none data-[highlighted]:bg-warm-50"
                >
                  {opt.label}
                  {sortBy === opt.value && (
                    <Check size={13} className="text-coral-400" />
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddProperty}
          icon={<Plus size={13} />}
        >
          Add property
        </Button>
      </div>
    </div>
  );
}
