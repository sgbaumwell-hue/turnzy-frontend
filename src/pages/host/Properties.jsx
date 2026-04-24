import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Check, X, Search, Home as HomeIcon, Globe } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/shadcn/input';
import { propertiesApi } from '@/api/properties';
import { settingsApi } from '@/api/settings';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ToastProvider, useToast } from '@/pages/settings/components/Toast';
import {
  propColor,
  calStatus,
  formatTz,
  propertyNeedsAction,
} from '@/components/workspace/tokens';
import { PropertyListRow } from '@/components/workspace/PropertyListRow';
import { CalendarSection } from '@/components/workspace/CalendarSection';
import { ScheduleSection } from '@/components/workspace/ScheduleSection';
import { PlatformTimezoneSection } from '@/components/workspace/PlatformTimezoneSection';
import { CleaningTeamSection } from '@/components/workspace/CleaningTeamSection';
import { DangerZoneCard } from '@/components/workspace/DangerZoneCard';
import { CleanerPicker } from '@/components/workspace/CleanerPicker';
import { AddPropertyModal } from '@/components/workspace/AddPropertyModal';
import { PropertyRail } from '@/components/PropertyRail';

function EmptyState({ onAdd }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-[#F9F8F6]">
      <div className="w-16 h-16 rounded-full bg-coral-50 flex items-center justify-center mb-4">
        <HomeIcon size={28} className="text-coral-400" />
      </div>
      <h3 className="font-serif text-[22px] font-bold text-[#1C1C1A] mb-2">
        No properties yet
      </h3>
      <p className="text-[13.5px] text-[#5F5E5A] max-w-xs mb-6">
        Add your first property to start coordinating turnovers.
      </p>
      <Button size="md" onClick={onAdd} icon={<Plus size={14} />}>
        Add property
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

function PropertyDetailHeader({ property, index, onRename, saving }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(property.name);
  const cal = calStatus(property.ical_url);
  const color = propColor(index);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === property.name) {
      setEditing(false);
      setName(property.name);
      return;
    }
    await onRename(trimmed);
    setEditing(false);
  }

  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
        />
        <Eyebrow>Property</Eyebrow>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Escape') { setEditing(false); setName(property.name); }
            }}
            className="h-10 text-[24px] font-bold"
          />
          <Button size="sm" onClick={submit} loading={saving} icon={<Check size={13} />}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(property.name); }}>
            <X size={13} />
          </Button>
        </div>
      ) : (
        <h1
          className="font-inter text-[#1C1C1A] leading-[1.1]"
          style={{ fontSize: 'clamp(26px, 3.6vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em' }}
        >
          {property.name}
        </h1>
      )}
      {!editing && (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#888780]">
          <Pill size="sm" tone="neutral">{property.platform || 'Other'}</Pill>
          <Pill size="sm" tone={cal.tone} dot>
            {cal.label}
          </Pill>
          {property.timezone && (
            <span className="inline-flex items-center gap-1">
              <Globe size={12} />
              {formatTz(property.timezone)}
            </span>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5F5E5A] hover:text-[#1C1C1A] transition-colors"
          >
            <Pencil size={11} />
            Edit name
          </button>
        </div>
      )}
    </header>
  );
}

function PropertyDetail({ property, index, allProperties, onBack, isMobile }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);
  const [pickerFor, setPickerFor] = useState(null); // 'primary' | 'backup' | null

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
            Back to properties
          </button>
        )}
        <PropertyDetailHeader
          property={property}
          index={index}
          saving={saving === 'name'}
          onRename={(newName) =>
            run('name', () => settingsApi.updatePropertyName(property.id, newName), 'Name updated')
          }
        />

        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-6 lg:gap-7">
          <div className="flex flex-col gap-5">
            <CalendarSection
              property={property}
              saving={saving === 'ical'}
              onSave={(url) =>
                run('ical', () => settingsApi.updateIcal(property.id, url), 'Calendar connected')
              }
              onDisconnect={() =>
                run('ical', () => settingsApi.disconnectIcal(property.id), 'Calendar disconnected')
              }
            />
            <ScheduleSection
              property={property}
              onSave={(co, ci) =>
                run('times', () => settingsApi.updatePropertyTimes(property.id, co, ci), 'Times saved')
              }
            />
            <PlatformTimezoneSection
              property={property}
              onSavePlatform={(p) =>
                run('platform', () => settingsApi.updatePropertyPlatform(property.id, p), 'Platform updated')
              }
              onSaveTimezone={(tz) =>
                run('tz', () => settingsApi.updatePropertyTimezone(property.id, tz), 'Timezone updated')
              }
            />
          </div>

          <div className="flex flex-col gap-5">
            <CleaningTeamSection
              property={property}
              saving={saving}
              onAssignPrimary={() => setPickerFor('primary')}
              onAssignBackup={() => setPickerFor('backup')}
              onRemove={(role) =>
                run(`remove-${role}`, () => settingsApi.deleteCleaner(property.id, role), 'Cleaner removed')
              }
              onPromote={() =>
                run('promote', () => settingsApi.swapCleaners(property.id), 'Roles swapped')
              }
            />
            <DangerZoneCard
              title="Delete property"
              description="Removes this property, its calendar connection, and its cleaner assignments."
              buttonLabel="Delete property"
              modalTitle={`Delete ${property.name}?`}
              modalBody="This removes the property and cancels any pending invites. Upcoming confirmed bookings will be lost."
              typeToConfirm={property.name}
              onConfirm={async () => {
                // No dedicated delete endpoint yet — disconnect calendar + clear cleaners
                // as a best-effort soft-delete placeholder. When the backend adds a real
                // delete endpoint, swap this out.
                await settingsApi.disconnectIcal(property.id).catch(() => {});
                toast('Delete endpoint not yet wired; please contact support to remove this property.', 'error');
              }}
            />
          </div>
        </div>
      </div>
      <CleanerPicker
        open={!!pickerFor}
        onClose={() => setPickerFor(null)}
        properties={allProperties}
        excludeKeys={[
          property.cleaner_email && property.cleaner_email.toLowerCase(),
          property.backup_cleaner_email && property.backup_cleaner_email.toLowerCase(),
        ].filter(Boolean)}
        onPick={async (cleaner) => {
          const isPrimary = pickerFor === 'primary';
          setPickerFor(null);
          if (isPrimary) {
            await run(
              'assign-primary',
              () =>
                settingsApi.updateCleaner({
                  property_id: property.id,
                  name: cleaner.name || '',
                  email: cleaner.email || '',
                  notification_method: 'email',
                  role: 'primary',
                }),
              'Cleaner assigned',
            );
          } else {
            await run(
              'assign-backup',
              () =>
                settingsApi.saveBackupCleaner({
                  property_id: property.id,
                  name: cleaner.name || '',
                  email: cleaner.email || '',
                  notification_method: 'email',
                }),
              'Backup assigned',
            );
          }
        }}
        onInviteNew={() => {
          setPickerFor(null);
          window.location.href = '/cleaners?new=1';
        }}
      />
    </div>
  );
}

