import { Mail } from 'lucide-react';
import { Pill } from '@/components/ui/Pill';
import { SettingsCard } from './SettingsCard';

// Read-only notifications card. Placeholder for future SMS / push toggles.
export function NotificationsCard() {
  return (
    <SettingsCard
      eyebrow="Notifications"
      title="How they get jobs"
      description="Cleaners are notified by email today. SMS and push channels are coming."
    >
      <div className="flex items-center gap-3 rounded-[10px] border border-[#EDEAE0] bg-[#F9F8F6] px-3 py-2.5">
        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#5F5E5A] flex-shrink-0">
          <Mail size={14} />
        </span>
        <div className="flex-1 min-w-0 text-[13px]">
          <div className="font-semibold text-[#1C1C1A]">Email</div>
          <div className="text-[12px] text-[#888780]">Offers + reminders</div>
        </div>
        <Pill size="sm" tone="confirmed">On</Pill>
      </div>
    </SettingsCard>
  );
}
