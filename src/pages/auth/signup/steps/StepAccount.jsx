import { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import client from '../../../../api/client';
import { Eyebrow, FieldLabel, Input, GoogleButton, PasswordField, PrimaryButton, StepPips, Divider, passwordStrength } from '../atoms';
import { getRole } from '../roles';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function StepAccount({ state, setState, next, back, invite, error, stepIndex, totalSteps, submitting }) {
  const r = getRole(state.role);
  const [name, setName] = useState(state.name || invite?.invitee?.suggested_name || '');
  const [email, setEmail] = useState(state.email || invite?.invitee?.email || '');
  const [pw, setPw] = useState(state.password || '');
  const [agreed, setAgreed] = useState(!!state.agreed);
  const [emailMismatch, setEmailMismatch] = useState(null);
  const [emailTakenError, setEmailTakenError] = useState(null);
  const lastCheckedEmail = useRef(null);

  const originalInviteEmail = invite?.invitee?.email;
  useEffect(() => {
    if (!originalInviteEmail) { setEmailMismatch(null); return; }
    const trimmed = email.trim().toLowerCase();
    if (trimmed && trimmed !== originalInviteEmail.toLowerCase()) {
      setEmailMismatch(`This invite was sent to ${originalInviteEmail}. Use that address or ask for a new invite.`);
    } else {
      setEmailMismatch(null);
    }
  }, [email, originalInviteEmail]);

  const strengthOk = passwordStrength(pw) >= 2;
  const valid = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && pw.length >= 8 && strengthOk && agreed && !emailMismatch && !emailTakenError;

  // On-blur email-exists check — per README §7. Prevents the frustrating case
  // where the user fills workspace, then gets kicked back because the email
  // was already taken. Skip for invite flows (server already checked).
  async function handleEmailBlur() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) return;
    if (invite) return;
    if (lastCheckedEmail.current === trimmed) return;
    lastCheckedEmail.current = trimmed;
    try {
      const { data } = await client.get(`/auth/check-email?email=${encodeURIComponent(trimmed)}`);
      if (data?.exists) {
        setEmailTakenError('An account with this email already exists.');
      } else {
        setEmailTakenError(null);
      }
    } catch {
      // Silent on network failure — server will catch at submit.
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    if (emailTakenError) setEmailTakenError(null);
  }

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    // Pass field values as a patch so the orchestrator merges them into
    // state atomically before submitting — setState then next() races
    // React's batched updates and ships the old email to the backend.
    next({ name: name.trim(), email: email.trim(), password: pw, agreed });
  }

  const googleHref = invite?.token
    ? `${BACKEND_URL}/auth/google?role=${state.role}&invite_token=${encodeURIComponent(invite.token)}`
    : `${BACKEND_URL}/auth/google?role=${state.role}`;

  const invitedName = invite?.invitee?.suggested_name?.split(' ')[0];

  return (
    <div>
      {/* Invite context banner (mobile only — desktop shows in panel) */}
      {invite && (
        <div className="mb-5 p-3 rounded-[12px] border border-[#E4DFD3] bg-white flex items-start gap-3 lg:hidden">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px]"
            style={{ background: r.accent }}>
            {invite.inviter?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-[#6B6454]">
              Invited by <span className="font-semibold text-[#1F1D1A]">{invite.inviter?.name}</span>
            </div>
            <div className="text-[11.5px] text-[#9C9481] mt-0.5">
              {invite.workspace?.name} · {invite.role_label || r.label}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>{invite ? 'Accept invite' : 'Create account'}</Eyebrow>
        <StepPips current={stepIndex} total={totalSteps} accent={r.accent} accentDark={r.accent2} />
      </div>

      <h2 className="font-inter text-[26px] lg:text-[30px] leading-[1.15] tracking-[-0.015em] font-extrabold text-[#1F1D1A]">
        {invite
          ? <>Welcome, <span style={{ color: r.accent, fontWeight: 800 }}>{invitedName || 'friend'}</span>.</>
          : <>The basics.</>
        }
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        {invite
          ? `Set up your account — we'll drop you straight into your work.`
          : `We'll start with your name and a password.`}
      </p>

      <div className="mt-7">
        <GoogleButton label={invite ? 'Accept with Google' : 'Sign up with Google'} href={googleHref} />
      </div>
      <Divider label="or with email" className="my-5" />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <FieldLabel>Your name</FieldLabel>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" autoFocus={!invite} autoComplete="name" />
        </div>

        <div>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="you@example.com"
            invalid={!!error || !!emailMismatch || !!emailTakenError}
            autoComplete="email"
          />
          {(error || emailMismatch || emailTakenError) && (
            <div className="mt-1.5 text-[12px] text-[#9A2F2A] font-medium flex items-start gap-1.5">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              <span>
                {error || emailMismatch || emailTakenError}
                {((error || emailTakenError || '').toLowerCase().includes('exists')) && (
                  <> <a href={`/login?email=${encodeURIComponent(email)}`} className="underline font-semibold">Sign in instead?</a></>
                )}
              </span>
            </div>
          )}
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <PasswordField value={pw} onChange={setPw} />
        </div>

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#CFC8B6] cursor-pointer accent-[#E85F34]"
          />
          <span className="text-[12.5px] text-[#6B6454] leading-relaxed">
            I agree to the{' '}
            <a href="/terms" target="_blank" rel="noreferrer" className="text-[#1F1D1A] font-semibold underline decoration-[#E4DFD3] underline-offset-2 hover:decoration-[#E85F34]">Terms</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noreferrer" className="text-[#1F1D1A] font-semibold underline decoration-[#E4DFD3] underline-offset-2 hover:decoration-[#E85F34]">Privacy Policy</a>.
          </span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          {back && (
            <button type="button" onClick={back}
              className="h-12 px-5 rounded-[12px] border border-[#E4DFD3] bg-white text-[#2C2A26] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150">
              Back
            </button>
          )}
          <PrimaryButton type="submit" disabled={!valid} loading={submitting} accent={r.accent} accentHover={r.accent2}>
            {invite ? 'Accept & continue →' : 'Continue →'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
