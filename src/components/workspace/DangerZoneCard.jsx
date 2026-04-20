import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/shadcn/input';
import { SettingsCard } from './SettingsCard';
import { Modal } from './Modal';

// Destructive action inside a section (delete property, remove cleaner).
// Opens a type-to-confirm modal.
export function DangerZoneCard({
  title = 'Delete',
  description,
  buttonLabel = 'Delete',
  modalTitle,
  modalBody,
  typeToConfirm,
  onConfirm,
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const matches = typeToConfirm ? input.trim() === typeToConfirm : true;

  async function submit() {
    if (!matches) return;
    setLoading(true);
    try {
      await onConfirm?.();
      setOpen(false);
      setInput('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SettingsCard
        tone="danger"
        eyebrow="Danger zone"
        eyebrowTone="danger"
        title={title}
        description={description}
      >
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 size={13} />}
          onClick={() => setOpen(true)}
        >
          {buttonLabel}
        </Button>
      </SettingsCard>
      <Modal open={open} onClose={() => setOpen(false)} width={460}>
        <h2 className="font-serif text-[22px] font-bold leading-tight text-[#1C1C1A]">
          {modalTitle}
        </h2>
        {modalBody && (
          <p className="mt-2 text-[13px] leading-relaxed text-[#5F5E5A]">{modalBody}</p>
        )}
        {typeToConfirm && (
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
              Type <span className="font-mono">{typeToConfirm}</span> to confirm
            </label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={typeToConfirm}
              autoFocus
              className="mt-1.5"
            />
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="md" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={submit}
            loading={loading}
            disabled={!matches}
          >
            {buttonLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
}
