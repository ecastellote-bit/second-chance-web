"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BADGES_EARNED_EVENT } from "@/lib/badges-store/badgeToastClient";
import type { EarnedBadgePayload } from "@/lib/badges-store/userBadgeTypes";
import {
  getCachedProfile,
  getCachedUserId,
} from "@/lib/users/activeUserSession";

type BadgeToastContextValue = {
  queueBadges: (badges: EarnedBadgePayload[]) => void;
};

const BadgeToastContext = createContext<BadgeToastContextValue | null>(null);

export function useBadgeToast(): BadgeToastContextValue {
  const ctx = useContext(BadgeToastContext);
  if (!ctx) {
    return {
      queueBadges: (badges) => {
        if (typeof window === "undefined" || badges.length === 0) return;
        window.dispatchEvent(
          new CustomEvent(BADGES_EARNED_EVENT, { detail: badges }),
        );
      },
    };
  }
  return ctx;
}

function resolveProgressHref(): string {
  const cached = getCachedProfile();
  const slug = cached?.slug?.trim();
  if (slug) return `/perfil/${slug}`;
  return "/perfil";
}

export function BadgeToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<EarnedBadgePayload[]>([]);
  const [current, setCurrent] = useState<EarnedBadgePayload | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const gapTimer = useRef<number | null>(null);
  const queuedSlugs = useRef(new Set<string>());

  const clearTimers = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (gapTimer.current) window.clearTimeout(gapTimer.current);
    hideTimer.current = null;
    gapTimer.current = null;
  }, []);

  const markSeen = useCallback(async (slug: string) => {
    const userId = getCachedUserId();
    if (!userId) return;
    await fetch(`/api/logros/${encodeURIComponent(slug)}/visto`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
  }, []);

  const queueBadges = useCallback((badges: EarnedBadgePayload[]) => {
    if (!badges.length) return;
    setQueue((prev) => {
      const next = [...prev];
      for (const badge of badges) {
        if (queuedSlugs.current.has(badge.slug)) continue;
        queuedSlugs.current.add(badge.slug);
        next.push(badge);
      }
      return next;
    });
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    setVisible(false);
    const slug = current?.slug;
    if (slug) void markSeen(slug);
    gapTimer.current = window.setTimeout(() => {
      setCurrent(null);
    }, 1000);
  }, [clearTimers, current, markSeen]);

  useEffect(() => {
    function onEarned(event: Event) {
      const detail = (event as CustomEvent<EarnedBadgePayload[]>).detail;
      if (Array.isArray(detail)) queueBadges(detail);
    }
    window.addEventListener(BADGES_EARNED_EVENT, onEarned);
    return () => window.removeEventListener(BADGES_EARNED_EVENT, onEarned);
  }, [queueBadges]);

  useEffect(() => {
    const userId = getCachedUserId();
    if (!userId) return;

    void (async () => {
      try {
        const res = await fetch(
          `/api/logros?userId=${encodeURIComponent(userId)}`,
        );
        const data = (await res.json()) as {
          ok?: boolean;
          badges?: Array<{
            slug: string;
            name: string;
            description: string;
            icon: string;
            earned: boolean;
            seen: boolean;
          }>;
        };
        if (!res.ok || !data.ok || !Array.isArray(data.badges)) return;
        const unseen = data.badges
          .filter((b) => b.earned && !b.seen)
          .map((b) => ({
            slug: b.slug,
            name: b.name,
            description: b.description,
            icon: b.icon,
          }));
        queueBadges(unseen);
      } catch {
        // silencioso
      }
    })();
  }, [queueBadges]);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next);
    requestAnimationFrame(() => setVisible(true));
  }, [current, queue]);

  useEffect(() => {
    if (!current || !visible) return;
    clearTimers();
    hideTimer.current = window.setTimeout(() => {
      dismiss();
    }, 5000);
    return clearTimers;
  }, [current, visible, dismiss, clearTimers]);

  const value = useMemo(() => ({ queueBadges }), [queueBadges]);
  const progressHref = resolveProgressHref();

  return (
    <BadgeToastContext.Provider value={value}>
      {children}
      {current ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Cerrar logro"
            onClick={dismiss}
          />
          <div
            className={[
              "fixed z-50 w-[90%] max-w-[360px] rounded-[12px] border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out",
              "bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0",
              visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <button
              type="button"
              onClick={dismiss}
              className="vu-focus absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7A8C]"
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="flex gap-3 pr-6">
              <span className="text-[40px] leading-none" aria-hidden>
                {current.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-[#0B2E59]">
                  ¡Conseguiste {current.name}!
                </p>
                <p className="mt-1 text-sm leading-snug text-[#6B7A8C]">
                  {current.description}
                </p>
                <Link
                  href={progressHref}
                  onClick={dismiss}
                  className="mt-3 inline-flex text-sm font-semibold text-[#1A9BB0] underline"
                >
                  Ver mi progreso
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </BadgeToastContext.Provider>
  );
}
