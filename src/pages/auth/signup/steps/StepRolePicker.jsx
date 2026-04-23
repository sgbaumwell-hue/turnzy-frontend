import { Home, Sparkles, Users, Check } from 'lucide-react';
import { Eyebrow, PrimaryButton } from '../atoms';
import { ROLE } from '../roles';

const OPTIONS = [
  {
    key: 'host',
    title: 'I own properties',
    sub: 'Short-term rental owner or property manager',
    meta: 'Airbnb · VRBO · Hostaway',
    Icon: Home,
  },
  {
    key: 'cleaner',
    title: 'I run a cleaning business',
    sub: 'Solo cleaner or cleaning company owner',
    meta: 'Coordinate a crew · Manage jobs',
    Icon: Sparkles,
  },
  {
    key: 'teammate',
    title: "I'm joining a team",
    sub: 'You clean for a company that uses Turnzy',
    meta: 'Need a code? Ask your boss.',
    Icon: Users,
  },
];

export function StepRolePicker({ state, setState, next, onEnterCode }) {
  const selected = state.role;

  return (
    <div>
      <Eyebrow className="mb-3">Create an account</Eyebrow>
      <h2 className="font-serif text-[32px] lg:text-[38px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        How will you use <span className="italic font-light" style={{ color: '#E85F34' }}>Turnzy</span>?
      </h2>
      <p className="text-[14.5px] text-[#6B6454] mt-3 leading-relaxed">
        One answer — you can always change it later. This just sets up the right home screen for you.
      </p>

      <div className="mt-8 space-y-3">
        {OPTIONS.map(({ key, title, sub, meta, Icon }) => {
          const r = ROLE[key];
          const isSel = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setState({ ...state, role: key })}
              className={`w-full text-left p-4 rounded-[14px] border transition-all duration-150
                ${isSel ? 'bg-white' : 'bg-white/50 hover:bg-white border-[#E4DFD3] hover:border-[#CFC8B6]'}`}
              style={{
                borderColor: isSel ? r.accent : undefined,
                boxShadow: isSel ? `0 0 0 2px ${r.accent}22, 0 4px 16px -6px rgba(0,0,0,.08)` : undefined,
              }}>
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: isSel ? r.accent : '#F1EFE8', color: isSel ? '#fff' : '#6B6454' }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-[15.5px] font-bold text-[#1F1D1A] tracking-[-0.01em]">{title}</div>
                  <div className="text-[13px] text-[#6B6454] mt-0.5">{sub}</div>
                  <div className="text-[11.5px] text-[#9C9481] mt-1.5 uppercase tracking-[0.06em] font-semibold">{meta}</div>
                </div>
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center transition-all"
                  style={{
                    background: isSel ? r.accent : 'transparent',
                    borderColor: isSel ? r.accent : '#CFC8B6',
                  }}>
                  {isSel && <Check size={12} strokeWidth={4} color="white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-7">
        <PrimaryButton disabled={!selected} onClick={next}>
          Continue →
        </PrimaryButton>
      </div>

      <div className="mt-6 pt-5 border-t border-[#E4DFD3] text-center">
        <p className="text-[13px] text-[#6B6454]">
          Have a team code instead?{' '}
          <button type="button" onClick={onEnterCode} className="text-[#1F1D1A] font-semibold underline decoration-[#E85F34] decoration-2 underline-offset-4 hover:decoration-4">
            Enter code
          </button>
        </p>
      </div>
    </div>
  );
}
