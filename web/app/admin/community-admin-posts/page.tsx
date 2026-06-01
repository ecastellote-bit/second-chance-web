"use client";

import { adminFetch } from "@/lib/admin/adminFetch";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CIRCULOS_CATALOG } from "@/lib/content/circulosCatalog";
import {
  ADMIN_POST_KIND_LABEL,
  ADMIN_POST_TARGET_LABEL,
  CIRCLE_CTA_OPTIONS,
  PROJECT_CTA_OPTIONS,
} from "@/lib/community/communityAdminPostCopy";
import type {
  CommunityAdminPostKind,
  CommunityAdminPostStatus,
  CommunityAdminPostTargetType,
} from "@/lib/learning/communityAdminPosts";

type PostRow = {
  postId: string;
  targetType: CommunityAdminPostTargetType;
  targetId: string;
  targetTitle: string;
  kind: CommunityAdminPostKind;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaSignalType?: string;
  status: CommunityAdminPostStatus;
  createdAt: string;
  publishedAt?: string | null;
};

const STATUS_FILTERS: { id: "" | CommunityAdminPostStatus; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "draft", label: "Borradores" },
  { id: "published", label: "Publicados" },
  { id: "hidden", label: "Ocultos" },
  { id: "archived", label: "Archivados" },
];

