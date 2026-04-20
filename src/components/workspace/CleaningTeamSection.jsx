import { useState } from 'react';
import { MoreHorizontal, ArrowUpRight, UserPlus } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { SettingsCard } from './SettingsCard';
import { InlineConfirm } from './InlineConfirm';

// Cleaning team section for a single property. Two slots:
//   - Primary: whoever takes this turnover by default.
//   - Backup:  gets it if primary declines.
// Between the slots, a small promote button when a backup exists — swaps
// roles (or promotes if primary is empty).
export function CleaningTeamSection({
  property,
  onAssignPrimary,
  onAssignBackup,
  onRemove,
  onPromote,
  saving,
}) {
  const hasPrimary = !!(property.cleaner_name || property.cleaner_email);
  const hasBackup = !!(property.backup_cleaner_name || property.backup_cleaner_email);
  const [confirm, setConfirm] = useState(null); // 'primary' | 'backup' | null

  return (
    <SettingsCard
      eyebrow="Cleaning team"
      title="Who covers this property"
      description="We offer the turnover to the primary cleaner first. If they decline, the backup gets it automatically."
    >
      <div className="flex flex-col gap-3">
        <CleanerSlot
          role="primary"
          property={property}
          onAssign={onAssignPrimary}
          onRequestRemove={() => setConfirm('primary')}
        />
        {hasBackup && (
          <button
            type="button"
            onClick={onPromote}
            className="self-start inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.5px] text-[#993C1D] hover:text-[#D85A30] transition-colors duration-150"
          >
            <ArrowUpRight size={12} />
            Promote backup to primary
          </button>
        )}
        <CleanerSlot
          role="backup"
          property={property}
          onAssign={onAssignBackup}
          onRequestRemove={() => setConfirm('backup')}
          disabled={!hasPrimary}
        />
        {confirm && (
          <InlineConfirm
            message={`Remove the ${confirm} cleaner from ${property.name}?`}
            confirmLabel="Remove"
            onCancel={() => setConfirm(null)}
            onConfirm={async () => {
              await onRemove(confirm);
              setConfirm(null);
            }}
            loading={saving === `remove-${confirm}`}
          />
        )}
      </div>
    </SettingsCard>
  );
}

function CleanerSlot({ role, property, onAssign, onRequestRemove, disabled = false }) {
  const name = role === 'primary' ? property.cleaner_name : property.backup_cleaner_name;
  const email = role === 'primary' ? property.cleaner_email : property.backup_cleaner_email;
  const userId = role === 'primary' ? property.cleaner_user_id : property.backup_cleaner_user_id;
  const confirmed = role === 'primary' ? property.cleaner_confirmed : !!userId;
  const filled = !!(name || email);

  const label = role === 'primary' ? 'Primary cleaner' : 'Backup cleaner';

  if (!filled) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onAssign}
        className="w-full text-left rounded-[12px] border border-dashed border-[#D3D1C7] px-4 py-3.5 flex items-center gap-3 text-[13px] text-[#5F5E5A] hover:border-coral-400 hover:bg-coral-50/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <span className="w-8 h-8 rounded-full bg-[#F1EFE8] flex items-center justify-center text-[#888780] flex-shrink-0">
          <UserPlus size={14} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
            {label}
          </div>
          <div className="mt-0.5 font-semibold text-[#1C1C1A]">
            {disabled && role === 'backup'
              ? 'Assign a primary cleaner first'
              : `+ Assign ${role === 'primary' ? 'primary' : 'backup'}`}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-[12px] border border-[#EDEAE0] bg-white px-4 py-3 flex items-center gap-3">
      <Avatar name={name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
          {label}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-semibold text-[#1C1C1A] truncate">{name || email}</span>
          <Pill size="sm" tone={confirmed ? 'confirmed' : 'pending'}>
            {confirmed ? 'Active' : 'Invite sent'}
          </Pill>
        </div>
        {email && (
          <div className="mt-0.5 text-[12px] text-[#888780] truncate">{email}</div>
        )}
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Cleaner actions"
            className="p-1.5 rounded-lg text-warm-400 hover:bg-warm-100 hover:text-warm-600 transition-colors duration-150"
          >
            <MoreHorizontal size={16} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-[180px] rounded-lg border border-[#EDEAE0] bg-white p-1 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.18)]"
          >
            <DropdownMenu.Item
              onSelect={onAssign}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#1C1C1A] outline-none data-[highlighted]:bg-[#F1EFE8]"
            >
              Replace {role}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-[#EDEAE0]" />
            <DropdownMenu.Item
              onSelect={onRequestRemove}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#A32D2D] outline-none data-[highlighted]:bg-[#FCEBEB]"
            >
              Remove {role}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
