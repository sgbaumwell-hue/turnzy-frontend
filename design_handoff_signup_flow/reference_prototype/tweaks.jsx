// Tweaks — floating control panel that switches between flow variants.

function Tweaks({ tweaks, setTweaks, onReset }) {
  const [open, setOpen] = React.useState(true);
  const set = k => v => setTweaks(t => ({ ...t, [k]: v }));

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 h-11 px-4 rounded-full bg-[#1F1D1A] text-white text-[12.5px] font-semibold shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] hover:bg-[#2C2A26] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Tweaks
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[280px] rounded-2xl bg-[#1F1D1A] text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E85F34]" />
              <div className="text-[12px] font-bold uppercase tracking-[0.12em]">Tweaks</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white p-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <TweakSelect label="Entry point" value={tweaks.entry} onChange={set('entry')}
              options={[
                ['direct',   'Direct — visited /signup'],
                ['invite',   'Invite link'],
                ['teamCode', 'Team code'],
              ]} />

            <TweakSelect label="Role" value={tweaks.role} onChange={set('role')}
              options={[
                ['host',     'Host'],
                ['cleaner',  'Cleaner (owner)'],
                ['teammate', 'Teammate'],
              ]} />

            <TweakSelect label="Edge case" value={tweaks.edgeCase} onChange={set('edgeCase')}
              options={[
                ['none',            'None — happy path'],
                ['existingAccount', 'Email already exists'],
                ['emailMismatch',   'Invite email mismatch'],
                ['expired',         'Invite link expired'],
                ['badCode',         'Bad team code'],
              ]} />

            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50 mb-2">Viewport</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[['desktop', 'Desktop'], ['mobile', 'Mobile']].map(([k, l]) => (
                  <button key={k} onClick={() => set('viewport')(k)}
                    className={`h-8 rounded-md text-[12px] font-semibold transition-colors ${tweaks.viewport === k ? 'bg-[#E85F34] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={onReset} className="w-full h-9 rounded-lg bg-white/5 hover:bg-white/10 text-[12px] font-semibold text-white/70 flex items-center justify-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L22 9"/><path d="M22 3v6h-6"/><path d="M22 12a9 9 0 0 1-15 6.7L2 15"/><path d="M2 21v-6h6"/></svg>
              Reset flow
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function TweakSelect({ label, value, onChange, options }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50 mb-2">{label}</div>
      <div className="space-y-1">
        {options.map(([k, l]) => (
          <button key={k} onClick={() => onChange(k)}
            className={`w-full text-left px-3 h-8 rounded-md text-[12.5px] transition-colors flex items-center justify-between ${value === k ? 'bg-[#E85F34] text-white font-semibold' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
            <span>{l}</span>
            {value === k && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Tweaks });
