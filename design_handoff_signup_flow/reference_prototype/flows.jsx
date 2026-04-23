// Turnzy Signup — flow orchestration.
// Decides: which steps this combo of (role × entry × invite) goes through,
// which step we're on, and passes the right props down.

// Sample invite fixtures — one per scenario
const INVITES = {
  cleaner: {
    from: 'Sam Aldridge',
    fromFirst: 'Sam',
    fromRole: 'Host · Coastal Stays',
    workspace: 'Coastal Stays',
    email: 'maria.rivera@gmail.com',
    prefillName: 'María Rivera',
    emailLocked: false,
    roleLabel: 'Lead Cleaner',
    propertyCount: 3,
    properties: ['Pismo Cliffside · 2BR', 'Morro Bay Studio', 'Avila Beach Cottage · 3BR'],
    roleOnSignup: 'cleaner',
  },
  teammate: {
    from: 'María Rivera',
    fromFirst: 'María',
    fromRole: 'Owner · Sparkle Turnovers',
    workspace: 'Sparkle Turnovers',
    email: 'jordan.k@gmail.com',
    prefillName: 'Jordan Kim',
    emailLocked: false,
    roleLabel: 'Teammate',
    propertyCount: 7,
    roleOnSignup: 'teammate',
  },
  host: {
    from: 'Devon Park',
    fromFirst: 'Devon',
    fromRole: 'Partner · Ridgeview Group',
    workspace: 'Ridgeview Group',
    email: 'alex@ridgeview.co',
    prefillName: 'Alex Chen',
    emailLocked: false,
    roleLabel: 'Co-owner',
    propertyCount: 12,
    roleOnSignup: 'host',
  },
};

// Given the tweaks state, return: list of step keys for this flow.
function stepsFor({ role, entry, teamCodeMode }) {
  if (entry === 'invite') {
    // Invite links: one screen — accept.
    return ['account', 'success'];
  }
  // Direct entry: role picker, then role-specific steps.
  if (role === 'host') return ['role', 'account', 'hostWorkspace', 'success'];
  if (role === 'cleaner') return ['role', 'account', 'cleanerSetup', 'success'];
  if (role === 'teammate') return teamCodeMode
    ? ['role', 'teamCode', 'account', 'success']
    : ['role', 'teamCode', 'account', 'success'];
  return ['role'];
}

function SignupFlow({ tweaks }) {
  const { role: tweakRole, entry, edgeCase, viewport } = tweaks;

  // Resolve invite based on entry + role
  const invite = React.useMemo(() => {
    if (entry !== 'invite') return null;
    const base = INVITES[tweakRole] || INVITES.cleaner;
    // edge case overrides
    if (edgeCase === 'expired') return { ...base, expired: true };
    if (edgeCase === 'emailMismatch') return { ...base };
    return base;
  }, [entry, tweakRole, edgeCase]);

  // Start-state depends on entry mode.
  const initialState = React.useMemo(() => ({
    role: entry === 'invite' ? (invite?.roleOnSignup || tweakRole) : (entry === 'direct' ? null : tweakRole),
    teamCodeMode: tweakRole === 'teammate' && entry === 'teamCode',
    stepIndex: 0,
    name: '', email: '', password: '', agreed: false,
  }), [entry, tweakRole, invite]);

  const [state, setState] = React.useState(initialState);
  React.useEffect(() => { setState(initialState); }, [entry, tweakRole, edgeCase]);

  // Derive the step list from current state
  const steps = React.useMemo(() => {
    if (entry === 'teamCode') return ['teamCode', 'account', 'success'];
    return stepsFor({ role: state.role || tweakRole, entry, teamCodeMode: state.teamCodeMode });
  }, [state.role, state.teamCodeMode, entry, tweakRole]);

  // If role is null (direct, not chosen yet), start at role picker
  const effectiveRole = state.role || tweakRole;
  const totalSteps = steps.filter(s => s !== 'role' && s !== 'success').length;
  const currentKey = steps[state.stepIndex] || steps[steps.length - 1];

  // Compute display stepIndex/totalSteps for pips (excluding role picker + success)
  const visibleStepIndex = steps.slice(0, state.stepIndex).filter(s => s !== 'role' && s !== 'success').length;

  // Short-circuit: expired invite edge case
  if (invite?.expired) {
    return <SignupShell role={effectiveRole} invite={invite}>
      <StepInviteExpired state={{ invite }} />
    </SignupShell>;
  }

  const next = () => setState(s => ({ ...s, stepIndex: Math.min(s.stepIndex + 1, steps.length - 1) }));
  const back = () => setState(s => ({ ...s, stepIndex: Math.max(s.stepIndex - 1, 0) }));
  const reset = () => setState({ ...initialState });

  // Augment state with pip info for children
  const augmented = { ...state, stepIndex: visibleStepIndex, totalSteps, role: effectiveRole };

  // Edge-case errors surfaced to the account step
  const accountError = edgeCase === 'existingAccount'
    ? 'An account with this email already exists. Sign in instead?'
    : edgeCase === 'emailMismatch' && entry === 'invite'
      ? `This invite was sent to ${invite.email}. Use that address or ask for a new invite.`
      : null;

  const teamCodeError = edgeCase === 'badCode' ? "We don't recognize that code. Double-check with your team lead." : null;

  let body;
  switch (currentKey) {
    case 'role':
      body = <StepRolePicker state={augmented} setState={setState} next={next} />;
      break;
    case 'teamCode':
      body = <StepTeamCode state={augmented} setState={setState} next={next} back={state.stepIndex > 0 ? back : null} error={teamCodeError} />;
      break;
    case 'account':
      body = <StepAccount state={augmented} setState={setState} next={next} back={state.stepIndex > 0 ? back : null} invite={invite} error={accountError} />;
      break;
    case 'hostWorkspace':
      body = <StepHostWorkspace state={augmented} setState={setState} next={next} back={back} />;
      break;
    case 'cleanerSetup':
      body = <StepCleanerSetup state={augmented} setState={setState} next={next} back={back} />;
      break;
    case 'success':
      body = <StepSuccess state={augmented} reset={reset} />;
      break;
    default:
      body = <StepRolePicker state={augmented} setState={setState} next={next} />;
  }

  // On the role picker, don't show an invite panel (no invite) — use whatever tweak role for visual.
  // After role is picked, switch panel to match.
  return (
    <SignupShell role={effectiveRole} invite={invite}>
      {body}
    </SignupShell>
  );
}

// ---------------------------------------------------------------------------
// Shell — panel left, form right. Handles the mobile/desktop switch.
// ---------------------------------------------------------------------------
function SignupShell({ role, invite, children }) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[#FBF8F1]">
      <Panel role={role} invite={invite} />
      <div className="flex flex-col lg:min-h-screen">
        <MobileHero role={role} invite={invite} />
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          {children}
        </div>
        <FooterLine />
      </div>
    </div>
  );
}

function FooterLine() {
  return (
    <div className="px-6 lg:px-12 py-5 border-t border-[#E4DFD3] bg-[#FBF8F1]">
      <div className="max-w-[440px] mx-auto lg:mx-0 flex items-center justify-between text-[11.5px] text-[#9C9481]">
        <div>© Turnzy 2026</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[#5F5B52]">Privacy</a>
          <a href="#" className="hover:text-[#5F5B52]">Terms</a>
          <a href="#" className="hover:text-[#5F5B52]">Help</a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SignupFlow, SignupShell, INVITES });
