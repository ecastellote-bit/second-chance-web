import { listCircleSignals } from "@/lib/learning/circleSignals";
import { listCommunityAdminPosts } from "@/lib/learning/communityAdminPosts";
import { listCommunityReports } from "@/lib/learning/communityReports";
import { listFormationSuggestions } from "@/lib/learning/formationSuggestions";
import { listFounderExitFeedback } from "@/lib/learning/founderExitFeedback";
import {
  getFounderProjectSeedStoreStatus,
  listFounderProjectSeeds,
} from "@/lib/learning/founderProjectSeeds";
import { listFounderProjectGuidedContributions } from "@/lib/learning/founderProjectGuidedContributions";
import { listFounderProjectSignals } from "@/lib/learning/founderProjectSignals";
import { listNotificationEvents } from "@/lib/learning/notificationEvents";
import { listSurfaceInterestLeads } from "@/lib/learning/surfaceInterestLeads";
import { maskAdminEmail } from "@/lib/admin/adminSessionCache";
import { readPendingHumanReviews } from "@/lib/admin/readPendingHumanReviews";
import { countUserInboxStatuses } from "@/lib/admin/userInboxCounts";
import { SURFACE_TYPE_LABEL } from "@/lib/admin/userInboxLabels";
import {
  isUserInboxAttentionStatus,
  userInboxStatusLabel,
} from "@/lib/admin/userInboxTypes";
import { KIND_LABEL, PANEL_HREFS, reportReasonLabel } from "./labels";
import type {
  ModerationInboxItem,
  ModerationQuickAction,
  ModerationStoreAlert,
  ModerationSummaryCounts,
  UnifiedModerationDashboard,
} from "./types";

const INBOX_LIMIT = 120;

function excerpt(text: string, max = 140): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function reportTargetHref(targetType: string, targetId: string): string | undefined {
  switch (targetType) {
    case "founder_project":
      return `/proyectos/semilla/${encodeURIComponent(targetId)}`;
    case "circle":
      return `/circulos/${encodeURIComponent(targetId)}`;
    case "formation_opportunity":
      return "/formacion";
    case "project_guided_contribution":
      return `${PANEL_HREFS.contributions}?projectId=${encodeURIComponent(targetId)}`;
    default:
      return undefined;
  }
}

const USER_INBOX_ACTIONS: ModerationQuickAction[] = [
  {
    id: "needs_reply",
    label: "Para responder",
    variant: "lime",
    payload: { adminStatus: "needs_reply" },
    isUserInboxAction: true,
  },
  {
    id: "reviewed",
    label: "Revisado",
    variant: "primary",
    payload: { adminStatus: "reviewed" },
    isUserInboxAction: true,
  },
  {
    id: "archived",
    label: "Archivar",
    variant: "secondary",
    payload: { adminStatus: "archived" },
    isUserInboxAction: true,
  },
];

function seedActions(status: string): ModerationQuickAction[] {
  if (status === "pending_review") {
    return [
      {
        id: "publish",
        label: "Publicar",
        variant: "primary",
        payload: { status: "published" },
        requiresConfirm: true,
      },
      {
        id: "hide",
        label: "Ocultar",
        variant: "secondary",
        payload: { status: "hidden" },
        requiresConfirm: true,
      },
    ];
  }
  if (status === "published") {
    return [
      {
        id: "hide",
        label: "Ocultar",
        variant: "secondary",
        payload: { status: "hidden" },
        requiresConfirm: true,
      },
      {
        id: "review",
        label: "Volver a revisión",
        variant: "secondary",
        payload: { status: "pending_review" },
      },
    ];
  }
  if (status === "hidden") {
    return [
      {
        id: "publish",
        label: "Publicar",
        variant: "primary",
        payload: { status: "published" },
        requiresConfirm: true,
      },
      {
        id: "review",
        label: "En revisión",
        variant: "secondary",
        payload: { status: "pending_review" },
      },
    ];
  }
  return [];
}

function contributionActions(status: string): ModerationQuickAction[] {
  if (status === "pending_review") {
    return [
      {
        id: "visible",
        label: "Hacer visible",
        variant: "primary",
        payload: { status: "visible" },
        requiresConfirm: true,
      },
      {
        id: "hidden",
        label: "Ocultar",
        variant: "secondary",
        payload: { status: "hidden" },
        requiresConfirm: true,
      },
      { id: "flagged", label: "Flaggear", variant: "danger", payload: { status: "flagged" } },
    ];
  }
  return [
    {
      id: "visible",
      label: "Visible",
      variant: "primary",
      payload: { status: "visible" },
      requiresConfirm: true,
    },
    {
      id: "hidden",
      label: "Ocultar",
      variant: "secondary",
      payload: { status: "hidden" },
      requiresConfirm: true,
    },
    { id: "flagged", label: "Flaggear", variant: "danger", payload: { status: "flagged" } },
    { id: "archived", label: "Archivar", variant: "secondary", payload: { status: "archived" } },
  ];
}

