export type UserBadgeRecord = {
  id: string;
  userId: string;
  badgeSlug: string;
  earnedAt: string;
  seen: boolean;
};

export type BadgeView = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
  seen: boolean;
};

export type EarnedBadgePayload = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export function generateUserBadgeId(): string {
  return `ubg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
