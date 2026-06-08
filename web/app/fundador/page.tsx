"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FundadorCommunityLanding } from "@/components/founder/FundadorCommunityLanding";
import {
  activateFounderCommunityPreview,
  isFounderCommunityPreviewActive,
} from "@/lib/founder/communityPreviewBypass";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";
import { trackFounderView } from "@/lib/founder/founderConversionTelemetry";

function FundadorPageContent() {
  const searchParams = useSearchParams();
  const [qualified, setQualified] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);

  useEffect(() => {
    trackFounderView();
  }, []);

  useEffect(() => {
    setQualified(isFoundingMemberQualified());
    setPreview(isFounderCommunityPreviewActive());

    const token = searchParams.get("preview-comunidad")?.trim();
    if (token) {
      if (activateFounderCommunityPreview(token)) {
        setPreview(true);
        setPreviewMsg("Modo exploración activado. Podés recorrer el barrio sin cuestionario.");
      } else {
        setPreviewMsg(
          "Clave incorrecta o falta NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY en .env.local",
        );
      }
    }
  }, [searchParams]);

  const debugFounderExit =
    process.env.NODE_ENV === "development" &&
    searchParams.get("debugFounderExit") === "1";

  return (
    <FundadorCommunityLanding
      qualified={qualified}
      preview={preview}
      previewMsg={previewMsg}
      debugFounderExit={debugFounderExit}
    />
  );
}

export default function FundadorPage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-[#F8FAFC]" />}>
      <FundadorPageContent />
    </Suspense>
  );
}
