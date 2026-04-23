// Turnzy Signup — atoms. Borrowed from ui_kits/turnzy-app/atoms.jsx, extended.

function Logo({ size = 32, wordmark = true, className = '' }) {
  const iconSize = size * 0.58;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex-shrink-0 inline-flex items-center justify-center"
        style={{
          width: size, height: size,
          borderRadius: size * 0.28,
          background: 'linear-gradient(140deg, #F07447 0%, #E85F34 45%, #C8481F 100%)',
          boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.3), inset 0 -1.5px 0 rgba(0,0,0,.1), 0 4px 10px rgba(168, 66, 30, .22), 0 1px 2px rgba(168, 66, 30, .15)'
        }}>
        <div className="absolute pointer-events-none" style={{ inset: 2, borderRadius: size * 0.28 - 2, background: 'linear-gradient(180deg, rgba(255,255,255,.22), transparent 50%)' }} />
        <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none" className="relative z-10">
          <path d="M16 3.5L26.5 9.5V21.5L16 28L5.5 21.5V9.5L16 3.5Z" stroke="white" strokeOpacity="0.38" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
          <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="16" r="2.2" fill="white"/>
        </svg>
      </div>
      {wordmark && (
        <span className="font-black leading-none" style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: size * 0.75, letterSpacing: '-0.035em', color: '#1A1815' }}>
          Turn<span style={{ background: 'linear-gradient(140deg, #F07447, #C8481F)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zy</span>
        </span>
      )}
    </div>
  );
}

function LogoOnDark({ size = 32 }) {
  const iconSize = size * 0.58;
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex-shrink-0 inline-flex items-center justify-center"
        style={{
          width: size, height: size,
          borderRadius: size * 0.28,
          background: 'linear-gradient(140deg, #F07447 0%, #E85F34 45%, #C8481F 100%)',
          boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.3), inset 0 -1.5px 0 rgba(0,0,0,.1), 0 4px 10px rgba(0,0,0,.4)'
        }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none" className="relative z-10">
          <path d="M16 3.5L26.5 9.5V21.5L16 28L5.5 21.5V9.5L16 3.5Z" stroke="white" strokeOpacity="0.38" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
          <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="16" r="2.2" fill="white"/>
        </svg>
      </div>
      <span className="font-black leading-none" style={{ fontSize: size * 0.75, letterSpacing: '-0.035em', color: '#fff' }}>
        Turnzy
      </span>
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'lg', onClick, loading, className = '', icon, fullWidth, disabled, type = 'button' }) {
  const variants = {
    primary: 'bg-[#1F1D1A] text-white hover:bg-[#2C2A26] active:bg-black shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_2px_4px_rgba(0,0,0,0.10)]',
    coral: 'bg-[#E85F34] text-white hover:bg-[#D4522A] shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_2px_6px_rgba(168,66,30,0.28)]',
    outline: 'bg-white border border-[#E4DFD3] text-[#2C2A26] hover:bg-[#FBF8F1] hover:border-[#CFC8B6]',
    ghost: 'text-[#5F5B52] hover:bg-[#EDE7D7]',
    danger: 'bg-white border border-[#E8C5C1] text-[#9A2F2A] hover:bg-[#FBEDEA]',
  };
  const sizes = {
    sm: 'text-[13px] h-8 px-3 rounded-[8px]',
    md: 'text-[14px] h-10 px-4 rounded-[10px]',
    lg: 'text-[15px] h-12 px-6 rounded-[12px] font-semibold',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85F34] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1] disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
      {!loading && icon}
      {children}
    </button>
  );
}

function Eyebrow({ children, className = '' }) {
  return <div className={`text-[10.5px] font-bold text-[#9C9481] uppercase tracking-[0.14em] ${className}`}>{children}</div>;
}

function FieldLabel({ children, hint, className = '' }) {
  return (
    <div className={`flex items-end justify-between mb-1.5 ${className}`}>
      <div className="text-[10.5px] font-bold text-[#9C9481] uppercase tracking-[0.14em]">{children}</div>
      {hint && <div className="text-[11px] text-[#9C9481]">{hint}</div>}
    </div>
  );
}

function Input({ className = '', invalid, ...props }) {
  return (
    <input {...props}
      className={`flex h-11 w-full rounded-[10px] border bg-white px-3.5 py-2 text-[14px] text-[#1F1D1A] placeholder:text-[#B4AD9A] transition-all duration-150 focus:outline-none focus:ring-4
        ${invalid
          ? 'border-[#C84437] focus:border-[#C84437] focus:ring-[#C84437]/12'
          : 'border-[#E4DFD3] focus:border-[#E85F34] focus:ring-[#E85F34]/12'
        } ${className}`} />
  );
}

