import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import { ConversationThreadView } from "@/components/messaging/ConversationThreadView";

export default async function MensajesThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <UserProfileGate>
      <ConversationThreadView slug={slug} />
    </UserProfileGate>
  );
}
