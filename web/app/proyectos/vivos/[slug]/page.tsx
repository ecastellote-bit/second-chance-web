import { VivoProjectDetailView } from "@/components/proyectos-vivos/VivoProjectDetailView";
import { BarrioNotificationHeader } from "@/components/notifications/NotificationBell";

export default async function ProyectosVivosSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
      <BarrioNotificationHeader />
      <VivoProjectDetailView slug={slug} />
    </div>
  );
}
