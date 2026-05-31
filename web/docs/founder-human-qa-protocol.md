# Protocolo de prueba humana — Ola fundacional (salida controlada)

**Producto:** VocationUp by Second Chance  
**Fase:** salida controlada con primeros usuarios reales — **no** construcción estructural nueva.  
**Última revisión estructural relevante:** P1-G1.1 (perfil → lectura archivada sin loading infinito).

**Documentos relacionados:**

- `web/docs/foundational-invitation-checklist.md` — invitación y preflight técnico  
- `web/docs/user-profile-flow.md` — perfil vs depot humano  
- `web/docs/human-depot-scope.md` — qué va al depósito  
- `web/docs/community-p1f-watchlist.txt` — deuda explícita (email real, `admin_post_published`)

---

## Objetivo de esta fase

Validar que un humano real puede:

1. Completar (o retomar) el diagnóstico y **ver su lectura** sin quedar congelado.  
2. Crear perfil y **entrar al barrio** con gates coherentes.  
3. Usar comunidad (lectura libre + acciones con perfil/email) sin promesas falsas.  
4. Dejar rastro operativo para el equipo (IDs, capturas, clasificación de fallas).

**No es objetivo:** agregar features comunitarias grandes, envío masivo de email, ni “pulir todo” antes del primer usuario.

---

## Qué NO prometer al usuario (copy y conversación)

| Promesa | Realidad hoy |
|---------|----------------|
| “Te llega un mail automático” | Cola **interna** `notification_events` (pending/skipped). **Sin envío SMTP** en P1-F. |
| “Tu email está verificado” | Email privado en perfil + consentimiento; **sin magic link / auth real**. |
| “La plaza te avisa de todo al instante” | Actividad y mensajes en app; notificaciones editoriales masivas **pendientes** (`admin_post_published`). |
| “Todo queda guardado en la nube para siempre” | Depósito humano = cuestionario + sentencia archivados; temáticas/activación son UX, no depot. |
| “Cualquiera puede publicar sin moderación” | Proyectos, ideas de círculo y aportes pasan por **visibilidad administrada**. |
| “Si tocás Ver mi diagnóstico siempre abre” | Abre si hay referencia + caso en servidor; si no, debe ver **fallback** (P1-G1.1), no spinner eterno. |

Si el usuario pregunta por email: decir que el equipo puede contactarlo **manualmente** si dejó email y consentimiento, y que las alertas automáticas por correo vienen después.

---

## Preflight (antes de abrir la primera tanda)

Ejecutar **una vez** por entorno (prod: `https://www.vocationup.com`):

| # | Verificación | Cómo |
|---|----------------|------|
| 1 | Build desplegado incluye P1-G1.1 | Commit `a526181` o posterior en rama desplegada |
| 2 | Blob / human-cases activo | `GET /api/human-cases/status` |
| 3 | Recorrido fundador en prod | `/fundador` → cuestionario → resultado archivado |
| 4 | Perfil → diagnóstico | `/perfil` → “Ver mi diagnóstico” **no** loading infinito |
| 5 | Archive inválido | `/full/result/archivo/id-invalido` → fallback amable |
| 6 | Admin accesible al equipo | `/admin/notification-events` (y rutas admin que usen) |

Registrar en la planilla de ola: fecha, commit/hash desplegado, quien hizo preflight.

---

## Checklist por usuario (sesión guiada ~45–60 min)

Copiar una fila por persona. Campos mínimos al final de la sección **Datos a registrar**.

### A — Entrada y diagnóstico

| # | Paso | Observar | OK / Falla |
|---|------|----------|------------|
| A1 | Abrir `/fundador` o link con `?founder=1` | Mensaje claro, sin errores de consola bloqueantes | |
| A2 | Completar cuestionario (o retomar) | Pasos 1–5, purgatorio/followup si aparece | |
| A3 | Llegar a `/full/result` | Lectura visible, sentencia legible | |
| A4 | Confirmar archivo | ID de caso visible; backup JSON ofrecido si falla guardado | |
| A5 | Anotar `archiveId` | Mismo ID luego en perfil (si aplica) | |

### B — Perfil y recuperación

| # | Paso | Observar | OK / Falla |
|---|------|----------|------------|
| B1 | `/perfil/crear` | Campos obligatorios, sin bloqueo raro | |
| B2 | Guardar perfil | Redirección coherente (plaza o redirect) | |
| B3 | `/perfil` → lectura | Con archivo: **“Ver mi diagnóstico”** abre lectura. Sin archivo: **“Iniciar lectura vocacional”** | |
| B4 | Perfil editar | Cambios persisten tras recargar | |
| B5 | Email + consent (si aplica) | Solo si el usuario quiere; no forzar copy de “verificado” | |

### C — Barrio (lectura + acción)

| # | Paso | Observar | OK / Falla |
|---|------|----------|------------|
| C1 | `/plaza` | Mapa + panel vivo, sin solapamientos críticos | |
| C2 | `/proyectos`, `/circulos`, `/formacion` | Lectura sin perfil OK | |
| C3 | Acción comunitaria (elegir una) | Con perfil incompleto: gate claro. Con perfil+email: acción permitida o mensaje explícito | |
| C4 | Sembrar o señal/aporte (si aplica) | Flujo termina; mensaje de “pendiente revisión” si corresponde | |
| C5 | `/actividad`, `/mensajes` | Lista coherente con lo que hizo | |

### D — Confianza y límites

