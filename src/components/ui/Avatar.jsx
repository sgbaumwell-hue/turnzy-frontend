import clsx from 'clsx';

const avatarSizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

// Deterministic hue from the name so each person gets a stable but
// distinct tint — no two call sites need to coordinate.
function hashHue(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function Avatar({ name = '', src, size = 'md', className }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  const hue = hashHue(name);
  const bg = `hsl(${hue} 45% 88%)`;
  const fg = `hsl(${hue} 40% 28%)`;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx(
          'rounded-full object-cover ring-2 ring-white flex-shrink-0',
          avatarSizes[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-bold ring-2 ring-white select-none flex-shrink-0',
        avatarSizes[size],
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
      aria-label={name}
    >
      {initials || '?'}
    </div>
  );
}
