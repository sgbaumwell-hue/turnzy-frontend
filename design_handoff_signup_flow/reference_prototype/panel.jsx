// Editorial left panel — role-aware. On desktop only.
// Shows: logo, big serif headline, tagline, stats OR invite context card.

function Panel({ role, invite, step, totalSteps }) {
  const r = ROLE[role] || ROLE.host;

  return (
    <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 overflow-hidden text-white transition-colors duration-500"
      style={{ background: r.panelBg }}>
      {/* soft color blooms */}
      <div className="absolute inset-0 opacity-[0.09] transition-opacity duration-500" style={{ backgroundImage: r.panelTint }} />
      {/* hexagonal pattern */}
      <svg className="absolute -right-20 -bottom-24 opacity-[0.07]" width="520" height="520" viewBox="0 0 100 100" fill="none">
        <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" stroke="white" strokeWidth="0.4"/>
        <path d="M50 15L82 33V67L50 85L18 67V33L50 15Z" stroke="white" strokeWidth="0.4"/>
        <path d="M50 25L74 38.5V61.5L50 75L26 61.5V38.5L50 25Z" stroke="white" strokeWidth="0.4"/>
      </svg>

      <div className="relative z-10 flex items-center justify-between">
        <LogoOnDark size={34} />
        <a href="#" className="text-[12.5px] text-white/50 hover:text-white font-medium">Already have an account? <span className="text-white underline decoration-white/40 underline-offset-4">Sign in</span></a>
      </div>

      {invite ? <InviteContextCard role={role} invite={invite} /> : <Headline role={role} />}

      <div className="relative z-10">
        {invite ? (
          <div className="flex items-center gap-2 text-[11px] text-white/40 uppercase tracking-[0.12em]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
            Secured by invite · Expires in 6 days
          </div>
        ) : (
          <Stats role={role} />
        )}
      </div>
    </div>
  );
}

function Headline({ role }) {
  const r = ROLE[role];
  return (
    <div className="relative z-10 max-w-md slide-in-l" key={role}>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-5" style={{ color: r.accent }}>
        — {r.eyebrow}
      </div>
      <h1 className="font-serif text-[48px] xl:text-[58px] leading-[1.02] tracking-[-0.03em] font-black">
        {r.headline[0]}<br/>
        {r.headline[1]}<br/>
        <span className="italic font-light" style={{ color: r.accent }}>{r.headline[2]}</span>
      </h1>
      <p className="mt-6 text-[14.5px] leading-relaxed text-white/60 max-w-sm">
        {r.tagline}
      </p>
    </div>
  );
}

function Stats({ role }) {
  const stats = {
    host:     [['4,812', 'Turnovers / month'], ['98.2%', 'Confirmed on time']],
    cleaner:  [['210+', 'Cleaning crews'], ['Avg 4.9★', 'On-time rating']],
    teammate: [['31k', 'Jobs completed'], ['< 2min', 'To accept a shift']],
  }[role];
  return (
    <div className="flex items-center gap-8 text-[12px] text-white/40">
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="w-px h-10 bg-white/15" />}
          <div><span className="text-white font-bold text-[22px] font-serif">{s[0]}</span><div className="uppercase tracking-[0.12em] mt-0.5">{s[1]}</div></div>
        </React.Fragment>
      ))}
    </div>
  );
}

// Shown in place of Headline when user is accepting an invite.
function InviteContextCard({ role, invite }) {
  const r = ROLE[role];
  return (
    <div className="relative z-10 max-w-md slide-in-l" key={invite.from + role}>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: r.accent }}>
        — You were invited
      </div>
      <h1 className="font-serif text-[36px] xl:text-[44px] leading-[1.05] tracking-[-0.025em] font-black">
        <span className="italic font-light" style={{ color: r.accent }}>{invite.fromFirst}</span><br/>
        wants you on<br/>
        {invite.workspace}.
      </h1>

      <div className="mt-7 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px]" style={{ background: 'linear-gradient(135deg, ' + r.accent + ', ' + r.accent2 + ')' }}>
            {invite.fromFirst.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-white">{invite.from}</div>
            <div className="text-[12px] text-white/50">{invite.fromRole}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-[10.5px] uppercase tracking-[0.14em] font-bold text-white/40 mb-2">You'll be added as</div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold" style={{ background: r.accent + '22', color: '#fff', boxShadow: 'inset 0 0 0 1px ' + r.accent + '55' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.accent }} />
              {invite.roleLabel}
            </div>
            {invite.propertyCount != null && (
              <div className="text-[12px] text-white/50">· {invite.propertyCount} {invite.propertyCount === 1 ? 'property' : 'properties'}</div>
            )}
          </div>
          {invite.properties && (
            <div className="mt-3 space-y-1.5">
              {invite.properties.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/70">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z"/></svg>
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-[13.5px] leading-relaxed text-white/55 max-w-sm">
        {r.tagline}
      </p>
    </div>
  );
}

// Mobile-only hero strip: compact version of the panel moment, above the form.
function MobileHero({ role, invite }) {
  const r = ROLE[role];
  return (
    <div className="relative lg:hidden overflow-hidden text-white" style={{ background: r.panelBg }}>
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: r.panelTint }} />
      <div className="relative z-10 px-5 pt-6 pb-7">
        <div className="flex items-center justify-between mb-5">
          <LogoOnDark size={28} />
          <a href="#" className="text-[11.5px] text-white/60 hover:text-white font-medium">Sign in</a>
        </div>

        {invite ? (
          <>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: r.accent }}>
              — You were invited
            </div>
            <div className="font-serif text-[28px] leading-[1.05] tracking-[-0.02em] font-black">
              <span className="italic font-light" style={{ color: r.accent }}>{invite.fromFirst}</span> wants you on {invite.workspace}.
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-semibold" style={{ background: r.accent + '22', color: '#fff', boxShadow: 'inset 0 0 0 1px ' + r.accent + '55' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.accent }} />
              {invite.roleLabel}
              {invite.propertyCount != null && <span className="text-white/60 font-normal">· {invite.propertyCount} props</span>}
            </div>
          </>
        ) : (
          <>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: r.accent }}>
              — {r.eyebrow}
            </div>
            <div className="font-serif text-[30px] leading-[1.02] tracking-[-0.025em] font-black">
              {r.headline[0]} {r.headline[1]}{' '}
              <span className="italic font-light" style={{ color: r.accent }}>{r.headline[2]}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Panel, MobileHero });
