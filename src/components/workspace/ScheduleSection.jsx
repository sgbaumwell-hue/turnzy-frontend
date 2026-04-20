import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SettingsCard } from './SettingsCard';

// Two time inputs framed as a "turnover window": guest checkout → next
// guest check-in, with a small TURNOVER eyebrow-pill between them to
// reinforce the concept. Saves on blur.
export function ScheduleSection({ property, onSave }) {
  const origCo = property.default_checkout_time || '11:00';
  const origCi = property.default_checkin_time || '15:00';
  const [co, setCo] = useState(origCo);
  const [ci, setCi] = useState(origCi);

  // Reset local state whenever the underlying property changes.
  useEffect(() => {
    setCo(property.default_checkout_time || '11:00');
    setCi(property.default_checkin_time || '15:00');
  }, [property.id, property.default_checkout_time, property.default_checkin_time]);

  function commit(nextCo, nextCi) {
    if (nextCo === origCo && nextCi === origCi) return;
    onSave?.(nextCo, nextCi);
  }

  // Warn when the cleaning window is zero or negative minutes.
  function toMinutes(t) {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
  const warn = (() => {
    const a = toMinutes(co);
    const b = toMinutes(ci);
    if (a == null || b == null) return false;
    return b - a <= 0;
  })();

  return (
    <SettingsCard
      eyebrow="Turnover window"
      title="Default times"
      description="When guests check out, and when the next guests arrive. Per-booking overrides stay per-booking."
    >
      <div className="flex items-stretch gap-3">
        <TimeField
          label="Guest checkout"
          value={co}
          onChange={setCo}
          onBlur={() => commit(co, ci)}
        />
        <div className="flex items-center px-1 pt-6">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1EFE8] text-[10px] font-bold uppercase tracking-[0.3px] text-[#5F5E5A]">
            <ArrowRight size={10} />
            Turnover
          </span>
        </div>
        <TimeField
          label="Next check-in"
          value={ci}
          onChange={setCi}
          onBlur={() => commit(co, ci)}
        />
      </div>
      {warn && (
        <p className="mt-3 text-[12px] text-[#854F0B]">
          The cleaning window between checkout and check-in is zero or negative — double-check your times.
        </p>
      )}
    </SettingsCard>
  );
}

function TimeField({ label, value, onChange, onBlur }) {
  return (
    <label className="flex-1 flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-[38px] px-3 rounded-lg border border-[#D3D1C7] bg-white text-[14px] text-[#1C1C1A] focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20"
      />
    </label>
  );
}
