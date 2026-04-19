import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Placeholder landing for `/properties/:id`. The full detail view is
// tracked as separate work — this keeps the route valid so card clicks
// land somewhere instead of 404-ing.
export function PropertyDetailStub() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="h-full overflow-y-auto bg-warm-50">
      <div className="mx-auto max-w-[1200px] px-8 pt-8 pb-20">
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
            Property detail
          </div>
          <p className="mt-2 text-[13px] text-warm-600">
            Full detail view for <span className="font-semibold">{id}</span> is
            coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
