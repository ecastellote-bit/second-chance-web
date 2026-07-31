"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApplyToRoleModal } from "@/components/proyectos-vivos/ApplyToRoleModal";
import { ProjectStatusBadge } from "@/components/proyectos-vivos/VivoProjectCard";
import { ContactModal } from "@/components/messaging/ContactModal";
import { Button } from "@/components/ui/Button";
import { getCachedUserId } from "@/lib/users/activeUserSession";
import type {
  ProjectDetailPayload,
  VivoProjectMember,
  VivoProjectRole,
} from "@/lib/projects-vivos/projectTypes";

function errorLabel(code: string): string {
  const map: Record<string, string> = {
    application_pending_limit: "Ya tenés 5 postulaciones pendientes.",
    application_self_not_allowed: "No podés postularte a tu propio proyecto.",
    role_already_filled: "Ese rol ya está ocupado.",
    application_already_exists: "Ya te postulaste a este rol.",
    community_profile_required: "Completá tu perfil para postularte.",
    community_email_required: "Agregá tu email en el perfil para postularte.",
    user_id_required: "Necesitás iniciar sesión con tu perfil.",
  };
  return map[code] ?? code;
}

export function VivoProjectDetailView({ slug }: { slug: string }) {
  const [detail, setDetail] = useState<ProjectDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [applyRole, setApplyRole] = useState<VivoProjectRole | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const me = getCachedUserId();
    setUserId(me);
    try {
      const qs = me ? `?userId=${encodeURIComponent(me)}` : "";
      const res = await fetch(`/api/proyectos-vivos/${encodeURIComponent(slug)}${qs}`);
      const data = (await res.json()) as ProjectDetailPayload & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.project) {
        throw new Error(data.error ?? "project_not_found");
      }
      setDetail({
        project: data.project,
        roles: data.roles ?? [],
        members: data.members ?? [],
        milestones: data.milestones ?? [],
        pendingApplications: data.pendingApplications ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleApply(message: string) {
    if (!userId || !applyRole) throw new Error("user_id_required");
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/proyectos-vivos/${encodeURIComponent(slug)}/postular`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            roleId: applyRole.id,
            message,
          }),
        },
      );
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(errorLabel(data.error ?? "No se pudo postular"));
      }
      setApplyRole(null);
      setToast("Postulación enviada");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function resolveMember(
    member: VivoProjectMember,
    status: "aceptado" | "rechazado",
  ) {
    if (!userId) return;
    const res = await fetch(
      `/api/proyectos-vivos/${encodeURIComponent(slug)}/miembros/${encodeURIComponent(member.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      },
    );
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setToast(errorLabel(data.error ?? "No se pudo actualizar"));
      return;
    }
    setToast(status === "aceptado" ? "Postulación aceptada" : "Postulación rechazada");
    await load();
  }

  async function completeMilestone(milestoneId: string) {
    if (!userId) return;
    const res = await fetch(
      `/api/proyectos-vivos/${encodeURIComponent(slug)}/milestones/${encodeURIComponent(milestoneId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, completed: true }),
      },
    );
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setToast(errorLabel(data.error ?? "No se pudo completar"));
      return;
    }
    setToast("Hito marcado como completado");
    await load();
  }

  if (loading) {
    return (
      <main className="flex min-h-[50dvh] items-center justify-center text-base text-[#6B7A8C]">
        Cargando proyecto…
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg text-[#243647]">No encontramos este proyecto.</p>
        <Link
          href="/proyectos/vivos"
          className="vu-focus mt-6 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
        >
          Volver al directorio
        </Link>
      </main>
    );
  }

  const { project, roles, members, milestones, pendingApplications } = detail;
  const isCreator = Boolean(userId && userId === project.creatorId);
  const openRoles = roles.filter((role) => !role.filled);

  return (
    <main className="pb-16">
      <div className="relative h-[220px] w-full bg-[#DFF4F7] sm:h-[280px]">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : null}
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <div className="-mt-8 rounded-2xl border border-[#E8EEF3] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <ProjectStatusBadge status={project.status} />
            {project.city ? (
              <span className="text-sm text-[#6B7A8C]">{project.city}</span>
            ) : null}
          </div>
          <h1 className="mt-3 text-[1.75rem] font-bold text-[#0B2E59]">{project.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#1A9BB0]">
              {project.creatorImage ? (
                <Image
                  src={project.creatorImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-bold text-white">
                  {project.creatorName.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-[#6B7A8C]">Creado por</p>
              {project.creatorSlug ? (
                <Link
                  href={`/perfil/${project.creatorSlug}`}
                  className="text-base font-semibold text-[#0B2E59] underline"
                >
                  {project.creatorName}
                </Link>
              ) : (
                <p className="text-base font-semibold text-[#0B2E59]">
                  {project.creatorName}
                </p>
              )}
            </div>
          </div>

          <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-[#243647]">
            {project.description}
          </p>

          {!isCreator && userId ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-6"
              onClick={() => setContactOpen(true)}
            >
              Contactar al líder
            </Button>
          ) : null}
        </div>

        {toast ? (
          <p className="mt-4 rounded-xl bg-[#E8F6EA] px-4 py-3 text-base text-[#1B5E20]" role="status">
            {toast}
          </p>
        ) : null}

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#0B2E59]">Equipo que buscamos</h2>
          <div className="mt-4 space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-2xl border border-[#E8EEF3] bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0B2E59]">{role.title}</h3>
                    <p className="mt-2 text-base text-[#6B7A8C]">{role.description}</p>
                    {role.skillsNeeded.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.skillsNeeded.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-[#F1F5F9] px-3 py-1 text-sm text-[#243647]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {role.filled ? (
                    <p className="text-sm font-semibold text-[#64748B]">
                      Cubierto por {role.filledByName ?? "un miembro"}
                    </p>
                  ) : !isCreator ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        if (!userId) {
                          window.location.href = "/perfil/crear";
                          return;
                        }
                        setApplyRole(role);
                      }}
                    >
                      Quiero sumarme
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {openRoles.length === 0 ? (
              <p className="text-base text-[#6B7A8C]">No hay roles abiertos por ahora.</p>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#0B2E59]">Ya se sumaron</h2>
          {members.length === 0 ? (
            <p className="mt-3 text-base text-[#6B7A8C]">Todavía no hay miembros aceptados.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#E8EEF3] bg-white p-4"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#1A9BB0]">
                    {member.userImage ? (
                      <Image
                        src={member.userImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-bold text-white">
                        {member.userName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    {member.userSlug ? (
                      <Link
                        href={`/perfil/${member.userSlug}`}
                        className="font-semibold text-[#0B2E59] underline"
                      >
                        {member.userName}
                      </Link>
                    ) : (
                      <p className="font-semibold text-[#0B2E59]">{member.userName}</p>
                    )}
                    <p className="text-sm text-[#6B7A8C]">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#0B2E59]">Hitos</h2>
          {milestones.length === 0 ? (
            <p className="mt-3 text-base text-[#6B7A8C]">
              El líder todavía no cargó hitos.
            </p>
          ) : (
            <ol className="relative mt-6 space-y-6 border-l-2 border-[#E8EEF3] pl-6">
              {milestones.map((milestone) => (
                <li key={milestone.id} className="relative">
                  <span
                    className={[
                      "absolute -left-[31px] top-1 h-3 w-3 rounded-full",
                      milestone.completed ? "bg-[#059669]" : "border-2 border-[#94A3B8] bg-white",
                    ].join(" ")}
                  />
                  <h3 className="text-lg font-semibold text-[#0B2E59]">
                    {milestone.title}
                    {milestone.completed ? " ✓" : ""}
                  </h3>
                  <p className="mt-1 text-base text-[#6B7A8C]">{milestone.description}</p>
                  {isCreator && !milestone.completed ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="mt-3"
                      onClick={() => void completeMilestone(milestone.id)}
                    >
                      Marcar como completado
                    </Button>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        {isCreator ? (
          <section className="mt-10 rounded-2xl border border-[#E8EEF3] bg-[#FFFBEB] p-5">
            <h2 className="text-xl font-semibold text-[#0B2E59]">Solicitudes</h2>
            {pendingApplications.length === 0 ? (
              <p className="mt-3 text-base text-[#6B7A8C]">
                No hay postulaciones pendientes.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {pendingApplications.map((member) => (
                  <li
                    key={member.id}
                    className="rounded-xl border border-[#E8EEF3] bg-white p-4"
                  >
                    <p className="font-semibold text-[#0B2E59]">
                      {member.userName} · {member.role}
                    </p>
                    <p className="mt-2 text-base text-[#243647]">{member.message}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={() => void resolveMember(member, "aceptado")}
                      >
                        Aceptar
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={() => void resolveMember(member, "rechazado")}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>

      {userId ? (
        <ContactModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          recipientId={project.creatorId}
          recipientName={project.creatorName}
          recipientSlug={project.creatorSlug}
          senderId={userId}
        />
      ) : null}

      <ApplyToRoleModal
        isOpen={Boolean(applyRole)}
        onClose={() => setApplyRole(null)}
        roleTitle={applyRole?.title ?? ""}
        submitting={submitting}
        onSubmit={handleApply}
      />
    </main>
  );
}
