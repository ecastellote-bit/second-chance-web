import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import { sendMessage } from "@/lib/messaging/messageStore";
import {
  ensureUniqueSlug,
  generateSlugFromName,
  normalizeSlug,
} from "@/lib/users/slugUtils";
import { findUserProfileById } from "@/lib/users/userProfileStore";
import {
  APPLICATION_MESSAGE_MAX,
  generateVivoId,
  isActiveCreatorStatus,
  MAX_ACTIVE_PROJECTS_AS_CREATOR,
  MAX_PENDING_APPLICATIONS,
  MAX_ROLES_PER_PROJECT,
  MIN_ROLES_PER_PROJECT,
  PROJECT_DESCRIPTION_MAX,
  type CreateProjectRoleInput,
  type MisProyectosPayload,
  type ProjectDetailPayload,
  type ProjectListFilters,
  type ProjectMemberStatus,
  type ProjectStatus,
  type VivoProject,
  type VivoProjectMember,
  type VivoProjectMilestone,
  type VivoProjectRole,
} from "./projectTypes";

const PROJECT_BLOB = "vu-proyectos-vivos/projects";
const ROLE_BLOB = "vu-proyectos-vivos/roles";
const MEMBER_BLOB = "vu-proyectos-vivos/members";
const MILESTONE_BLOB = "vu-proyectos-vivos/milestones";

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

export async function listProjects(): Promise<VivoProject[]> {
  if (isVercelBlobConfigured()) {
    return listFromBlob<VivoProject>(PROJECT_BLOB);
  }
  return listFromLocalById<VivoProject>(localPath("vu-proyectos-vivos-projects.jsonl"));
}

export async function listRoles(): Promise<VivoProjectRole[]> {
  if (isVercelBlobConfigured()) {
    return listFromBlob<VivoProjectRole>(ROLE_BLOB);
  }
  return listFromLocalById<VivoProjectRole>(localPath("vu-proyectos-vivos-roles.jsonl"));
}

export async function listMembers(): Promise<VivoProjectMember[]> {
  if (isVercelBlobConfigured()) {
    return listFromBlob<VivoProjectMember>(MEMBER_BLOB);
  }
  return listFromLocalById<VivoProjectMember>(
    localPath("vu-proyectos-vivos-members.jsonl"),
  );
}

export async function listMilestones(): Promise<VivoProjectMilestone[]> {
  if (isVercelBlobConfigured()) {
    return listFromBlob<VivoProjectMilestone>(MILESTONE_BLOB);
  }
  return listFromLocalById<VivoProjectMilestone>(
    localPath("vu-proyectos-vivos-milestones.jsonl"),
  );
}

async function persistProject(project: VivoProject): Promise<void> {
  await persistEntity(PROJECT_BLOB, "vu-proyectos-vivos-projects.jsonl", project);
}

async function persistRole(role: VivoProjectRole): Promise<void> {
  await persistEntity(ROLE_BLOB, "vu-proyectos-vivos-roles.jsonl", role);
}

async function persistMember(member: VivoProjectMember): Promise<void> {
  await persistEntity(MEMBER_BLOB, "vu-proyectos-vivos-members.jsonl", member);
}

async function persistMilestone(milestone: VivoProjectMilestone): Promise<void> {
  await persistEntity(
    MILESTONE_BLOB,
    "vu-proyectos-vivos-milestones.jsonl",
    milestone,
  );
}

export async function findProjectBySlug(slug: string): Promise<VivoProject | null> {
  const normalized = normalizeSlug(slug);
  const projects = await listProjects();
  return projects.find((p) => p.slug === normalized) ?? null;
}

export async function findProjectById(id: string): Promise<VivoProject | null> {
  const projects = await listProjects();
  return projects.find((p) => p.id === id) ?? null;
}

function statusRank(status: ProjectStatus): number {
  if (status === "buscando_miembros") return 0;
  if (status === "en_curso") return 1;
  if (status === "pausado") return 2;
  return 3;
}

