import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { FullAnswersProvider } from "./fullAnswersContext";

function isFullV2BlockedInProduction(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.NEXT_PUBLIC_VU_FULL_V2_DEV === "1") return false;
  return true;
}

export default function FullFlowV2Layout({
  children,
}: {
  children: ReactNode;
}) {
  if (isFullV2BlockedInProduction()) {
    redirect("/full?founder=1");
  }

  return <FullAnswersProvider>{children}</FullAnswersProvider>;
}
