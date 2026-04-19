import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertiesBreadcrumb } from '@/components/properties/PropertiesBreadcrumb';
import { PortfolioHero } from '@/components/properties/PortfolioHero';
import { PropertiesToolbar } from '@/components/properties/PropertiesToolbar';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { AddPropertyCard } from '@/components/properties/AddPropertyCard';
import { EditorialFooter } from '@/components/properties/EditorialFooter';
import { SAMPLE_PROPERTIES } from '@/components/properties/propertyFixtures';
import { useAuthStore } from '@/store/authStore';

// Filter predicate for each tab.
const FILTERS = {
  All:                (p) => !p.archived,
  'Needs attention':  (p) => p.flagged && !p.archived,
  Confirmed:          (p) => !p.flagged && !p.archived,
  Archived:           (p) => !!p.archived,
};

// Sort comparator for each sort option.
const SORTS = {
  'a-z':              (a, b) => a.name.localeCompare(b.name),
  'z-a':              (a, b) => b.name.localeCompare(a.name),
  'most-turnovers':   (a, b) => (b.ytdTurnovers ?? 0) - (a.ytdTurnovers ?? 0),
  'needs-attention':  (a, b) => Number(b.flagged) - Number(a.flagged),
};

export function PropertiesPortfolio() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('a-z');

  // Until the backend exposes the full Property shape (cover, nextTurnover,
  // YTD stats, default cleaner, etc.) we render fixtures — this keeps the
  // page runnable and visually accurate while the API catches up.
  const properties = SAMPLE_PROPERTIES;

  const counts = useMemo(
    () => ({
      All:                properties.filter(FILTERS.All).length,
      'Needs attention':  properties.filter(FILTERS['Needs attention']).length,
      Confirmed:          properties.filter(FILTERS.Confirmed).length,
      Archived:           properties.filter(FILTERS.Archived).length,
    }),
    [properties],
  );

  const visibleProperties = useMemo(() => {
    const predicate = FILTERS[filter] ?? FILTERS.All;
    const comparator = SORTS[sortBy] ?? SORTS['a-z'];
    return [...properties].filter(predicate).sort(comparator);
  }, [properties, filter, sortBy]);

  // Portfolio-level derived metrics for the hero.
  const hero = useMemo(() => {
    const active = properties.filter(FILTERS.All);
    const ytdTurnovers = active.reduce((a, p) => a + (p.ytdTurnovers ?? 0), 0);
    const ytdHours = active.reduce((a, p) => a + (p.ytdHours ?? 0), 0);
    const rated = active.filter((p) => p.defaultCleaner?.rate != null);
    const cleanerRating = rated.length
      ? rated.reduce((a, p) => a + p.defaultCleaner.rate, 0) / rated.length
      : 0;
    const needsAttention = active.filter((p) => p.flagged).length;
    return {
      count: active.length,
      ytdTurnovers,
      ytdHours,
      cleanerRating,
      needsAttention,
      totalProperties: active.length,
    };
  }, [properties]);

  const workspaceName = user?.workspace_name || user?.name
    ? `${user?.workspace_name ?? user?.name}${user?.workspace_name ? '' : "'s portfolio"}`
    : 'Your workspace';

  return (
    <div className="h-full overflow-y-auto bg-warm-50">
      <div className="mx-auto max-w-[1200px] px-8 pt-8 pb-20">
        <div className="mb-5">
          <PropertiesBreadcrumb />
        </div>

        <PortfolioHero
          count={hero.count}
          workspaceName={workspaceName}
          ytdTurnovers={hero.ytdTurnovers}
          ytdHours={hero.ytdHours}
          cleanerRating={hero.cleanerRating}
          needsAttention={hero.needsAttention}
          totalProperties={hero.totalProperties}
          deltaPercent={12}
        />

        <div className="mt-7 mb-4">
          <PropertiesToolbar
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onAddProperty={() => navigate('/properties/new')}
          />
        </div>

        {visibleProperties.length === 0 ? (
          <div className="py-20 text-center text-[14px] text-warm-400">
            No properties match this view.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {visibleProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
            {filter === 'All' && (
              <AddPropertyCard onClick={() => navigate('/properties/new')} />
            )}
          </div>
        )}

        <EditorialFooter />
      </div>
    </div>
  );
}
