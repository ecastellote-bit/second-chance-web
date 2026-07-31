import type { ProfileFamilyId } from "@/lib/types/profileFamilies";

export const MAX_ACTIVE_PROJECTS_AS_CREATOR = 3;
export const MAX_PENDING_APPLICATIONS = 5;
export const MAX_ROLES_PER_PROJECT = 5;
export const MIN_ROLES_PER_PROJECT = 1;
export const PROJECT_DESCRIPTION_MAX = 500;
export const APPLICATION_MESSAGE_MAX = 300;

export type ProjectStatus =
  | "buscando_miembros"
  | "en_curso"
  | "completado"
  | "pausado";

export type ProjectMemberStatus =
  | "postulado"
  | "aceptado"
  | "rechazado"
  | "salio";

export type VivoProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ProjectStatus;
  creatorId: string;
  creatorName: string;
  creatorSlug: string;
  creatorImage: string | null;
  familiaVocacional: string;
  familiaVocacionalId: ProfileFamilyId | string;
  city: string;
  coverImage: string | null;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VivoProjectRole = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  skillsNeeded: string[];
  filled: boolean;
  filledByUserId: string | null;
  filledByName: string | null;
  createdAt: string;
};

export type VivoProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userSlug: string;
  userImage: string | null;
  roleId: string;
  role: string;
  status: ProjectMemberStatus;
  message: string;
  joinedAt: string;
  updatedAt: string;
};

export type VivoProjectMilestone = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  order: number;
  createdAt: string;
};

export type CreateProjectRoleInput = {
  title: string;
  description: string;
  skillsNeeded: string[];
};

export type ProjectListFilters = {
  familiaVocacional?: string;
  city?: string;
  status?: ProjectStatus | "";
  q?: string;
  limit?: number;
  offset?: number;
};

export type ProjectDetailPayload = {
  project: VivoProject;
  roles: VivoProjectRole[];
  members: VivoProjectMember[];
  milestones: VivoProjectMilestone[];
  pendingApplications: VivoProjectMember[];
};

export type MisProyectosPayload = {
  lidero: VivoProject[];
  participo: Array<VivoProject & { myRole: string }>;
  postule: Array<
    VivoProject & { application: VivoProjectMember; roleTitle: string }
  >;
};

export function generateVivoId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isActiveCreatorStatus(status: ProjectStatus): boolean {
  return status !== "completado";
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  buscando_miembros: "Buscando equipo",
  en_curso: "En curso",
  completado: "Completado",
  pausado: "Pausado",
};
