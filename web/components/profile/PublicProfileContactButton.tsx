"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContactModal } from "@/components/messaging/ContactModal";
import { Button } from "@/components/ui/Button";
import { trackMetaEvent } from "@/lib/analytics/trackMetaEvent";
import {
  fetchUserProfile,
  getCachedUserId,
} from "@/lib/users/activeUserSession";
import { isUserProfileComplete } from "@/lib/users/userProfileTypes";

type Props = {
  recipientId: string;
  recipientName: string;
  recipientSlug: string;
};

export function PublicProfileContactButton({
  recipientId,
  recipientName,
  recipientSlug,
}: Props) {
  const router = useRouter();
  const [visitorUserId, setVisitorUserId] = useState<string | null>(null);
  const [visitorHasSlug, setVisitorHasSlug] = useState(false);
  const [visitorProfileComplete, setVisitorProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cachedId = getCachedUserId();

    if (!cachedId) {
      setLoading(false);
      return;
    }

    setVisitorUserId(cachedId);
    void fetchUserProfile(cachedId).then((profile) => {
      if (cancelled) return;
      setVisitorHasSlug(Boolean(profile?.slug?.trim()));
      setVisitorProfileComplete(isUserProfileComplete(profile));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const isOwnProfile = visitorUserId === recipientId;

  if (loading) {
    return (
      <Button variant="primary" size="lg" fullWidth disabled>
        Cargando…
      </Button>
    );
  }

  if (!visitorUserId) {
    return (
      <Link
        href="/perfil/crear"
        className="vu-focus inline-flex min-h-[48px] w-full items-center justify-center rounded-vu-sm bg-[#0B2E59] px-7 text-base font-semibold text-white"
      >
        Unite para contactar
      </Link>
    );
  }

  if (isOwnProfile) {
    return (
      <Button variant="primary" size="lg" fullWidth disabled>
        Este es tu perfil
      </Button>
    );
  }

  if (!visitorProfileComplete || !visitorHasSlug) {
    return (
      <div className="space-y-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push("/perfil/editar")}
          title="Completá tu perfil para contactar a otros."
        >
          Completá tu perfil para contactar
        </Button>
        <p className="text-center text-base text-[#6B7A8C]">
          Completá tu perfil para contactar a otros.
        </p>
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
        senderId={visitorUserId}
      />
    </>
  );
}
