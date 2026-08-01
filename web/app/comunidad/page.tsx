import { CommunityFeedView } from "@/components/comunidad/CommunityFeedView";
import { BarrioNotificationHeader } from "@/components/notifications/NotificationBell";

export default function ComunidadPage() {
  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
      <BarrioNotificationHeader />
      <CommunityFeedView />
    </main>
  );
}
