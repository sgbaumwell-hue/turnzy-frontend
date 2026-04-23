import { useState } from 'react';
import { User, Users } from 'lucide-react';
import { Eyebrow, FieldLabel, Input, PrimaryButton, StepPips } from '../atoms';

const CLEANER_ACCENT = '#2F7A3F';

const MODES = [
  { key: 'solo', title: 'Solo — just me', sub: 'I clean every job myself', Icon: User },
  { key: 'team', title: 'I have a crew',   sub: 'I dispatch jobs to teammates', Icon: Users },
];

export function StepCleanerSetup({ state, setState, next, back, stepIndex, totalSteps, submitting }) {
  const [mode, setMode] = useState(state.mode || null);
  const [business, setBusiness] = useState(state.business || '');
  const [area, setArea] = useState(state.area || '');

  const valid = !!mode && business.trim().length >= 2;

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    setState({ ...state, mode, business: business.trim(), area: area.trim() });
    next();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>Your business</Eyebrow>
        <StepPips current={stepIndex} total={totalSteps} accent={CLEANER_ACCENT} accentDark="#1F5428" />
      </div>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        How do you <span className="italic font-light" style={{ color: CLEANER_ACCENT }}>work</span>?
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        This shapes your dashboard. You can add teammates anytime.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        <div>
          <FieldLabel>Work style</FieldLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {MODES.map(({ key, title, sub, Icon }) => {
              const isSel = mode === key;
              return (
                <button key={key} type="button" onClick={() => setMode(key)}
                  className={`text-left p-3.5 rounded-[10px] border transition-all duration-150
                    ${isSel ? 'bg-[#EAF3DE] border-[#2F7A3F]' : 'bg-white border-[#E4DFD3] hover:border-[#CFC8B6]'}`}>
                  <div className="mb-1.5" style={{ color: isSel ? CLEANER_ACCENT : '#6B6454' }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div className="text-[14px] font-bold text-[#1F1D1A]">{title}</div>
                  <div className="text-[11.5px] text-[#6B6454] mt-0.5 leading-snug">{sub}</div>
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
          <button type="button" onClick={back}
            className="h-12 px-5 rounded-[12px] border border-[#E4DFD3] bg-white text-[#2C2A26] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150">
            Back
          </button>
          <PrimaryButton type="submit" disabled={!valid} loading={submitting} accent={CLEANER_ACCENT} accentHover="#1F5428">
            Finish setup →
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
