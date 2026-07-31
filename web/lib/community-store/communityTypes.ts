export const COMMUNITY_POST_MAX = 1000;
export const COMMUNITY_COMMENT_MAX = 500;
export const COMMUNITY_POSTS_PER_DAY = 5;

export type CommunityPostType = "texto" | "enlace";

export type CommunityLinkMetadata = {
  url: string;
  urlTitle?: string;
  urlDescription?: string;
  urlImage?: string | null;
};

export type CommunityPost = {
  id: string;
  content: string;
  type: CommunityPostType;
  metadata: CommunityLinkMetadata | null;
  authorId: string;
  authorName: string;
  authorSlug: string;
  authorImage: string | null;
  circleTag: string;
  circleTagSlug: string;
  likesCount: number;
  commentsCount: number;
  likedBy: string[];
  isDemo?: boolean;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorSlug: string;
  authorImage: string | null;
  content: string;
  isDemo?: boolean;
  createdAt: string;
};

/** Lista corta y amable — rechazo preventivo, no censura agresiva. */
export const COMMUNITY_FORBIDDEN_WORDS = [
  "idiota",
  "estupido",
  "estúpido",
  "imbecil",
  "imbécil",
  "basura humana",
  "hijo de puta",
  "hdp",
] as const;

export function generateCommunityId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function containsForbiddenWord(text: string): string | null {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  for (const word of COMMUNITY_FORBIDDEN_WORDS) {
    const needle = word
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    if (normalized.includes(needle)) return word;
  }
  return null;
}
