export type InAppNotificationType =
  | "mensaje_nuevo_hilo"
  | "postulacion_recibida"
  | "postulacion_aceptada"
  | "postulacion_rechazada"
  | "milestone_completado";

export type InAppNotificationData = {
  url: string;
  threadId?: string | null;
  projectSlug?: string | null;
  milestoneId?: string | null;
};

export type InAppNotification = {
  id: string;
  userId: string;
  type: InAppNotificationType;
  title: string;
  body: string;
  data: InAppNotificationData;
  read: boolean;
  readAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

export function generateInAppNotificationId(): string {
  return `ian_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const IN_APP_NOTIFICATION_ICON: Record<InAppNotificationType, string> = {
  mensaje_nuevo_hilo: "💬",
  postulacion_recibida: "📋",
  postulacion_aceptada: "✅",
  postulacion_rechazada: "❌",
  milestone_completado: "🎯",
};
