import { redirect } from "next/navigation";
import { PRESENTED_PROJECT } from "@/lib/content/proyectoPresentadoCatalog";

export default function ProximoMovimientoPage() {
  redirect(`/proyectos/${PRESENTED_PROJECT.id}`);
}
