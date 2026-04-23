// App entry — root component, tweaks + mobile frame wrapper.

const DEFAULT_TWEAKS = {
  entry: 'direct',      // direct | invite | teamCode
  role: 'host',         // host | cleaner | teammate
  edgeCase: 'none',
  viewport: 'desktop',
};

function App() {
  const [tweaks, setTweaks] = React.useState(() => {
    try { return { ...DEFAULT_TWEAKS, ...(JSON.parse(localStorage.getItem('turnzy_signup_tweaks') || '{}')) }; }
    catch { return DEFAULT_TWEAKS; }
  });
  const [flowKey, setFlowKey] = React.useState(0);

  React.useEffect(() => {
    localStorage.setItem('turnzy_signup_tweaks', JSON.stringify(tweaks));
  }, [tweaks]);

  // Force-remount the flow when entry/role/edgeCase change — clean reset.
  React.useEffect(() => { setFlowKey(k => k + 1); }, [tweaks.entry, tweaks.role, tweaks.edgeCase]);

  const reset = () => setFlowKey(k => k + 1);

  const isMobile = tweaks.viewport === 'mobile';

  return (
    <div className="min-h-screen w-full">
      {isMobile ? (
        <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at center, #2C2A26 0%, #0A0A09 100%)' }}>
          <div className="mobile-frame">
            <div className="w-full h-full overflow-y-auto" style={{ paddingTop: 48 }}>
              <SignupFlow key={flowKey} tweaks={{ ...tweaks, forceMobile: true }} />
            </div>
          </div>
        </div>
      ) : (
        <SignupFlow key={flowKey} tweaks={tweaks} />
      )}

      <Tweaks tweaks={tweaks} setTweaks={setTweaks} onReset={reset} />
    </div>
  );
}

// In mobile viewport, we hide the .lg breakpoints — force the mobile layout
// by adding a utility class. Tailwind's responsive doesn't know the frame width,
// so we inject a runtime override.
(function injectMobileOverride() {
  const style = document.createElement('style');
  style.textContent = `
    .mobile-frame .lg\\:grid-cols-\\[1\\.05fr_1fr\\] { grid-template-columns: 1fr !important; }
    .mobile-frame .lg\\:flex { display: none !important; }
    .mobile-frame .hidden.lg\\:flex { display: none !important; }
    .mobile-frame .lg\\:hidden { display: block !important; }
    .mobile-frame .lg\\:min-h-screen { min-height: 100% !important; }
    .mobile-frame .lg\\:p-12 { padding: 1.5rem !important; }
    .mobile-frame .lg\\:px-12 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
    .mobile-frame .lg\\:text-\\[38px\\] { font-size: 30px !important; }
    .mobile-frame .lg\\:text-\\[34px\\] { font-size: 28px !important; }
    .mobile-frame .lg\\:text-\\[32px\\] { font-size: 26px !important; }
    .mobile-frame .lg\\:mx-0 { margin-left: auto !important; margin-right: auto !important; }
  `;
  document.head.appendChild(style);
})();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
