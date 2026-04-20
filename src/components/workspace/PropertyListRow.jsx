import clsx from 'clsx';
import { propColor, propertyNeedsAction } from './tokens';

// Row used in the Properties list pane. Structure:
//   [4px accent bar] [name / secondary] [needs-action dot]
// Selected row flips to white-on-warm with an inset ring; hover rows fade
// in a warm surface.
export function PropertyListRow({ property, index, active, onClick }) {
  const color = propColor(index);
  const needsAction = propertyNeedsAction(property);

  // Secondary line: "Airbnb · Marisol Reyes"; falls back to italics when
  // either slot is empty.
  let secondary;
  if (!property.ical_url) {
    secondary = <em className="text-[#B07510] not-italic font-semibold">No calendar</em>;
  } else if (!property.cleaner_name && !property.cleaner_email) {
    secondary = (
      <>
        <span>{property.platform || 'Other'}</span>
        <span className="mx-1 text-[#B8B7B0]">·</span>
        <em className="text-[#B07510] not-italic font-semibold">No cleaner</em>
      </>
    );
  } else {
    secondary = (
      <>
        <span>{property.platform || 'Other'}</span>
        <span className="mx-1 text-[#B8B7B0]">·</span>
        <span className="truncate">{property.cleaner_name || property.cleaner_email}</span>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group relative flex w-full items-center gap-3 px-3 py-2.5 text-left rounded-[10px] transition-colors duration-100',
        active
          ? 'bg-white shadow-[inset_0_0_0_1px_#EDEAE0,0_1px_0_rgba(0,0,0,0.02)]'
          : 'hover:bg-[#F1EFE8]',
      )}
    >
      <span
        aria-hidden="true"
        className="flex-shrink-0 rounded-full"
        style={{ width: 4, height: 36, background: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-bold text-[#1C1C1A] truncate">
          {property.name}
        </div>
        <div className="mt-0.5 text-[12px] text-[#888780] flex items-center min-w-0">
          {secondary}
        </div>
      </div>
      {needsAction && (
        <span
          aria-hidden="true"
          className="flex-shrink-0 w-2 h-2 rounded-full bg-[#EF9F27]"
          title="Needs action"
        />
      )}
    </button>
  );
}
