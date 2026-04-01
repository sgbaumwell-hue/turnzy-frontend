export function Billing() {
  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Billing</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage your plan and payment method.</p>

      <div className="bg-white border border-warm-200 rounded-xl p-6">
        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-[12px] font-semibold rounded-full mb-3">
          Free during beta
        </span>
        <p className="text-[14px] text-warm-500">Billing features coming soon.</p>
      </div>
    </div>
  );
}
