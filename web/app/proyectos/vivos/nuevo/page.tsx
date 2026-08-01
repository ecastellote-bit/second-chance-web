import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import { CreateVivoProjectWizard } from "@/components/proyectos-vivos/CreateVivoProjectWizard";
import { BarrioNotificationHeader } from "@/components/notifications/NotificationBell";

export default function NuevoProyectoVivoPage() {
  return (
    <UserProfileGate>
      <main className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
        <BarrioNotificationHeader />
        <CreateVivoProjectWizard />
      </main>
    </UserProfileGate>
  );
}
