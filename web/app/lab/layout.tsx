import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab interno | VocationUp",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
