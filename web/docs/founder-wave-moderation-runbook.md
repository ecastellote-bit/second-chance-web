# Hoja operativa — Moderación ola fundacional (1 página)

**Producto:** VocationUp by Second Chance  
**Uso:** equipo fundador / facilitadores durante la **primera tanda humana**  
**Prod:** https://www.vocationup.com — **siempre moderar en prod**, no en localhost.

**Documentos hermanos:**

- `web/docs/founder-human-qa-protocol.md` — qué probar con cada fundador  
- `web/docs/foundational-invitation-checklist.md` — invitación y preflight  
- `web/docs/community-p1f-watchlist.txt` — deuda (email SMTP, `admin_post_published`)

---

## Regla de oro (decirla en voz alta)

| Sí | No |
|----|-----|
| Publicar semillas, aprobar aportes e ideas, cerrar reportes | Prometer **mail automático** |
| Contactar por WhatsApp/email **manual** si hay consentimiento | Decir “cuenta verificada” |
| Registrar en la cola de notificaciones como **gestionada** tras avisar | Asumir que localhost = lo que ven en el celular |

**Los paneles `/admin/*` hoy no tienen login:** no compartir URLs con fundadores; acceso solo del equipo.

---

## Hub de moderación (marcar favoritos)

| # | Panel | URL prod |
|---|--------|----------|
| 1 | **Proyectos sembrados** | https://www.vocationup.com/admin/founder-project-seeds |
| 2 | **Aportes guiados** | https://www.vocationup.com/admin/founder-project-contributions |
| 3 | **Círculos / ideas** | https://www.vocationup.com/admin/circle-signals |
| 4 | **Reportes** | https://www.vocationup.com/admin/community-reports |
| 5 | **Anuncios del barrio** | https://www.vocationup.com/admin/community-admin-posts |
| 6 | **Señales a proyectos** | https://www.vocationup.com/admin/founder-project-signals |
| 7 | **Sugerencias formación** | https://www.vocationup.com/admin/formation-suggestions |
| 8 | **Cola notificaciones** | https://www.vocationup.com/admin/notification-events |

**Diagnóstico / depot (no barrio):**  
https://www.vocationup.com/admin/casos-humanos · https://www.vocationup.com/admin/reviews

---

## Rutina diaria (~20–40 min + respuestas puntuales)

### Apertura (5 min) — “¿Hay fuego?”

1. **Reportes nuevos** → panel 4, filtro **Nuevos**.  
   - Si hay denuncia grave: pausar publicación del contenido en el panel correspondiente (semilla, aporte o círculo) y marcar reporte **Acción tomada**.

2. **Semillas en revisión** → panel 1, filtro **En revisión**.  
   - Objetivo del día: vaciar cola o dejar mensaje claro al fundador (“estamos revisando”).

3. **Aportes en revisión** → panel 2, filtro **En revisión** (default útil).

4. **Alerta roja en semillas:** si dice “depósito local / no durable” → estás en el entorno equivocado; abrir admin en **www.vocationup.com**.

### Bloque proyectos (10–15 min) — “Que el barrio se mueva”

| Paso | Acción | Panel |
|------|--------|-------|
| 1 | Revisar texto de semilla nueva | 1 |
| 2 | Si OK → estado **Publicado** | 1 |
| 3 | Si no OK → dejar **En revisión** u **Oculto** + mensaje manual al fundador | — |
| 4 | Revisar **señales** “me interesa” en proyectos publicados | 6 → marcar **Revisada** |
| 5 | Revisar **aportes** pendientes → **Visible** u **Oculto** | 2 |

**Después de publicar:** el fundador ve el proyecto en `/proyectos`. No implica email automático.

### Bloque círculos y formación (5–10 min)

| Paso | Acción | Panel |
|------|--------|-------|
| 1 | Ideas de círculo (`circle_idea`) → aprobar visibilidad + texto público | 3 |
| 2 | Otras señales de círculo → revisar / flag si hace falta | 3 |
| 3 | Sugerencias de formación nuevas → **Revisada** | 7 |

### Cierre del turno (5 min)

| Paso | Acción | Panel |
|------|--------|-------|
| 1 | ¿Post editorial del día? (aviso barrio / proyecto / círculo) | 5 |
| 2 | Pasar cola **pending** de notificaciones: marcar **Gestionada** si ya contactaste manualmente | 8 |
| 3 | Anotar en sheet interno: semillas publicadas, aportes visibles, incidentes | — |

