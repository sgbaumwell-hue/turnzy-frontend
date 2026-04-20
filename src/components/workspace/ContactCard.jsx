import { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/shadcn/input';
import { SettingsCard } from './SettingsCard';

// Contact card on the Cleaner detail page. Name is inline-editable per the
// design call; email is read-only (changing it would invalidate the invite).
export function ContactCard({ cleaner, onRenameAllProperties, saving }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cleaner.name || '');

  useEffect(() => {
    setName(cleaner.name || '');
    setEditing(false);
  }, [cleaner.key]);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === cleaner.name) {
      setEditing(false);
      setName(cleaner.name || '');
      return;
    }
    await onRenameAllProperties(trimmed);
    setEditing(false);
  }

  return (
    <SettingsCard eyebrow="Contact" title="Name & email">
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
            Name
          </div>
          {editing ? (
            <div className="mt-1 flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') { setEditing(false); setName(cleaner.name || ''); }
                }}
                className="flex-1"
              />
              <Button size="sm" onClick={submit} loading={saving} icon={<Check size={13} />}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(cleaner.name || ''); }}>
                <X size={13} />
              </Button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[14px] font-semibold text-[#1C1C1A]">
                {cleaner.name || <span className="italic text-[#888780]">No name</span>}
              </span>
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Edit name"
                className="p-1 rounded text-[#888780] hover:text-[#1C1C1A] transition-colors"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
            Email
          </div>
          <div className="mt-1 text-[14px] text-[#1C1C1A]">{cleaner.email || '—'}</div>
          <div className="mt-0.5 text-[11px] text-[#888780]">
            Can&apos;t be changed after invite
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
