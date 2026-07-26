"use client";

import { useEffect, useState } from "react";
import { FundadorCommunityLanding } from "@/components/founder/FundadorCommunityLanding";
import {
  activateFounderCommunityPreview,
  isFounderCommunityPreviewActive,
} from "@/lib/founder/communityPreviewBypass";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";
import { trackFounderView } from "@/lib/founder/founderConversionTelemetry";
import { trackFounderLandingViewed } from "@/lib/telemetry/fundadorInstrumentation";

type Props = {
  previewToken?: string;
  debugFounderExit?: boolean;
};

export default function FundadorPageContent({ previewToken, debugFounderExit = false }: Props) {
  const [qualified, setQualified] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);

  useEffect(() => {
    trackFounderView();
    trackFounderLandingViewed({
      hasFounderParam: false,
      preview: isFounderCommunityPreviewActive(),
      qualified: isFoundingMemberQualified(),
    });
  }, []);

  useEffect(() => {
    setQualified(isFoundingMemberQualified());
    setPreview(isFounderCommunityPreviewActive());

    if (previewToken) {
      if (activateFounderCommunityPreview(previewToken)) {
        setPreview(true);
        setPreviewMsg("Modo exploración activado. Podés recorrer el barrio sin cuestionario.");
      } else {
        setPreviewMsg(
          "Clave incorrecta o falta NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY en .env.local",
        );
      }
    }
  }, [previewToken]);

  return (
    <FundadorCommunityLanding
      qualified={qualified}
      preview={preview}
      previewMsg={previewMsg}
      debugFounderExit={debugFounderExit}
    />
  );
}
