import { EventosView } from "@/components/eventos/EventosView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export default function EventosPage() {
  return (
    <UserProfileGate>
      <EventosView />
    </UserProfileGate>
  );
}
