import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import { CreateVivoProjectWizard } from "@/components/proyectos-vivos/CreateVivoProjectWizard";

export default function NuevoProyectoVivoPage() {
  return (
    <UserProfileGate>
      <main className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
        <CreateVivoProjectWizard />
      </main>
    </UserProfileGate>
  );
}
