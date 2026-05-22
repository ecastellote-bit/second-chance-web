import { notFound } from "next/navigation";
import { ProyectoPresentadoView } from "@/components/proyectos/ProyectoPresentadoView";
import { ProyectoStubView } from "@/components/proyectos/ProyectoStubView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import { PROYECTOS_CATALOG } from "@/lib/content/proyectosCatalog";
import { getPresentedProject } from "@/lib/content/proyectoPresentadoCatalog";

type Props = { params: Promise<{ id: string }> };

export default async function ProyectoPage({ params }: Props) {
  const { id } = await params;
  const presented = getPresentedProject(id);
  if (presented) {
    return (
      <UserProfileGate>
        <ProyectoPresentadoView project={presented} />
      </UserProfileGate>
    );
  }

  const listed = PROYECTOS_CATALOG.find((p) => p.id === id);
  if (listed) {
    return (
      <UserProfileGate>
        <ProyectoStubView project={listed} />
      </UserProfileGate>
    );
  }

  notFound();
}