---

## Quién hace qué (roles mínimos)

| Rol | Responsabilidad | Paneles |
|-----|-----------------|---------|
| **Moderador barrio** | Publicar proyectos, aportes, ideas, reportes, anuncios | 1–5 |
| **Facilitador fundador** | Acompañar diagnóstico/perfil; no tocar estados sin criterio | QA protocol + panel 1 solo si sembró |
| **Técnico / Ernesto** | Blob, casos humanos, bugs P0, deploy | casos-humanos, reviews, lab/prelaunch |
| **Comunicación** | WhatsApp/email manual post-publicación | 8 como registro, no como SMTP |

Una persona puede cubrir moderador + comunicación en la primera tanda.

---

## Qué hace cada panel (acción en una línea)

| Panel | Entrada del usuario | Tu acción |
|-------|---------------------|-----------|
| **Semillas** | Sembró en `/proyectos/sembrar` | `published` = visible en barrio |
| **Aportes** | Dejó texto en ficha de proyecto | `visible` = se muestra al público |
| **Círculos** | Idea o interés en círculo | Aprobar visibilidad + texto (ideas) |
| **Reportes** | Botón reportar contenido | Cerrar ticket + moderar contenido si aplica |
| **Anuncios** | (solo equipo) | Crear/publicar aviso en barrio o ficha |
| **Señales proyecto** | “Me interesa”, etc. | Revisión interna; dueño puede tener evento en cola |
| **Formación** | Sugirió oportunidad | Marcar revisada |
| **Notificaciones** | (automático al hito) | Auditoría; **gestionada** = “ya avisamos por fuera” |

---

## Respuestas rápidas al fundador (copy sugerido)

**Proyecto en revisión:**  
“Recibimos tu semilla. El equipo la revisa para que quede bien en el barrio; en cuanto esté publicada lo vas a ver en Proyectos.”

**Proyecto publicado:**  
“Ya está visible en la mesa del barrio. Si dejaste email y consentimiento en tu perfil, el equipo puede escribirte; todavía no hay avisos automáticos por correo.”

**Aporte visible:**  
“Tu aporte ya puede verse en la ficha del proyecto (si el equipo lo aprobó).”

**Idea de círculo visible:**  
“Tu idea ya aparece en el círculo que elegiste.”

**No usar:** “Te llegó un mail del sistema”, “tu cuenta está verificada”, “el algoritmo decidió”.

---

## Escalamiento

| Situación | Acción |
|-----------|--------|
| Contenido ofensivo / dato sensible | Ocultar contenido + reporte **Acción tomada** + registro interno |
| Fundador no ve su proyecto publicado | Confirmar estado **Publicado** en panel 1 **en prod** + mismo `userId`/semilla |
| “No me llegó el mail” | Explicar cola sin SMTP; contacto manual si hay consent |
| Bug app (loading, perfil, diagnóstico) | `founder-human-qa-protocol.md` → clasificar P0/P1; no “arreglar” ocultando contenido |
| Caso diagnóstico / lectura | `/admin/casos-humanos` o `/admin/reviews` — **no** mezclar con semillas |

---

## Checklist fin de semana (ola controlada)

- [ ] Cola de semillas **En revisión** en cero o con fecha comprometida  
- [ ] Aportes **En revisión** atendidos  
- [ ] Reportes **Nuevos** en cero  
- [ ] Eventos `pending` relevantes marcados **Gestionada** o documentado por qué `skipped`  
- [ ] Al menos un anuncio del barrio publicado si hubo movimiento (panel 5)  
- [ ] Sheet de hallazgos actualizado para fixes quirúrgicos (P1/P2)

---

## Orden recomendado al abrir el navegador

```text
1. /admin/community-reports     (¿fuego?)
2. /admin/founder-project-seeds (¿semillas?)
3. /admin/founder-project-contributions
4. /admin/circle-signals
5. /admin/founder-project-signals
6. /admin/formation-suggestions
7. /admin/community-admin-posts (si hay novedad)
8. /admin/notification-events   (cierre / auditoría)
```

---

*VocationUp — ola fundacional. Moderación con cuidado; el barrio es visible solo cuando el equipo lo publica.*
