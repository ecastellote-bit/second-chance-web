import type { ReactNode } from "react";
import { FullAnswersProvider } from "./fullAnswersContext";

export default function FullFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <FullAnswersProvider>{children}</FullAnswersProvider>;
}