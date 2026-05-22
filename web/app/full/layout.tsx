import type { ReactNode } from "react";
import { FoundationalFlowBootstrap } from "@/components/diagnostic/FoundationalFlowBootstrap";
import { FullAnswersProvider } from "./fullAnswersContext";

export default function FullFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <FullAnswersProvider>
      <FoundationalFlowBootstrap />
      {children}
    </FullAnswersProvider>
  );
}