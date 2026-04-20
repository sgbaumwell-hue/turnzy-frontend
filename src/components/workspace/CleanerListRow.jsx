import clsx from 'clsx';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { propColor } from './tokens';

// Row used in the Cleaners list pane. Structure:
//   [avatar] [name / property-dot cluster] [status pill]
export function CleanerListRow({ cleaner, propertyIndex, active, onClick }) {
  const isActive = cleaner.userId && cleaner.confirmed;
  const propCount = cleaner.properties.length;

  // Cap the visible dot cluster at 4; overflow shows "+N".
  const visible = cleaner.properties.slice(0, 4);
  const overflow = Math.max(0, propCount - visible.length);

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors duration-100',
        active
          ? 'bg-white shadow-[inset_0_0_0_1px_#EDEAE0,0_1px_0_rgba(0,0,0,0.02)]'
          : 'hover:bg-[#F1EFE8]',
      )}
    >
      <Avatar name={cleaner.name || cleaner.email} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-bold text-[#1C1C1A] truncate">
          {cleaner.name || cleaner.email}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[#888780]">
          <span className="truncate">
            {propCount} {propCount === 1 ? 'property' : 'properties'}
          </span>
          {propCount > 0 && <span className="text-[#B8B7B0]">·</span>}
          <span className="inline-flex items-center gap-0.5 flex-shrink-0">
            {visible.map((p, i) => {
              const color = propColor(propertyIndex(p.id));
              if (p.role === 'backup') {
                return (
                  <span
                    key={`${p.id}-${i}`}
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full"
                    style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }}
                  />
                );
              }
              return (
                <span
                  key={`${p.id}-${i}`}
                  aria-hidden="true"
                  className="w-2 h-2 rounded-full"
                  style={{ background: color }}
                />
              );
            })}
            {overflow > 0 && (
              <span className="ml-1 text-[11px] text-[#888780]">+{overflow}</span>
            )}
          </span>
        </div>
      </div>
      <Pill size="sm" tone={isActive ? 'confirmed' : 'pending'}>
        {isActive ? 'Active' : 'Invited'}
      </Pill>
    </button>
  );
}
