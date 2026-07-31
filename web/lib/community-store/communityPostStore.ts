import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import { CIRCULOS_CATALOG } from "@/lib/content/circulosCatalog";
import { findUserProfileById } from "@/lib/users/userProfileStore";
import {
  COMMUNITY_COMMENT_MAX,
  COMMUNITY_POST_MAX,
  COMMUNITY_POSTS_PER_DAY,
  containsForbiddenWord,
  generateCommunityId,
  type CommunityComment,
  type CommunityLinkMetadata,
  type CommunityPost,
  type CommunityPostType,
} from "./communityTypes";

const POST_BLOB = "vu-community-feed/posts";
const COMMENT_BLOB = "vu-community-feed/comments";

function localPath(name: string): string {
  return path.join(process.cwd(), "data", name);
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

async function listFromBlob<T extends { id: string }>(
  prefix: string,
  limit = 1000,
): Promise<T[]> {
  const { blobs } = await list({
    prefix: `${prefix}/`,
    limit: Math.min(limit, 1000),
  });
  const items: T[] = [];
  for (const blob of blobs) {
    try {
      const record = await readJsonFromPrivateBlob<T>(blob.pathname);
      if (record?.id) items.push(record);
    } catch {
      continue;
    }
  }
  return items;
}

async function listFromLocalById<T extends { id: string }>(
  filePath: string,
): Promise<T[]> {
  const records = await readJsonlFile<T>(filePath);
  const byId = new Map<string, T>();
  for (const record of records) {
    if (record.id) byId.set(record.id, record);
  }
  return Array.from(byId.values());
}

async function persistEntity<T extends { id: string }>(
  blobPrefix: string,
  localFile: string,
  entity: T,
): Promise<void> {
  if (isVercelBlobConfigured()) {
    await put(`${blobPrefix}/${entity.id}.json`, JSON.stringify(entity), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  await appendJsonlLine(localPath(localFile), entity);
}

export function findCatalogCircle(circleTagSlug: string) {
  const slug = circleTagSlug.trim().toLowerCase();
  return CIRCULOS_CATALOG.find((c) => c.id.toLowerCase() === slug) ?? null;
}

export async function listCommunityPosts(): Promise<CommunityPost[]> {
  if (isVercelBlobConfigured()) {
    return listFromBlob<CommunityPost>(POST_BLOB);
  }
  return listFromLocalById<CommunityPost>(localPath("community-posts.jsonl"));
}

export async function listCommunityComments(): Promise<CommunityComment[]> {
  if (isVercelBlobConfigured()) {
    return listFromBlob<CommunityComment>(COMMENT_BLOB);
  }
  return listFromLocalById<CommunityComment>(localPath("community-comments.jsonl"));
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}::${id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [createdAt, id] = raw.split("::");
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

export async function listFeedPosts(input: {
  limit?: number;
  cursor?: string | null;
  circleTagSlug?: string;
}): Promise<{ posts: CommunityPost[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 30);
  let posts = await listCommunityPosts();

  if (process.env.NODE_ENV === "production") {
    posts = posts.filter((p) => !p.isDemo);
  }

  const tag = input.circleTagSlug?.trim().toLowerCase();
  if (tag) {
    posts = posts.filter((p) => p.circleTagSlug.toLowerCase() === tag);
  }

  posts.sort((a, b) => {
    const byDate = b.createdAt.localeCompare(a.createdAt);
    if (byDate !== 0) return byDate;
    return b.id.localeCompare(a.id);
  });

  const cursor = input.cursor ? decodeCursor(input.cursor) : null;
  if (cursor) {
    posts = posts.filter((p) => {
      if (p.createdAt < cursor.createdAt) return true;
      if (p.createdAt > cursor.createdAt) return false;
      return p.id < cursor.id;
    });
  }

  const page = posts.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor =
    page.length === limit && last ? encodeCursor(last.createdAt, last.id) : null;

  return { posts: page, nextCursor };
}

export async function countPostsByUserToday(userId: string): Promise<number> {
  const id = userId.trim();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();
  const posts = await listCommunityPosts();
  return posts.filter((p) => p.authorId === id && p.createdAt >= startIso).length;
}

export async function createCommunityPost(input: {
  userId: string;
  content: string;
  type?: CommunityPostType;
  metadata?: CommunityLinkMetadata | null;
  circleTagSlug: string;
}): Promise<CommunityPost> {
  const userId = input.userId.trim();
  if (!userId) throw new Error("user_id_required");

  const content = input.content.trim();
  if (!content) throw new Error("post_content_required");
  if (content.length > COMMUNITY_POST_MAX) throw new Error("post_content_too_long");

  const forbidden = containsForbiddenWord(content);
  if (forbidden) throw new Error("post_content_moderated");

  const circle = findCatalogCircle(input.circleTagSlug);
  if (!circle) throw new Error("circle_tag_invalid");

  const profile = await findUserProfileById(userId);
  if (!profile) throw new Error("profile_not_found");

  const todayCount = await countPostsByUserToday(userId);
  if (todayCount >= COMMUNITY_POSTS_PER_DAY) throw new Error("post_daily_limit");

  let type: CommunityPostType = input.type === "enlace" ? "enlace" : "texto";
  let metadata: CommunityLinkMetadata | null = null;
  if (type === "enlace") {
    const url = input.metadata?.url?.trim() ?? "";
    if (!url) throw new Error("link_url_required");
    metadata = {
      url,
      urlTitle: input.metadata?.urlTitle?.trim() || undefined,
      urlDescription: input.metadata?.urlDescription?.trim() || undefined,
      urlImage: input.metadata?.urlImage?.trim() || null,
    };
  }

  const post: CommunityPost = {
    id: generateCommunityId("cpost"),
    content,
    type,
    metadata,
    authorId: userId,
    authorName: profile.displayName.trim(),
    authorSlug: profile.slug?.trim() ?? "",
    authorImage: profile.avatarUrl?.trim() || null,
    circleTag: circle.title,
    circleTagSlug: circle.id,
    likesCount: 0,
    commentsCount: 0,
    likedBy: [],
    createdAt: new Date().toISOString(),
  };

  await persistEntity(POST_BLOB, "community-posts.jsonl", post);
  return post;
}

export async function findCommunityPost(postId: string): Promise<CommunityPost | null> {
  const posts = await listCommunityPosts();
  return posts.find((p) => p.id === postId) ?? null;
}

export async function togglePostLike(input: {
  userId: string;
  postId: string;
}): Promise<{ liked: boolean; likesCount: number; post: CommunityPost }> {
  const userId = input.userId.trim();
  if (!userId) throw new Error("user_id_required");

  const post = await findCommunityPost(input.postId);
  if (!post) throw new Error("post_not_found");

  const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
  const already = likedBy.includes(userId);
  let nextLikedBy: string[];
  if (already) {
    nextLikedBy = likedBy.filter((id) => id !== userId);
  } else {
    nextLikedBy = [...likedBy, userId];
  }

  const updated: CommunityPost = {
    ...post,
    likedBy: nextLikedBy,
    likesCount: nextLikedBy.length,
  };
  await persistEntity(POST_BLOB, "community-posts.jsonl", updated);
  return { liked: !already, likesCount: updated.likesCount, post: updated };
}

export async function listCommentsByPost(
  postId: string,
): Promise<CommunityComment[]> {
  const comments = await listCommunityComments();
  return comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createCommunityComment(input: {
  userId: string;
  postId: string;
  content: string;
}): Promise<{ comment: CommunityComment; post: CommunityPost }> {
  const userId = input.userId.trim();
  if (!userId) throw new Error("user_id_required");

  const content = input.content.trim();
  if (!content) throw new Error("comment_content_required");
  if (content.length > COMMUNITY_COMMENT_MAX) {
    throw new Error("comment_content_too_long");
  }

  const forbidden = containsForbiddenWord(content);
  if (forbidden) throw new Error("comment_content_moderated");

  const post = await findCommunityPost(input.postId);
  if (!post) throw new Error("post_not_found");

  const profile = await findUserProfileById(userId);
  if (!profile) throw new Error("profile_not_found");

  const comment: CommunityComment = {
    id: generateCommunityId("ccom"),
    postId: post.id,
    authorId: userId,
    authorName: profile.displayName.trim(),
    authorSlug: profile.slug?.trim() ?? "",
    authorImage: profile.avatarUrl?.trim() || null,
    content,
    createdAt: new Date().toISOString(),
  };

  await persistEntity(COMMENT_BLOB, "community-comments.jsonl", comment);

  const updatedPost: CommunityPost = {
    ...post,
    commentsCount: post.commentsCount + 1,
  };
  await persistEntity(POST_BLOB, "community-posts.jsonl", updatedPost);

  return { comment, post: updatedPost };
}
