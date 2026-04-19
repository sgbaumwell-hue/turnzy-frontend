import { ChevronRight } from 'lucide-react';

// Small breadcrumb above the hero: "Workspace › Properties".
// "Workspace" is a label only, not a route.
export function PropertiesBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-warm-400">
      <span className="cursor-pointer transition-colors duration-150 hover:text-warm-800">
        Workspace
      </span>
      <ChevronRight size={12} className="text-warm-400" aria-hidden="true" />
      <span className="font-semibold text-warm-800">Properties</span>
    </nav>
  );
}
