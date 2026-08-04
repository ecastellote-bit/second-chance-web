"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CommunityPostCard } from "@/components/comunidad/CommunityPostCard";
import { CreateCommunityPostBox } from "@/components/comunidad/CreateCommunityPostBox";
import { Button } from "@/components/ui/Button";
import { getCachedUserId } from "@/lib/users/activeUserSession";
import type { CommunityPost } from "@/lib/community-store/communityTypes";

export function CommunityFeedView() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getCachedUserId());
  }, []);

  const load = useCallback(async (cursor?: string | null, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("limit", "10");
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/comunidad/posts?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        posts?: CommunityPost[];
        nextCursor?: string | null;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.posts) {
        throw new Error(data.error ?? "No se pudo cargar el feed");
      }
      setPosts((prev) => (append ? [...prev, ...data.posts!] : data.posts!));
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(null, false);
  }, [load]);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl bg-[#F8FAFC] pb-16">
      <header className="px-4 pb-2 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.75rem] font-bold text-[#0B2E59]">
              Comunidad VocationUp
            </h1>
            <p className="mt-1 text-base text-[#6B7A8C]">
              Lo que estamos construyendo juntos
            </p>
          </div>
          <Link
            href="/comunidad/reglas"
            className="text-sm font-semibold text-[#1A9BB0] underline"
          >
            Reglas del barrio
          </Link>
        </div>
        <p className="mt-3 text-sm text-[#6B7A8C]">
          Los temas vienen de los{" "}
          <Link href="/circulos" className="font-semibold text-[#1A9BB0] underline">
            círculos del catálogo
          </Link>
          . No son grupos con membresía. Podés contactar personas desde el{" "}
          <Link
            href="/community/conectar_con_otros"
            className="font-semibold text-[#1A9BB0] underline"
          >
            directorio Connect
          </Link>
          .
        </p>
      </header>

      <CreateCommunityPostBox
        onCreated={(post) => setPosts((prev) => [post, ...prev])}
      />

      <div className="space-y-4 px-4 pt-4">
        {loading ? (
          <p className="text-center text-base text-[#6B7A8C]">Cargando conversación…</p>
        ) : null}

        {error ? (
          <div className="rounded-[12px] border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-base text-[#243647]">{error}</p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-3"
              onClick={() => void load(null, false)}
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        {!loading && !error && posts.length === 0 ? (
          <div className="rounded-[12px] border border-[#E8EEF3] bg-white p-8 text-center">
            <p className="text-lg text-[#243647]">
              Todavía no hay publicaciones. Sé la primera voz del barrio.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/community/conectar_con_otros"
                className="vu-focus inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
              >
                Conocé personas en Connect →
              </Link>
              <Link
                href="/proyectos/vivos"
                className="vu-focus inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
              >
                Proyectos vivos →
              </Link>
            </div>
          </div>
        ) : null}

        {posts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            currentUserId={userId}
            onPostUpdated={(updated) =>
              setPosts((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item)),
              )
            }
          />
        ))}

        {nextCursor ? (
          <div className="flex justify-center py-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={loadingMore}
              onClick={() => void load(nextCursor, true)}
            >
              {loadingMore ? "Cargando…" : "Cargar más"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 space-y-3 px-4 text-center">
        <Link
          href="/mensajes"
          className="block text-base font-semibold text-[#1A9BB0] underline"
        >
          Ir a mis mensajes →
        </Link>
        <Link
          href="/proyectos/vivos"
          className="block text-base font-semibold text-[#1A9BB0] underline"
        >
          ¿Tenés un proyecto? Mirá Proyectos Vivos →
        </Link>
      </div>
    </div>
  );
}
