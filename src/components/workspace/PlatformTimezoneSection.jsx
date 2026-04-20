import { SettingsCard } from './SettingsCard';
import { US_TIMEZONES, PLATFORMS, formatTz } from './tokens';

// Two selects side-by-side. Each fires onSave immediately (change, not blur)
// since native selects don't really have a "blur after commit" semantic.
export function PlatformTimezoneSection({ property, onSavePlatform, onSaveTimezone }) {
  return (
    <SettingsCard
      eyebrow="Platform & timezone"
      title="Where the bookings live"
      description="Used for showing platform-specific copy and computing local times."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectField
          label="Platform"
          value={property.platform || 'Other'}
          onChange={onSavePlatform}
          options={PLATFORMS.map((p) => ({ value: p, label: p }))}
        />
        <SelectField
          label="Timezone"
          value={property.timezone || 'America/New_York'}
          onChange={onSaveTimezone}
          options={US_TIMEZONES.map((tz) => ({ value: tz, label: formatTz(tz) }))}
        />
      </div>
    </SettingsCard>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-[38px] px-3 pr-9 rounded-lg border border-[#D3D1C7] bg-white text-[14px] text-[#1C1C1A] appearance-none bg-no-repeat bg-[right_12px_center] cursor-pointer focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888780' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
