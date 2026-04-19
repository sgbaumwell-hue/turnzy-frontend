import { Plus } from 'lucide-react';

// Empty-state tile that appears as the last card in the grid when filter === 'All'.
export function AddPropertyCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-3 min-h-[320px] w-full p-8 rounded-[14px] border border-dashed border-warm-300 text-warm-600 transition-all duration-200 hover:border-coral-400 hover:bg-coral-50/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-2"
    >
      <span className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center transition-colors duration-200 group-hover:bg-coral-50">
        <Plus
          size={20}
          className="text-warm-600 transition-colors duration-200 group-hover:text-coral-400"
        />
      </span>
      <span className="font-semibold text-[14px] text-warm-800">
        Add a property
      </span>
      <span className="mt-0.5 text-center text-[12px] text-warm-400 max-w-[220px]">
        Connect Airbnb, VRBO, or add a direct booking source.
      </span>
    </button>
  );
}
