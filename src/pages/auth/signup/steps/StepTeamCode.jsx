import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Eyebrow, FieldLabel, Input, PrimaryButton, StepPips } from '../atoms';

const TEAMMATE_ACCENT = '#2F6BBD';

function formatCode(raw) {
  const stripped = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
  if (stripped.length <= 4) return stripped;
  return `${stripped.slice(0, 4)}-${stripped.slice(4)}`;
}

export function StepTeamCode({ state, setState, next, back, error, stepIndex, totalSteps, submitting }) {
  const [code, setCode] = useState(state.teamCode || '');
  const stripped = code.replace(/[^A-Z0-9]/g, '');
  const valid = stripped.length === 8;

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    next({ teamCode: stripped, teamCodeDisplay: code });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>Join a team</Eyebrow>
        <StepPips current={stepIndex} total={totalSteps} accent={TEAMMATE_ACCENT} accentDark="#1F538E" />
      </div>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        Enter your <span className="italic font-light" style={{ color: TEAMMATE_ACCENT }}>team code</span>.
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        Your boss or team lead can share a code from their Turnzy settings.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <FieldLabel hint="8 characters">Team code</FieldLabel>
          <Input
            value={code}
            onChange={e => setCode(formatCode(e.target.value))}
            placeholder="SPRK-7Q2X"
            className="font-mono tracking-[0.3em] text-center !text-[16px] uppercase"
            invalid={!!error}
            autoFocus
            maxLength={9}
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <div className="mt-1.5 text-[12px] text-[#9A2F2A] font-medium flex items-center gap-1.5">
              <AlertCircle size={13} />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          {back && (
            <button type="button" onClick={back}
              className="h-12 px-5 rounded-[12px] border border-[#E4DFD3] bg-white text-[#2C2A26] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150">
              Back
            </button>
          )}
          <PrimaryButton type="submit" disabled={!valid} loading={submitting} accent={TEAMMATE_ACCENT} accentHover="#1F538E">
            Verify code →
          </PrimaryButton>
        </div>
      </form>

      <div className="mt-8 p-4 rounded-[12px] bg-[#F5F0E2]/60 border border-[#E4DFD3]">
        <div className="text-[12px] text-[#6B6454] leading-relaxed">
          <span className="font-bold text-[#1F1D1A]">Don't have a code?</span> Ask whoever hired you — they can generate one from{' '}
          <span className="font-mono bg-white px-1.5 py-0.5 rounded text-[11px] border border-[#E4DFD3]">Team → Invite</span> in their dashboard.
        </div>
      </div>
    </div>
  );
}
