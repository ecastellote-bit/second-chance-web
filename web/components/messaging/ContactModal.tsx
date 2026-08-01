"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/messaging/messageTypes";
import {
  emitEarnedBadges,
  readEarnedBadgesFromJson,
} from "@/lib/badges-store/badgeToastClient";

export type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientSlug: string;
  senderId: string;
  onSent?: () => void;
};

export function ContactModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientSlug,
  senderId,
  onSent,
}: ContactModalProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setContent("");
    setError("");
    setSuccess("");
    setSending(false);
  }, [isOpen, recipientId]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();

    if (trimmed.length < 1) {
      setError("Escribí al menos un carácter.");
      return;
    }
    if (trimmed.length > MESSAGE_CONTENT_MAX_LENGTH) {
      setError(`El mensaje no puede superar ${MESSAGE_CONTENT_MAX_LENGTH} caracteres.`);
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          recipientId,
          content: trimmed,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo enviar el mensaje");
      }

      emitEarnedBadges(readEarnedBadgesFromJson(data));
      setSuccess(
        "Mensaje enviado. Podés ver la conversación en tu bandeja de entrada.",
      );
      onSent?.();
      window.setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
    } finally {
      setSending(false);
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
        aria-labelledby="contact-modal-title"
        className="w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow-[0_20px_48px_rgba(11,46,89,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="contact-modal-title" className="text-xl font-bold text-[#0B2E59]">
            Contactar a {recipientName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="vu-focus inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-2xl leading-none text-[#6B7A8C]"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-base font-semibold text-[#243647]">Tu mensaje</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Escribí tu mensaje... ¿Qué te interesa de su perfil?"
              maxLength={MESSAGE_CONTENT_MAX_LENGTH}
              rows={5}
              className="min-h-[120px] w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-base leading-relaxed text-[#243647]"
            />
          </label>

          <p className="text-sm text-[#6B7A8C]">
            {content.length} / {MESSAGE_CONTENT_MAX_LENGTH}
          </p>

          {error ? (
            <p className="text-base font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="text-base font-medium text-[#059669]" role="status">
              {success}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={sending || Boolean(success)}
          >
            {sending ? "Enviando..." : "Enviar mensaje"}
          </Button>

          {recipientSlug ? (
            <p className="text-center text-sm text-[#6B7A8C]">
              Perfil: /perfil/{recipientSlug}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
