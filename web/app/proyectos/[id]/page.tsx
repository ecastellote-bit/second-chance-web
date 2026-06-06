import { notFound } from "next/navigation";
import { ProyectoPresentadoView } from "@/components/proyectos/ProyectoPresentadoView";
import { ProyectoStubView } from "@/components/proyectos/ProyectoStubView";
import { getAnyProjectById } from "@/lib/content/proyectosCatalog";
import { getPresentedProject } from "@/lib/content/proyectoPresentadoCatalog";

type Props = { params: Promise<{ id: string }> };

export default async function ProyectoPage({ params }: Props) {
  const { id } = await params;
  const presented = getPresentedProject(id);
  if (presented) {
    return <ProyectoPresentadoView project={presented} />;
  }

  const listed = getAnyProjectById(id);
  if (listed) {
    return <ProyectoStubView project={listed} />;
  }

  notFound();
}
