import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Eyebrow, FieldLabel, Input, PrimaryButton, StepPips } from '../atoms';

const SIZES = [
  { key: '1',    label: 'Just 1',    sub: 'A single property' },
  { key: '2-5',  label: '2 – 5',     sub: 'A small portfolio' },
  { key: '6-20', label: '6 – 20',    sub: 'Growing operation' },
  { key: '20+',  label: '20+',       sub: 'Full-time management' },
];

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
  { value: 'America/Denver',      label: 'Mountain (Denver)' },
  { value: 'America/Chicago',     label: 'Central (Chicago)' },
  { value: 'America/New_York',    label: 'Eastern (New York)' },
  { value: 'America/Phoenix',     label: 'Arizona (Phoenix)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii (Honolulu)' },
  { value: 'Europe/London',       label: 'London' },
  { value: 'Europe/Paris',        label: 'Central European' },
];

export function StepHostWorkspace({ state, setState, next, back, stepIndex, totalSteps, submitting }) {
  const [workspace, setWorkspace] = useState(state.workspace || '');
  const [tz, setTz] = useState(state.tz || 'America/Los_Angeles');
  const [size, setSize] = useState(state.size || null);

  const valid = workspace.trim().length >= 2 && !!size;

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (!valid) return;
    next({ workspace: workspace.trim(), tz, size });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>Your workspace</Eyebrow>
        <StepPips current={stepIndex} total={totalSteps} />
      </div>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        What do we call <span className="italic font-light" style={{ color: '#E85F34' }}>home base</span>?
      </h2>
      <p className="text-[14px] text-[#6B6454] mt-2">
        Name your workspace and tell us roughly how many doors you manage.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        <div>
          <FieldLabel>Workspace name</FieldLabel>
          <Input value={workspace} onChange={e => setWorkspace(e.target.value)} placeholder="e.g. Coastal Stays, Maple Ridge Rentals" autoFocus />
          <div className="mt-1.5 text-[11.5px] text-[#9C9481]">Usually your company or portfolio name. Cleaners will see this.</div>
        </div>

        <div>
          <FieldLabel>How many properties?</FieldLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {SIZES.map(s => {
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
              className="h-11 w-full rounded-[10px] border border-[#E4DFD3] bg-white px-3.5 text-[14px] text-[#1F1D1A] appearance-none focus:outline-none focus:border-[#E85F34] focus:ring-4 focus:ring-[#E85F34]/10 pr-10 cursor-pointer">
              {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9C9481]" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={back}
            className="h-12 px-5 rounded-[12px] border border-[#E4DFD3] bg-white text-[#2C2A26] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150">
            Back
          </button>
          <PrimaryButton type="submit" disabled={!valid} loading={submitting}>
            Create workspace →
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