function circleSignalActions(
  signalType: string,
  status: string,
  publicStatus?: string,
): ModerationQuickAction[] {
  const actions: ModerationQuickAction[] = [];
  if (signalType === "circle_idea" && publicStatus !== "visible") {
    actions.push({
      id: "approve_visibility",
      label: "Aprobar idea curada",
      variant: "lime",
      payload: { action: "approve_visibility" },
      needsPublicText: true,
    });
  }
  if (signalType === "circle_idea" && publicStatus === "visible") {
    actions.push({
      id: "hide_visibility",
      label: "Ocultar visibilidad",
      variant: "secondary",
      payload: { action: "hide_visibility" },
      requiresConfirm: true,
    });
  }
  if (status === "active") {
    actions.push(
      { id: "reviewed", label: "Marcar revisada", variant: "primary", payload: { status: "reviewed" } },
      { id: "flagged", label: "Flaggear", variant: "danger", payload: { status: "flagged" } },
    );
  }
  return actions;
}

export async function loadUnifiedModerationDashboard(): Promise<UnifiedModerationDashboard> {
  const [
    seeds,
    contributions,
    circleSignals,
    reports,
    adminPosts,
    projectSignals,
    formations,
    notifications,
    surfaceLeads,
    exitFeedback,
    storeStatus,
    humanReviews,
  ] = await Promise.all([
    listFounderProjectSeeds({ limit: 300 }),
    listFounderProjectGuidedContributions({ limit: 300 }),
    listCircleSignals({ limit: 300 }),
    listCommunityReports({ limit: 300 }),
    listCommunityAdminPosts({ limit: 200 }),
    listFounderProjectSignals({ limit: 300 }),
    listFormationSuggestions({ limit: 200 }),
    listNotificationEvents({ limit: 300 }),
    listSurfaceInterestLeads(),
    listFounderExitFeedback(),
    getFounderProjectSeedStoreStatus(),
    readPendingHumanReviews(),
  ]);

  const inboxCounts = countUserInboxStatuses(surfaceLeads, exitFeedback);

  const counts: ModerationSummaryCounts = {
    seedsPendingReview: seeds.filter((s) => s.status === "pending_review").length,
    contributionsPendingReview: contributions.filter((c) => c.status === "pending_review")
      .length,
    contributionsFlagged: contributions.filter((c) => c.status === "flagged").length,
    circleIdeasPending: circleSignals.filter(
      (s) =>
        s.signalType === "circle_idea" &&
        s.status === "active" &&
        s.publicStatus !== "visible",
    ).length,
    reportsNew: reports.filter((r) => r.status === "new").length,
    adminPostsDraft: adminPosts.filter((p) => p.status === "draft").length,
    projectSignalsActive: projectSignals.filter((s) => s.status === "active").length,
    formationNew: formations.filter((f) => f.status === "new").length,
    notificationsPending: notifications.filter((n) => n.status === "pending").length,
    notificationsFailed: notifications.filter((n) => n.status === "failed").length,
    surfaceInterestNew: surfaceLeads.filter((l) => isUserInboxAttentionStatus(l.status)).length,
    exitFeedbackNew: exitFeedback.filter((f) => isUserInboxAttentionStatus(f.status)).length,
    userInboxNeedsReply: inboxCounts.needsReply,
    userInboxArchived: inboxCounts.archived + inboxCounts.hidden,
    humanReviewPending: humanReviews.length,
  };

  const storeAlert: ModerationStoreAlert = {
    show: Boolean(storeStatus && (!storeStatus.durable || storeStatus.backend === "local_jsonl")),
    message:
      "Moderá en producción (www.vocationup.com). Este entorno puede estar leyendo depósito local o sin Blob durable.",
    backend: storeStatus?.backend,
    durable: storeStatus?.durable,
  };

  const items: ModerationInboxItem[] = [];

  for (const lead of surfaceLeads.filter((x) => isUserInboxAttentionStatus(x.status))) {
    items.push({
      id: lead.leadId,
      kind: "surface_interest",
      priority: lead.status === "needs_reply" ? 2 : 5,
      title: `Interés · ${SURFACE_TYPE_LABEL[lead.surfaceType] ?? lead.surfaceType}`,
      excerpt: excerpt(`${maskAdminEmail(lead.email)} — ${lead.text}`),
      status: lead.status,
      statusLabel: userInboxStatusLabel(lead.status),
      createdAt: lead.createdAt,
      relatedLabel: lead.path ?? undefined,
      panelHref: PANEL_HREFS.userInbox,
      actions: USER_INBOX_ACTIONS,
      meta: { surfaceType: lead.surfaceType },
    });
  }

  for (const fb of exitFeedback.filter((x) => isUserInboxAttentionStatus(x.status))) {
    items.push({
      id: fb.feedbackId,
      kind: "exit_feedback",
      priority: fb.status === "needs_reply" ? 1 : 4,
      title: "Feedback de salida /fundador",
      excerpt: excerpt(
        `Feedback registrado${fb.exitTrigger ? ` · ${fb.exitTrigger}` : ""} — ver inbox`,
      ),
      status: fb.status,
      statusLabel: userInboxStatusLabel(fb.status),
      createdAt: fb.createdAt,
      relatedLabel: fb.exitTrigger ?? undefined,
      panelHref: PANEL_HREFS.userInbox,
      actions: USER_INBOX_ACTIONS,
      meta: { exitTrigger: fb.exitTrigger ?? undefined },
    });
  }

  for (const r of reports.filter((x) => x.status === "new")) {
    items.push({
      id: r.reportId,
      kind: "report",
      priority: 15,
      title: `Reporte · ${reportReasonLabel(r.reason)}`,
      excerpt: excerpt(r.details ?? `Origen: ${r.targetType}`),
      status: r.status,
      statusLabel: "Nuevo",
      createdAt: r.createdAt,
      relatedLabel: r.targetType,
      relatedHref: reportTargetHref(r.targetType, r.targetId),
      panelHref: PANEL_HREFS.reports,
      risk: "report",
      actions: [
        { id: "reviewed", label: "Revisado", variant: "primary", payload: { status: "reviewed" } },
        {
          id: "dismissed",
          label: "Descartar",
          variant: "secondary",
          payload: { status: "dismissed" },
          requiresConfirm: true,
        },
        {
          id: "action_taken",
          label: "Acción tomada",
          variant: "lime",
          payload: { status: "action_taken" },
        },
      ],
      meta: { targetType: r.targetType, targetId: r.targetId },
    });
  }

  for (const review of humanReviews) {
    const urgency = review.triggerResult?.urgency ?? "low";
    const reasonCount = review.triggerResult?.reasons?.length ?? 0;
    items.push({
      id: review.caseId ?? review.queuedAt,
      kind: "human_review",
      priority: 17,
      title: `Revisión humana · urgencia ${urgency}`,
      excerpt: excerpt(
        `${reasonCount} señal(es) de escalado — abrí el panel para ver el detalle completo.`,
      ),
      status: "pending",
      statusLabel: "Pendiente",
      createdAt: review.queuedAt,
      panelHref: "/admin/reviews",
      actions: [
        {
          id: "open_reviews",
          label: "Ver en revisión",
          variant: "primary",
          payload: {},
          requiresPanel: true,
        },
      ],
      meta: { urgency },
    });
  }

  for (const s of seeds.filter((x) => x.status === "pending_review")) {
    items.push({
      id: s.seedId,
      kind: "seed",
      priority: 20,
      title: s.title,
      excerpt: excerpt(s.summary ?? ""),
      status: s.status,
      statusLabel: "En revisión",
      createdAt: s.createdAt,
      relatedHref: `/proyectos/semilla/${encodeURIComponent(s.seedId)}`,
      panelHref: PANEL_HREFS.seeds,
      actions: seedActions(s.status),
      meta: { userId: s.userId ?? undefined },
    });
  }

  for (const c of contributions.filter(
    (x) => x.status === "pending_review" || x.status === "flagged",
  )) {
    items.push({
      id: c.contributionId,
      kind: "contribution",
      priority: c.status === "flagged" ? 35 : 30,
      title: c.projectTitle,
      excerpt: excerpt(c.text),
      status: c.status,
      statusLabel: c.status === "flagged" ? "Flaggeado" : "En revisión",
      createdAt: c.createdAt,
      relatedHref: `/proyectos/semilla/${encodeURIComponent(c.projectId)}`,
      panelHref: PANEL_HREFS.contributions,
      risk: c.status === "flagged" ? "flagged" : undefined,
      actions: contributionActions(c.status),
      meta: { projectId: c.projectId },
    });
  }

  for (const s of circleSignals.filter(
    (x) =>
      x.signalType === "circle_idea" && x.status === "active" && x.publicStatus !== "visible",
  )) {
    items.push({
      id: s.signalId,
      kind: "circle_signal",
      priority: 40,
      title: `${s.circleTitle} · idea de círculo`,
      excerpt: excerpt(s.note ?? s.publicText ?? ""),
      status: s.publicStatus ?? "not_public",
      statusLabel: "Idea pendiente de curar",
      createdAt: s.createdAt,
      relatedHref: `/circulos/${encodeURIComponent(s.circleId)}`,
      panelHref: PANEL_HREFS.circleSignals,
      actions: circleSignalActions(s.signalType, s.status, s.publicStatus),
      meta: { circleId: s.circleId, draftText: s.note ?? s.publicText ?? "" },
    });
  }

  for (const p of adminPosts.filter((x) => x.status === "draft")) {
    items.push({
      id: p.postId,
      kind: "admin_post",
      priority: 50,
      title: p.title,
      excerpt: excerpt(p.body),
      status: p.status,
      statusLabel: "Borrador",
      createdAt: p.createdAt,
      relatedLabel: `${p.targetType} · ${p.targetId}`,
      panelHref: PANEL_HREFS.adminPosts,
      actions: [
        {
          id: "publish",
          label: "Publicar",
          variant: "primary",
          payload: { status: "published" },
          requiresConfirm: true,
        },
        {
          id: "panel",
          label: "Editar en panel",
          variant: "secondary",
          payload: {},
          requiresPanel: true,
        },
      ],
    });
  }

  for (const s of projectSignals.filter((x) => x.status === "active")) {
    items.push({
      id: s.signalId,
      kind: "project_signal",
      priority: 60,
      title: s.projectTitle,
      excerpt: `${s.signalType}${s.capabilities?.length ? ` · ${s.capabilities.join(", ")}` : ""}`,
      status: s.status,
      statusLabel: "Activa",
      createdAt: s.createdAt,
      relatedHref: `/proyectos/semilla/${encodeURIComponent(s.projectId)}`,
      panelHref: PANEL_HREFS.projectSignals,
      actions: [
        { id: "reviewed", label: "Revisada", variant: "primary", payload: { status: "reviewed" } },
        { id: "flagged", label: "Flaggear", variant: "danger", payload: { status: "flagged" } },
      ],
      meta: { projectId: s.projectId },
    });
  }

  for (const f of formations.filter((x) => x.status === "new")) {
    items.push({
      id: f.suggestionId,
      kind: "formation",
      priority: 70,
      title: "Sugerencia de formación",
      excerpt: excerpt(f.text),
      status: f.status,
      statusLabel: "Nueva",
      createdAt: f.createdAt,
      panelHref: PANEL_HREFS.formation,
      actions: [
        { id: "reviewed", label: "Revisada", variant: "primary", payload: { status: "reviewed" } },
        { id: "archived", label: "Archivar", variant: "secondary", payload: { status: "archived" } },
      ],
      meta: { userId: f.userId },
    });
  }

  for (const n of notifications.filter((x) => x.status === "pending" || x.status === "failed")) {
    items.push({
      id: n.notificationId,
      kind: "notification",
      priority: n.status === "failed" ? 85 : 80,
      title: n.title,
      excerpt: excerpt(n.body),
      status: n.status,
      statusLabel: n.status === "failed" ? "Con error" : "Pendiente",
      createdAt: n.createdAt,
      panelHref: PANEL_HREFS.notifications,
      actions: [
        { id: "sent", label: "Gestionada", variant: "primary", payload: { status: "sent" } },
        { id: "skipped", label: "Omitir", variant: "secondary", payload: { status: "skipped" } },
      ],
      meta: { type: n.type, userId: n.userId },
    });
  }

  items.sort((a, b) => a.priority - b.priority || b.createdAt.localeCompare(a.createdAt));

  return {
    generatedAt: new Date().toISOString(),
    counts,
    storeAlert,
    items: items.slice(0, INBOX_LIMIT),
    deepLinks: [
      { label: "Semillas", href: PANEL_HREFS.seeds },
      { label: "Aportes", href: PANEL_HREFS.contributions },
      { label: "Círculos", href: PANEL_HREFS.circleSignals },
      { label: "Reportes", href: PANEL_HREFS.reports },
      { label: "Anuncios", href: PANEL_HREFS.adminPosts },
      { label: "Señales proyecto", href: PANEL_HREFS.projectSignals },
      { label: "Formación", href: PANEL_HREFS.formation },
      { label: "Notificaciones", href: PANEL_HREFS.notifications },
      { label: "Señales email / feedback", href: PANEL_HREFS.userInbox },
      { label: "Revisión humana (diagnóstico)", href: "/admin/reviews" },
    ],
  };
}
