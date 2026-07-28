"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import {
  grantFoundingMember,
  getFoundingMemberArchiveId,
} from "@/lib/learning/foundationalMember";
import {
  fetchCommunityContact,
  fetchUserProfile,
  getOrCreateUserId,
  markProfileComplete,
} from "@/lib/users/activeUserSession";
import {
  parseChipInput,
  type UserProfileClientView,
} from "@/lib/users/userProfileTypes";
import {
  uploadProfileMedia,
  withTimeout,
} from "@/lib/users/uploadProfileMediaClient";
import { ProfilePhotosEditor } from "@/components/perfil/ProfilePhotosEditor";

function mediaUploadError(
  kind: "cover" | "avatar",
  code: string | undefined,
): string {
  if (code === "image_too_large") {
    return kind === "cover"
      ? "La portada supera 3 MB."
      : "La foto supera 3 MB. Elegí otra más liviana.";
  }
  if (code === "image_invalid_type") {
    return "Formato no válido. Usá JPG o PNG (si el celu guardó HEIC, exportá como JPG).";
  }
  if (code?.startsWith("blob_not_configured")) {
    return "El almacenamiento del sitio aún no está listo. Probá en unos minutos o avisá al equipo.";
  }
  if (code?.endsWith("_upload_timeout")) {
    return kind === "cover"
      ? "La portada tardó demasiado en subir."
      : "La foto tardó demasiado en subir. Probá con otra imagen o mejor señal.";
  }
  if (code === "image_empty") {
    return "La imagen llegó vacía. Elegí la foto otra vez.";
  }
  if (code === "image_load_failed") {
    return "No pudimos leer esa imagen. Probá otra de la galería o sacá una foto nueva con la cámara.";
  }
  if (code?.includes("upload_failed")) {
    return kind === "cover"
      ? "No se pudo guardar la portada. Probá con JPG más liviana."
      : "No se pudo guardar la foto en el servidor. Probá con JPG o PNG (máx. 3 MB).";
  }
  return kind === "cover"
    ? "No se pudo guardar la portada."
    : "No se pudo subir la foto. Tocá «Reintentar subida» debajo de la imagen.";
}

function errorCodeFromThrown(err: unknown): string | undefined {
  if (!(err instanceof Error)) return undefined;
  const msg = err.message;
  const head = msg.includes(":") ? msg.split(":")[0] : msg;
  if (head.includes("upload_failed")) return head;
  return head;
}

function profileSaveError(code: string | undefined): string {
  if (code?.startsWith("blob_not_configured")) {
    return "El almacenamiento del sitio aún no está listo. Probá en unos minutos o avisá al equipo.";
  }
  if (code === "profile_save_timeout") {
    return "Guardar el perfil tardó demasiado. Revisá la conexión e intentá de nuevo.";
  }
  if (code === "profile_incomplete") {
    return "Completá todos los campos obligatorios del perfil.";
  }
  if (code === "email_invalid") {
    return "Revisá el email: tiene que tener un formato válido.";
  }
  return code ?? "No se pudo guardar el perfil";
}

type Props = {
  mode: "create" | "edit";
  redirectTo?: string;
};