export function PropertiesPage() {
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });
  const rawProperties = data?.data?.properties || data?.data || [];

  // Alphabetical sort — stable across renders; preserves index for color
  // palette purposes.
  const properties = useMemo(
    () => [...rawProperties].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [rawProperties],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.platform || '').toLowerCase().includes(q) ||
      (p.cleaner_name || '').toLowerCase().includes(q),
    );
  }, [properties, query]);

  const selected = properties.find((p) => p.id === selectedId);
  const selectedIndex = properties.findIndex((p) => p.id === selectedId);

  // Auto-select the first property on desktop so the detail pane isn't
  // empty. Mobile stays on the list until the user taps in.
  useEffect(() => {
    if (isDesktop && !selectedId && properties.length > 0) {
      setSelectedId(properties[0].id);
    }
  }, [isDesktop, properties, selectedId]);

  async function handleCreate({ name, platform }) {
    const res = await settingsApi.createProperty({ name, platform });
    const newId = res?.data?.property?.id || res?.data?.id;
    await queryClient.invalidateQueries({ queryKey: ['properties'] });
    if (newId) setSelectedId(newId);
    setAddOpen(false);
  }

  if (isLoading) {
    return <div className="p-6 text-[13px] text-[#888780]">Loading properties…</div>;
  }

  if (properties.length === 0) {
    return (
      <>
        <EmptyState onAdd={() => setAddOpen(true)} />
        <AddPropertyModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreate={handleCreate}
        />
      </>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* List pane */}
      <aside
        className={`flex-col bg-white border-r border-[#EDEAE0] ${
          selected && !isDesktop ? 'hidden' : 'flex'
        } w-full lg:w-[340px] lg:flex-shrink-0`}
      >
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-[18px] font-extrabold text-[#1C1C1A] tracking-[-0.2px]">
            Properties
          </h2>
          <div className="mt-0.5 text-[12px] text-[#888780]">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </div>
        </div>
        {properties.length > 4 && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#D3D1C7] bg-white focus-within:border-coral-400 focus-within:ring-2 focus-within:ring-coral-400/20">
              <Search size={13} className="text-[#888780]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search properties…"
                className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-[#1C1C1A] placeholder:text-[#888780]"
              />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-[#888780]">
              No matches.
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filtered.map((p) => {
                const idx = properties.findIndex((x) => x.id === p.id);
                return (
                  <li key={p.id}>
                    <PropertyListRow
                      property={p}
                      index={idx}
                      active={selectedId === p.id}
                      onClick={() => setSelectedId(p.id)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="p-3 border-t border-[#EDEAE0]">
          <Button
            variant="outline"
            size="md"
            fullWidth
            icon={<Plus size={14} />}
            onClick={() => setAddOpen(true)}
          >
            Add property
          </Button>
        </div>
      </aside>

      {/* Detail pane */}
      <main
        className={`flex-1 min-w-0 overflow-hidden flex bg-[#F9F8F6] ${
          !selected && !isDesktop ? 'hidden' : ''
        }`}
      >
        {selected ? (
          <>
            <div className="flex-1 min-w-0 overflow-hidden" style={{ maxWidth: isDesktop ? 760 : '100%' }}>
              <PropertyDetail
                key={selected.id}
                property={selected}
                index={selectedIndex}
                allProperties={rawProperties}
                isMobile={!isDesktop}
                onBack={() => setSelectedId(null)}
              />
            </div>
            {isDesktop && <PropertyRail />}
          </>
        ) : (
          isDesktop && <PropertyRail />
        )}
      </main>

      <AddPropertyModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

// Route-level wrapper: the Properties page needs its own toast context.
export function Properties() {
  return (
    <ToastProvider>
      <PropertiesPage />
    </ToastProvider>
  );
}
