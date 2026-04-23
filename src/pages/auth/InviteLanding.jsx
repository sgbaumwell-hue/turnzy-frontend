import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SignupFlow } from './signup/SignupFlow';
import { SignupShell } from './signup/SignupShell';
import { StepInviteExpired } from './signup/steps/StepInviteExpired';
import { authApi } from '../../api/auth';

/**
 * /invite/:token — loads the invite, shows SignupFlow in accept mode.
 * On 410 (expired) or 404, redirect to /invite/:token/expired.
 */
export function InviteLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | ready | expired | error
  const [invite, setInvite] = useState(null);

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

  return <SignupFlow entry="invite" invite={{ ...invite, role_key: roleKey }} />;
}

export function InviteExpiredLanding() {
  const { token } = useParams();
  return (
    <SignupShell role="host">
      <StepInviteExpired token={token} />
    </SignupShell>
  );
}
