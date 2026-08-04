"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  SURFACE_INTEREST_TEXT_MAX,
  SURFACE_INTEREST_TEXT_MIN,
} from "@/lib/community/surfaceInterestLimits";
import type { SurfaceInterestConfig } from "@/lib/content/surfaceInterestCopy";
import {
  getObservatorySessionId,
  trackObservatoryEvent,
} from "@/lib/observatory/client";
import {
  fetchClientSessionGate,
  getEmailHint,
  setEmailHint,
} from "@/lib/users/activeUserSession";

type Step = "input" | "email" | "success";

type Props = SurfaceInterestConfig & {
  className?: string;
  onChipSelect?: (chipId: string, label: string) => void;
};

export function QuickInterestCapture({
  intentType,
  title,
  subtitle,
  placeholder,
  primaryCta,
  footnote,
  emailStepTitle,
  emailStepCopy,
  emailCta,
  successTitle,
  successCopy,
  successCopyWithProfile,
  continueHref,
  continueLabel = "Seguir explorando",
  exploreMoreHref,
  exploreMoreLabel,
  actionChips,
  className = "",
  onChipSelect,
}: Props) {
  const pathname = usePathname();
  const [step, setStep] = useState<Step>("input");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [actionMode, setActionMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /** null = aún no evaluamos sesión */
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dedupeKey = `vu_obs_done_surface_interest_started_${intentType}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");
    trackObservatoryEvent("surface_interest_started", "barrio", {
      surface: intentType,
      path: pathname.slice(0, 120),
    });
  }, [intentType, pathname]);

  /** Prefill email + detectar si ya hay perfil (sin forzar gate de create). */
  useEffect(() => {
    const hint = getEmailHint();
    if (hint) setEmail(hint);

    void fetchClientSessionGate().then((gate) => {
      const known =
        gate.reason === "ready" ||
        gate.reason === "email_missing" ||
        gate.reason === "profile_incomplete";
      setHasProfile(known);
    });
  }, []);

  const track = useCallback(
    (
      type:
        | "surface_interest_submitted"
        | "surface_interest_email_requested"
        | "surface_interest_email_submitted"
        | "surface_interest_profile_invite_clicked",
      payload?: Record<string, string | number | boolean | null>,
    ) => {
      trackObservatoryEvent(type, "barrio", {
        surface: intentType,
        path: pathname.slice(0, 120),
        ...payload,
      });
    },
    [intentType, pathname],
  );

  function handleChipClick(chip: { id: string; label: string }) {
    setActionMode(chip.id);
    setText((prev) => (prev.trim() ? prev : chip.label));
    onChipSelect?.(chip.id, chip.label);
  }

  function handleInterestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < SURFACE_INTEREST_TEXT_MIN) {
      setError("Contanos un poco más — al menos unas palabras.");
      return;
    }
    if (trimmed.length > SURFACE_INTEREST_TEXT_MAX) {
      setError(`Máximo ${SURFACE_INTEREST_TEXT_MAX} caracteres.`);
      return;
    }
    setError("");
    track("surface_interest_submitted", {
      textLength: trimmed.length,
      hasActionMode: actionMode ? 1 : 0,
    });
    track("surface_interest_email_requested");
    setStep("email");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/surface-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surfaceType: intentType,
          text: text.trim(),
          email: email.trim(),
          sessionId: getObservatorySessionId(),
          path: pathname,
          actionMode,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      const success = res.ok && data.ok === true;
      track("surface_interest_email_submitted", {
        success: success ? 1 : 0,
        textLength: text.trim().length,
      });
      if (!success) {
        setError(
          data.error === "email_invalid"
            ? "Revisá que el email esté bien escrito."
            : data.error === "text_too_long"
              ? `El texto es demasiado largo (máx. ${SURFACE_INTEREST_TEXT_MAX} caracteres).`
              : data.error === "blob_not_configured"
                ? "No pudimos guardar en este entorno. Probá desde la URL principal."
                : "No pudimos guardar ahora. Probá de nuevo.",
        );
        return;
      }
      setEmailHint(email);
      // Revalidar perfil antes del éxito (por si se creó en otra pestaña).
      const gate = await fetchClientSessionGate();
      const known =
        gate.reason === "ready" ||
        gate.reason === "email_missing" ||
        gate.reason === "profile_incomplete";
      setHasProfile(known);
      setStep("success");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    const profileKnown = hasProfile === true;
    const body =
      profileKnown && successCopyWithProfile
        ? successCopyWithProfile
        : successCopy;

    return (
      <section
        className={[
          "rounded-[24px] border border-[#C6D92D]/40 bg-white p-5 shadow-[0_8px_24px_rgba(15,42,70,0.08)]",
          className,
        ].join(" ")}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">Listo</p>
        <h2 className="mt-1 text-[1.25rem] font-bold text-[#0B2E59]">{successTitle}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{body}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href={continueHref}
            className="vu-focus inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#0B2E59] px-4 text-sm font-semibold text-white"
          >
            {continueLabel}
          </Link>
          {exploreMoreHref && exploreMoreLabel ? (
            <Link
              href={exploreMoreHref}
              className="vu-focus inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#0B2E59]"
            >
              {exploreMoreLabel}
            </Link>
          ) : null}
          {profileKnown ? (
            <Link
              href="/perfil"
              className="vu-focus inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[#E8EEF3] bg-white px-4 text-sm font-semibold text-[#1A9BB0]"
            >
              Ver mi perfil
            </Link>
          ) : (
            <Link
              href={`/perfil/crear?redirect=${encodeURIComponent(pathname || continueHref)}`}
              onClick={() => track("surface_interest_profile_invite_clicked")}
              className="vu-focus inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#0B2E59]"
            >
              Crear perfil (opcional)
            </Link>
          )}
        </div>
        {!profileKnown ? (
          <p className="mt-3 text-[11px] leading-relaxed text-[#6B7A8C]">
            El perfil no es obligatorio para esta señal. Podés seguir sin crearlo.
          </p>
        ) : null}
      </section>
    );
  }

  if (step === "email") {
    return (
      <section
        className={[
          "rounded-[24px] border-2 border-[#1A9BB0]/30 bg-white p-5 shadow-[0_8px_24px_rgba(15,42,70,0.08)]",
          className,
        ].join(" ")}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">Un paso más</p>
        <h2 className="mt-1 text-[1.25rem] font-bold text-[#0B2E59]">{emailStepTitle}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{emailStepCopy}</p>
        <p className="mt-2 text-[12px] leading-relaxed text-[#6B7A8C]">
          Esto no crea un perfil ni abre cuenta. Solo nos permite avisarte si se armar algo
          relacionado.
        </p>
        <form onSubmit={(e) => void handleEmailSubmit(e)} className="mt-4">
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-sm text-[#243647]"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="vu-focus min-h-[44px] flex-1 rounded-xl bg-[#0B2E59] px-4 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading ? "Guardando…" : emailCta}
            </button>
            <button
              type="button"
              onClick={() => setStep("input")}
              className="vu-focus min-h-[44px] rounded-xl border border-[#E8EEF3] px-4 text-sm font-semibold text-[#6B7A8C]"
            >
              Volver
            </button>
          </div>
        </form>
        {error ? <p className="mt-3 text-[12px] text-amber-800">{error}</p> : null}
      </section>
    );
  }

  return (
    <section
      className={[
        "rounded-[24px] border-2 border-[#1A9BB0]/35 bg-white p-5 shadow-[0_8px_28px_rgba(26,155,176,0.12)]",
        className,
      ].join(" ")}
    >
      <h2 className="text-[1.35rem] font-bold leading-snug text-[#0B2E59]">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-[13px] leading-snug text-[#6B7A8C]">{subtitle}</p>
      ) : null}

      {actionChips && actionChips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actionChips.map((chip) => {
            const chipObj = typeof chip === "string" ? { id: chip, label: chip } : chip;
            const active = actionMode === chipObj.id;
            return (
              <button
                key={chipObj.id}
                type="button"
                onClick={() => handleChipClick(chipObj)}
                className={[
                  "vu-focus rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  active
                    ? "bg-[#0B2E59] text-white"
                    : "border border-[#E8EEF3] bg-[#F8FAFC] text-[#0B2E59] hover:border-[#1A9BB0]/40",
                ].join(" ")}
              >
                {chipObj.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <form onSubmit={handleInterestSubmit} className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={SURFACE_INTEREST_TEXT_MAX}
          className="min-h-[120px] w-full resize-y rounded-xl border border-[#E8EEF3] px-4 py-3 text-sm leading-relaxed text-[#243647] placeholder:text-[#9AA8B8]"
        />
        <button
          type="submit"
          className="vu-focus mt-3 min-h-[48px] w-full rounded-xl bg-[#0B2E59] px-4 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(11,46,89,0.22)] active:scale-[0.99] sm:w-auto sm:min-w-[12rem]"
        >
          {primaryCta}
        </button>
      </form>

      {error ? <p className="mt-2 text-[12px] text-amber-800">{error}</p> : null}
      <p className="mt-3 text-[11px] text-[#6B7A8C]">{footnote}</p>
    </section>
  );
}
