import { ActividadView } from "@/components/community/ActividadView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export default function ActividadPage() {
  return (
    <UserProfileGate>
      <ActividadView />
    </UserProfileGate>
  );
}
