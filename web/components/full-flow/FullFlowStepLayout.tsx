"use client";

import type { ReactNode } from "react";
import type { FullFlowStationId } from "@/lib/content/fullFlowStations";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import {
  FullFlowActions,
  FullFlowErrorBox,
  FullFlowShell,
  FullFlowStationHeader,
  FullFlowStepCard,
} from "./FullFlowShell";

type StepKey = "step1" | "step2" | "step3" | "step4" | "step5";

const STATION_TO_KEY: Record<FullFlowStationId, StepKey> = {
  1: "step1",
  2: "step2",
  3: "step3",
  4: "step4",
  5: "step5",
};

export function FullFlowStepLayout({
  station,
  errors,
  children,
  onBack,
  onNext,
  nextDisabled,
}: {
  station: FullFlowStationId;
  errors: string[];
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  const copy = FULL_FLOW_COPY[STATION_TO_KEY[station]];

  return (
    <FullFlowShell variant="station" station={station} showPreservationNote>
      <FullFlowStationHeader station={station} />
      <FullFlowErrorBox title={copy.validation.summaryTitle} items={errors} />
      <FullFlowStepCard>{children}</FullFlowStepCard>
      <FullFlowActions
        backLabel={copy.backLabel}
        nextLabel={copy.nextLabel}
        onBack={onBack}
        onNext={onNext}
        nextDisabled={nextDisabled}
      />
    </FullFlowShell>
  );
}
