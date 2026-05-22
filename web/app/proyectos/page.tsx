import { ProyectosListView } from "@/components/proyectos/ProyectosListView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export default function ProyectosIndexPage() {
  return (
    <UserProfileGate>
      <ProyectosListView />
    </UserProfileGate>
  );
}
