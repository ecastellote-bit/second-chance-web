import { VivosDirectoryView } from "@/components/proyectos-vivos/VivosDirectoryView";
import { BarrioNotificationHeader } from "@/components/notifications/NotificationBell";

export default function ProyectosVivosPage() {
  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
      <BarrioNotificationHeader />
      <VivosDirectoryView />
    </main>
  );
}
