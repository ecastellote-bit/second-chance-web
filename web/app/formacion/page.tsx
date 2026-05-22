import { FormacionView } from "@/components/formacion/FormacionView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export default function FormacionPage() {
  return (
    <UserProfileGate>
      <FormacionView />
    </UserProfileGate>
  );
}
