"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getCachedUserId } from "@/lib/users/activeUserSession";
import type {
  CommunityComment,
  CommunityPost,
} from "@/lib/community-store/communityTypes";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.floor((Date.now() - then) / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

type Props = {
  post: CommunityPost;
  currentUserId: string | null;
  onPostUpdated: (post: CommunityPost) => void;
};

export function CommunityPostCard({ post, currentUserId, onPostUpdated }: Props) {
  const [liked, setLiked] = useState(
    Boolean(currentUserId && post.likedBy?.includes(currentUserId)),
  );
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [draft, setDraft] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLiked(Boolean(currentUserId && post.likedBy?.includes(currentUserId)));
    setLikesCount(post.likesCount);
    setCommentsCount(post.commentsCount);
  }, [post, currentUserId]);

  async function toggleLike() {
    const userId = currentUserId ?? getCachedUserId();
    if (!userId) {
      window.location.href = "/perfil/crear?redirect=%2Fcomunidad";
      return;
    }

    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await fetch(`/api/comunidad/posts/${encodeURIComponent(post.id)}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        liked?: boolean;
        likesCount?: number;
      };
      if (!res.ok || !data.ok) throw new Error("like_failed");
      setLiked(Boolean(data.liked));
      setLikesCount(data.likesCount ?? 0);
      onPostUpdated({
        ...post,
        likedBy: data.liked
          ? Array.from(new Set([...(post.likedBy ?? []), userId]))
          : (post.likedBy ?? []).filter((id) => id !== userId),
        likesCount: data.likesCount ?? 0,
      });
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  }

  async function loadComments() {
    setLoadingComments(true);
    try {
      const res = await fetch(
        `/api/comunidad/posts/${encodeURIComponent(post.id)}/comentarios`,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        comments?: CommunityComment[];
      };
      if (res.ok && data.ok && data.comments) setComments(data.comments);
    } finally {
      setLoadingComments(false);
    }
  }

  async function openComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments.length === 0) await loadComments();
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    const userId = currentUserId ?? getCachedUserId();
    if (!userId) {
      window.location.href = "/perfil/crear?redirect=%2Fcomunidad";
      return;
    }
    const content = draft.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/comunidad/posts/${encodeURIComponent(post.id)}/comentar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, content }),
        },
      );
      const data = (await res.json()) as {
        ok?: boolean;
        comment?: CommunityComment;
        commentsCount?: number;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.comment) {
        throw new Error(data.message ?? "No se pudo comentar");
      }
      setComments((prev) => [...prev, data.comment!]);
      setCommentsCount(data.commentsCount ?? commentsCount + 1);
      setDraft("");
      onPostUpdated({
        ...post,
        commentsCount: data.commentsCount ?? commentsCount + 1,
      });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al comentar");
    } finally {
      setSubmitting(false);
    }
  }

  const visibleComments = comments.slice(-3);

  return (
    <article className="rounded-[12px] border border-[#E8EEF3] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,70,0.04)]">
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1A9BB0]">
          {post.authorImage ? (
            <Image src={post.authorImage} alt="" fill className="object-cover" sizes="40px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
              {post.authorName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {post.authorSlug ? (
              <Link
                href={`/perfil/${post.authorSlug}`}
                className="font-semibold text-[#0B2E59] underline-offset-2 hover:underline"
              >
                {post.authorName}
              </Link>
            ) : (
              <span className="font-semibold text-[#0B2E59]">{post.authorName}</span>
            )}
            {post.authorSlug ? (
              <span className="text-sm text-[#6B7A8C]">@{post.authorSlug}</span>
            ) : null}
            <span className="rounded-[6px] bg-[#E8F7FA] px-2 py-0.5 text-xs font-semibold text-[#1A9BB0]">
              {post.circleTag}
            </span>
            <span className="text-sm text-[#6B7A8C]">{relativeTime(post.createdAt)}</span>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-[#243647]">
            {post.content}
          </p>

          {post.type === "enlace" && post.metadata?.url ? (
            <a
              href={post.metadata.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block overflow-hidden rounded-[10px] border border-[#E8EEF3] transition hover:shadow-sm"
            >
              {post.metadata.urlImage ? (
                <div className="relative h-36 w-full bg-[#F1F5F9]">
                  <Image
                    src={post.metadata.urlImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                  />
                </div>
              ) : null}
              <div className="p-3">
                <p className="font-semibold text-[#0B2E59]">
                  {post.metadata.urlTitle || post.metadata.url}
                </p>
                {post.metadata.urlDescription ? (
                  <p className="mt-1 line-clamp-2 text-sm text-[#6B7A8C]">
                    {post.metadata.urlDescription}
                  </p>
                ) : null}
              </div>
            </a>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => void toggleLike()}
              className="vu-focus inline-flex min-h-[44px] items-center gap-2 text-base text-[#6B7A8C] hover:text-[#0B2E59]"
            >
              <span aria-hidden>{liked ? "❤️" : "♡"}</span>
              {likesCount}
            </button>
            <button
              type="button"
              onClick={() => void openComments()}
              className="vu-focus inline-flex min-h-[44px] items-center gap-2 text-base text-[#6B7A8C] hover:text-[#0B2E59]"
            >
              <span aria-hidden>💬</span>
              {commentsCount}
            </button>
          </div>

          {commentsOpen ? (
            <div className="mt-4 border-t border-[#E8EEF3] pt-4">
              {loadingComments ? (
                <p className="text-sm text-[#6B7A8C]">Cargando comentarios…</p>
              ) : null}
              <ul className="space-y-3">
                {visibleComments.map((comment) => (
                  <li key={comment.id} className="text-base text-[#243647]">
                    <span className="font-semibold text-[#0B2E59]">
                      {comment.authorName}
                    </span>{" "}
                    {comment.content}
                  </li>
                ))}
              </ul>
              {comments.length > 3 ? (
                <p className="mt-2 text-sm text-[#6B7A8C]">
                  Mostrando los últimos 3 de {comments.length}
                </p>
              ) : null}

              <form onSubmit={(e) => void submitComment(e)} className="mt-3 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={500}
                  placeholder="Escribir un comentario..."
                  className="min-h-[48px] flex-1 rounded-xl border border-[#E8EEF3] px-4 text-base"
                />
                <Button type="submit" variant="primary" size="lg" disabled={submitting || !draft.trim()}>
                  Enviar
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
