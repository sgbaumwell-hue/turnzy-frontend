import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Eyebrow, PrimaryButton } from '../atoms';

export function StepInviteExpired({ token }) {
  const [requesting, setRequesting] = useState(false);
  const [sent, setSent] = useState(false);

  async function requestNew() {
    setRequesting(true);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
      await fetch(`${BACKEND_URL}/api/invites/${encodeURIComponent(token)}/resend`, { method: 'POST' });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#F1EFE8] text-[#6B6454]">
        <Clock size={36} strokeWidth={1.8} />
      </div>

      <Eyebrow className="mb-3">Invite expired</Eyebrow>
      <h2 className="font-serif text-[30px] lg:text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">
        This link has <span className="italic font-light" style={{ color: '#C84437' }}>lapsed</span>.
      </h2>
      <p className="text-[14.5px] text-[#6B6454] mt-3 leading-relaxed">
        For security, invite links expire after a few days. Ask for a fresh one — or sign in if you already accepted.
      </p>

      <div className="mt-8 space-y-3">
        {sent ? (
          <div className="h-12 inline-flex items-center justify-center gap-2 w-full rounded-[12px] bg-[#EAF3DE] text-[#27500A] text-[14px] font-semibold">
            We let them know. You'll get a new link by email.
          </div>
        ) : (
          <PrimaryButton onClick={requestNew} loading={requesting}>
            Request a new link
          </PrimaryButton>
        )}
        <a href="/login" className="h-12 inline-flex items-center justify-center w-full rounded-[12px] border border-[#E4DFD3] bg-white text-[#2C2A26] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150">
          Sign in instead
        </a>
      </div>
    </div>
  );
}
