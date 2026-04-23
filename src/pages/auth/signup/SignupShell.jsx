import { Shield } from 'lucide-react';
import { LogoOnDark, Logo } from './atoms';
import { InviteContextCard } from './InviteContextCard';
import { getRole } from './roles';

function Headline({ role }) {
  const r = getRole(role);
  return (
    <div className="relative z-10 max-w-md" key={role}>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-5" style={{ color: r.accent }}>
        — {r.eyebrow}
      </div>
      <h1 className="font-serif text-[48px] xl:text-[58px] leading-[1.02] tracking-[-0.03em] font-black text-white">
        {r.headline[0]}<br />
        {r.headline[1]}<br />
        <span className="italic font-light" style={{ color: r.accent }}>{r.headline[2]}</span>
      </h1>
      <p className="mt-6 text-[14.5px] leading-relaxed text-white/60 max-w-sm">
        {r.tagline}
      </p>
    </div>
  );
}

function Stats({ role }) {
  const r = getRole(role);
  return (
    <div className="flex items-center gap-8 text-[12px] text-white/40">
      {r.stats.map((s, i) => (
        <div key={i} className="flex items-center gap-8">
          {i > 0 && <div className="w-px h-10 bg-white/15" />}
          <div>
            <span className="text-white font-bold text-[22px] font-serif">{s[0]}</span>
            <div className="uppercase tracking-[0.12em] mt-0.5">{s[1]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InviteBadge({ expiresAt }) {
  const days = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt) - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  return (
    <div className="flex items-center gap-2 text-[11px] text-white/40 uppercase tracking-[0.12em]">
      <Shield size={14} />
      Secured by invite{days != null && <> · Expires in {days} {days === 1 ? 'day' : 'days'}</>}
    </div>
  );
}

/**
 * SignupShell — split layout used by every /signup and /invite screen.
 * Desktop: left dark panel (role-tinted) + right form column + pinned footer.
 * Mobile: dark hero strip on top (~140-180px) + form below + footer.
 */
export function SignupShell({ role = 'host', invite = null, children }) {
  const r = getRole(role);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[#FBF8F1]">

      {/* DESKTOP LEFT PANEL */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 overflow-hidden text-white transition-colors duration-500"
        style={{ background: r.panelBg }}>
        <div className="absolute inset-0 opacity-[0.09] transition-opacity duration-500" style={{ backgroundImage: r.panelTint }} />
        <svg className="absolute -right-20 -bottom-24 opacity-[0.07]" width="520" height="520" viewBox="0 0 100 100" fill="none">
          <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" stroke="white" strokeWidth="0.4" />
          <path d="M50 15L82 33V67L50 85L18 67V33L50 15Z" stroke="white" strokeWidth="0.4" />
          <path d="M50 25L74 38.5V61.5L50 75L26 61.5V38.5L50 25Z" stroke="white" strokeWidth="0.4" />
        </svg>

        {/* Top row: logo + sign-in link */}
        <div className="relative z-10 flex items-center justify-between">
          <LogoOnDark size={34} />
          <a href="/login" className="text-[12.5px] text-white/50 hover:text-white font-medium transition-colors">
            Already have an account? <span className="text-white underline decoration-white/40 underline-offset-4">Sign in</span>
          </a>
        </div>

        {/* Middle: headline or invite context */}
        {invite ? <InviteContextCard role={role} invite={invite} /> : <Headline role={role} />}

        {/* Bottom: stats or invite-secure line */}
        <div className="relative z-10">
          {invite ? <InviteBadge expiresAt={invite.expires_at || invite.expiresAt} /> : <Stats role={role} />}
        </div>
      </div>

      {/* MOBILE HERO STRIP */}
      <div className="relative lg:hidden overflow-hidden text-white" style={{ background: r.panelBg }}>
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: r.panelTint }} />
        <div className="relative z-10 px-5 pt-6 pb-6">
          <div className="flex items-center justify-between mb-5">
            <LogoOnDark size={28} />
            <a href="/login" className="text-[11.5px] text-white/60 hover:text-white font-medium transition-colors">Sign in</a>
          </div>

          {invite ? (
            <>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: r.accent }}>
                — You were invited
              </div>
              <div className="font-serif text-[26px] leading-[1.05] tracking-[-0.02em] font-black">
                <span className="italic font-light" style={{ color: r.accent }}>{invite.inviter?.name?.split(' ')[0] || 'Someone'}</span> wants you on {invite.workspace?.name || 'the team'}.
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-semibold text-white"
                style={{ background: `${r.accent}22`, boxShadow: `inset 0 0 0 1px ${r.accent}55` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.accent }} />
                {invite.role_label || invite.roleLabel || r.label}
                {invite.property_ids?.length > 0 && <span className="text-white/60 font-normal">· {invite.property_ids.length} props</span>}
              </div>
            </>
          ) : (
            <>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: r.accent }}>
                — {r.eyebrow}
              </div>
              <div className="font-serif text-[28px] leading-[1.02] tracking-[-0.025em] font-black">
                {r.headline[0]} {r.headline[1]}{' '}
                <span className="italic font-light" style={{ color: r.accent }}>{r.headline[2]}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: FORM COLUMN */}
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px]">
            <div className="lg:hidden mb-6">
              <Logo size={30} />
            </div>
            {children}
          </div>
        </div>
        <footer className="border-t border-[#EDE7D7] px-6 lg:px-12 py-4 flex flex-wrap items-center justify-center lg:justify-between gap-3 text-[11.5px] text-[#9C9481]">
          <div>© Turnzy {new Date().getFullYear()}</div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-[#5F5B52] transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-[#5F5B52] transition-colors">Terms</a>
            <a href="mailto:help@turnzy.com" className="hover:text-[#5F5B52] transition-colors">Help</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
