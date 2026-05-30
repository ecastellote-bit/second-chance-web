"use client";

import { useEffect, useState } from "react";
import {
  ADMIN_POST_KIND_LABEL,
  adminPostCtaAnchor,
  adminPostCtaLabel,
} from "@/lib/community/communityAdminPostCopy";
import type {
  CommunityAdminPostKind,
  CommunityAdminPostTargetType,
} from "@/lib/learning/communityAdminPosts";

type PublicPost = {
  postId: string;
  kind: CommunityAdminPostKind;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaSignalType?: string;
  publishedAt?: string | null;
  createdAt: string;
};

type Props = {
  targetType: CommunityAdminPostTargetType;
  targetId: string;
  title: string;
  emptyMessage: string;
  className?: string;
};

export function CommunityAdminPostsBlock({
  targetType,
  targetId,
  title,
  emptyMessage,
  className = "",
}: Props) {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ targetType, targetId, limit: "12" });
        const res = await fetch(`/api/community-admin-posts?${params.toString()}`);
        const data = (await res.json()) as { ok?: boolean; posts?: PublicPost[] };
        if (!cancelled && data.ok && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  return (
    <section
      className={[
        "rounded-2xl border border-[#E8EEF3] bg-white p-4",
        className,
      ].join(" ")}
    >
      <h2 className="text-lg font-bold text-[#0B2E59]">{title}</h2>
      {loading ? (
        <p className="mt-2 text-[13px] text-[#6B7A8C]">Cargando movimientos…</p>
      ) : posts.length === 0 ? (
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {posts.map((post) => {
            const cta = adminPostCtaLabel(targetType, post.ctaLabel, post.ctaSignalType);
            const anchor = adminPostCtaAnchor(targetType, post.ctaSignalType);
            const dateLabel = post.publishedAt ?? post.createdAt;
            return (
              <li
                key={post.postId}
                className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
                  {ADMIN_POST_KIND_LABEL[post.kind]}
                </p>
                <p className="mt-1 text-[14px] font-bold text-[#0B2E59]">{post.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#243647]">{post.body}</p>
                <p className="mt-2 text-[11px] text-[#6B7A8C]">
                  {new Date(dateLabel).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {cta && anchor ? (
                  <a
                    href={anchor}
                    className="vu-focus mt-2 inline-block text-[12px] font-semibold text-[#1A9BB0] underline"
                  >
                    {cta} →
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
