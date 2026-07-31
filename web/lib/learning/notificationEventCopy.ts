import type { NotificationEventType } from "./notificationEvents";

export const NOTIFICATION_EVENT_ADMIN_COPY = {
  title: "Eventos de notificación",
  subcopy:
    "Esta bandeja registra avisos que VocationUp podrá enviar más adelante por correo. En esta etapa todavía no se envían emails reales.",
  manualStatusNote: "Estado manual de gestión — no implica envío automático por correo.",
  actions: {
    markSent: "Marcar como gestionada",
    markSkipped: "Omitir",
    markFailed: "Marcar con error",
    markPending: "Volver a pendiente",
  },
} as const;

export const NOTIFICATION_EVENT_TYPE_LABEL: Record<NotificationEventType, string> = {
  project_published: "Proyecto publicado",
  project_hidden: "Proyecto pausado",
  project_signal_received: "Señal recibida (dueño)",
  project_contribution_visible: "Aporte publicado",
  circle_idea_visible: "Idea de círculo visible",
  admin_post_published: "Post editorial (pendiente)",
  formation_suggestion_reviewed: "Sugerencia formación revisada",
  vivo_application_received: "Postulación a proyecto vivo",
  vivo_application_response: "Respuesta a postulación",
  vivo_milestone_completed: "Hito de proyecto completado",
};

export const NOTIFICATION_EVENT_STATUS_LABEL = {
  pending: "Pendiente",
  sent: "Gestionada",
  skipped: "Omitida",
  failed: "Con error",
} as const;

export const NOTIFICATION_SKIP_REASON_LABEL: Record<string, string> = {
  no_profile: "Sin perfil",
  no_email: "Sin email",
  no_consent: "Sin consentimiento",
  self_event: "Evento propio",
  duplicate: "Duplicado",
  unknown: "Desconocido",
};

export const NOTIFICATION_MILESTONE_COPY = {
  project_published: {
    title: "Tu proyecto ya es visible en el barrio",
    body: "El equipo publicó tu proyecto para recibir primeras señales. Podés verlo desde tu ficha.",
  },
  project_hidden: {
    title: "Tu proyecto fue pausado en el barrio",
    body: "El equipo pausó la visibilidad de tu proyecto. Podrá revisarse nuevamente más adelante.",
  },
  project_signal_received: {
    title: "Tu proyecto recibió una nueva señal",
    body: "Alguien dejó una señal vinculada a tu proyecto. El equipo la revisará antes de abrir cualquier próximo paso.",
  },
  project_contribution_visible: {
    title: "Tu aporte fue publicado",
    body: "El equipo aprobó tu aporte guiado y ya puede verse en el proyecto, sin mostrar tus datos personales.",
  },
  circle_idea_visible: {
    title: "Tu idea fue publicada en un círculo",
    body: "El equipo curó y publicó una idea vinculada al círculo. Se muestra sin exponer tu identidad.",
  },
  formation_suggestion_reviewed: {
    title: "Tu sugerencia de formación fue revisada",
    body: "El equipo registró tu sugerencia para orientar futuras modalidades formativas.",
  },
  vivo_application_received: {
    title: "Nueva postulación a tu proyecto",
    body: "Alguien quiere sumarse a un rol de tu proyecto colaborativo. Revisá las solicitudes en Mis proyectos.",
  },
  vivo_application_accepted: {
    title: "Te sumaron a un proyecto",
    body: "El líder aceptó tu postulación. Ya podés conversar y ver el proyecto en Mis proyectos.",
  },
  vivo_application_rejected: {
    title: "Postulación no aceptada",
    body: "El líder revisó tu postulación y por ahora no te sumaron a ese rol.",
  },
  vivo_milestone_completed: {
    title: "Un hito del proyecto se completó",
    body: "El líder marcó un hito como hecho. Miralo en la ficha del proyecto.",
  },
} as const;