function Divider({ className = '', label }) {
  if (label) return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-[#E4DFD3]" />
      <Eyebrow>{label}</Eyebrow>
      <div className="flex-1 h-px bg-[#E4DFD3]" />
    </div>
  );
  return <div className={`h-px bg-[#E4DFD3] ${className}`} />;
}

function GoogleButton({ label = 'Continue with Google', onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-[10px] border border-[#E4DFD3] bg-white text-[#1F1D1A] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150 active:scale-[0.99]">
      <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      {label}
    </button>
  );
}

// Stepper pips — shows progress through a flow
function StepPips({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300
          ${i === current ? 'w-8 bg-[#E85F34]' : i < current ? 'w-1.5 bg-[#C8481F]' : 'w-1.5 bg-[#E4DFD3]'}`} />
      ))}
    </div>
  );
}

// Eye icon
function Eye({ open, size = 16 }) {
  return open
    ? <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>;
}

// Password field w/ strength meter
function PasswordField({ value, onChange, showStrength = true, autoFocus }) {
  const [show, setShow] = React.useState(false);
  const strength = React.useMemo(() => {
    let s = 0;
    if (!value) return 0;
    if (value.length >= 8) s++;
    if (value.length >= 12) s++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
    if (/\d/.test(value)) s++;
    if (/[^a-zA-Z0-9]/.test(value)) s++;
    return Math.min(4, s);
  }, [value]);
  const labels = ['', 'Too weak', 'Weak', 'Good', 'Strong'];
  const colors = ['#E4DFD3', '#C84437', '#D8792C', '#B8991F', '#3F8F2F'];

  return (
    <div>
      <div className="relative">
        <Input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} className="pr-11" autoFocus={autoFocus} placeholder="At least 8 characters" />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9481] hover:text-[#5F5B52] transition-colors p-1">
          <Eye open={show} />
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 flex items-center gap-2 fade-in">
          <div className="flex gap-1 flex-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-200"
                style={{ background: i <= strength ? colors[strength] : '#EDE7D7' }} />
            ))}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: colors[strength] }}>
            {labels[strength]}
          </div>
        </div>
      )}
    </div>
  );
}

// Role hue tokens — used by left-panel and accents
const ROLE = {
  host: {
    key: 'host',
    label: 'Host',
    accent: '#E85F34',
    accent2: '#C8481F',
    panelBg: '#1F1D1A',
    panelTint: 'radial-gradient(circle at 20% 30%, #E85F34 0%, transparent 45%), radial-gradient(circle at 80% 70%, #E85F34 0%, transparent 40%)',
    eyebrow: 'Property owner · host',
    headline: ['One list.', 'Every turnover.', 'Handled.'],
    tagline: 'Turnzy syncs bookings from Airbnb, VRBO, and Hostaway — then quietly keeps your cleaning crew in lock-step with every check-out.',
  },
  cleaner: {
    key: 'cleaner',
    label: 'Cleaner',
    accent: '#2F7A3F',
    accent2: '#1F5428',
    panelBg: '#172318',
    panelTint: 'radial-gradient(circle at 20% 30%, #3F8F2F 0%, transparent 45%), radial-gradient(circle at 75% 70%, #E85F34 0%, transparent 35%)',
    eyebrow: 'Cleaning business · owner',
    headline: ['Your route.', 'Your rhythm.', 'One schedule.'],
    tagline: 'See every turnover across all the properties you clean — without managing seven different host texts and calendars.',
  },
  teammate: {
    key: 'teammate',
    label: 'Teammate',
    accent: '#2F6BBD',
    accent2: '#1F538E',
    panelBg: '#161E2A',
    panelTint: 'radial-gradient(circle at 20% 30%, #3A7AC2 0%, transparent 45%), radial-gradient(circle at 80% 70%, #E85F34 0%, transparent 30%)',
    eyebrow: 'Teammate · crew member',
    headline: ['Show up.', 'Clock in.', 'Done.'],
    tagline: 'Turnzy tells you what property, what time, and what the host needs — one tap to confirm, one tap to wrap.',
  },
};

Object.assign(window, {
  Logo, LogoOnDark, Button, Eyebrow, FieldLabel, Input, Divider, GoogleButton,
  StepPips, Eye, PasswordField, ROLE,
});
