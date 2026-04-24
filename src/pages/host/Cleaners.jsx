import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Mail } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { propertiesApi } from '@/api/properties';
import { settingsApi } from '@/api/settings';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ToastProvider, useToast } from '@/pages/settings/components/Toast';
import { buildCleanerList } from '@/components/workspace/tokens';
import { CleanerListRow } from '@/components/workspace/CleanerListRow';
import { CoverageCard } from '@/components/workspace/CoverageCard';
import { ContactCard } from '@/components/workspace/ContactCard';
import { NotificationsCard } from '@/components/workspace/NotificationsCard';
import { DangerZoneCard } from '@/components/workspace/DangerZoneCard';
import { AddCleanerFlow } from '@/components/workspace/AddCleanerFlow';
import { PropertyRail } from '@/components/PropertyRail';

function EmptyState({ onAdd }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-[#F9F8F6]">
      <div className="w-16 h-16 rounded-full bg-coral-50 flex items-center justify-center mb-4">
        <Users size={28} className="text-coral-400" />
      </div>
      <h3 className="font-serif text-[22px] font-bold text-[#1C1C1A] mb-2">
        No cleaners yet
      </h3>
      <p className="text-[13.5px] text-[#5F5E5A] max-w-xs mb-6">
        Invite your cleaners to start coordinating turnovers automatically.
      </p>
      <Button size="md" onClick={onAdd} icon={<Plus size={14} />}>
        Add cleaner
      </Button>
    </div>
  );
}

function Placeholder({ label }) {
  return (
    <div className="h-full hidden lg:flex items-center justify-center text-[14px] text-[#888780] bg-[#F9F8F6]">
      {label}
    </div>
  );
}

function CleanerDetailHeader({ cleaner, onResend, resending }) {
  const isActive = cleaner.userId && cleaner.confirmed;

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar name={cleaner.name || cleaner.email} size="lg" />
        <Eyebrow>Cleaner</Eyebrow>
      </div>
      <h1
        className="font-inter text-[#1C1C1A] leading-[1.1]"
        style={{ fontSize: 'clamp(24px, 3.4vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em' }}
      >
        {cleaner.name || cleaner.email}
      </h1>
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#5F5E5A]">
        <Pill size="sm" tone={isActive ? 'confirmed' : 'pending'} dot>
          {isActive ? 'Active' : 'Invite sent'}
        </Pill>
        {cleaner.email && (
          <span className="inline-flex items-center gap-1.5">
            <Mail size={12} className="text-[#888780]" />
            {cleaner.email}
          </span>
        )}
        {!isActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResend}
            loading={resending}
          >
            Resend invite
          </Button>
        )}
      </div>
    </header>
  );
}

