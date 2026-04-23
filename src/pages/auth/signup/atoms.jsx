import { useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Logo({ size = 32, wordmark = true, dark = false, className = '' }) {
  const iconSize = size * 0.58;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex-shrink-0 inline-flex items-center justify-center"
        style={{
          width: size, height: size, borderRadius: size * 0.28,
          background: 'linear-gradient(140deg, #F07447 0%, #E85F34 45%, #C8481F 100%)',
          boxShadow: dark
            ? 'inset 0 1.5px 0 rgba(255,255,255,.3), inset 0 -1.5px 0 rgba(0,0,0,.1), 0 4px 10px rgba(0,0,0,.4)'
            : 'inset 0 1.5px 0 rgba(255,255,255,.3), inset 0 -1.5px 0 rgba(0,0,0,.1), 0 4px 10px rgba(168, 66, 30, .22)',
        }}>
        {!dark && <div className="absolute pointer-events-none" style={{ inset: 2, borderRadius: size * 0.28 - 2, background: 'linear-gradient(180deg, rgba(255,255,255,.22), transparent 50%)' }} />}
        <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none" className="relative z-10">
          <path d="M16 3.5L26.5 9.5V21.5L16 28L5.5 21.5V9.5L16 3.5Z" stroke="white" strokeOpacity="0.38" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
          <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="16" r="2.2" fill="white"/>
        </svg>
      </div>
      {wordmark && (
        <span className="font-black leading-none" style={{ fontSize: size * 0.75, letterSpacing: '-0.035em', color: dark ? '#fff' : '#1A1815' }}>
          {dark
            ? 'Turnzy'
            : <>Turn<span style={{ background: 'linear-gradient(140deg, #F07447, #C8481F)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zy</span></>
          }
        </span>
      )}
    </div>
  );
}

export function LogoOnDark({ size = 32 }) {
  return <Logo size={size} dark />;
}

export function Eyebrow({ children, className = '', style }) {
  return <div className={`text-[10.5px] font-bold text-[#9C9481] uppercase tracking-[0.14em] ${className}`} style={style}>{children}</div>;
}

export function FieldLabel({ children, hint, className = '' }) {
  return (
    <div className={`flex items-end justify-between mb-1.5 ${className}`}>
      <div className="text-[10.5px] font-bold text-[#9C9481] uppercase tracking-[0.14em]">{children}</div>
      {hint && <div className="text-[11px] text-[#9C9481]">{hint}</div>}
    </div>
  );
}

export function Input({ className = '', invalid, ...props }) {
  return (
    <input {...props}
      className={`flex h-11 w-full rounded-[10px] border bg-white px-3.5 py-2 text-[14px] text-[#1F1D1A] placeholder:text-[#B4AD9A] transition-all duration-150 focus:outline-none focus:ring-4
        ${invalid
          ? 'border-[#C84437] focus:border-[#C84437] focus:ring-[#C84437]/10'
          : 'border-[#E4DFD3] focus:border-[#E85F34] focus:ring-[#E85F34]/10'
        } ${className}`} />
  );
}

export function Divider({ className = '', label }) {
  if (label) return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-[#E4DFD3]" />
      <Eyebrow>{label}</Eyebrow>
      <div className="flex-1 h-px bg-[#E4DFD3]" />
    </div>
  );
  return <div className={`h-px bg-[#E4DFD3] ${className}`} />;
}

export function GoogleButton({ label = 'Continue with Google', href, onClick }) {
  const classes = 'w-full h-11 inline-flex items-center justify-center gap-3 rounded-[10px] border border-[#E4DFD3] bg-white text-[#1F1D1A] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150 active:scale-[0.99]';
  const body = (<>
    <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
    {label}
  </>);
  if (href) return <a href={href} className={classes}>{body}</a>;
  return <button type="button" onClick={onClick} className={classes}>{body}</button>;
}

export function PrimaryButton({ children, loading, disabled, type = 'button', onClick, className = '', accent = '#E85F34', accentHover = '#D4522A' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`w-full h-12 inline-flex items-center justify-center gap-2 rounded-[12px] text-white text-[15px] font-semibold active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      style={{ background: accent }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.background = accentHover; }}
      onMouseLeave={(e) => { if (!disabled && !loading) e.currentTarget.style.background = accent; }}>
      {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
      {children}
    </button>
  );
}

export function StepPips({ current, total, accent = '#E85F34', accentDark = '#C8481F' }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 32 : 6,
            background: i === current ? accent : i < current ? accentDark : '#E4DFD3',
          }} />
      ))}
    </div>
  );
}

export function PasswordField({ value, onChange, showStrength = true, autoFocus, placeholder = 'At least 8 characters', invalid, id }) {
  const [show, setShow] = useState(false);
  const strength = useMemo(() => {
    if (!value) return 0;
    let s = 0;
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
        <Input id={id} type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} className="pr-11" autoFocus={autoFocus} placeholder={placeholder} invalid={invalid} autoComplete="new-password" />
        <button type="button" tabIndex={-1} onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9481] hover:text-[#5F5B52] transition-colors p-1" aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {[1, 2, 3, 4].map(i => (
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

export function passwordStrength(value) {
  if (!value) return 0;
  let s = 0;
  if (value.length >= 8) s++;
  if (value.length >= 12) s++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
  if (/\d/.test(value)) s++;
  if (/[^a-zA-Z0-9]/.test(value)) s++;
  return Math.min(4, s);
}
