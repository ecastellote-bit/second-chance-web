import { MessagesHubView } from "@/components/messaging/MessagesHubView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export default function MensajesPage() {
  return (
    <UserProfileGate>
      <MessagesHubView />
    </UserProfileGate>
  );
}