function CleanerDetail({ cleaner, allProperties, onBack, onAfterRemoveAll, isMobile }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  }

  async function run(key, fn, successMsg) {
    setSaving(key);
    try {
      await fn();
      if (successMsg) toast(successMsg);
      refresh();
    } catch (e) {
      toast(e?.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(null);
    }
  }

  // Propagate a name change across every property the cleaner is assigned
  // to. No dedicated rename endpoint — we fan out the per-property update.
  async function renameAllProperties(newName) {
    await run(
      'rename',
      async () => {
        for (const p of cleaner.properties) {
          if (p.role === 'primary') {
            await settingsApi.updateCleaner({
              property_id: p.id,
              name: newName,
              email: cleaner.email,
              notification_method: 'email',
              role: 'primary',
            });
          } else {
            await settingsApi.saveBackupCleaner({
              property_id: p.id,
              name: newName,
              email: cleaner.email,
              notification_method: 'email',
            });
          }
        }
      },
      'Name updated',
    );
  }

  async function resend() {
    if (!cleaner.properties.length) return;
    await run(
      'resend',
      () => settingsApi.resendInvite(cleaner.properties[0].id),
      'Invite resent',
    );
  }

  async function removeFromProperty(propertyId, role) {
    await run(
      `remove-${propertyId}`,
      () => settingsApi.deleteCleaner(propertyId, role),
      'Removed from property',
    );
  }

  async function addToProperty(propertyId, role) {
    if (role === 'primary') {
      await run(
        'add',
        () =>
          settingsApi.updateCleaner({
            property_id: propertyId,
            name: cleaner.name,
            email: cleaner.email,
            notification_method: 'email',
            role: 'primary',
          }),
        'Assigned to property',
      );
    } else {
      await run(
        'add',
        () =>
          settingsApi.saveBackupCleaner({
            property_id: propertyId,
            name: cleaner.name,
            email: cleaner.email,
            notification_method: 'email',
          }),
        'Assigned as backup',
      );
    }
  }

  async function removeAll() {
    await run(
      'remove-all',
      async () => {
        for (const p of cleaner.properties) {
          await settingsApi.deleteCleaner(p.id, p.role);
        }
      },
      'Cleaner removed',
    );
    onAfterRemoveAll?.();
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F9F8F6]">
      <div className="max-w-[960px] mx-auto px-6 lg:px-8 pt-6 lg:pt-8 pb-20">
        {isMobile && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5F5E5A] hover:text-[#1C1C1A] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to cleaners
          </button>
        )}
        <CleanerDetailHeader
          cleaner={cleaner}
          onResend={resend}
          resending={saving === 'resend'}
        />
        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] gap-6 lg:gap-7">
          <div className="flex flex-col gap-5">
            <CoverageCard
              cleaner={cleaner}
              allProperties={allProperties}
              saving={saving}
              onRemove={removeFromProperty}
              onAdd={addToProperty}
            />
            <NotificationsCard />
          </div>
          <div className="flex flex-col gap-5">
            <ContactCard
              cleaner={cleaner}
              onRenameAllProperties={renameAllProperties}
              saving={saving === 'rename'}
            />
            <DangerZoneCard
              title="Remove cleaner"
              description={`Removes ${cleaner.name || 'this cleaner'} from every property they cover. Upcoming confirmed bookings revert to Needs Action.`}
              buttonLabel="Remove cleaner"
              modalTitle={`Remove ${cleaner.name || cleaner.email}?`}
              modalBody={`This removes them from ${cleaner.properties.length} ${
                cleaner.properties.length === 1 ? 'property' : 'properties'
              }. Any upcoming accepted bookings will revert to Needs Action and they'll be notified.`}
              onConfirm={removeAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CleanersPage() {
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedKey, setSelectedKey] = useState(null);
  const [adding, setAdding] = useState(searchParams.get('new') === '1');

  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });
  const properties = data?.data?.properties || data?.data || [];

  const cleaners = useMemo(() => {
    const list = buildCleanerList(properties);
    return list.sort((a, b) =>
      (a.name || a.email).localeCompare(b.name || b.email),
    );
  }, [properties]);

  const selected = cleaners.find((c) => c.key === selectedKey);

  useEffect(() => {
    if (isDesktop && !adding && !selectedKey && cleaners.length > 0) {
      setSelectedKey(cleaners[0].key);
    }
  }, [isDesktop, adding, selectedKey, cleaners]);

  // Drop the ?new=1 query param once we've opened the flow.
  useEffect(() => {
    if (adding && searchParams.get('new')) {
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [adding, searchParams, setSearchParams]);

  function handleSelect(key) {
    setAdding(false);
    setSelectedKey(key);
  }

  function handleOpenAdd() {
    setAdding(true);
    setSelectedKey(null);
  }

  function handleAddSuccess({ email }) {
    setAdding(false);
    setSelectedKey(email?.toLowerCase() || null);
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  }

  if (isLoading) {
    return <div className="p-6 text-[13px] text-[#888780]">Loading cleaners…</div>;
  }

  // Empty state: no cleaners AND the host isn't in add mode.
  if (cleaners.length === 0 && !adding) {
    return <EmptyState onAdd={handleOpenAdd} />;
  }

  const innerPane = adding ? (
    <AddCleanerFlow
      properties={properties}
      onCancel={() => setAdding(false)}
      onSuccess={handleAddSuccess}
      onGoToProperties={() => navigate('/properties')}
    />
  ) : selected ? (
    <CleanerDetail
      key={selected.key}
      cleaner={selected}
      allProperties={properties}
      isMobile={!isDesktop}
      onBack={() => setSelectedKey(null)}
      onAfterRemoveAll={() => setSelectedKey(null)}
    />
  ) : null;

  const rightPane = innerPane ? (
    <>
      <div
        className="overflow-hidden"
        style={isDesktop ? { flex: '0 1 960px', minWidth: 0 } : { flex: 1, minWidth: 0 }}
      >
        {innerPane}
      </div>
      {isDesktop && <PropertyRail />}
    </>
  ) : (
    isDesktop && <PropertyRail />
  );

  const rightPaneOpen = adding || selected;

  return (
    <div className="h-full flex overflow-hidden">
      <aside
        className={`flex-col bg-white border-r border-[#EDEAE0] ${
          rightPaneOpen && !isDesktop ? 'hidden' : 'flex'
        } w-full lg:w-[340px] lg:flex-shrink-0`}
      >
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-[18px] font-extrabold text-[#1C1C1A] tracking-[-0.2px]">
            Cleaners
          </h2>
          <div className="mt-0.5 text-[12px] text-[#888780]">
            {cleaners.length} {cleaners.length === 1 ? 'cleaner' : 'cleaners'} across{' '}
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {cleaners.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-[#888780]">
              No cleaners yet.
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {cleaners.map((c) => (
                <li key={c.key}>
                  <CleanerListRow
                    cleaner={c}
                    propertyIndex={(id) => properties.findIndex((p) => p.id === id)}
                    active={!adding && selectedKey === c.key}
                    onClick={() => handleSelect(c.key)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-3 border-t border-[#EDEAE0]">
          <Button
            variant="outline"
            size="md"
            fullWidth
            icon={<Plus size={14} />}
            onClick={handleOpenAdd}
          >
            Add cleaner
          </Button>
        </div>
      </aside>

      <main
        className={`flex-1 min-w-0 overflow-hidden flex bg-[#F9F8F6] ${
          !rightPaneOpen && !isDesktop ? 'hidden' : ''
        }`}
      >
        {rightPane}
      </main>
    </div>
  );
}

export function Cleaners() {
  return (
    <ToastProvider>
      <CleanersPage />
    </ToastProvider>
  );
}
