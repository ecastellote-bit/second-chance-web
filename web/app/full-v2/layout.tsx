import type { ReactNode } from "react";
import { FullAnswersProvider } from "./fullAnswersContext";

export default function FullFlowV2Layout({
  children,
}: {
  children: ReactNode;
}) {
  return <FullAnswersProvider>{children}</FullAnswersProvider>;
}
