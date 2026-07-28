import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import { findUserProfileById } from "@/lib/users/userProfileStore";
import {
  conversationStorageKey,
  generateMessageId,
  normalizeConversationParticipants,
  validateMessageContent,
  type GetConversationMessagesResult,
  type ListConversationsResult,
  type VuConversation,
  type VuConversationSummary,
  type VuMessage,
} from "./messageTypes";

const MESSAGE_BLOB_PREFIX = "vu-direct-messages/messages";
const CONVERSATION_BLOB_PREFIX = "vu-direct-messages/conversations";

function localMessagesPath(): string {
  return path.join(process.cwd(), "data", "vu-messages.jsonl");
}

function localConversationsPath(): string {
  return path.join(process.cwd(), "data", "vu-conversations.jsonl");
}

function messageBlobPath(messageId: string): string {
  return `${MESSAGE_BLOB_PREFIX}/${messageId}.json`;
}

function conversationBlobPath(participantA: string, participantB: string): string {
  return `${CONVERSATION_BLOB_PREFIX}/${conversationStorageKey(participantA, participantB)}.json`;
}

async function readJsonFromPrivateBlob<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return JSON.parse(raw) as T;
}

async function readJsonlFile<T>(filePath: string, limit = 5000): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines.slice(-limit).map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}

