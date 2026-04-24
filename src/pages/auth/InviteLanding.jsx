import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SignupFlow } from './signup/SignupFlow';
import { SignupShell } from './signup/SignupShell';
import { StepInviteExpired } from './signup/steps/StepInviteExpired';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

/**
 * /invite/:token — loads the invite, then routes to one of three states:
 *
 *   1. Not signed in → <SignupFlow entry="invite"> (create new account).
 *   2. Signed in, email matches the invite → <AcceptAsExistingUser> (one-click
 *      POST to /api/invites/:token/accept).
 *   3. Signed in, email mismatch → prompt to sign out and use the right account.
 *
 * On 410 (expired) or missing token, show the expired screen.
 */
export function InviteLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | ready | expired | error
  const [invite, setInvite] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.getInvite(token)
      .then(({ data }) => {
        setInvite({ ...data, token });
        setStatus('ready');
      })
      .catch(err => {
        if (err.response?.status === 410) {
          navigate(`/invite/${encodeURIComponent(token)}/expired`, { replace: true });
        } else {
          setStatus('error');
        }
      });
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <SignupShell role="host">
        <div className="py-16 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#E85F34] border-t-transparent rounded-full animate-spin" />
        </div>
      </SignupShell>
    );
  }

  if (status === 'error') {
    return (
      <SignupShell role="host">
        <StepInviteExpired token={token} />
      </SignupShell>
    );
  }

  // Map server role → UI role bucket
  const roleKey = ({
    host_owner: 'host',
    cleaner_owner: 'cleaner',
    cleaner_lead: 'cleaner',
    cleaner_teammate: 'teammate',
  })[invite?.role] || 'teammate';

  // ── Branching on auth state ──
  const inviteEmail = (invite?.invitee?.email || '').toLowerCase();
  const currentEmail = (user?.email || '').toLowerCase();

  if (isAuthenticated && inviteEmail && currentEmail === inviteEmail) {
    return <AcceptAsExistingUser invite={invite} roleKey={roleKey} />;
  }

  if (isAuthenticated && inviteEmail && currentEmail !== inviteEmail) {
    return <EmailMismatch invite={invite} currentEmail={user.email} />;
  }

  // Default: not signed in → normal signup flow.
  return <SignupFlow entry="invite" invite={{ ...invite, role_key: roleKey }} />;
}

/* ──────────────────────────────────────────────────────────────
 * Accept-as-existing-user screen
 * ────────────────────────────────────────────────────────────── */

function AcceptAsExistingUser({ invite, roleKey }) {
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  const inviter = invite?.inviter?.name || 'Someone';
  const workspace = invite?.workspace?.name || '';
  const propertyCount = invite?.properties?.length ?? invite?.property_ids?.length ?? 0;
  const roleLabel = invite?.role_label || (roleKey === 'cleaner' ? 'cleaner' : 'team member');

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      await authApi.acceptInvite(invite.token, {});
      // Route to the appropriate dashboard for the accepted role.
      if (roleKey === 'cleaner') navigate('/cleaner', { replace: true });
      else if (roleKey === 'teammate') navigate('/team', { replace: true });
      else navigate('/', { replace: true });
    } catch (e) {
      const status = e.response?.status;
      if (status === 410) {
        navigate(`/invite/${encodeURIComponent(invite.token)}/expired`, { replace: true });
        return;
      }
      setError(e.response?.data?.message || 'Could not accept invite. Try again.');
      setAccepting(false);
    }
  }

  return (
    <SignupShell role={roleKey === 'cleaner' ? 'cleaner' : 'host'}>
      <div className="max-w-md mx-auto py-10 px-6 font-inter">
        <div
          className="text-[10.5px] font-extrabold uppercase"
          style={{ color: '#D85A30', letterSpacing: '0.14em' }}
        >
          — Accept invite
        </div>
        <h1
          className="font-serif mt-2"
          style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.6, color: '#1F1D1A', lineHeight: 1.15 }}
        >
          Join {workspace || 'this workspace'} as {roleLabel}?
        </h1>
        <p className="mt-3" style={{ fontSize: 14, color: '#5F5B52', lineHeight: 1.55 }}>
          <b>{inviter}</b> invited <b>{invite?.invitee?.email}</b> to join Turnzy
          {propertyCount
            ? ` as their ${roleLabel} for ${propertyCount} propert${propertyCount === 1 ? 'y' : 'ies'}.`
            : ` as their ${roleLabel}.`}
        </p>
        <p className="mt-2" style={{ fontSize: 13, color: '#888780' }}>
          You&rsquo;re signed in as this email, so we&rsquo;ll attach the invite to your
          account. No new account needed.
        </p>

        {error && (
          <div
            className="mt-4 px-3 py-2 rounded-lg"
            style={{ background: '#FCEBEB', color: '#7B1D17', fontSize: 13, border: '1px solid #F0C8C4' }}
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="inline-flex items-center font-inter transition-colors disabled:opacity-60"
            style={{
              height: 40, padding: '0 20px', borderRadius: 10,
              background: '#D85A30', color: '#fff', fontSize: 14, fontWeight: 700,
            }}
          >
            {accepting ? 'Accepting…' : 'Accept invite →'}
          </button>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="inline-flex items-center font-inter"
            style={{
              height: 40, padding: '0 14px', borderRadius: 10,
              background: 'transparent', color: '#5F5B52', fontSize: 13, fontWeight: 600,
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </SignupShell>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Email mismatch — invite is for a different address
 * ────────────────────────────────────────────────────────────── */

function EmailMismatch({ invite, currentEmail }) {
  const { clearUser } = useAuthStore();
  const navigate = useNavigate();

  function signOutAndRetry() {
    clearUser();
    localStorage.removeItem('turnzy_token');
    navigate(`/invite/${encodeURIComponent(invite.token)}`, { replace: true });
  }

  return (
    <SignupShell role="host">
      <div className="max-w-md mx-auto py-10 px-6 font-inter">
        <div
          className="text-[10.5px] font-extrabold uppercase"
          style={{ color: '#D85A30', letterSpacing: '0.14em' }}
        >
          — Wrong account
        </div>
        <h1
          className="font-serif mt-2"
          style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.6, color: '#1F1D1A', lineHeight: 1.15 }}
        >
          This invite is for a different email.
        </h1>
        <p className="mt-3" style={{ fontSize: 14, color: '#5F5B52', lineHeight: 1.55 }}>
          The invite was sent to <b>{invite?.invitee?.email}</b>, but you&rsquo;re signed in
          as <b>{currentEmail}</b>. Sign out and back in with the right account to accept.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={signOutAndRetry}
            className="inline-flex items-center font-inter transition-colors"
            style={{
              height: 40, padding: '0 20px', borderRadius: 10,
              background: '#D85A30', color: '#fff', fontSize: 14, fontWeight: 700,
            }}
          >
            Sign out & switch
          </button>
        </div>
      </div>
    </SignupShell>
  );
}

export function InviteExpiredLanding() {
  const { token } = useParams();
  return (
    <SignupShell role="host">
      <StepInviteExpired token={token} />
    </SignupShell>
  );
}
