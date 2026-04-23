import { useEffect } from 'react';
import { Calendar, Users, Mail, Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Eyebrow } from '../atoms';
import { getRole } from '../roles';

const NEXT_STEPS = {
  host: [
    { Icon: Calendar, label: 'Connect your first property calendar' },
    { Icon: Users, label: 'Invite your cleaning team' },
  ],
  cleaner: [
    { Icon: Mail, label: 'Wait for host invites — or invite one yourself' },
    { Icon: Users, label: 'Add teammates to dispatch jobs to' },
  ],
  teammate: [
    { Icon: Calendar, label: 'See your upcoming turnovers' },
    { Icon: Bell, label: 'Enable notifications for new jobs' },
  ],
};

export function StepSuccess({ state }) {
  const r = getRole(state.role);
  const steps = NEXT_STEPS[state.role] || NEXT_STEPS.host;
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      const landing = state.role === 'cleaner' ? '/cleaner'
        : state.role === 'teammate' ? '/team'
        : '/';
      navigate(landing);
    }, 2000);
    return () => clearTimeout(t);
  }, [state.role, navigate]);

  const body = {
    host: `${state.workspace || 'Your workspace'} is ready. We'll walk you through the first turnover.`,
    cleaner: `${state.business || 'Your business'} is set up. Your dashboard is empty until a host invites you — that's normal.`,
    teammate: `You've joined the crew. Your next job will show up here.`,
  }[state.role];

  return (
    <div className="text-center">
      <div
        className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: r.accent, boxShadow: `0 0 0 0 ${r.accent}55`, animation: 'turnzySuccessPulse 1.6s ease-out' }}>
        <Check size={40} strokeWidth={2.8} color="white" />
      </div>
      <style>{`@keyframes turnzySuccessPulse { 0% { box-shadow: 0 0 0 0 ${r.accent}55; } 100% { box-shadow: 0 0 0 24px ${r.accent}00; } }`}</style>

      <Eyebrow className="mb-3">You're in</Eyebrow>
      <h2 className="font-serif text-[32px] lg:text-[38px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        Welcome to <span className="italic font-light" style={{ color: r.accent }}>Turnzy</span>.
      </h2>
      <p className="text-[14.5px] text-[#6B6454] mt-3">{body}</p>

      <div className="mt-8 p-5 rounded-[14px] bg-white border border-[#E4DFD3] text-left">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9C9481] mb-3">A tour will start next</div>
        <div className="space-y-2.5">
          {steps.map(({ Icon, label }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F0E2] flex items-center justify-center flex-shrink-0" style={{ color: r.accent }}>
                <Icon size={15} strokeWidth={2} />
              </div>
              <div className="text-[13.5px] text-[#1F1D1A] font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-[11.5px] text-[#9C9481] uppercase tracking-[0.12em]">Taking you to your dashboard…</p>
    </div>
  );
}
