import clsx from 'clsx';

// Tri-state segmented control used in the Add-Cleaner matrix.
// Values: 'none' | 'backup' | 'primary'. Visual emphasis ramps up with
// seniority of the role.
const OPTIONS = [
  { value: 'none',    label: 'None' },
  { value: 'backup',  label: 'Backup' },
  { value: 'primary', label: 'Primary' },
];

export function RoleSegmented({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      className="inline-flex items-center p-0.5 rounded-[8px] bg-[#F1EFE8]"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        const isPrimary = active && opt.value === 'primary';
        const isBackup = active && opt.value === 'backup';
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'h-7 px-3 rounded-[6px] text-[12px] font-bold uppercase tracking-[0.4px] transition-colors duration-100',
              !active && 'text-[#5F5E5A] hover:text-[#1C1C1A]',
              isPrimary && 'bg-coral-400 text-white shadow-sm',
              isBackup && 'bg-white text-[#1C1C1A] shadow-sm',
              active && opt.value === 'none' && 'bg-white text-[#1C1C1A] shadow-sm',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
