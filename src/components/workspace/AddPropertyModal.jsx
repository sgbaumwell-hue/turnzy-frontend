import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/shadcn/input';
import { Modal } from './Modal';
import { PLATFORMS } from './tokens';

// Compact Add Property modal — just name + platform. The new property is
// created with defaults; the host continues in the detail pane to paste a
// calendar URL and assign a cleaner.
export function AddPropertyModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Airbnb');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onCreate({ name: trimmed, platform });
      setName('');
      setPlatform('Airbnb');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} width={460}>
      <h2 className="font-serif text-[24px] font-bold leading-tight text-[#1C1C1A] tracking-[-0.3px]">
        Add a property
      </h2>
      <p className="mt-1 text-[13px] text-[#5F5E5A]">
        Start with a name and platform. You&apos;ll paste the calendar URL next.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
            Name
          </span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Larkin's Way"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
            Platform
          </span>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="h-[38px] px-3 pr-9 rounded-lg border border-[#D3D1C7] bg-white text-[14px] text-[#1C1C1A] appearance-none bg-no-repeat bg-[right_12px_center] cursor-pointer focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888780' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
            }}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleCreate}
          loading={saving}
          disabled={!name.trim()}
        >
          Add property
        </Button>
      </div>
    </Modal>
  );
}
