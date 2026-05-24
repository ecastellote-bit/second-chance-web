import { ArchivedDiagnosticView } from "@/components/diagnostic/ArchivedDiagnosticView";

type Props = {
  params: Promise<{ archiveId: string }>;
};

export default async function ArchivedResultPage({ params }: Props) {
  const { archiveId } = await params;
  return <ArchivedDiagnosticView archiveId={decodeURIComponent(archiveId)} />;
}
