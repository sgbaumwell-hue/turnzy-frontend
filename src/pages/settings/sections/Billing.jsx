import { CreditCard } from 'lucide-react';

export function Billing() {
  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Billing</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage your plan and payment method.</p>

      <div className="bg-white border border-warm-200 rounded-lg shadow-sm p-8 text-center max-w-lg">
        <div className="w-14 h-14 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard size={24} className="text-green-600" />
        </div>
        <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-[14px] font-semibold rounded-full mb-3">
          Free during beta
        </span>
        <p className="text-[14px] text-warm-500 mt-2">
          Turnzy is free while we're in beta — no credit card required.
        </p>
        <p className="text-[12px] text-warm-400 mt-2">
          When paid plans launch, you'll get at least 30 days notice and the chance to lock in early pricing.
        </p>
      </div>
    </div>
  );
}
