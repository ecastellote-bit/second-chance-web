export const MESSAGE_CONTENT_MAX_LENGTH = 1000;

export interface VuMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderSlug: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface VuConversation {
  participantA: string;
  participantB: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCountA: number;
  unreadCountB: number;
}

export type VuConversationSummary = VuConversation & {
  otherUserId: string;
  otherUserSlug: string | null;
  otherUserName: string;
  otherUserAvatar: string | null;
  unreadCount: number;
};

export type ListConversationsResult = {
  conversations: VuConversationSummary[];
  totalUnread: number;
};

export type GetConversationMessagesResult = {
  messages: VuMessage[];
  total: number;
};

export function normalizeConversationParticipants(
  userIdA: string,
  userIdB: string,
): { participantA: string; participantB: string } {
  return userIdA < userIdB
    ? { participantA: userIdA, participantB: userIdB }
    : { participantA: userIdB, participantB: userIdA };
}

export function conversationStorageKey(
  participantA: string,
  participantB: string,
): string {
  return `${participantA}__${participantB}`;
}

export function validateMessageContent(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length < 1) {
    throw new Error("message_content_empty");
  }
  if (trimmed.length > MESSAGE_CONTENT_MAX_LENGTH) {
    throw new Error("message_content_too_long");
  }
  return trimmed;
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
