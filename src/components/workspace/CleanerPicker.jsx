import { useMemo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { buildCleanerList } from './tokens';
import { Modal } from './Modal';

// Picker used when assigning (or replacing) a cleaner on a property. Lists
// the existing cleaners across the workspace so the host can reuse someone
// they've already invited. "Invite new cleaner" routes to the full
// Add Cleaner flow on the Cleaners page.
export function CleanerPicker({ open, onClose, properties, excludeKeys = [], onPick, onInviteNew }) {
  const cleaners = useMemo(() => {
    const list = buildCleanerList(properties);
    return list
      .filter((c) => !excludeKeys.includes(c.key))
      .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
  }, [properties, excludeKeys]);

  return (
    <Modal open={open} onClose={onClose} width={440}>
      <h2 className="font-serif text-[22px] font-bold leading-tight text-[#1C1C1A]">
        Pick a cleaner
      </h2>
      <p className="mt-1 text-[13px] text-[#5F5E5A]">
        Choose someone you&apos;ve invited before, or invite someone new.
      </p>

      <div className="mt-4 max-h-[320px] overflow-y-auto -mx-2 px-2">
        {cleaners.length === 0 ? (
          <div className="rounded-[10px] border border-[#EDEAE0] bg-[#F9F8F6] px-4 py-6 text-center text-[13px] text-[#888780]">
            No other cleaners in your workspace yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {cleaners.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => onPick(c)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-left hover:bg-[#F1EFE8] transition-colors duration-150"
                >
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#1C1C1A] truncate">
                      {c.name || c.email}
                    </div>
                    {c.email && (
                      <div className="text-[11px] text-[#888780] truncate">{c.email}</div>
                    )}
                  </div>
                  <span className="text-[11px] text-[#888780]">
                    {c.properties.length} {c.properties.length === 1 ? 'property' : 'properties'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {onInviteNew && (
        <div className="mt-4 pt-4 border-t border-[#EDEAE0]">
          <button
            type="button"
            onClick={onInviteNew}
            className="w-full inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-[#F1EFE8] text-[13px] font-semibold text-[#1C1C1A] hover:bg-[#E3E0D2] transition-colors"
          >
            Invite someone new →
          </button>
        </div>
      )}
    </Modal>
  );
}
