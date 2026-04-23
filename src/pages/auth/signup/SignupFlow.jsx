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
// Host workspace setup is deferred to post-signup settings — users don't
// want a required "create workspace" step mid-onboarding.
function stepsFor(role, entry, teamCodeVerified) {
  if (entry === 'invite') return ['account', 'success'];
  if (entry === 'join' || (role === 'teammate' && !role)) {
    return teamCodeVerified ? ['teamCode', 'account', 'success'] : ['teamCode', 'account', 'success'];
  }
  if (!role) return ['role'];
  if (role === 'host')     return ['role', 'account', 'success'];
  if (role === 'cleaner')  return ['role', 'account', 'cleanerSetup', 'success'];
  if (role === 'teammate') return ['role', 'teamCode', 'account', 'success'];
  return ['role'];
}

function stepsForDirect(presetRole) {
  if (presetRole === 'host')     return ['account', 'success'];
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
  // Fall back to first step if stepKey is stale (e.g. user was mid-flow
  // on a step that's since been removed from the list, like 'workspace').
  const stepKeyResolved = (stepKey && stepList.includes(stepKey)) ? stepKey : stepList[0];
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

  // next(patch?) — advance to the next step, optionally merging field state
  // atomically so submitters don't race React's batched setState. The patch
  // parameter is CRITICAL: without it, a step calling setState(x); next()
  // would hand the old state to submitSignup because the state update
  // hasn't applied yet when next() reads the closure variable.
  function next(patch) {
    setError(null);
    if (patch) setStateRaw(prev => ({ ...prev, ...patch }));
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
  async function onTeamCodeNext(patch) {
    const merged = patch ? { ...state, ...patch } : state;
    if (patch) setStateRaw(prev => ({ ...prev, ...patch }));
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await teamApi.verifyCode(merged.teamCode);
      setStateRaw(prev => ({ ...prev, teamCodeVerified: true, teamCodeWorkspace: data.workspace }));
      const nextIdx = stepIdx + 1;
      goToStep(stepList[nextIdx]);
    } catch (err) {
      setError(err.response?.data?.message || "We don't recognize that code. Double-check with your team lead.");
    } finally {
      setSubmitting(false);
    }
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
      const data = err.response?.data || {};
      const msg = data.message || 'Something went wrong. Please try again.';
      if (err.response?.status === 409) {
        const serverMsg = data.message || 'An account with that email already exists.';
        // If we were past the account step, walk back to it so user can fix.
        // goToStep no longer clears errors, so the message survives the jump.
        if (stepKeyResolved !== 'account') goToStep('account');
        setError(serverMsg);
      } else {
        // Surface the diagnostic code if the backend included one — helps
        // pinpoint schema/config issues without needing Railway log access.
        const suffix = data.code && data.code !== 'UNKNOWN' ? ` (${data.code})` : '';
        setError(msg + suffix);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Wrap next() on the final data step so it triggers submit. Takes the
  // same (patch) contract as next() — the patch is what actually gets sent
  // to the backend, because relying on React's batched state is a race.
  function nextOrSubmit(patch) {
    const merged = patch ? { ...state, ...patch } : state;
    const nextIdx = stepIdx + 1;
    if (nextIdx < stepList.length && stepList[nextIdx] === 'success') {
      if (patch) setStateRaw(prev => ({ ...prev, ...patch }));
      submitSignup(merged);
    } else {
      next(patch);
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
