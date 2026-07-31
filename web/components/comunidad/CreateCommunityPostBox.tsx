"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CIRCULOS_CATALOG } from "@/lib/content/circulosCatalog";
import { getCachedUserId } from "@/lib/users/activeUserSession";
import {
  COMMUNITY_POST_MAX,
  type CommunityPost,
} from "@/lib/community-store/communityTypes";

type Props = {
  onCreated: (post: CommunityPost) => void;
};

export function CreateCommunityPostBox({ onCreated }: Props) {
  const [content, setContent] = useState("");
  const [circleTagSlug, setCircleTagSlug] = useState(CIRCULOS_CATALOG[0]?.id ?? "");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canPublish = useMemo(
    () => content.trim().length > 0 && Boolean(circleTagSlug),
    [content, circleTagSlug],
  );

  async function publish() {
    const userId = getCachedUserId();
    if (!userId) {
      window.location.href = "/perfil/crear?redirect=%2Fcomunidad";
      return;
    }
    if (!canPublish || saving) return;

    setSaving(true);
    setError("");
    try {
      const type = showLink && linkUrl.trim() ? "enlace" : "texto";
      const res = await fetch("/api/comunidad/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content: content.trim(),
          type,
          circleTagSlug,
          metadata:
            type === "enlace"
              ? { url: linkUrl.trim(), urlTitle: linkUrl.trim() }
              : null,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        post?: CommunityPost;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.post) {
        throw new Error(data.message ?? data.error ?? "No se pudo publicar");
      }
      onCreated(data.post);
      setContent("");
      setLinkUrl("");
      setShowLink(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sticky top-0 z-10 border-b border-[#E8EEF3] bg-[#F8FAFC]/95 p-4 backdrop-blur">
      <div className="rounded-[12px] border border-[#E8EEF3] bg-white p-4 shadow-sm">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={COMMUNITY_POST_MAX}
          rows={3}
          placeholder="¿Qué estás construyendo hoy?"
          className="min-h-[96px] w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-base text-[#243647]"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex-1">
            <span className="sr-only">Tema (círculo)</span>
            <select
              value={circleTagSlug}
              onChange={(e) => setCircleTagSlug(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] bg-white px-3 text-base"
            >
              {CIRCULOS_CATALOG.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setShowLink((v) => !v)}
            className="vu-focus min-h-[48px] rounded-xl border border-[#E8EEF3] px-4 text-sm font-semibold text-[#1A9BB0]"
          >
            {showLink ? "Quitar enlace" : "Agregar enlace"}
          </button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!canPublish || saving}
            onClick={() => void publish()}
          >
            {saving ? "Publicando..." : "Publicar"}
          </Button>
        </div>
        {showLink ? (
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="mt-3 min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base"
          />
        ) : null}
        <p className="mt-2 text-sm text-[#6B7A8C]">
          {content.length} / {COMMUNITY_POST_MAX}
        </p>
        {error ? (
          <p className="mt-2 text-base text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
