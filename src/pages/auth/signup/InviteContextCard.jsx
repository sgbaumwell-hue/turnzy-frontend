import { Home } from 'lucide-react';
import { getRole } from './roles';

export function InviteContextCard({ role, invite }) {
  const r = getRole(role);
  const firstName = invite.inviter?.name?.split(' ')[0] || 'Your team';
  const propertyCount = invite.property_ids?.length || 0;
  const properties = invite.properties || [];

  return (
    <div className="relative z-10 max-w-md">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: r.accent }}>
        — You were invited
      </div>
      <h1 className="font-serif text-[36px] xl:text-[44px] leading-[1.05] tracking-[-0.025em] font-black text-white">
        <span className="italic font-light" style={{ color: r.accent }}>{firstName}</span><br />
        wants you on<br />
        {invite.workspace?.name || invite.workspaceName || 'the team'}.
      </h1>

      <div className="mt-7 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] text-white"
            style={{ background: `linear-gradient(135deg, ${r.accent}, ${r.accent2})` }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-white">{invite.inviter?.name}</div>
            <div className="text-[12px] text-white/50">{invite.inviter?.role_label || invite.inviter?.role}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-[10.5px] uppercase tracking-[0.14em] font-bold text-white/40 mb-2">You'll be added as</div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold text-white"
              style={{ background: `${r.accent}22`, boxShadow: `inset 0 0 0 1px ${r.accent}55` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.accent }} />
              {invite.role_label || invite.roleLabel || r.label}
            </div>
            {propertyCount > 0 && (
              <div className="text-[12px] text-white/50">· {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}</div>
            )}
          </div>
          {properties.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {properties.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/70">
                  <Home size={12} className="text-white/30" />
                  {typeof p === 'string' ? p : p.name}
                </div>
              ))}
              {properties.length > 3 && (
                <div className="text-[11.5px] text-white/40 pl-5">+{properties.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-[13.5px] leading-relaxed text-white/55 max-w-sm">
        {r.tagline}
      </p>
    </div>
  );
}
