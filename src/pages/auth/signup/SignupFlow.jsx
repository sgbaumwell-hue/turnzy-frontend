import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupShell } from './SignupShell';
import { StepRolePicker } from './steps/StepRolePicker';
import { StepAccount } from './steps/StepAccount';
import { StepHostWorkspace } from './steps/StepHostWorkspace';
import { StepCleanerSetup } from './steps/StepCleanerSetup';
import { StepTeamCode } from './steps/StepTeamCode';
import { StepSuccess } from './steps/StepSuccess';
import { authApi, teamApi } from '../../../api/auth';
import { useAuthStore } from '../../../store/authStore';

const STORAGE_KEY = 'turnzy_signup_state';

// Given role + entry mode, return the ordered list of step keys.
function stepsFor(role, entry, teamCodeVerified) {
  if (entry === 'invite') return ['account', 'success'];
  if (entry === 'join' || (role === 'teammate' && !role)) {
    return teamCodeVerified ? ['teamCode', 'account', 'success'] : ['teamCode', 'account', 'success'];
  }
  if (!role) return ['role'];
  if (role === 'host')     return ['role', 'account', 'workspace', 'success'];
  if (role === 'cleaner')  return ['role', 'account', 'cleanerSetup', 'success'];
  if (role === 'teammate') return ['role', 'teamCode', 'account', 'success'];
  return ['role'];
}

function stepsForDirect(presetRole) {
  if (presetRole === 'host')     return ['account', 'workspace', 'success'];
  if (presetRole === 'cleaner')  return ['account', 'cleanerSetup', 'success'];
  if (presetRole === 'teammate') return ['teamCode', 'account', 'success'];
  return ['role', 'account', 'success']; // fallback
}

// Pips count excludes 'role' and 'success' — only counts the "data entry" steps.
function pipSteps(allSteps) {
  return allSteps.filter(s => s !== 'role' && s !== 'success');
}

/**
 * SignupFlow — orchestrates the multi-step signup.
 *
 * Props:
 *   presetRole?: 'host' | 'cleaner' | 'teammate'  (from /signup/host etc.)
 *   entry?: 'direct' | 'invite' | 'join'          (default 'direct')
 *   invite?: {token, inviter, workspace, invitee, role, property_ids, properties, role_label, expires_at}
 */
