"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProjectStatusBadge } from "@/components/proyectos-vivos/VivoProjectCard";
import { SessionContinueLinks } from "@/components/perfil/SessionContinueLinks";
import { Button } from "@/components/ui/Button";
import { getCachedUserId } from "@/lib/users/activeUserSession";
import type { MisProyectosPayload } from "@/lib/projects-vivos/projectTypes";

type Tab = "lidero" | "participo" | "postule";

export function MisProyectosVivosView() {
  const [tab, setTab] = useState<Tab>("lidero");
  const [data, setData] = useState<MisProyectosPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsSession, setNeedsSession] = useState(false);

  useEffect(() => {
    const userId = getCachedUserId();
    if (!userId) {
      setNeedsSession(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void fetch(`/api/proyectos-vivos/mis-proyectos?userId=${encodeURIComponent(userId)}`)
      .then(async (res) => {
        const json = (await res.json()) as MisProyectosPayload & {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || !json.ok) throw new Error(json.error ?? "Error");
        if (!cancelled) {
          setData({
            lidero: json.lidero ?? [],
            participo: json.participo ?? [],
            postule: json.postule ?? [],
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (needsSession) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
        <Link href="/proyectos/vivos" className="text-sm font-semibold text-[#1A9BB0] underline">
          ← Proyectos Vivos
        </Link>
        <h1 className="mt-4 text-[1.75rem] font-bold text-[#0B2E59]">Mis proyectos</h1>
        <div className="mt-6">
          <SessionContinueLinks
            returnTo="/proyectos/vivos/mis-proyectos"
            title="Para ver tus proyectos, necesitamos tu perfil"
            body="Retomá tu perfil en este dispositivo o creá uno. Después volvés a esta lista."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
      <Link href="/proyectos/vivos" className="text-sm font-semibold text-[#1A9BB0] underline">
        ← Proyectos Vivos
      </Link>
      <h1 className="mt-4 text-[1.75rem] font-bold text-[#0B2E59]">Mis proyectos</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["lidero", "Lidero"],
            ["participo", "Participo"],
            ["postule", "Postulé"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              "vu-focus min-h-[48px] rounded-xl px-4 text-base font-semibold",
              tab === id
                ? "bg-[#0B2E59] text-white"
                : "border border-[#E8EEF3] bg-white text-[#243647]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-base text-[#6B7A8C]">Cargando…</p>
      ) : null}
      {error ? (
        <p className="mt-8 text-base text-red-600">{error}</p>
      ) : null}

      {!loading && !error && tab === "lidero" && (data?.lidero ?? []).length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] p-6 text-center">
          <p className="text-base text-[#243647]">No hay proyectos en esta pestaña.</p>
          <Link
            href="/proyectos/vivos/nuevo"
            className="vu-focus mt-4 inline-flex min-h-[48px] items-center rounded-[10px] bg-[#0B2E59] px-5 text-base font-semibold text-white"
          >
            Crear mi proyecto
          </Link>
        </div>
      ) : null}

      {!loading && !error && tab === "participo" && (data?.participo ?? []).length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] p-6 text-center">
          <p className="text-base text-[#243647]">No hay proyectos en esta pestaña.</p>
          <Link
            href="/proyectos/vivos"
            className="vu-focus mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
          >
            Explorar proyectos vivos
          </Link>
        </div>
      ) : null}

      {!loading && !error && tab === "postule" && (data?.postule ?? []).length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] p-6 text-center">
          <p className="text-base text-[#243647]">No hay proyectos en esta pestaña.</p>
          <Link
            href="/proyectos/vivos"
            className="vu-focus mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
          >
            Explorar proyectos vivos
          </Link>
        </div>
      ) : null}

      <ul className="mt-6 space-y-4">
        {tab === "lidero"
          ? (data?.lidero ?? []).map((project) => (
              <li
                key={project.id}
                className="rounded-2xl border border-[#E8EEF3] bg-white p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <ProjectStatusBadge status={project.status} />
                  <h2 className="text-lg font-semibold text-[#0B2E59]">{project.title}</h2>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/proyectos/vivos/${project.slug}`}
                    className="vu-focus inline-flex min-h-[48px] items-center rounded-[10px] bg-[#0B2E59] px-4 text-base font-semibold text-white"
                  >
                    Gestionar
                  </Link>
                </div>
              </li>
            ))
          : null}

        {tab === "participo"
          ? (data?.participo ?? []).map((project) => (
              <li
                key={project.id}
                className="rounded-2xl border border-[#E8EEF3] bg-white p-5"
              >
                <ProjectStatusBadge status={project.status} />
                <h2 className="mt-2 text-lg font-semibold text-[#0B2E59]">
                  {project.title}
                </h2>
                <p className="mt-1 text-base text-[#6B7A8C]">Tu rol: {project.myRole}</p>
                <Link
                  href={`/proyectos/vivos/${project.slug}`}
                  className="vu-focus mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
                >
                  Ver proyecto
                </Link>
              </li>
            ))
          : null}

        {tab === "postule"
          ? (data?.postule ?? []).map((project) => (
              <li
                key={`${project.id}-${project.application.id}`}
                className="rounded-2xl border border-[#E8EEF3] bg-white p-5"
              >
                <ProjectStatusBadge status={project.status} />
                <h2 className="mt-2 text-lg font-semibold text-[#0B2E59]">
                  {project.title}
                </h2>
                <p className="mt-1 text-base text-[#6B7A8C]">
                  Postulado a: {project.roleTitle}
                </p>
                <Link
                  href={`/proyectos/vivos/${project.slug}`}
                  className="vu-focus mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
                >
                  Ver proyecto
                </Link>
              </li>
            ))
          : null}
      </ul>

      {!loading ? (
        <div className="mt-8">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => window.location.reload()}
          >
            Actualizar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
