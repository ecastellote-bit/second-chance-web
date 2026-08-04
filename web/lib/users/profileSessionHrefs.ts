/**
 * Rutas de alta/continuidad de sesión con retorno al lugar que pedía la acción (Connect).
 */
export function profileSessionHrefs(returnTo: string): {
  create: string;
  resume: string;
  edit: string;
} {
  const path = returnTo.trim() || "/plaza";
  const q = `?redirect=${encodeURIComponent(path)}`;
  return {
    create: `/perfil/crear${q}`,
    resume: `/perfil/continuar${q}`,
    edit: `/perfil/editar${q}`,
  };
}

export function humanMessageSendError(code: string): string {
  const map: Record<string, string> = {
    message_payload_invalid: "Faltan datos del mensaje. Revisá e intentá de nuevo.",
    message_content_empty: "Escribí al menos un carácter.",
    message_content_too_long: "El mensaje es demasiado largo.",
    message_participants_required: "No pudimos identificar a las personas de esta conversación.",
    message_self_not_allowed: "No podés enviarte un mensaje a vos mismo.",
    message_profile_not_found:
      "Hace falta un perfil completo (con nombre público) para enviar mensajes.",
    community_profile_required: "Completá tu perfil para continuar.",
    community_email_required: "Agregá tu email de contacto para continuar.",
    user_id_required: "Retomá o creá tu perfil en este dispositivo para continuar.",
  };
  return map[code] ?? (code.includes("_") ? "No pudimos completar la acción. Probá de nuevo." : code);
}
