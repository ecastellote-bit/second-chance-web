import { PerfilUsuarioView } from "@/components/perfil/PerfilUsuarioView";
import { PERFIL_MARIA_SOL } from "@/lib/content/perfilCatalog";

export default function PerfilPage() {
  return <PerfilUsuarioView profile={PERFIL_MARIA_SOL} />;
}
