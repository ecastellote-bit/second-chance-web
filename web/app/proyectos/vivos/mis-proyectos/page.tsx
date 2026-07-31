import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import { MisProyectosVivosView } from "@/components/proyectos-vivos/MisProyectosVivosView";

export default function MisProyectosVivosPage() {
  return (
    <UserProfileGate>
      <main className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
        <MisProyectosVivosView />
      </main>
    </UserProfileGate>
  );
}
