import { Sparkles } from 'lucide-react';

// Soft editorial closer for the Properties page — part of Turnzy's voice.
export function EditorialFooter() {
  return (
    <div
      className="mt-16 pt-10 mx-auto max-w-[620px] text-center border-t"
      style={{ borderColor: '#EDE7D7' }}
    >
      <Sparkles size={16} className="mx-auto mb-3 text-coral-400" />
      <p className="font-serif italic text-[15px] leading-relaxed text-warm-600">
        The calm before every check-in is the work of a hundred small handoffs,
        done right.
      </p>
      <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-warm-400">
        Turnzy Field Notes
      </div>
    </div>
  );
}
