import { useState } from 'react';
import { Copy, Check, Link2, MoreHorizontal } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/shadcn/input';
import { SettingsCard } from './SettingsCard';

// Calendar connection section. Two main branches:
//   - connected: monospace URL chip + copy + Replace URL + More (Disconnect)
//   - disconnected: amber warning inline + "Connect calendar" → URL input
//
// "Replace URL" expands the same URL input inline (mirrors the prototype).
// Disconnect is hidden behind the More menu to avoid accidental clicks.
export function CalendarSection({ property, onSave, onDisconnect, saving }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(property.ical_url || '');
  const [copied, setCopied] = useState(false);

  const isConnected = !!property.ical_url;

  function handleCopy() {
    try {
      navigator.clipboard.writeText(property.ical_url || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function handleSave() {
    const value = url.trim();
    if (!value) return;
    await onSave(value);
    setEditing(false);
  }

  function startEdit() {
    setUrl(property.ical_url || '');
    setEditing(true);
  }

  return (
    <SettingsCard
      eyebrow="Calendar feed"
      title="Where bookings come from"
      description="Paste the iCal URL from Airbnb, VRBO, or any platform that exports one."
      actions={
        isConnected && !editing ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="Calendar actions"
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
                  onSelect={onDisconnect}
                  className="cursor-pointer rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[#A32D2D] outline-none data-[highlighted]:bg-[#FCEBEB]"
                >
                  Disconnect calendar
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : null
      }
    >
      {editing ? (
        <div className="flex flex-col gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/…"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} loading={saving}>
              {isConnected ? 'Save URL' : 'Connect'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : isConnected ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#EDEAE0] bg-[#F9F8F6] px-3 py-2">
            <Link2 size={13} className="text-[#888780] flex-shrink-0" />
            <span className="flex-1 min-w-0 truncate font-mono text-[12px] text-[#5F5E5A]">
              {property.ical_url}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy URL"
              className="p-1 rounded text-warm-400 hover:text-warm-600 transition-colors"
            >
              {copied ? (
                <Check size={13} className="text-[#639922]" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
          <div>
            <Button size="sm" variant="outline" onClick={startEdit}>
              Replace URL
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-[10px] border border-[#F7E2B0] bg-[#FDF6E7] px-3 py-2.5 text-[13px] text-[#854F0B]">
            No calendar connected. Bookings won&apos;t auto-populate.
          </div>
          <div>
            <Button size="sm" onClick={startEdit}>
              Connect calendar
            </Button>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
