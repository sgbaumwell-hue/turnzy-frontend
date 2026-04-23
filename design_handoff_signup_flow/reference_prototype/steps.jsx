// Turnzy Signup — individual step screens. Each exports a <Step*> component
// that takes {state, setState, next, back, invite} and returns the right-column body.

// ---------------------------------------------------------------------------
// Role picker — first screen of direct signup
// ---------------------------------------------------------------------------
function StepRolePicker({ state, setState, next }) {
  const roles = [
    {
      key: 'host',
      title: 'I own properties',
      sub: 'Short-term rental owner or property manager',
      meta: 'Airbnb · VRBO · Hostaway',
      accent: ROLE.host.accent,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z"/>
        </svg>
      ),
    },
    {
      key: 'cleaner',
      title: 'I run a cleaning business',
      sub: 'Solo cleaner or cleaning company owner',
      meta: 'Coordinate a crew · Manage jobs',
      accent: ROLE.cleaner.accent,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"/><path d="M12 3v18"/><path d="M3 9h18"/><circle cx="7" cy="6" r="1"/><circle cx="17" cy="6" r="1"/>
        </svg>
      ),
    },
    {
      key: 'teammate',
      title: "I'm joining a team",
      sub: 'You clean for a company that uses Turnzy',
      meta: 'Need a code? Ask your boss.',
      accent: ROLE.teammate.accent,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
  ];
  const selected = state.role;

  return (
    <div className="w-full max-w-[440px] fade-in">
      <div className="lg:hidden mb-6"><Logo size={30} /></div>

      <Eyebrow className="mb-3">Create an account</Eyebrow>
      <h2 className="font-serif text-[32px] lg:text-[38px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        How will you use <span className="italic font-light" style={{ color: '#E85F34' }}>Turnzy</span>?
      </h2>
      <p className="text-[14.5px] text-[#6B6454] mt-3 leading-relaxed">
        One answer — you can always change it later. This just sets up the right home screen for you.
      </p>

      <div className="mt-8 space-y-3">
        {roles.map(r => {
          const isSel = selected === r.key;
          return (
            <button key={r.key} onClick={() => setState({ ...state, role: r.key })}
              className={`w-full text-left p-4 rounded-[14px] border transition-all duration-150 group
                ${isSel ? 'bg-white shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08),0_1px_0_rgba(0,0,0,0.04)]' : 'bg-white/50 hover:bg-white border-[#E4DFD3] hover:border-[#CFC8B6]'}`}
              style={{ borderColor: isSel ? r.accent : undefined, boxShadow: isSel ? `0 0 0 2px ${r.accent}22, 0 4px 16px -6px rgba(0,0,0,.08)` : undefined }}>
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: isSel ? r.accent : '#F1EFE8', color: isSel ? '#fff' : '#6B6454' }}>
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-[15.5px] font-bold text-[#1F1D1A] tracking-[-0.01em]">{r.title}</div>
                  <div className="text-[13px] text-[#6B6454] mt-0.5">{r.sub}</div>
                  <div className="text-[11.5px] text-[#9C9481] mt-1.5 uppercase tracking-[0.06em] font-semibold">{r.meta}</div>
                </div>
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center transition-all
                  ${isSel ? '' : 'border-[#CFC8B6]'}`}
                  style={{ background: isSel ? r.accent : 'transparent', borderColor: isSel ? r.accent : undefined }}>
                  {isSel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex items-center gap-3">
        <Button variant="coral" size="lg" fullWidth disabled={!selected} onClick={next}>
          Continue →
        </Button>
      </div>

      <div className="mt-6 pt-5 border-t border-[#E4DFD3] text-center">
        <p className="text-[13px] text-[#6B6454]">Have a team code instead? <button onClick={() => setState({ ...state, role: 'teammate', teamCodeMode: true })} className="text-[#1F1D1A] font-semibold underline decoration-[#E85F34] decoration-2 underline-offset-4 hover:decoration-4">Enter code</button></p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account — name + email + password (shared across roles; invite variant pre-fills)
// ---------------------------------------------------------------------------
function StepAccount({ state, setState, next, back, invite, error }) {
  const [pw, setPw] = React.useState(state.password || '');
  const [agreed, setAgreed] = React.useState(state.agreed || false);
  const [name, setName] = React.useState(state.name || (invite?.prefillName || ''));
  const [email, setEmail] = React.useState(state.email || (invite?.email || ''));

  const r = ROLE[state.role];
  const roleLabel = invite ? invite.roleLabel : r.label;

  const valid = name.trim().length >= 2 && /@/.test(email) && pw.length >= 8 && agreed;

  function submit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    setState({ ...state, name, email, password: pw, agreed });
    next();
  }

  return (
    <div className="w-full max-w-[400px] fade-in">
      <div className="lg:hidden mb-6"><Logo size={28} /></div>

      {/* Invite banner (mobile takes panel place) */}
      {invite && (
        <div className="mb-5 p-3 rounded-[12px] border border-[#E4DFD3] bg-white flex items-start gap-3 lg:hidden">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px]" style={{ background: r.accent }}>
            {invite.fromFirst.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-[#6B6454]">Invited by <span className="font-semibold text-[#1F1D1A]">{invite.from}</span></div>
            <div className="text-[11.5px] text-[#9C9481] mt-0.5">{invite.workspace} · {roleLabel}</div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>{invite ? 'Accept invite' : 'Create account'}</Eyebrow>
        {state.totalSteps > 1 && <StepPips current={state.stepIndex} total={state.totalSteps} />}
      </div>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        {invite ? <>Welcome, <span className="italic font-light" style={{ color: r.accent }}>{(invite.prefillName || 'friend').split(' ')[0]}</span>.</> : <>The basics.</>}
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        {invite ? "Set up your account — we'll drop you straight into your work." : "We'll start with your name and a password."}
      </p>

      <div className="mt-7">
        <GoogleButton label={invite ? 'Accept with Google' : 'Sign up with Google'} />
      </div>
      <Divider label="or with email" className="my-5" />

      <form onSubmit={submit} className="space-y-4">
        <div>
          <FieldLabel>Your name</FieldLabel>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" autoFocus={!invite} />
        </div>
        <div>
          <FieldLabel hint={invite && invite.emailLocked ? 'From invite' : null}>Email</FieldLabel>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            invalid={!!error}
            disabled={invite?.emailLocked}
            className={invite?.emailLocked ? 'bg-[#F9F8F6] text-[#6B6454]' : ''}
          />
          {error && <div className="mt-1.5 text-[12px] text-[#9A2F2A] font-medium flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            {error}
          </div>}
        </div>
        <div>
          <FieldLabel>Password</FieldLabel>
          <PasswordField value={pw} onChange={setPw} />
        </div>

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer group">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#CFC8B6] text-[#E85F34] focus:ring-[#E85F34] cursor-pointer accent-[#E85F34]" />
          <span className="text-[12.5px] text-[#6B6454] leading-relaxed">
            I agree to the <a href="#" className="text-[#1F1D1A] font-semibold underline decoration-[#E4DFD3] underline-offset-2 hover:decoration-[#E85F34]">Terms</a> and <a href="#" className="text-[#1F1D1A] font-semibold underline decoration-[#E4DFD3] underline-offset-2 hover:decoration-[#E85F34]">Privacy Policy</a>.
          </span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          {back && <Button variant="outline" size="lg" onClick={back}>Back</Button>}
          <Button type="submit" variant="coral" size="lg" fullWidth disabled={!valid}>
            {invite ? 'Accept & continue →' : 'Continue →'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Host workspace — company name, timezone, property count range
// ---------------------------------------------------------------------------
function StepHostWorkspace({ state, setState, next, back }) {
  const [workspace, setWorkspace] = React.useState(state.workspace || '');
  const [tz, setTz] = React.useState(state.tz || 'America/Los_Angeles');
  const [size, setSize] = React.useState(state.size || null);

  const sizes = [
    { key: '1',    label: 'Just 1',    sub: 'A single property' },
    { key: '2-5',  label: '2 – 5',     sub: 'A small portfolio' },
    { key: '6-20', label: '6 – 20',    sub: 'Growing operation' },
    { key: '20+',  label: '20+',       sub: 'Full-time management' },
  ];

  const valid = workspace.trim().length >= 2 && size;

  function submit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    setState({ ...state, workspace, tz, size });
    next();
  }

  return (
    <div className="w-full max-w-[420px] fade-in">
      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>Your workspace</Eyebrow>
        <StepPips current={state.stepIndex} total={state.totalSteps} />
      </div>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        What do we call <span className="italic font-light" style={{ color: '#E85F34' }}>home base</span>?
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        Name your workspace and tell us roughly how many doors you manage.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <div>
          <FieldLabel>Workspace name</FieldLabel>
          <Input value={workspace} onChange={e => setWorkspace(e.target.value)} placeholder="e.g. Coastal Stays, Maple Ridge Rentals" autoFocus />
          <div className="mt-1.5 text-[11.5px] text-[#9C9481]">Usually your company or portfolio name. Cleaners will see this.</div>
        </div>

        <div>
          <FieldLabel>How many properties?</FieldLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {sizes.map(s => {
              const isSel = size === s.key;
              return (
                <button key={s.key} type="button" onClick={() => setSize(s.key)}
                  className={`text-left p-3 rounded-[10px] border transition-all duration-150
                    ${isSel ? 'bg-[#FBEDE6] border-[#E85F34]' : 'bg-white border-[#E4DFD3] hover:border-[#CFC8B6]'}`}>
                  <div className="text-[14.5px] font-bold text-[#1F1D1A]">{s.label}</div>
                  <div className="text-[11.5px] text-[#6B6454] mt-0.5">{s.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel>Timezone</FieldLabel>
          <div className="relative">
            <select value={tz} onChange={e => setTz(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-[#E4DFD3] bg-white px-3.5 text-[14px] text-[#1F1D1A] appearance-none focus:outline-none focus:border-[#E85F34] focus:ring-4 focus:ring-[#E85F34]/12 pr-10 cursor-pointer">
              <option value="America/Los_Angeles">Pacific (Los Angeles)</option>
              <option value="America/Denver">Mountain (Denver)</option>
              <option value="America/Chicago">Central (Chicago)</option>
              <option value="America/New_York">Eastern (New York)</option>
              <option value="America/Phoenix">Arizona (Phoenix)</option>
              <option value="Pacific/Honolulu">Hawaii (Honolulu)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Central European</option>
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9C9481]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="lg" onClick={back}>Back</Button>
          <Button type="submit" variant="coral" size="lg" fullWidth disabled={!valid}>
            Create workspace →
          </Button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cleaner — how you work (solo / team), service area
// ---------------------------------------------------------------------------
function StepCleanerSetup({ state, setState, next, back }) {
  const [mode, setMode] = React.useState(state.mode || null);
  const [business, setBusiness] = React.useState(state.business || '');
  const [area, setArea] = React.useState(state.area || '');

  const modes = [
    { key: 'solo', title: 'Solo — just me', sub: 'I clean every job myself', icon: '👤' },
    { key: 'team', title: 'I have a crew', sub: 'I dispatch jobs to teammates', icon: '👥' },
  ];

  const valid = mode && business.trim().length >= 2;

  function submit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    setState({ ...state, mode, business, area });
    next();
  }

  return (
    <div className="w-full max-w-[420px] fade-in">
      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>Your business</Eyebrow>
        <StepPips current={state.stepIndex} total={state.totalSteps} />
      </div>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        How do you <span className="italic font-light" style={{ color: '#2F7A3F' }}>work</span>?
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        This shapes your dashboard. You can add teammates anytime.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <div>
          <FieldLabel>Work style</FieldLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {modes.map(m => {
              const isSel = mode === m.key;
              return (
                <button key={m.key} type="button" onClick={() => setMode(m.key)}
                  className={`text-left p-3.5 rounded-[10px] border transition-all duration-150
                    ${isSel ? 'bg-[#EAF3DE] border-[#2F7A3F]' : 'bg-white border-[#E4DFD3] hover:border-[#CFC8B6]'}`}>
                  <div className="text-[20px] mb-1.5">{m.icon}</div>
                  <div className="text-[14px] font-bold text-[#1F1D1A]">{m.title}</div>
                  <div className="text-[11.5px] text-[#6B6454] mt-0.5 leading-snug">{m.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel>Business name</FieldLabel>
          <Input value={business} onChange={e => setBusiness(e.target.value)} placeholder="e.g. Sparkle Turnovers, María's Cleaning" autoFocus />
          <div className="mt-1.5 text-[11.5px] text-[#9C9481]">Hosts will see this when they look you up.</div>
        </div>

        <div>
          <FieldLabel hint="Optional">Service area</FieldLabel>
          <Input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Portland, OR · Pismo Beach" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="lg" onClick={back}>Back</Button>
          <Button type="submit" variant="coral" size="lg" fullWidth disabled={!valid}>
            Finish setup →
          </Button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team code — direct teammate path
// ---------------------------------------------------------------------------
function StepTeamCode({ state, setState, next, back, error }) {
  const [code, setCode] = React.useState(state.teamCode || '');
  const valid = code.replace(/[^A-Z0-9]/gi, '').length >= 6;

  function submit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    setState({ ...state, teamCode: code });
    next();
  }

  return (
    <div className="w-full max-w-[400px] fade-in">
      <div className="lg:hidden mb-6"><Logo size={28} /></div>

      <Eyebrow className="mb-3">Join a team</Eyebrow>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        Enter your <span className="italic font-light" style={{ color: '#2F6BBD' }}>team code</span>.
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        Your boss or team lead can share a code from their Turnzy settings.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <FieldLabel>6-character code</FieldLabel>
          <Input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SPRK-7Q2"
            className="font-mono tracking-[0.3em] text-center !text-[16px]"
            invalid={!!error}
            autoFocus
            maxLength={12}
          />
          {error && <div className="mt-1.5 text-[12px] text-[#9A2F2A] font-medium flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            {error}
          </div>}
        </div>

        <div className="flex items-center gap-3 pt-2">
          {back && <Button variant="outline" size="lg" onClick={back}>Back</Button>}
          <Button type="submit" variant="coral" size="lg" fullWidth disabled={!valid}>
            Verify code →
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 rounded-[12px] bg-[#F5F0E2]/60 border border-[#E4DFD3]">
        <div className="text-[12px] text-[#6B6454] leading-relaxed">
          <span className="font-bold text-[#1F1D1A]">Don't have a code?</span> Ask whoever hired you — they can generate one from <span className="font-mono bg-white px-1.5 py-0.5 rounded text-[11px] border border-[#E4DFD3]">Team → Invite</span> in their dashboard.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success — final screen, "taking you to your dashboard"
// ---------------------------------------------------------------------------
function StepSuccess({ state, reset }) {
  const r = ROLE[state.role];
  const nextSteps = {
    host: [
      { icon: 'calendar', label: 'Connect your first property calendar' },
      { icon: 'users', label: 'Invite your cleaning team' },
    ],
    cleaner: [
      { icon: 'mail', label: 'Wait for host invites — or invite one yourself' },
      { icon: 'users', label: 'Add teammates to dispatch jobs to' },
    ],
    teammate: [
      { icon: 'calendar', label: 'See your upcoming turnovers' },
      { icon: 'bell', label: 'Enable notifications for new jobs' },
    ],
  }[state.role];

  return (
    <div className="w-full max-w-[420px] fade-in text-center">
      <div className="lg:hidden mb-6 flex justify-center"><Logo size={30} /></div>

      <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: r.accent, animation: 'pulse-ring 1.6s ease-out' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <Eyebrow className="mb-3">You're in</Eyebrow>
      <h2 className="font-serif text-[32px] lg:text-[38px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        Welcome to <span className="italic font-light" style={{ color: r.accent }}>Turnzy</span>.
      </h2>
      <p className="text-[14.5px] text-[#6B6454] mt-3">
        {state.role === 'host' && `${state.workspace || 'Your workspace'} is ready. We'll walk you through the first turnover.`}
        {state.role === 'cleaner' && `${state.business || 'Your business'} is set up. Your dashboard is empty until a host invites you — that's normal.`}
        {state.role === 'teammate' && `You've joined the crew. Your next job will show up here.`}
      </p>

      <div className="mt-8 p-5 rounded-[14px] bg-white border border-[#E4DFD3] text-left">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9C9481] mb-3">A tour will start next</div>
        <div className="space-y-2.5">
          {nextSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F0E2] flex items-center justify-center flex-shrink-0" style={{ color: r.accent }}>
                {s.icon === 'calendar' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                {s.icon === 'users' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                {s.icon === 'mail' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                {s.icon === 'bell' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              </div>
              <div className="text-[13.5px] text-[#2C2A26] flex-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Button variant="coral" size="lg" fullWidth className="mt-6" onClick={reset}>
        Take me in →
      </Button>

      <div className="mt-5 text-[12px] text-[#9C9481]">
        Check your email to verify — you can keep using the app meanwhile.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edge-case screens (as full-page states)
// ---------------------------------------------------------------------------
function StepInviteExpired({ state }) {
  return (
    <div className="w-full max-w-[400px] fade-in text-center">
      <div className="lg:hidden mb-6 flex justify-center"><Logo size={30} /></div>

      <div className="mx-auto w-16 h-16 rounded-full bg-[#FBEDEA] flex items-center justify-center mb-5">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9A2F2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <Eyebrow className="mb-3">Invite expired</Eyebrow>
      <h2 className="font-serif text-[28px] lg:text-[32px] leading-[1.05] tracking-[-0.02em] font-black text-[#1F1D1A]">
        This link has <span className="italic font-light" style={{ color: '#C84437' }}>lapsed</span>.
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-3 leading-relaxed">
        Invite links are good for 7 days. Ask {state.invite?.from || 'whoever sent it'} to send a new one — it'll land in your inbox in seconds.
      </p>

      <div className="mt-7 flex flex-col gap-2.5">
        <Button variant="coral" size="lg" fullWidth>Request a new link</Button>
        <Button variant="outline" size="lg" fullWidth>Sign in instead</Button>
      </div>
    </div>
  );
}

Object.assign(window, {
  StepRolePicker, StepAccount, StepHostWorkspace, StepCleanerSetup,
  StepTeamCode, StepSuccess, StepInviteExpired,
});