export function SignupFlow({ presetRole, entry = 'direct', invite = null }) {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  // Restore state from sessionStorage on mount (same tab, same flow).
  const initialState = (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      // Only restore if the flow signature matches — prevents stale restores
      // if user backed out and chose a different role in another tab.
      if (parsed._signature === signatureFor(presetRole, entry, invite?.token)) {
        return parsed.state;
      }
    } catch {}
    return {};
  })();

  const [state, setStateRaw] = useState({
    role: invite?.role_key || presetRole || initialState.role || null,
    name: '', email: '', password: '', agreed: false,
    workspace: '', size: null, tz: 'America/Los_Angeles',
    mode: null, business: '', area: '',
    teamCode: '', teamCodeVerified: false, teamCodeWorkspace: null,
    ...initialState,
  });
  const [stepKey, setStepKey] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Determine step list for the current role/entry combo.
  const stepList = entry === 'invite'
    ? ['account', 'success']
    : (presetRole ? stepsForDirect(presetRole) : stepsFor(state.role, entry));

  // Compute the initial step key after state.role is known.
  const stepKeyResolved = stepKey || stepList[0];
  const stepIdx = stepList.indexOf(stepKeyResolved);
  const pipList = pipSteps(stepList);
  const pipIdx  = pipList.indexOf(stepKeyResolved);

  // Persist state on every change (keyed by flow signature).
  const saveRef = useRef();
  saveRef.current = { state, signature: signatureFor(presetRole, entry, invite?.token) };
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        _signature: saveRef.current.signature,
        state: saveRef.current.state,
      }));
    } catch {}
  }, [state]);

  function setState(updater) {
    setStateRaw(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
  }

  // goToStep is a low-level setter — caller decides whether to clear the error.
  // next()/back() DO clear errors (forward progress = fresh slate). The 409
  // branch in submitSignup uses setStepKey directly so the error survives.
  function goToStep(key) {
    setStepKey(key);
  }

  function next() {
    setError(null);
    const nextIdx = stepIdx + 1;
    if (nextIdx >= stepList.length) return;
    goToStep(stepList[nextIdx]);
  }

  function back() {
    setError(null);
    const prevIdx = Math.max(0, stepIdx - 1);
    goToStep(stepList[prevIdx]);
  }

  // Verify team code before advancing from StepTeamCode.
  async function onTeamCodeNext() {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await teamApi.verifyCode(state.teamCode);
      setState({ teamCodeVerified: true, teamCodeWorkspace: data.workspace });
      const nextIdx = stepIdx + 1;
      goToStep(stepList[nextIdx]);
    } catch (err) {
      setError(err.response?.data?.message || "We don't recognize that code. Double-check with your team lead.");
    } finally {
      setSubmitting(false);
    }
  }

  // Submit the account on StepAccount — this is the final server call for
  // every flow. Backend returns {user, token} on success.
  async function onAccountNext(patchedState) {
    const finalState = patchedState || state;

    // For multi-step direct flows (host / cleaner), don't submit yet — advance
    // to the role-specific step first and submit there.
    const hasMoreSteps = stepIdx + 1 < stepList.length - 1; // -1 because 'success' is last
    if (hasMoreSteps) {
      next();
      return;
    }

    await submitSignup(finalState);
  }

  async function submitSignup(finalState) {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        role: finalState.role,
        account: {
          name: finalState.name,
          email: finalState.email,
          password: finalState.password,
        },
        workspace: finalState.role === 'host' ? {
          name: finalState.workspace,
          size: finalState.size,
          timezone: finalState.tz,
        } : undefined,
        business: finalState.role === 'cleaner' ? {
          name: finalState.business,
          mode: finalState.mode,
          service_area: finalState.area || null,
        } : undefined,
        team_code: finalState.role === 'teammate' ? finalState.teamCode : undefined,
        invite_token: invite?.token,
      };

      const { data } = await authApi.complete(payload);
      if (data.token) localStorage.setItem('turnzy_token', data.token);
      const { token, ...user } = data;
      setUser(user);

      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}

      // Advance to the success step in this flow.
      goToStep('success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      if (err.response?.status === 409) {
        const serverMsg = err.response.data?.message || 'An account with that email already exists.';
        // If we were past the account step, walk back to it so user can fix.
        // goToStep no longer clears errors, so the message survives the jump.
        if (stepKeyResolved !== 'account') goToStep('account');
        setError(serverMsg);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Wrap next() on the final data step so it triggers submit.
  function nextOrSubmit() {
    const nextIdx = stepIdx + 1;
    if (nextIdx < stepList.length && stepList[nextIdx] === 'success') {
      submitSignup(state);
    } else {
      next();
    }
  }

  // Render the active step.
  const currentStep = stepKeyResolved;
  const showShell = currentStep !== null;

  let stepBody = null;
  const commonProps = {
    state, setState,
    back: stepIdx > 0 ? back : null,
    invite,
    error,
    submitting,
    stepIndex: pipIdx,
    totalSteps: pipList.length,
  };

  if (currentStep === 'role') {
    stepBody = <StepRolePicker state={state} setState={setState} next={next} onEnterCode={() => { setState({ role: 'teammate' }); navigate('/signup/join'); }} />;
  } else if (currentStep === 'teamCode') {
    stepBody = <StepTeamCode {...commonProps} next={onTeamCodeNext} />;
  } else if (currentStep === 'account') {
    stepBody = <StepAccount {...commonProps} next={nextOrSubmit} />;
  } else if (currentStep === 'workspace') {
    stepBody = <StepHostWorkspace {...commonProps} next={nextOrSubmit} />;
  } else if (currentStep === 'cleanerSetup') {
    stepBody = <StepCleanerSetup {...commonProps} next={nextOrSubmit} />;
  } else if (currentStep === 'success') {
    stepBody = <StepSuccess state={state} />;
  }

  const shellRole = state.role || presetRole || 'host';

  return (
    <SignupShell role={shellRole} invite={invite}>
      {stepBody}
    </SignupShell>
  );
}

function signatureFor(role, entry, token) {
  return `${role || 'pick'}::${entry}::${token || 'none'}`;
}
