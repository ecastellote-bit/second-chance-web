import type { ReactNode } from "react";
import { FullAnswersProvider } from "./fullAnswersContext";

export default function FullLayout({ children }: { children: ReactNode }) {
  return <FullAnswersProvider>{children}</FullAnswersProvider>;
}

