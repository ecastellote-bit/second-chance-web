import { MensajesView } from "@/components/community/MensajesView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export default function MensajesPage() {
  return (
    <UserProfileGate>
      <MensajesView />
    </UserProfileGate>
  );
}
