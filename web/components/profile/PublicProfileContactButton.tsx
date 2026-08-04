"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ContactModal } from "@/components/messaging/ContactModal";
import { SessionContinueLinks } from "@/components/perfil/SessionContinueLinks";
import { Button } from "@/components/ui/Button";
import { trackMetaEvent } from "@/lib/analytics/trackMetaEvent";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import {
  fetchClientSessionGate,
  getCachedUserId,
} from "@/lib/users/activeUserSession";
import { profileSessionHrefs } from "@/lib/users/profileSessionHrefs";

type Props = {
  recipientId: string;
  recipientName: string;
  recipientSlug: string;
};

type VisitorState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "own" }
  | { status: "need_resume_or_create" }
  | { status: "need_complete"; userId: string }
  | { status: "need_email"; userId: string }
  | { status: "ready"; userId: string };

export function PublicProfileContactButton({
  recipientId,
  recipientName,
  recipientSlug,
}: Props) {
  const pathname = usePathname();
  const returnTo = pathname || `/perfil/${recipientSlug}`;
  const hrefs = profileSessionHrefs(returnTo);
  const [state, setState] = useState<VisitorState>({ status: "loading" });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cached = getCachedUserId();
      if (!cached) {
        if (!cancelled) setState({ status: "anonymous" });
        return;
      }
      if (cached === recipientId) {
        if (!cancelled) setState({ status: "own" });
        return;
      }

      const gate = await fetchClientSessionGate();
      if (cancelled) return;

      if (gate.reason === "no_local_identity" || gate.reason === "profile_missing") {
        setState({ status: "need_resume_or_create" });
        return;
      }
      if (gate.reason === "profile_incomplete") {
        setState({ status: "need_complete", userId: gate.userId ?? cached });
        return;
      }
      if (gate.reason === "email_missing") {
        setState({ status: "need_email", userId: gate.userId ?? cached });
        return;
      }
      if (gate.allowed && gate.userId) {
        setState({ status: "ready", userId: gate.userId });
        return;
      }
      setState({ status: "need_resume_or_create" });
    })();

    return () => {
      cancelled = true;
    };
  }, [recipientId]);

  if (state.status === "loading") {
    return (
      <Button variant="primary" size="lg" fullWidth disabled>
        Cargando…
      </Button>
    );
  }

  if (state.status === "own") {
    return (
      <Button variant="primary" size="lg" fullWidth disabled>
        Este es tu perfil
      </Button>
    );
  }

  if (state.status === "anonymous" || state.status === "need_resume_or_create") {
    return (
      <SessionContinueLinks
        returnTo={returnTo}
        title="Para contactar, necesitamos tu perfil"
        body="Si ya creaste perfil en otro dispositivo, retomaló con el email. Si es la primera vez, creá uno. Vas a volver a este perfil."
        density="default"
      />
    );
  }

  if (state.status === "need_complete") {
    return (
      <div className="space-y-3 text-center">
        <p className="text-base font-semibold text-[#0B2E59]">
          {PROFILE_FLOW_COPY.profileIncomplete.title}
        </p>
        <p className="text-sm leading-relaxed text-[#6B7A8C]">
          Completá los datos obligatorios para que la otra persona sepa con quién habla.
        </p>
        <Link
          href={hrefs.edit}
          className="vu-focus inline-flex min-h-[48px] w-full items-center justify-center rounded-vu-sm bg-[#0B2E59] px-7 text-base font-semibold text-white"
        >
          {PROFILE_FLOW_COPY.profileIncomplete.cta}
        </Link>
        <Link
          href={hrefs.resume}
          className="vu-focus block text-sm font-semibold text-[#1A9BB0] underline"
        >
          {PROFILE_FLOW_COPY.identityMissing.ctaResume}
        </Link>
      </div>
    );
  }

  if (state.status === "need_email") {
    return (
      <div className="space-y-3 text-center">
        <p className="text-base font-semibold text-[#0B2E59]">
          {PROFILE_FLOW_COPY.emailMissing.title}
        </p>
        <p className="text-sm leading-relaxed text-[#6B7A8C]">
          {PROFILE_FLOW_COPY.emailMissing.body}
        </p>
        <Link
          href={hrefs.edit}
          className="vu-focus inline-flex min-h-[48px] w-full items-center justify-center rounded-vu-sm bg-[#0B2E59] px-7 text-base font-semibold text-white"
        >
          {PROFILE_FLOW_COPY.emailMissing.cta}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => {
          trackMetaEvent("Contact", {
            content_name: recipientName,
            content_ids: [recipientSlug],
            content_type: "profile",
          });
          setModalOpen(true);
        }}
      >
        Contactar
      </Button>
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        recipientId={recipientId}
        recipientName={recipientName}
        recipientSlug={recipientSlug}
        senderId={state.userId}
      />
    </>
  );
}
