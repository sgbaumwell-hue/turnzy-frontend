import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Modal } from './Modal';

// Shown when the host is about to reassign Primary on one or more properties
// that already have a primary cleaner. Per affected row, lets them choose
// what happens to the current primary: demote to backup (if free) or remove.
//
// Props:
//   conflicts: [{ propertyId, propertyName, currentPrimary: {name, email}, backupFull }]
//   onConfirm(decisions: {[propertyId]: 'demote' | 'remove'}): Promise
export function ReplaceConfirmModal({ open, conflicts, onClose, onConfirm, loading }) {
  const [decisions, setDecisions] = useState({});

  useEffect(() => {
    if (!open) return;
    // Default decision per row: 'demote' unless backup is full (forced 'remove')
    const next = {};
    for (const c of conflicts) next[c.propertyId] = c.backupFull ? 'remove' : 'demote';
    setDecisions(next);
  }, [open, conflicts]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <h2 className="font-serif text-[22px] font-bold leading-tight text-[#1C1C1A] tracking-[-0.3px]">
        Confirm primary replacements
      </h2>
      <p className="mt-1 text-[13px] text-[#5F5E5A]">
        {conflicts.length === 1
          ? 'This property already has a primary cleaner. Choose what happens to them.'
          : `${conflicts.length} properties already have a primary cleaner. Choose what happens to each.`}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {conflicts.map((c) => (
          <div
            key={c.propertyId}
            className="rounded-[12px] border border-[#EDEAE0] bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-[14px] font-semibold text-[#1C1C1A] truncate">
                {c.propertyName}
              </div>
              <Pill size="sm" tone="coral">Primary will change</Pill>
            </div>
            <div className="text-[12px] text-[#888780] mb-3">
              Current primary: <span className="font-semibold text-[#1C1C1A]">{c.currentPrimary.name || c.currentPrimary.email}</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className={`flex items-start gap-2 p-2 rounded-[8px] cursor-pointer ${c.backupFull ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F9F8F6]'}`}>
                <input
                  type="radio"
                  name={`decision-${c.propertyId}`}
                  checked={decisions[c.propertyId] === 'demote'}
                  disabled={c.backupFull}
                  onChange={() => setDecisions((d) => ({ ...d, [c.propertyId]: 'demote' }))}
                  className="mt-1 accent-coral-400"
                />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#1C1C1A]">Demote to backup</div>
                  <div className="text-[12px] text-[#888780]">
                    {c.backupFull
                      ? 'Backup slot is full — can\'t demote.'
                      : 'They stay on the property as the backup cleaner.'}
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-2 p-2 rounded-[8px] cursor-pointer hover:bg-[#F9F8F6]">
                <input
                  type="radio"
                  name={`decision-${c.propertyId}`}
                  checked={decisions[c.propertyId] === 'remove'}
                  onChange={() => setDecisions((d) => ({ ...d, [c.propertyId]: 'remove' }))}
                  className="mt-1 accent-coral-400"
                />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#1C1C1A]">Remove from property</div>
                  <div className="text-[12px] text-[#888780]">
                    They lose coverage on this property entirely.
                  </div>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" size="md" onClick={onClose}>
          Back
        </Button>
        <Button
          variant="primary"
          size="md"
          loading={loading}
          onClick={() => onConfirm(decisions)}
        >
          Confirm &amp; send invite
        </Button>
      </div>
    </Modal>
  );
}
