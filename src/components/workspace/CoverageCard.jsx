import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { SettingsCard } from './SettingsCard';
import { InlineConfirm } from './InlineConfirm';
import { propColor } from './tokens';

// Coverage card on the Cleaner detail page — lists every property the
// cleaner covers, role per property, and lets the host remove or add
// assignments inline.
export function CoverageCard({
  cleaner,
  allProperties,
  onRemove,
  onAdd,
  saving,
}) {
  const [confirmPropId, setConfirmPropId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const coveredIds = new Set(cleaner.properties.map((p) => p.id));
  const uncovered = useMemo(
    () =>
      allProperties
        .filter((p) => !coveredIds.has(p.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allProperties, coveredIds],
  );

  function indexOf(id) {
    return allProperties.findIndex((p) => p.id === id);
  }

  return (
    <SettingsCard
      eyebrow="Coverage"
      title="Properties covered"
      description="This cleaner is either primary or backup on each of these properties."
      actions={
        !showPicker && (
          <Button
            variant="outline"
            size="sm"
            icon={<Plus size={12} />}
            onClick={() => setShowPicker(true)}
          >
            Add property
          </Button>
        )
      }
    >
      {cleaner.properties.length === 0 && !showPicker && (
        <div className="rounded-[10px] border border-[#F7E2B0] bg-[#FDF6E7] px-3 py-2 text-[13px] text-[#854F0B]">
          Not assigned to any property yet.
        </div>
      )}

      <ul className="flex flex-col divide-y divide-[#EDEAE0]">
        {cleaner.properties.map((p) => {
          const color = propColor(indexOf(p.id));
          return (
            <li key={`${p.id}-${p.role}`} className="py-2.5">
              {confirmPropId === p.id ? (
                <InlineConfirm
                  message={
                    <>
                      Remove {cleaner.name || cleaner.email} from{' '}
                      <strong className="font-semibold text-[#1C1C1A]">{p.name}</strong>?
                    </>
                  }
                  confirmLabel="Remove"
                  onCancel={() => setConfirmPropId(null)}
                  onConfirm={async () => {
                    await onRemove(p.id, p.role);
                    setConfirmPropId(null);
                  }}
                  loading={saving === `remove-${p.id}`}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 rounded-full"
                    style={{ width: 4, height: 24, background: color }}
                  />
                  <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-[#1C1C1A] truncate">
                    {p.name}
                  </span>
                  <Pill size="sm" tone={p.role === 'primary' ? 'coral' : 'neutral'}>
                    {p.role}
                  </Pill>
                  <button
                    type="button"
                    onClick={() => setConfirmPropId(p.id)}
                    aria-label={`Remove from ${p.name}`}
                    className="p-1.5 rounded-lg text-[#888780] hover:bg-[#FCEBEB] hover:text-[#A32D2D] transition-colors duration-150"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {showPicker && (
        <div className="mt-3 rounded-[10px] border border-[#EDEAE0] bg-[#F9F8F6] p-2">
          {uncovered.length === 0 ? (
            <div className="px-3 py-4 text-[13px] text-[#888780] text-center">
              All properties are already covered.
            </div>
          ) : (
            <ul className="flex flex-col">
              {uncovered.map((p) => {
                const color = propColor(indexOf(p.id));
                const hasPrimary = !!(p.cleaner_name || p.cleaner_email);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={async () => {
                        await onAdd(p.id, hasPrimary ? 'backup' : 'primary');
                        setShowPicker(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-left hover:bg-white transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 rounded-full"
                        style={{ width: 4, height: 20, background: color }}
                      />
                      <span className="flex-1 min-w-0 text-[13px] font-semibold text-[#1C1C1A] truncate">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-[#888780]">
                        {hasPrimary ? 'add as backup' : 'add as primary'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-2 pt-2 border-t border-[#EDEAE0] flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => setShowPicker(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
