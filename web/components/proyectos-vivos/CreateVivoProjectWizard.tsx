"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getCachedUserId, fetchUserProfile } from "@/lib/users/activeUserSession";
import { PROFILE_FAMILIES } from "@/lib/registries/profileFamilies";
import {
  MAX_ROLES_PER_PROJECT,
  MIN_ROLES_PER_PROJECT,
  PROJECT_DESCRIPTION_MAX,
} from "@/lib/projects-vivos/projectTypes";

type RoleDraft = {
  title: string;
  description: string;
  skillsRaw: string;
};

const emptyRole = (): RoleDraft => ({
  title: "",
  description: "",
  skillsRaw: "",
});

export function CreateVivoProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [familiaId, setFamiliaId] = useState("");
  const [city, setCity] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [roles, setRoles] = useState<RoleDraft[]>([emptyRole()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = getCachedUserId();
    setUserId(id);
    if (!id) return;
    void fetchUserProfile(id).then((profile) => {
      if (profile?.familiaVocacional) setFamiliaId(profile.familiaVocacional);
      if (profile?.city) setCity(profile.city);
    });
  }, []);

  const familiaLabel = useMemo(() => {
    return PROFILE_FAMILIES.find((f) => f.id === familiaId)?.label ?? familiaId;
  }, [familiaId]);

  function updateRole(index: number, patch: Partial<RoleDraft>) {
    setRoles((prev) =>
      prev.map((role, i) => (i === index ? { ...role, ...patch } : role)),
    );
  }

  async function publish() {
    if (!userId) {
      router.push("/perfil/crear?redirect=%2Fproyectos%2Fvivos%2Fnuevo");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/proyectos-vivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title,
          description,
          familiaVocacional: familiaLabel,
          familiaVocacionalId: familiaId,
          city,
          coverImage: coverImage.trim() || null,
          roles: roles.map((role) => ({
            title: role.title,
            description: role.description,
            skillsNeeded: role.skillsRaw
              .split(/[,;\n]/)
              .map((s) => s.trim())
              .filter(Boolean),
          })),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        project?: { slug: string };
        error?: string;
      };
      if (!res.ok || !data.ok || !data.project) {
        const map: Record<string, string> = {
          project_creator_limit: "Ya tenés 3 proyectos activos. Completá o pausá uno para crear otro.",
          community_profile_required: "Completá tu perfil para crear un proyecto.",
          community_email_required: "Agregá tu email en el perfil para crear un proyecto.",
        };
        throw new Error(map[data.error ?? ""] ?? data.error ?? "No se pudo publicar");
      }
      router.replace(`/proyectos/vivos/${data.project.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-16">
      <Link href="/proyectos/vivos" className="text-sm font-semibold text-[#1A9BB0] underline">
        ← Proyectos Vivos
      </Link>
      <h1 className="mt-4 text-[1.75rem] font-bold text-[#0B2E59]">
        Crear proyecto colaborativo
      </h1>
      <p className="mt-2 text-base text-[#6B7A8C]">Paso {step} de 3</p>

      {step === 1 ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-5">
          <label className="block space-y-2">
            <span className="font-semibold text-[#243647]">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base"
            />
          </label>
          <label className="block space-y-2">
            <span className="font-semibold text-[#243647]">Descripción</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={PROJECT_DESCRIPTION_MAX}
              rows={5}
              className="min-h-[120px] w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-base"
            />
            <span className="text-sm text-[#6B7A8C]">
              {description.length} / {PROJECT_DESCRIPTION_MAX}
            </span>
          </label>
          <label className="block space-y-2">
            <span className="font-semibold text-[#243647]">Familia vocacional</span>
            <select
              value={familiaId}
              onChange={(e) => setFamiliaId(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] bg-white px-3 text-base"
            >
              <option value="">Elegí una familia</option>
              {PROFILE_FAMILIES.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="font-semibold text-[#243647]">Ciudad</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base"
            />
          </label>
          <label className="block space-y-2">
            <span className="font-semibold text-[#243647]">Imagen de portada (URL)</span>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://… o /vu/…"
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base"
            />
          </label>
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            disabled={title.trim().length < 3 || description.trim().length < 20}
            onClick={() => setStep(2)}
          >
            Continuar
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 space-y-4">
          {roles.map((role, index) => (
            <div
              key={`role-${index}`}
              className="space-y-3 rounded-2xl border border-[#E8EEF3] bg-white p-5"
            >
              <p className="text-sm font-semibold text-[#1A9BB0]">Rol {index + 1}</p>
              <input
                value={role.title}
                onChange={(e) => updateRole(index, { title: e.target.value })}
                placeholder="Título del rol"
                className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base"
              />
              <textarea
                value={role.description}
                onChange={(e) => updateRole(index, { description: e.target.value })}
                placeholder="Qué va a hacer esta persona"
                rows={3}
                className="w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-base"
              />
              <input
                value={role.skillsRaw}
                onChange={(e) => updateRole(index, { skillsRaw: e.target.value })}
                placeholder="Skills separadas por coma"
                className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base"
              />
            </div>
          ))}
          {roles.length < MAX_ROLES_PER_PROJECT ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setRoles((prev) => [...prev, emptyRole()])}
            >
              Agregar otro rol
            </Button>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={
                roles.filter((r) => r.title.trim().length >= 2).length <
                MIN_ROLES_PER_PROJECT
              }
              onClick={() => setStep(3)}
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-5">
          <h2 className="text-xl font-semibold text-[#0B2E59]">Revisar y publicar</h2>
          <p className="text-lg font-semibold text-[#243647]">{title}</p>
          <p className="text-base text-[#6B7A8C]">{description}</p>
          <p className="text-sm text-[#6B7A8C]">
            {familiaLabel || "Sin familia"} · {city || "Sin ciudad"}
          </p>
          <ul className="space-y-2">
            {roles.map((role, index) => (
              <li key={`preview-role-${index}`} className="text-base text-[#243647]">
                · {role.title}
              </li>
            ))}
          </ul>
          {error ? (
            <p className="text-base text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={saving}
              onClick={() => void publish()}
            >
              {saving ? "Publicando..." : "Publicar proyecto"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
