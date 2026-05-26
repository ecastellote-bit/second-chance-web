import type { ReactNode } from "react";
import { Suspense } from "react";
import { FoundationalFlowBootstrap } from "@/components/diagnostic/FoundationalFlowBootstrap";
import { FounderWaveBootstrap } from "@/components/diagnostic/FounderWaveBootstrap";
import { FullAnswersProvider } from "./fullAnswersContext";

export default function FullFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <FullAnswersProvider>
      <FoundationalFlowBootstrap />
      <Suspense fallback={null}>
        <FounderWaveBootstrap />
      </Suspense>
      {children}
    </FullAnswersProvider>
  );
}