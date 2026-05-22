import { CirculosView } from "@/components/circulos/CirculosView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export default function CirculosPage() {
  return (
    <UserProfileGate>
      <CirculosView />
    </UserProfileGate>
  );
}