| # | Paso | Observar | OK / Falla |
|---|------|----------|------------|
| D1 | Recargar página en resultado archivado | No vuelve a loading infinito | |
| D2 | Cambiar de dispositivo (opcional) | Misma cuenta/perfil: expectativa realista (localStorage vs servidor) | |
| D3 | Reportar si algo “no guardó” | Ofrecer export JSON; no culpar al usuario | |

---

## Qué observar (además del OK/Falla)

- **Tiempo percibido** en processing/purgatorio (¿>2 min sin feedback?).  
- **Copy confuso** (jerga interna, promesas de email).  
- **Gates** (¿sabe por qué no puede comentar/señalar?).  
- **Móvil vs desktop** (botones <44px, scroll, teclado en formularios).  
- **Consola red** (404 en `human-cases`, 500 en community POST).  
- **Estado emocional** (frustración, abandono en qué paso).

---

## Datos a registrar (por usuario)

Plantilla sugerida (Notion, sheet o JSONL interno):

```text
fecha_iso:
facilitador:
usuario_alias:          # no DNI en texto plano si no hace falta
dispositivo:            # ej. Android Chrome / iPhone Safari / desktop
archiveId:              # si existe
userId_perfil:          # vu_user_id o id servidor si lo tenés
email_dejado:           # sí/no + consent sí/no (no pegar email en canales públicos)
recorrido_completo:     # sí/no + último paso alcanzado
fallas:                 # lista corta
severidad_max:          # P0 | P1 | P2
accion_equipo:          # fix / workaround / educar usuario / frenar ola
capturas:               # links o carpeta privada
notas_libres:
```

**Privacidad:** no subir capturas con datos sensibles a canales abiertos. Casos humanos completos viven en depot/admin, no en WhatsApp público.

---

## Clasificación de fallas

| Nivel | Definición | Ejemplos | Acción |
|-------|------------|----------|--------|
| **P0 — Frenar ola** | Bloquea confianza o integridad de datos | Loading infinito en diagnóstico/perfil; pérdida silenciosa de caso; acción comunitaria sin gate que expone datos | **Frenar** nuevas invitaciones hasta hotfix |
| **P1 — Seguir con registro** | Flujo alternativo existe; molesto pero no congela | Fallback archive; copy confuso; admin tarda en publicar | Seguir ola; fix en batch quirúrgico |
| **P2 — Post-ola** | Estética, orden UI, textos | Espaciado plaza, typos, orden de botones | Anotar; no bloquear humanos |

**Regla:** un solo P0 en prod con reproducción clara → pausar invitaciones nuevas hasta verificación del fix en prod.

---

## Cuándo frenar vs cuándo seguir

### Frenar (no abrir más usuarios hasta revisión)

- Cualquier **P0** reproducido en producción.  
- `GET /api/human-cases/status` o guardado de caso fallando de forma sistemática.  
- Perfil → “Ver mi diagnóstico” vuelve a **loading infinito** (regresión P1-G1.1).  
- Acciones comunitarias permitidas **sin** perfil/email cuando deberían estar bloqueadas.

### Seguir (con registro disciplinado)

- P1 aislados con workaround documentado (import JSON, reintentar, crear perfil).  
- Usuario no termina por tiempo — **no** es falla de producto si el flujo hasta el paso alcanzado fue OK.  
- Expectativa de email: educar con tabla “qué NO prometer”.  
- Deuda conocida: `admin_post_published`, envío SMTP, auth real.

### Escalar al equipo técnico (mismo día)

- P0 o >3 usuarios con el mismo P1 en 24 h.  
- Incluir: pasos, URL, `archiveId`, dispositivo, hora UTC, captura, commit desplegado.

---

## Smoke rápido post-deploy (5 min, repetible)

1. `/perfil` → **Ver mi diagnóstico** → abre lectura (usuario con archivo).  
2. `/full/result/archivo/id-invalido` → fallback, sin spinner eterno.  
3. Perfil sin lectura → **Iniciar lectura vocacional** → `/comenzar`.  
4. Una lectura en `/plaza` + una página comunitaria.  
5. (Opcional) Disparar hito comunitario y ver evento en `/admin/notification-events` (`pending` o `skipped` con razón).

---

## Verificación interna de notificaciones (no bloqueante)

Tras publicar proyecto, señal, contribución visible, idea de círculo o formación revisada:

- Entrar `/admin/notification-events`.  
- Confirmar fila con `dedupeKey` coherente y status `pending` o `skipped` (`no_consent`, `no_email`, etc.).  
- **No** esperar correo en bandeja del usuario.

Pendiente conocido: **`admin_post_published`** — no probar como prometido al usuario.

---

## Orden recomendado después de este protocolo

1. Ejecutar preflight + 1–3 sesiones piloto con facilitador.  
2. Ajustes **visuales/textuales puntuales** (P2, sin arquitectura nueva).  
3. Abrir primera tanda controlada (tamaño acotado, mismo checklist).  
4. Correcciones **quirúrgicas** según P0/P1 del registro.  
5. Repetir; no expandir scope comunitario por ansiedad.

---

## Criterio de “ola lista”

| Criterio | Requerido |
|----------|-----------|
| P1-G1.1 en prod | Sí |
| Preflight técnico | Sí |
| ≥1 piloto humano sin P0 | Sí |
| Facilitador conoce “qué NO prometer” | Sí |
| Planilla de registro en uso | Sí |
| Envío masivo de email | **No** exigido |
| `admin_post_published` | **No** exigido |

---

*VocationUp by Second Chance — fase de salida controlada. Construcción estructural P1 cerrada; lo que sigue es aprendizaje con humanos reales y fixes acotados.*