export function PerfilForm({ mode, redirectTo = "/perfil" }: Props) {
  const router = useRouter();
  const copy = PROFILE_FLOW_COPY.crear;

  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [momentoActual, setMomentoActual] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [buscandoRaw, setBuscandoRaw] = useState("");
  const [aportarRaw, setAportarRaw] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [hasSavedEmail, setHasSavedEmail] = useState(false);
  const [notificationConsent, setNotificationConsent] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRetryKey, setAvatarRetryKey] = useState(0);
  const [coverUploading, setCoverUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!avatarFile) return;

    let cancelled = false;
    const file = avatarFile;
    const userId = getOrCreateUserId();

    setAvatarUploading(true);
    setAvatarError("");

    uploadProfileMedia("avatar", userId, file)
      .then((url) => {
        if (cancelled) return;
        setAvatarUrl(url);
        setAvatarFile(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setAvatarError(mediaUploadError("avatar", errorCodeFromThrown(err)));
      })
      .finally(() => {
        if (!cancelled) setAvatarUploading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [avatarFile, avatarRetryKey]);

  function retryAvatarUpload() {
    if (!avatarFile && !avatarUrl) return;
    if (avatarFile) {
      setAvatarError("");
      setAvatarRetryKey((k) => k + 1);
      return;
    }
    setAvatarError("Elegí la foto de nuevo desde el círculo.");
  }

  useEffect(() => {
    if (!coverFile) return;

    let cancelled = false;
    const file = coverFile;
    const userId = getOrCreateUserId();

    setCoverUploading(true);

    uploadProfileMedia("cover", userId, file)
      .then((url) => {
        if (cancelled) return;
        setCoverUrl(url);
        setCoverFile(null);
      })
      .catch(() => {
        // Portada opcional: el preview local alcanza; se reintenta al guardar si hace falta.
      })
      .finally(() => {
        if (!cancelled) setCoverUploading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coverFile]);

  useEffect(() => {
    const userId = getOrCreateUserId();
    Promise.all([fetchUserProfile(userId), fetchCommunityContact(userId)]).then(
      ([profile, contact]) => {
        if (profile) hydrate(profile);
        setHasSavedEmail(contact.hasEmail);
        setNotificationConsent(contact.notificationConsent);
        setLoading(false);
      },
    );
  }, [mode]);

  function hydrate(profile: UserProfileClientView) {
    setDisplayName(profile.displayName);
    setHeadline(profile.headline);
    setMomentoActual(profile.momentoActual);
    setCountry(profile.country ?? "");
    setCity(profile.city ?? "");
    setBio(profile.bio ?? "");
    setBuscandoRaw(profile.buscando.join(", "));
    setAportarRaw(profile.aportar.join(", "));
    setAvatarUrl(profile.avatarUrl);
    setCoverUrl(profile.coverUrl ?? null);
    if (profile.diagnosticArchiveId?.trim()) {
      grantFoundingMember(profile.diagnosticArchiveId.trim());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const userId = getOrCreateUserId();

    try {
      if (avatarUploading) {
        setError("Esperá unos segundos: la foto de perfil se está subiendo.");
        return;
      }

      let resolvedAvatarUrl = avatarUrl?.trim() || null;
      let resolvedCoverUrl = coverUrl?.trim() || null;

      if (!resolvedAvatarUrl && avatarFile) {
        try {
          resolvedAvatarUrl = await uploadProfileMedia("avatar", userId, avatarFile);
          setAvatarUrl(resolvedAvatarUrl);
          setAvatarFile(null);
        } catch (err) {
          throw new Error(mediaUploadError("avatar", errorCodeFromThrown(err)));
        }
      }

      if (!resolvedCoverUrl && coverFile) {
        try {
          resolvedCoverUrl = await uploadProfileMedia("cover", userId, coverFile);
          setCoverUrl(resolvedCoverUrl);
          setCoverFile(null);
        } catch (err) {
          setError(
            `${mediaUploadError("cover", errorCodeFromThrown(err))} Podés crear el perfil igual; después editás la portada.`,
          );
        }
      }

      if (!resolvedAvatarUrl) {
        if (!avatarFile && !avatarUrl) {
          setAvatarError(
            "Tocá el círculo, elegí una foto de la galería y esperá «Foto lista» en verde.",
          );
        } else if (!avatarError) {
          setAvatarError(
            "La foto aún no terminó de subir. Esperá «Foto lista» o tocá «Reintentar subida».",
          );
        }
        return;
      }

      const res = await withTimeout(
        fetch("/api/user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            displayName,
            headline,
            momentoActual,
            country: country.trim() || undefined,
            city: city.trim() || null,
            bio: bio.trim() || null,
            buscando: parseChipInput(buscandoRaw),
            aportar: parseChipInput(aportarRaw),
            avatarUrl: resolvedAvatarUrl,
            coverUrl: resolvedCoverUrl,
            diagnosticArchiveId: getFoundingMemberArchiveId(),
            cohortBatch: getFoundationalCohortBatch(),
            email: email.trim() || null,
            notificationConsent: email.trim() ? notificationConsent : false,
          }),
        }),
        30_000,
        "profile_save_timeout",
      );

      const data = (await res.json()) as {
        ok?: boolean;
        profile?: UserProfileClientView;
        error?: string;
      };
      if (!data.ok || !data.profile) {
        throw new Error(profileSaveError(data.error));
      }

      markProfileComplete(data.profile);
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7A8C]">
        Cargando perfil…
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#F8FAFC] px-5 py-10 pb-16 font-[family-name:var(--font-inter)]">
      <div className="relative z-10 mx-auto max-w-lg space-y-6">
        <Link href="/perfil" className="text-[12px] font-semibold text-[#1A9BB0] underline">
          ← Perfil
        </Link>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            {copy.eyebrow}
          </p>
          <h1 className="text-[1.5rem] font-bold text-[#0B2E59]">{copy.title}</h1>
          <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{copy.subtitle}</p>
        </div>

        <ProfilePhotosEditor
          displayName={displayName}
          existingAvatarUrl={avatarUrl}
          existingCoverUrl={coverUrl}
          avatarFile={avatarFile}
          coverFile={coverFile}
          onAvatarChange={setAvatarFile}
          onCoverChange={setCoverFile}
          avatarError={avatarError}
          avatarUploading={avatarUploading}
          avatarReady={Boolean(avatarUrl?.trim()) && !avatarUploading}
          coverUploading={coverUploading}
          onRetryAvatar={retryAvatarUpload}
          showRetryAvatar={Boolean(avatarError) && !avatarUploading}
        />

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-5 shadow-sm">
          <Field
            label={PROFILE_FLOW_COPY.fields.displayName}
            value={displayName}
            onChange={setDisplayName}
            required
            minLength={2}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.headline}
            value={headline}
            onChange={setHeadline}
            required
            minLength={10}
            placeholder={PROFILE_FLOW_COPY.hints.headline}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.momentoActual}
            value={momentoActual}
            onChange={setMomentoActual}
            required
            minLength={20}
            multiline
            placeholder={PROFILE_FLOW_COPY.hints.momentoActual}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.country}
            value={country}
            onChange={setCountry}
          />
          <Field
            label="Ciudad"
            value={city}
            onChange={setCity}
            placeholder="Ej. Buenos Aires, Medellín, Madrid"
          />
          <Field
            label="Bio pública"
            value={bio}
            onChange={setBio}
            multiline
            maxLength={280}
            placeholder="Una frase sobre vos para la tarjeta pública (máx. 280 caracteres)."
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.buscando}
            value={buscandoRaw}
            onChange={setBuscandoRaw}
            required
            placeholder={PROFILE_FLOW_COPY.hints.buscando}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.aportar}
            value={aportarRaw}
            onChange={setAportarRaw}
            required
            placeholder={PROFILE_FLOW_COPY.hints.aportar}
          />

          <div className="space-y-3 rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] p-4">
            <div>
              <p className="text-sm font-semibold text-[#0B2E59]">
                {PROFILE_FLOW_COPY.emailSection.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7A8C]">
                {PROFILE_FLOW_COPY.emailSection.body}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#6B7A8C]">
                {PROFILE_FLOW_COPY.emailSection.noVerification}
              </p>
            </div>
            {hasSavedEmail && !email.trim() && (
              <p className="text-xs font-medium text-[#1A9BB0]">
                {PROFILE_FLOW_COPY.emailSection.savedHint}
              </p>
            )}
            <Field
              label={PROFILE_FLOW_COPY.fields.email}
              value={email}
              onChange={setEmail}
              type="email"
              placeholder={PROFILE_FLOW_COPY.hints.email}
            />
            <label className="flex cursor-pointer items-start gap-3 text-sm text-[#243647]">
              <input
                type="checkbox"
                checked={notificationConsent}
                disabled={!email.trim() && !hasSavedEmail}
                onChange={(e) => setNotificationConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#E8EEF3]"
              />
              <span>{PROFILE_FLOW_COPY.fields.notificationConsent}</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={saving || avatarUploading || !avatarUrl?.trim()}
            className="w-full rounded-xl bg-[#0B2E59] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving
              ? "Guardando…"
              : avatarUploading
                ? "Subiendo foto…"
                : mode === "create"
                  ? copy.submitCreate
                  : copy.submitEdit}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  minLength,
  maxLength,
  multiline,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const className =
    "mt-1 w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-sm text-[#243647]";

  return (
    <div>
      <label className="text-sm font-semibold text-[#0B2E59]">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          rows={4}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}