async function appendJsonlLine(filePath: string, record: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

function belongsToConversation(
  message: VuMessage,
  participantA: string,
  participantB: string,
): boolean {
  const pair = new Set([participantA, participantB]);
  return pair.has(message.senderId) && pair.has(message.recipientId);
}

async function listMessagesFromBlob(limit = 5000): Promise<VuMessage[]> {
  const { blobs } = await list({
    prefix: `${MESSAGE_BLOB_PREFIX}/`,
    limit: Math.min(limit, 1000),
  });

  const messages: VuMessage[] = [];
  for (const blob of blobs) {
    try {
      const record = await readJsonFromPrivateBlob<VuMessage>(blob.pathname);
      if (record?.id) messages.push(record);
    } catch {
      continue;
    }
  }

  return messages;
}

async function listMessagesFromLocal(limit = 5000): Promise<VuMessage[]> {
  const records = await readJsonlFile<VuMessage>(localMessagesPath(), limit);
  const byId = new Map<string, VuMessage>();
  for (const record of records) {
    if (record.id) byId.set(record.id, record);
  }
  return Array.from(byId.values());
}

async function listAllMessages(limit = 5000): Promise<VuMessage[]> {
  if (isVercelBlobConfigured()) {
    return listMessagesFromBlob(limit);
  }
  return listMessagesFromLocal(limit);
}

async function persistMessage(message: VuMessage): Promise<void> {
  if (isVercelBlobConfigured()) {
    await put(messageBlobPath(message.id), JSON.stringify(message), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  await appendJsonlLine(localMessagesPath(), message);
}

async function readConversationFromBlob(
  participantA: string,
  participantB: string,
): Promise<VuConversation | null> {
  return readJsonFromPrivateBlob<VuConversation>(
    conversationBlobPath(participantA, participantB),
  );
}

async function listConversationsFromBlob(limit = 1000): Promise<VuConversation[]> {
  const { blobs } = await list({
    prefix: `${CONVERSATION_BLOB_PREFIX}/`,
    limit: Math.min(limit, 1000),
  });

  const conversations: VuConversation[] = [];
  for (const blob of blobs) {
    try {
      const record = await readJsonFromPrivateBlob<VuConversation>(blob.pathname);
      if (record?.participantA && record?.participantB) {
        conversations.push(record);
      }
    } catch {
      continue;
    }
  }

  return conversations;
}

async function listConversationsFromLocal(limit = 5000): Promise<VuConversation[]> {
  const records = await readJsonlFile<VuConversation>(localConversationsPath(), limit);
  const byKey = new Map<string, VuConversation>();

  for (const record of records) {
    if (!record.participantA || !record.participantB) continue;
    const key = conversationStorageKey(record.participantA, record.participantB);
    const prev = byKey.get(key);
    if (!prev || record.lastMessageAt > prev.lastMessageAt) {
      byKey.set(key, record);
    }
  }

  return Array.from(byKey.values());
}

async function listAllConversations(limit = 1000): Promise<VuConversation[]> {
  if (isVercelBlobConfigured()) {
    return listConversationsFromBlob(limit);
  }
  return listConversationsFromLocal(limit);
}

async function persistConversation(conversation: VuConversation): Promise<void> {
  if (isVercelBlobConfigured()) {
    await put(
      conversationBlobPath(conversation.participantA, conversation.participantB),
      JSON.stringify(conversation),
      {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    );
    return;
  }

  await appendJsonlLine(localConversationsPath(), conversation);
}

async function loadConversation(
  participantA: string,
  participantB: string,
): Promise<VuConversation | null> {
  if (isVercelBlobConfigured()) {
    return readConversationFromBlob(participantA, participantB);
  }

  const conversations = await listConversationsFromLocal(5000);
  const key = conversationStorageKey(participantA, participantB);
  return (
    conversations.find(
      (item) => conversationStorageKey(item.participantA, item.participantB) === key,
    ) ?? null
  );
}

function unreadCountForUser(conversation: VuConversation, userId: string): number {
  if (userId === conversation.participantA) return conversation.unreadCountA;
  if (userId === conversation.participantB) return conversation.unreadCountB;
  return 0;
}

function incrementUnreadForRecipient(
  conversation: VuConversation,
  recipientId: string,
): VuConversation {
  if (recipientId === conversation.participantA) {
    return { ...conversation, unreadCountA: conversation.unreadCountA + 1 };
  }
  if (recipientId === conversation.participantB) {
    return { ...conversation, unreadCountB: conversation.unreadCountB + 1 };
  }
  return conversation;
}

function resetUnreadForReader(
  conversation: VuConversation,
  readerId: string,
): VuConversation {
  if (readerId === conversation.participantA) {
    return { ...conversation, unreadCountA: 0 };
  }
  if (readerId === conversation.participantB) {
    return { ...conversation, unreadCountB: 0 };
  }
  return conversation;
}

export async function sendMessage(input: {
  senderId: string;
  recipientId: string;
  content: string;
}): Promise<VuMessage> {
  const senderId = input.senderId.trim();
  const recipientId = input.recipientId.trim();
  const content = validateMessageContent(input.content);

  if (!senderId || !recipientId) {
    throw new Error("message_participants_required");
  }
  if (senderId === recipientId) {
    throw new Error("message_self_not_allowed");
  }

  const senderProfile = await findUserProfileById(senderId);
  const recipientProfile = await findUserProfileById(recipientId);
  if (!senderProfile || !recipientProfile) {
    throw new Error("message_profile_not_found");
  }

  const createdAt = new Date().toISOString();
  const message: VuMessage = {
    id: generateMessageId(),
    senderId,
    recipientId,
    senderSlug: senderProfile.slug?.trim() ?? "",
    senderName: senderProfile.displayName.trim(),
    senderAvatar: senderProfile.avatarUrl?.trim() || null,
    content,
    createdAt,
    readAt: null,
  };

  const { participantA, participantB } = normalizeConversationParticipants(
    senderId,
    recipientId,
  );

  const existing = await loadConversation(participantA, participantB);
  const baseConversation: VuConversation = existing ?? {
    participantA,
    participantB,
    lastMessageAt: createdAt,
    lastMessagePreview: content.slice(0, 100),
    unreadCountA: 0,
    unreadCountB: 0,
  };

  const updatedConversation = incrementUnreadForRecipient(
    {
      ...baseConversation,
      lastMessageAt: createdAt,
      lastMessagePreview: content.slice(0, 100),
    },
    recipientId,
  );

  await persistMessage(message);
  await persistConversation(updatedConversation);

  return message;
}

export async function listConversationsForUser(
  userId: string,
): Promise<ListConversationsResult> {
  const trimmedUserId = userId.trim();
  if (!trimmedUserId) {
    return { conversations: [], totalUnread: 0 };
  }

  const allConversations = await listAllConversations();
  const userConversations = allConversations.filter(
    (conversation) =>
      conversation.participantA === trimmedUserId ||
      conversation.participantB === trimmedUserId,
  );

  const summaries: VuConversationSummary[] = [];

  for (const conversation of userConversations) {
    const otherUserId =
      conversation.participantA === trimmedUserId
        ? conversation.participantB
        : conversation.participantA;

    const otherProfile = await findUserProfileById(otherUserId);
    const unreadCount = unreadCountForUser(conversation, trimmedUserId);

    summaries.push({
      ...conversation,
      otherUserId,
      otherUserSlug: otherProfile?.slug?.trim() ?? null,
      otherUserName: otherProfile?.displayName.trim() ?? "Miembro del barrio",
      otherUserAvatar: otherProfile?.avatarUrl?.trim() || null,
      unreadCount,
    });
  }

  summaries.sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt));

  const totalUnread = summaries.reduce((sum, item) => sum + item.unreadCount, 0);

  return { conversations: summaries, totalUnread };
}

export async function getConversationMessages(input: {
  userId: string;
  otherUserId: string;
  limit?: number;
  offset?: number;
}): Promise<GetConversationMessagesResult> {
  const userId = input.userId.trim();
  const otherUserId = input.otherUserId.trim();
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  const offset = Math.max(input.offset ?? 0, 0);

  if (!userId || !otherUserId || userId === otherUserId) {
    return { messages: [], total: 0 };
  }

  const { participantA, participantB } = normalizeConversationParticipants(
    userId,
    otherUserId,
  );

  const allMessages = await listAllMessages();
  const threadMessages = allMessages
    .filter((message) => belongsToConversation(message, participantA, participantB))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  const total = threadMessages.length;
  const messages = threadMessages.slice(offset, offset + limit);

  return { messages, total };
}

export async function markMessagesAsRead(input: {
  readerId: string;
  senderId: string;
}): Promise<void> {
  const readerId = input.readerId.trim();
  const senderId = input.senderId.trim();

  if (!readerId || !senderId || readerId === senderId) {
    throw new Error("message_read_invalid");
  }

  const { participantA, participantB } = normalizeConversationParticipants(
    readerId,
    senderId,
  );

  const conversation = await loadConversation(participantA, participantB);
  if (!conversation) return;

  const now = new Date().toISOString();
  const allMessages = await listAllMessages();
  let changedMessages = false;

  for (const message of allMessages) {
    if (
      message.senderId === senderId &&
      message.recipientId === readerId &&
      message.readAt === null
    ) {
      const updated: VuMessage = { ...message, readAt: now };
      await persistMessage(updated);
      changedMessages = true;
    }
  }

  const updatedConversation = resetUnreadForReader(conversation, readerId);
  if (
    changedMessages ||
    updatedConversation.unreadCountA !== conversation.unreadCountA ||
    updatedConversation.unreadCountB !== conversation.unreadCountB
  ) {
    await persistConversation(updatedConversation);
  }
}
