"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FundadorPredictiveLanding } from "@/components/founder/FundadorPredictiveLanding";
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

  return (
    <FundadorPredictiveLanding
      qualified={qualified}
      preview={preview}
      previewMsg={previewMsg}
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
