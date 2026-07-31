"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { APPLICATION_MESSAGE_MAX } from "@/lib/projects-vivos/projectTypes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  roleTitle: string;
  submitting: boolean;
  onSubmit: (message: string) => Promise<void>;
};

export function ApplyToRoleModal({
  isOpen,
  onClose,
  roleTitle,
  submitting,
  onSubmit,
}: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setMessage("");
    setError("");
  }, [isOpen, roleTitle]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Escribí un mensaje corto para el líder.");
      return;
    }
    if (trimmed.length > APPLICATION_MESSAGE_MAX) {
      setError(`Máximo ${APPLICATION_MESSAGE_MAX} caracteres.`);
      return;
    }
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2E59]/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-role-title"
        className="w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow-[0_20px_48px_rgba(11,46,89,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="apply-role-title" className="text-xl font-bold text-[#0B2E59]">
            Sumarme como {roleTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="vu-focus inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-2xl text-[#6B7A8C]"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-base font-semibold text-[#243647]">Tu mensaje</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={APPLICATION_MESSAGE_MAX}
              rows={5}
              placeholder="Contale al líder por qué sos ideal para este rol"
              className="min-h-[120px] w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-base text-[#243647]"
            />
          </label>
          <p className="text-sm text-[#6B7A8C]">
            {message.length} / {APPLICATION_MESSAGE_MAX}
          </p>
          {error ? (
            <p className="text-base text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar postulación"}
          </Button>
        </form>
      </div>
    </div>
  );
}
