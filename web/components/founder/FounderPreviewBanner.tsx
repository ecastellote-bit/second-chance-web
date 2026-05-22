"use client";

import { deactivateFounderCommunityPreview, isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";
import { useEffect, useState } from "react";

export function FounderPreviewBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isFounderCommunityPreviewActive());
  }, []);

  if (!active) return null;

  return (
    <div
      className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-[12px] text-amber-950"
      role="status"
    >
      <span className="font-semibold">Modo exploración fundador</span> — barrio sin exigir
      cuestionario ni perfil. Los invitados no ven esto.{" "}
      <button
        type="button"
        onClick={() => {
          deactivateFounderCommunityPreview();
          setActive(false);
          window.location.href = "/fundador";
        }}
        className="font-bold underline"
      >
        Salir del modo
      </button>
    </div>
  );
}