export default function CommunityAdminPostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CommunityAdminPostStatus>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [targetType, setTargetType] = useState<CommunityAdminPostTargetType>("founder_project");
  const [targetId, setTargetId] = useState("");
  const [kind, setKind] = useState<CommunityAdminPostKind>("update");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaSignalType, setCtaSignalType] = useState("");
  const [createStatus, setCreateStatus] = useState<CommunityAdminPostStatus>("draft");
  const [publishedSeeds, setPublishedSeeds] = useState<
    { seedId: string; title: string; status: string }[]
  >([]);
  const [targetsLoading, setTargetsLoading] = useState(true);

  const sortedCircles = useMemo(
    () => [...CIRCULOS_CATALOG].sort((a, b) => a.title.localeCompare(b.title, "es")),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadTargets() {
      setTargetsLoading(true);
      try {
        const res = await adminFetch(
          "/api/admin/founder-project-seeds/list?status=published&limit=200",
        );
        const data = (await res.json()) as {
          ok?: boolean;
          seeds?: { seedId: string; title: string; status: string }[];
        };
        if (!cancelled && data.ok && Array.isArray(data.seeds)) {
          setPublishedSeeds(data.seeds);
        }
      } finally {
        if (!cancelled) setTargetsLoading(false);
      }
    }
    loadTargets();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (targetType === "general_barrio") {
      setTargetId("barrio");
      return;
    }
    if (targetType === "circle") {
      const stillValid = sortedCircles.some((c) => c.id === targetId);
      if (!stillValid) setTargetId(sortedCircles[0]?.id ?? "");
      return;
    }
    if (targetType === "founder_project") {
      const stillValid = publishedSeeds.some((s) => s.seedId === targetId);
      if (!stillValid) setTargetId(publishedSeeds[0]?.seedId ?? "");
    }
  }, [targetType, sortedCircles, publishedSeeds]);

  const targetPreviewHref =
    targetType === "circle" && targetId
      ? `/circulos/${encodeURIComponent(targetId)}`
      : targetType === "founder_project" && targetId
        ? `/proyectos/semilla/${encodeURIComponent(targetId)}`
        : targetType === "general_barrio"
          ? "/plaza"
          : null;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "400" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch(`/api/admin/community-admin-posts/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        posts?: PostRow[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar publicaciones");
      }
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/community-admin-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          kind,
          title,
          body,
          ctaSignalType: ctaSignalType || undefined,
          status: createStatus,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const code = data.error ?? "";
        throw new Error(
          code === "admin_post_target_invalid"
            ? "Destino inválido: elegí un proyecto publicado o un círculo del listado."
            : code === "admin_post_validation_failed"
              ? "Revisá título (mín. 5) y cuerpo (mín. 20 caracteres)."
              : code === "blob_not_configured"
                ? "Blob no configurado en este entorno. Usá la URL principal de producción."
                : code || "No se pudo crear",
        );
      }
      setTitle("");
      setBody("");
      setTargetId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  }

  async function patchStatus(postId: string, status: CommunityAdminPostStatus) {
    setUpdatingId(postId);
    setError("");
    try {
      const res = await adminFetch(`/api/admin/community-admin-posts/${encodeURIComponent(postId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "No se pudo actualizar");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setUpdatingId(null);
    }
  }

  const ctaOptions = targetType === "circle" ? CIRCLE_CTA_OPTIONS : PROJECT_CTA_OPTIONS;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            Editorial fundador · P1-E1
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Publicaciones administradas</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
            Movimientos del equipo en proyectos, círculos y barrio. No son posteos de usuarios.
          </p>
          <Link
            href="/admin/founder-project-seeds"
            className="mt-2 inline-block text-sm font-semibold text-[#1A9BB0] underline"
          >
            Proyectos fundadores →
          </Link>
        </div>

        <form
          onSubmit={createPost}
          className="mb-6 space-y-3 rounded-2xl border border-[#E8EEF3] bg-white p-4"
        >
          <p className="font-bold text-[#0B2E59]">Nueva publicación</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-[#6B7A8C]">
              Destino
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as CommunityAdminPostTargetType);
                  setCtaSignalType("");
                  setTargetId("");
                }}
                className="mt-1 w-full rounded-lg border border-[#E8EEF3] px-2 py-2 text-sm"
              >
                <option value="founder_project">Proyecto fundador publicado</option>
                <option value="circle">Círculo del catálogo</option>
                <option value="general_barrio">Barrio general (plaza)</option>
              </select>
            </label>
            <label className="text-xs text-[#6B7A8C]">
              {targetType === "circle"
                ? "Círculo"
                : targetType === "founder_project"
                  ? "Proyecto"
                  : "Destino fijo"}
              {targetType === "general_barrio" ? (
                <p className="mt-1 rounded-lg border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0B2E59]">
                  barrio — avisos en la plaza
                </p>
              ) : targetType === "circle" ? (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E8EEF3] px-2 py-2 text-sm"
                  required
                >
                  <option value="" disabled>
                    Elegí un círculo…
                  </option>
                  {sortedCircles.map((circle) => (
                    <option key={circle.id} value={circle.id}>
                      {circle.title} · id: {circle.id}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  disabled={targetsLoading || publishedSeeds.length === 0}
                  className="mt-1 w-full rounded-lg border border-[#E8EEF3] px-2 py-2 text-sm disabled:opacity-60"
                  required
                >
                  <option value="" disabled>
                    {targetsLoading
                      ? "Cargando proyectos…"
                      : publishedSeeds.length === 0
                        ? "No hay proyectos publicados"
                        : "Elegí un proyecto…"}
                  </option>
                  {publishedSeeds.map((seed) => (
                    <option key={seed.seedId} value={seed.seedId}>
                      {seed.title} · {seed.seedId}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
          {targetType === "founder_project" && !targetsLoading && publishedSeeds.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              No hay proyectos en estado <strong>published</strong>. Publicá una semilla en{" "}
              <Link href="/admin/founder-project-seeds" className="font-semibold underline">
                Proyectos fundadores
              </Link>{" "}
              antes de crear movimientos editoriales ahí.
            </p>
          ) : null}
          {targetPreviewHref ? (
            <p className="text-xs text-[#6B7A8C]">
              Vista previa:{" "}
              <Link href={targetPreviewHref} className="font-semibold text-[#1A9BB0] underline">
                {targetPreviewHref}
              </Link>
              {targetType !== "general_barrio" ? (
                <span className="ml-1 font-mono text-[#6B7A8C]">({targetId})</span>
              ) : null}
            </p>
          ) : null}
          <label className="block text-xs text-[#6B7A8C]">
            Tipo
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as CommunityAdminPostKind)}
              className="mt-1 w-full rounded-lg border border-[#E8EEF3] px-2 py-2 text-sm"
            >
              {Object.entries(ADMIN_POST_KIND_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (mín. 5 caracteres)"
            className="w-full rounded-lg border border-[#E8EEF3] px-3 py-2 text-sm"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Cuerpo (mín. 20 caracteres, sin HTML ni enlaces libres)"
            className="w-full resize-none rounded-lg border border-[#E8EEF3] px-3 py-2 text-sm"
            required
          />
          {targetType !== "general_barrio" ? (
            <label className="block text-xs text-[#6B7A8C]">
              CTA opcional (ancla a panel de señales)
              <select
                value={ctaSignalType}
                onChange={(e) => setCtaSignalType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E8EEF3] px-2 py-2 text-sm"
              >
                <option value="">Sin CTA</option>
                {ctaOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block text-xs text-[#6B7A8C]">
            Estado inicial
            <select
              value={createStatus}
              onChange={(e) => setCreateStatus(e.target.value as CommunityAdminPostStatus)}
              className="mt-1 w-full rounded-lg border border-[#E8EEF3] px-2 py-2 text-sm"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={
              creating ||
              (targetType === "founder_project" && (!targetId || publishedSeeds.length === 0)) ||
              (targetType === "circle" && !targetId)
            }
            className="rounded-xl bg-[#0B2E59] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {creating ? "Guardando…" : "Crear publicación"}
          </button>
        </form>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                statusFilter === item.id
                  ? "bg-[#0B2E59] text-white"
                  : "border border-[#E8EEF3] bg-white text-[#6B7A8C]",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-[#6B7A8C]">No hay publicaciones con este filtro.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.postId} className="rounded-xl border border-[#E8EEF3] bg-white p-4 text-sm">
                <p className="font-bold text-[#0B2E59]">
                  {post.title}{" "}
                  <span className="font-normal text-[#6B7A8C]">
                    · {ADMIN_POST_TARGET_LABEL[post.targetType]} · {post.targetTitle}
                  </span>
                </p>
                <p className="mt-1 text-[#6B7A8C]">
                  {ADMIN_POST_KIND_LABEL[post.kind]} · {post.status} · {post.targetId}
                </p>
                <p className="mt-2 text-[#243647]">{post.body}</p>
                {post.targetType === "founder_project" ? (
                  <Link
                    href={`/proyectos/semilla/${encodeURIComponent(post.targetId)}`}
                    className="mt-2 inline-block text-xs font-semibold text-[#1A9BB0] underline"
                  >
                    Ver ficha proyecto →
                  </Link>
                ) : null}
                {post.targetType === "circle" ? (
                  <Link
                    href={`/circulos/${encodeURIComponent(post.targetId)}`}
                    className="mt-2 inline-block text-xs font-semibold text-[#1A9BB0] underline"
                  >
                    Ver círculo →
                  </Link>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.status !== "published" ? (
                    <button
                      type="button"
                      disabled={updatingId === post.postId}
                      onClick={() => patchStatus(post.postId, "published")}
                      className="rounded-lg bg-[#C6D92D] px-3 py-1.5 text-xs font-bold text-[#0B2E59] disabled:opacity-60"
                    >
                      Publicar
                    </button>
                  ) : null}
                  {post.status !== "hidden" ? (
                    <button
                      type="button"
                      disabled={updatingId === post.postId}
                      onClick={() => patchStatus(post.postId, "hidden")}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Ocultar
                    </button>
                  ) : null}
                  {post.status !== "archived" ? (
                    <button
                      type="button"
                      disabled={updatingId === post.postId}
                      onClick={() => patchStatus(post.postId, "archived")}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Archivar
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
