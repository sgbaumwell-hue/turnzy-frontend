import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Send, CheckCircle, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Input } from '@/components/shadcn/input';
import { Avatar } from '@/components/ui/Avatar';
import { settingsApi } from '@/api/settings';
import client from '@/api/client';
import { useToast } from '@/pages/settings/components/Toast';
import { RoleSegmented } from './RoleSegmented';
import { ReplaceConfirmModal } from './ReplaceConfirmModal';
import { propColor } from './tokens';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Inline 2-step flow for adding a cleaner. Step 1 captures name+email with
// a live "already a Turnzy user" check. Step 2 lets the host assign the new
// cleaner across properties with per-row role (None / Backup / Primary).
//
// Replacing an existing primary requires explicit confirmation via
// ReplaceConfirmModal — the host chooses per affected property whether to
// demote the current primary to backup or remove them.
export function AddCleanerFlow({ properties, onCancel, onSuccess, onGoToProperties }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState(null); // null | 'existing' | 'new'
  const [emailError, setEmailError] = useState('');
  const [roles, setRoles] = useState({}); // { [propertyId]: 'none' | 'backup' | 'primary' }
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasOneProperty = properties.length === 1;
  const sortedProperties = useMemo(
    () => [...properties].sort((a, b) => a.name.localeCompare(b.name)),
    [properties],
  );

  // When jumping straight from step 1 → submit (single-property case), the
  // single property defaults to primary if open, else backup.
  useEffect(() => {
    if (hasOneProperty && !roles[properties[0].id]) {
      const p = properties[0];
      setRoles({ [p.id]: p.cleaner_name || p.cleaner_email ? 'backup' : 'primary' });
    }
  }, [hasOneProperty, properties, roles]);

  if (properties.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-[#F9F8F6]">
        <div className="w-16 h-16 rounded-full bg-coral-50 flex items-center justify-center mb-4">
          <HomeIcon size={28} className="text-coral-400" />
        </div>
        <h3 className="font-serif text-[22px] font-bold text-[#1C1C1A] mb-2">
          Add a property first
        </h3>
        <p className="text-[13.5px] text-[#5F5E5A] max-w-xs mb-6">
          Cleaners are always tied to at least one property. Create one first, then invite a cleaner to cover it.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={onCancel}>Cancel</Button>
          <Button size="md" onClick={onGoToProperties}>Go to Properties →</Button>
        </div>
      </div>
    );
  }

  function validateEmail() {
    if (!email) return false;
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  }

  async function checkEmail() {
    const e = email.trim().toLowerCase();
    if (!e || !EMAIL_REGEX.test(e)) return;
    try {
      const res = await client.get(`/auth/check-email?email=${encodeURIComponent(e)}`);
      setEmailStatus(res.data?.exists ? 'existing' : 'new');
    } catch {
      setEmailStatus(null);
    }
  }

  function selectedCount() {
    return Object.values(roles).filter((r) => r && r !== 'none').length;
  }

  function findConflicts() {
    const out = [];
    for (const p of sortedProperties) {
      const role = roles[p.id];
      if (role !== 'primary') continue;
      if (p.cleaner_name || p.cleaner_email) {
        out.push({
          propertyId: p.id,
          propertyName: p.name,
          currentPrimary: { name: p.cleaner_name, email: p.cleaner_email },
          backupFull: !!(p.backup_cleaner_name || p.backup_cleaner_email),
        });
      }
    }
    return out;
  }

  async function executeAssignments(decisions = {}) {
    setLoading(true);
    try {
      for (const p of sortedProperties) {
        const role = roles[p.id];
        if (!role || role === 'none') continue;
        const hasPrimary = !!(p.cleaner_name || p.cleaner_email);

        if (role === 'backup') {
          await settingsApi.saveBackupCleaner({
            property_id: p.id,
            name,
            email,
            notification_method: 'email',
          });
        } else if (role === 'primary' && !hasPrimary) {
          await settingsApi.updateCleaner({
            property_id: p.id,
            name,
            email,
            notification_method: 'email',
            role: 'primary',
          });
        } else if (role === 'primary' && hasPrimary) {
          // Need a decision for this property — should be in `decisions`.
          const decision = decisions[p.id] || 'remove';
          if (decision === 'demote') {
            // Move current primary into (empty) backup slot, then set new primary.
            await settingsApi.swapCleaners(p.id);
            await settingsApi.updateCleaner({
              property_id: p.id,
              name,
              email,
              notification_method: 'email',
              role: 'primary',
            });
          } else {
            // Remove: drop old primary, install new.
            await settingsApi.deleteCleaner(p.id, 'primary');
            await settingsApi.updateCleaner({
              property_id: p.id,
              name,
              email,
              notification_method: 'email',
              role: 'primary',
            });
          }
        }
      }
      toast(`Invite sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onSuccess?.({ name, email });
    } catch (e) {
      toast(e?.response?.data?.error || 'Failed to send invite', 'error');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  async function handleSend() {
    if (!validateEmail()) return;
    if (selectedCount() === 0) {
      toast('Select at least one property to cover.', 'error');
      return;
    }
    const conflicts = findConflicts();
    if (conflicts.length > 0) {
      setConfirmOpen(true);
    } else {
      await executeAssignments();
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F9F8F6]">
      <div className="max-w-[720px] mx-auto px-6 lg:px-8 pt-8 pb-20">
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5F5E5A] hover:text-[#1C1C1A] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to cleaners
        </button>

        <Eyebrow>
          {hasOneProperty ? 'Step 1 of 1' : `Step ${step} of 2`}
        </Eyebrow>

        {step === 1 ? (
          <>
            <h1
              className="mt-2 font-serif font-bold text-[#1C1C1A] leading-[1.1] tracking-[-0.4px]"
              style={{ fontSize: 'clamp(24px, 3.4vw, 34px)' }}
            >
              Invite a cleaner
            </h1>
            <p className="mt-2 text-[13.5px] text-[#5F5E5A] max-w-[520px]">
              We&apos;ll send them an invite email. If they already have a Turnzy account, they&apos;ll just connect.
            </p>

            <div className="mt-6 max-w-[560px] rounded-[14px] border border-[#EDEAE0] bg-white p-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
                  Name
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marisol Reyes"
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#888780]">
                  Email
                </span>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailStatus(null);
                    setEmailError('');
                  }}
                  onBlur={() => {
                    if (validateEmail()) checkEmail();
                  }}
                  placeholder="cleaner@example.com"
                  type="email"
                />
                {emailError && (
                  <div className="text-[12px] text-[#A32D2D]">{emailError}</div>
                )}
                {emailStatus === 'existing' && (
                  <div className="rounded-[8px] border border-[#C0DD97] bg-[#EAF3DE] px-2.5 py-1.5 text-[12px] text-[#27500A] inline-flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    {email} already has a Turnzy account — they&apos;ll just connect.
                  </div>
                )}
                {emailStatus === 'new' && (
                  <div className="text-[12px] text-[#888780]">
                    We&apos;ll send an invite email to {email}.
                  </div>
                )}
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 max-w-[560px]">
              <Button variant="ghost" size="md" onClick={onCancel}>Cancel</Button>
              <Button
                size="md"
                disabled={!name.trim() || !email.trim()}
                onClick={() => {
                  if (!validateEmail()) return;
                  if (hasOneProperty) {
                    handleSend();
                  } else {
                    setStep(2);
                  }
                }}
                loading={loading && hasOneProperty}
                icon={hasOneProperty ? <Send size={13} /> : undefined}
              >
                {hasOneProperty ? 'Send invite' : (
                  <>Choose properties <ArrowRight size={13} /></>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1
              className="mt-2 font-serif font-bold text-[#1C1C1A] leading-[1.1] tracking-[-0.4px]"
              style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}
            >
              Which properties will {name || 'they'} cover?
            </h1>
            <p className="mt-2 text-[13.5px] text-[#5F5E5A]">
              Pick a role per property. Primary = gets the offer first. Backup = steps in if primary declines.
            </p>

            <div className="mt-6 rounded-[14px] border border-[#EDEAE0] bg-white overflow-hidden">
              <ul className="divide-y divide-[#EDEAE0]">
                {sortedProperties.map((p, i) => {
                  const idx = properties.findIndex((x) => x.id === p.id);
                  const role = roles[p.id] || 'none';
                  const hasPrimary = !!(p.cleaner_name || p.cleaner_email);
                  const hasBackup = !!(p.backup_cleaner_name || p.backup_cleaner_email);
                  const selected = role !== 'none';
                  const primaryReplace = role === 'primary' && hasPrimary;
                  const backupReplace = role === 'backup' && hasBackup;

                  return (
                    <li
                      key={p.id}
                      className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
                        selected ? 'bg-coral-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          aria-hidden="true"
                          className="flex-shrink-0 rounded-full"
                          style={{ width: 4, height: 28, background: propColor(idx) }}
                        />
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#1C1C1A] truncate">
                            {p.name}
                          </div>
                          <div className="mt-0.5 text-[11.5px] text-[#888780]">
                            Primary:{' '}
                            <span className="text-[#5F5E5A]">
                              {p.cleaner_name || p.cleaner_email || 'No primary'}
                            </span>
                            <span className="mx-1">·</span>
                            Backup:{' '}
                            <span className="text-[#5F5E5A]">
                              {p.backup_cleaner_name || p.backup_cleaner_email || 'No backup'}
                            </span>
                          </div>
                          {(primaryReplace || backupReplace) && (
                            <div className="mt-1 text-[11.5px] text-[#854F0B] inline-flex items-center gap-1">
                              ↯ Replaces{' '}
                              {primaryReplace
                                ? p.cleaner_name || p.cleaner_email
                                : p.backup_cleaner_name || p.backup_cleaner_email}
                              {primaryReplace && ' (primary)'}
                              {backupReplace && ' (backup)'}
                            </div>
                          )}
                        </div>
                      </div>
                      <RoleSegmented
                        value={role}
                        onChange={(next) => setRoles((r) => ({ ...r, [p.id]: next }))}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="ghost" size="md" onClick={() => setStep(1)} icon={<ArrowLeft size={13} />}>
                Back
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#888780]">
                  {selectedCount()} {selectedCount() === 1 ? 'property' : 'properties'} selected
                </span>
                <Button
                  size="md"
                  disabled={selectedCount() === 0}
                  loading={loading}
                  onClick={handleSend}
                  icon={<Send size={13} />}
                >
                  Send invite
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ReplaceConfirmModal
        open={confirmOpen}
        conflicts={findConflicts()}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeAssignments}
        loading={loading}
      />
    </div>
  );
}
