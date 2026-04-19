import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Placeholder for `/properties/new`. The real add-property flow (modal or
// multi-step form) is separate work.
export function AddPropertyStub() {
  const navigate = useNavigate();
  return (
    <div className="h-full overflow-y-auto bg-warm-50">
      <div className="mx-auto max-w-[620px] px-8 pt-8 pb-20">
        <button
          type="button"
          onClick={() => navigate('/properties')}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-warm-600 hover:text-warm-800 transition-colors duration-150"
        >
          <ArrowLeft size={13} />
          Back to Properties
        </button>
        <div className="mt-10 rounded-[14px] border border-warm-200 bg-white p-10 text-center">
          <div className="font-serif font-black text-[28px] tracking-[-0.025em] text-warm-800">
            Add a property
          </div>
          <p className="mt-2 text-[13px] text-warm-600">
            The add-property flow is coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