export async function listProjectsFiltered(
  filters: ProjectListFilters = {},
): Promise<{ projects: VivoProject[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 24, 1), 48);
  const offset = Math.max(filters.offset ?? 0, 0);
  const q = filters.q?.trim().toLowerCase() ?? "";
  const city = filters.city?.trim().toLowerCase() ?? "";
  const familia = filters.familiaVocacional?.trim() ?? "";
  const status = filters.status || "";

  let projects = await listProjects();
  projects = projects.filter((p) => !p.isDemo || process.env.NODE_ENV !== "production");

  if (familia) {
    projects = projects.filter(
      (p) =>
        p.familiaVocacionalId === familia ||
        p.familiaVocacional.toLowerCase() === familia.toLowerCase(),
    );
  }
  if (city) {
    projects = projects.filter((p) => p.city.toLowerCase().includes(city));
  }
  if (status) {
    projects = projects.filter((p) => p.status === status);
  }
  if (q) {
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  projects.sort((a, b) => {
    const rank = statusRank(a.status) - statusRank(b.status);
    if (rank !== 0) return rank;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const total = projects.length;
  return { projects: projects.slice(offset, offset + limit), total };
}

export async function getProjectDetail(
  slug: string,
  requesterId?: string | null,
): Promise<ProjectDetailPayload | null> {
  const project = await findProjectBySlug(slug);
  if (!project) return null;

  const [roles, members, milestones] = await Promise.all([
    listRoles(),
    listMembers(),
    listMilestones(),
  ]);

  const projectRoles = roles.filter((r) => r.projectId === project.id);
  const projectMembers = members.filter((m) => m.projectId === project.id);
  const projectMilestones = milestones
    .filter((m) => m.projectId === project.id)
    .sort((a, b) => a.order - b.order);

  const accepted = projectMembers.filter((m) => m.status === "aceptado");
  const pending =
    requesterId && requesterId === project.creatorId
      ? projectMembers.filter((m) => m.status === "postulado")
      : [];

  return {
    project,
    roles: projectRoles,
    members: accepted,
    milestones: projectMilestones,
    pendingApplications: pending,
  };
}

export async function createProjectWithRoles(input: {
  userId: string;
  title: string;
  description: string;
  familiaVocacional: string;
  familiaVocacionalId: string;
  city: string;
  coverImage?: string | null;
  roles: CreateProjectRoleInput[];
  isDemo?: boolean;
}): Promise<VivoProject> {
  const userId = input.userId.trim();
  if (!userId) throw new Error("user_id_required");

  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < 3) throw new Error("project_title_required");
  if (description.length < 20) throw new Error("project_description_too_short");
  if (description.length > PROJECT_DESCRIPTION_MAX) {
    throw new Error("project_description_too_long");
  }

  const roles = input.roles
    .map((role) => ({
      title: role.title.trim(),
      description: role.description.trim(),
      skillsNeeded: role.skillsNeeded
        .map((s) => s.trim())
        .filter((s) => s.length >= 2)
        .slice(0, 8),
    }))
    .filter((role) => role.title.length >= 2);

  if (roles.length < MIN_ROLES_PER_PROJECT) throw new Error("project_roles_required");
  if (roles.length > MAX_ROLES_PER_PROJECT) throw new Error("project_roles_too_many");

  const profile = await findUserProfileById(userId);
  if (!profile) throw new Error("profile_not_found");

  const existing = await listProjects();
  const activeCount = existing.filter(
    (p) => p.creatorId === userId && isActiveCreatorStatus(p.status),
  ).length;
  if (activeCount >= MAX_ACTIVE_PROJECTS_AS_CREATOR) {
    throw new Error("project_creator_limit");
  }

  const slug = ensureUniqueSlug(
    generateSlugFromName(title),
    existing.map((p) => p.slug),
  );

  const now = new Date().toISOString();
  const project: VivoProject = {
    id: generateVivoId("prj"),
    slug,
    title,
    description,
    status: "buscando_miembros",
    creatorId: userId,
    creatorName: profile.displayName.trim(),
    creatorSlug: profile.slug?.trim() ?? "",
    creatorImage: profile.avatarUrl?.trim() || null,
    familiaVocacional: input.familiaVocacional.trim() || "General",
    familiaVocacionalId: input.familiaVocacionalId.trim() || "general",
    city: input.city.trim() || "",
    coverImage: input.coverImage?.trim() || null,
    isDemo: input.isDemo === true,
    createdAt: now,
    updatedAt: now,
  };

  await persistProject(project);

  for (const role of roles) {
    const roleRecord: VivoProjectRole = {
      id: generateVivoId("role"),
      projectId: project.id,
      title: role.title,
      description: role.description,
      skillsNeeded: role.skillsNeeded,
      filled: false,
      filledByUserId: null,
      filledByName: null,
      createdAt: now,
    };
    await persistRole(roleRecord);
  }

  return project;
}

export async function applyToRole(input: {
  userId: string;
  slug: string;
  roleId: string;
  message: string;
}): Promise<VivoProjectMember> {
  const userId = input.userId.trim();
  const roleId = input.roleId.trim();
  const message = input.message.trim();

  if (!userId) throw new Error("user_id_required");
  if (!roleId) throw new Error("role_id_required");
  if (message.length < 1) throw new Error("application_message_required");
  if (message.length > APPLICATION_MESSAGE_MAX) {
    throw new Error("application_message_too_long");
  }

  const project = await findProjectBySlug(input.slug);
  if (!project) throw new Error("project_not_found");
  if (project.creatorId === userId) throw new Error("application_self_not_allowed");

  const profile = await findUserProfileById(userId);
  if (!profile) throw new Error("profile_not_found");

  const [roles, members] = await Promise.all([listRoles(), listMembers()]);
  const role = roles.find((r) => r.id === roleId && r.projectId === project.id);
  if (!role) throw new Error("role_not_found");
  if (role.filled) throw new Error("role_already_filled");

  const pendingCount = members.filter(
    (m) => m.userId === userId && m.status === "postulado",
  ).length;
  if (pendingCount >= MAX_PENDING_APPLICATIONS) {
    throw new Error("application_pending_limit");
  }

  const alreadyApplied = members.some(
    (m) =>
      m.projectId === project.id &&
      m.userId === userId &&
      m.roleId === roleId &&
      (m.status === "postulado" || m.status === "aceptado"),
  );
  if (alreadyApplied) throw new Error("application_already_exists");

  const now = new Date().toISOString();
  const member: VivoProjectMember = {
    id: generateVivoId("mem"),
    projectId: project.id,
    userId,
    userName: profile.displayName.trim(),
    userSlug: profile.slug?.trim() ?? "",
    userImage: profile.avatarUrl?.trim() || null,
    roleId: role.id,
    role: role.title,
    status: "postulado",
    message,
    joinedAt: now,
    updatedAt: now,
  };

  await persistMember(member);
  return member;
}

export async function resolveApplication(input: {
  creatorId: string;
  slug: string;
  memberId: string;
  status: Extract<ProjectMemberStatus, "aceptado" | "rechazado">;
}): Promise<{ member: VivoProjectMember; project: VivoProject }> {
  const creatorId = input.creatorId.trim();
  const project = await findProjectBySlug(input.slug);
  if (!project) throw new Error("project_not_found");
  if (project.creatorId !== creatorId) throw new Error("forbidden_not_creator");

  const members = await listMembers();
  const member = members.find(
    (m) => m.id === input.memberId && m.projectId === project.id,
  );
  if (!member) throw new Error("member_not_found");
  if (member.status !== "postulado") throw new Error("application_not_pending");

  const now = new Date().toISOString();
  const updatedMember: VivoProjectMember = {
    ...member,
    status: input.status,
    updatedAt: now,
  };
  await persistMember(updatedMember);

  let updatedProject = project;

  if (input.status === "aceptado") {
    const roles = await listRoles();
    const role = roles.find((r) => r.id === member.roleId);
    if (role && !role.filled) {
      await persistRole({
        ...role,
        filled: true,
        filledByUserId: member.userId,
        filledByName: member.userName,
      });
    }

    if (project.status === "buscando_miembros") {
      updatedProject = {
        ...project,
        status: "en_curso",
        updatedAt: now,
      };
      await persistProject(updatedProject);
    }

    try {
      await sendMessage({
        senderId: creatorId,
        recipientId: member.userId,
        content: `¡Bienvenido al equipo! Te acepté en el rol de ${member.role}.`,
      });
    } catch {
      // No bloquear la aceptación si falla el DM (perfil incompleto del otro, etc.)
    }
  }

  return { member: updatedMember, project: updatedProject };
}

export async function createMilestone(input: {
  creatorId: string;
  slug: string;
  title: string;
  description: string;
  order?: number;
}): Promise<VivoProjectMilestone> {
  const project = await findProjectBySlug(input.slug);
  if (!project) throw new Error("project_not_found");
  if (project.creatorId !== input.creatorId.trim()) {
    throw new Error("forbidden_not_creator");
  }

  const title = input.title.trim();
  if (title.length < 2) throw new Error("milestone_title_required");

  const existing = (await listMilestones()).filter(
    (m) => m.projectId === project.id,
  );
  const order =
    typeof input.order === "number"
      ? input.order
      : existing.reduce((max, m) => Math.max(max, m.order), 0) + 1;

  const milestone: VivoProjectMilestone = {
    id: generateVivoId("ms"),
    projectId: project.id,
    title,
    description: input.description.trim(),
    completed: false,
    completedAt: null,
    order,
    createdAt: new Date().toISOString(),
  };

  await persistMilestone(milestone);
  return milestone;
}

export async function completeMilestone(input: {
  creatorId: string;
  slug: string;
  milestoneId: string;
}): Promise<{
  milestone: VivoProjectMilestone;
  project: VivoProject;
  acceptedMemberIds: string[];
}> {
  const project = await findProjectBySlug(input.slug);
  if (!project) throw new Error("project_not_found");
  if (project.creatorId !== input.creatorId.trim()) {
    throw new Error("forbidden_not_creator");
  }

  const milestones = await listMilestones();
  const milestone = milestones.find(
    (m) => m.id === input.milestoneId && m.projectId === project.id,
  );
  if (!milestone) throw new Error("milestone_not_found");
  if (milestone.completed) throw new Error("milestone_already_completed");

  const now = new Date().toISOString();
  const updated: VivoProjectMilestone = {
    ...milestone,
    completed: true,
    completedAt: now,
  };
  await persistMilestone(updated);

  const projectMilestones = milestones
    .map((m) => (m.id === updated.id ? updated : m))
    .filter((m) => m.projectId === project.id);

  let updatedProject = project;
  const allDone =
    projectMilestones.length > 0 && projectMilestones.every((m) => m.completed);
  if (allDone) {
    updatedProject = { ...project, status: "completado", updatedAt: now };
    await persistProject(updatedProject);
  }

  const members = await listMembers();
  const acceptedMemberIds = members
    .filter((m) => m.projectId === project.id && m.status === "aceptado")
    .map((m) => m.userId);

  return {
    milestone: updated,
    project: updatedProject,
    acceptedMemberIds,
  };
}

export async function listMisProyectos(
  userId: string,
): Promise<MisProyectosPayload> {
  const id = userId.trim();
  const [projects, members] = await Promise.all([listProjects(), listMembers()]);

  const lidero = projects
    .filter((p) => p.creatorId === id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const myMemberships = members.filter((m) => m.userId === id);
  const byProjectId = new Map(projects.map((p) => [p.id, p]));

  const participo = myMemberships
    .filter((m) => m.status === "aceptado")
    .map((m) => {
      const project = byProjectId.get(m.projectId);
      if (!project) return null;
      return { ...project, myRole: m.role };
    })
    .filter((item): item is VivoProject & { myRole: string } => Boolean(item));

  const postule = myMemberships
    .filter((m) => m.status === "postulado")
    .map((m) => {
      const project = byProjectId.get(m.projectId);
      if (!project) return null;
      return { ...project, application: m, roleTitle: m.role };
    })
    .filter(
      (
        item,
      ): item is VivoProject & {
        application: VivoProjectMember;
        roleTitle: string;
      } => Boolean(item),
    );

  return { lidero, participo, postule };
}
