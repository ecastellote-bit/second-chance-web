# Checklist de invitación — Ola fundacional (30–40 personas)

## Mensaje central (para fundadores)

> Venís a **entrenar** nuestro sistema vocacional con tu historia real. A cambio: **6 meses de permanencia gratuita** en VocationUp y la posibilidad de **sembrar la Comunidad** con tu proyecto, con **visibilidad prioritaria** entre nuestros usuarios durante ese período.

**Requisitos para ser miembro fundante:**
1. Completar el cuestionario y **llegar al diagnóstico** (caso archivado en `/full/result`).
2. **Crear el perfil** en `/perfil/crear` (obligatorio para proyectos e interacción en el barrio).

> **Depósito humano:** solo importan el **cuestionario completo** y la **sentencia del diagnóstico** archivados en `/full/result`. Temáticas, activación y recorrido en Comunidad son UX de producto; no hace falta persistirlos en el depot. Ver `web/docs/human-depot-scope.md`.

---

## Antes de enviar invitaciones

| # | Tarea | Verificación |
|---|--------|----------------|
| 1 | `BLOB_READ_WRITE_TOKEN` en Vercel (producción) | `GET /api/human-cases/status` → almacén activo |
| 2 | Variable de cohorte (opcional) | `NEXT_PUBLIC_FOUNDATIONAL_COHORT_BATCH=foundational_wave_2026_05` |
| 3 | Smoke test end-to-end en prod | Un recorrido completo → ID de caso visible en resultado |
| 4 | Lab: batch fundacional | `/lab/foundational-cohort` — casos con diagnóstico archivado |
| 5 | Export del batch | `cd web && npm run cohort:export` |
| 6 | Golden de jueces (si hubo cambios) | `npm run presentation:golden` (+ semantic, narrative, etc.) |

---

## Link de invitación (recomendado)

**URL principal para pioneros:**

```
https://<tu-dominio>/fundador
```

Alternativa directa al cuestionario:

```
https://<tu-dominio>/full?founder=1
```

---

## Guión corto para WhatsApp / email (copiar y adaptar)

**Asunto:** Tu lugar en la Comunidad fundadora de VocationUp

Hola [nombre],

Te invitamos a ser parte de los **primeros 30–40** que recorren VocationUp en serio.

**Qué te pedimos:** dedicar tiempo a completar el cuestionario y llegar a tu **diagnóstico vocacional**. Tu lectura no es un test automático: entrena a nuestro equipo de “jueces” y mejora el sistema para miles de personas después.

**Qué te damos:**
- **6 meses gratis** de permanencia en la plataforma.
- Derecho a **sembrar la Comunidad** con tu proyecto, con **visibilidad prioritaria** entre nuestros usuarios durante ese tiempo.

**Empezá acá:** [link /fundador]

Si el guardado falla, la app te ofrece descargar una copia — compartila con nosotros y lo recuperamos.

Gracias por construir esto con nosotros,  
[Equipo fundador]

---

## Recorrido esperado del invitado

```mermaid
flowchart TD
  A[/fundador — invitación] --> B[/full — cuestionario 5 pasos]
  B --> C[Purgatorio / followup si aplica]
  C --> D[/full/result — diagnóstico + archivo]
  D --> E{¿Caso archivado?}
  E -->|Sí| F[Miembro fundante · diagnóstico]
  E -->|No| G[Backup JSON + reintento]
  F --> P[/perfil/crear — perfil obligatorio]
  P --> H[Comunidad: temáticas, plaza, barrio]
  H -.->|no va al depot| F
```

---

## Durante la ola (operación diaria)

| Frecuencia | Acción |
|------------|--------|
| Diario | Revisar `/lab/foundational-cohort` — casos nuevos **con archiveId** (diagnóstico) |
| Diario | `GET /api/human-cases?cohortBatch=foundational_wave_2026_05` |
| Semanal | `npm run cohort:export` → revisión humana y reclasificación |
| Por caso | `PATCH /api/human-cases/[archiveId]` con veredicto del equipo |
| Alertas | Invitado sin banner verde en resultado → prioridad facilitador |

---

## Criterios de “caso completo” para entrenamiento

1. Archivo en depot: **cuestionario** (`sourceInput`) + **sentencia** (`currentResult`, incl. `personalizedPresentation` si existe)  
2. `cohortBatch` correcto en `clientMeta`  
3. `reviewStatus: pending_human_review` (luego veredicto humano vía PATCH)  
4. Extracto de aprendizaje generado automáticamente  

**No** se exige: temática elegida, cartel de activación, ni pasos en Comunidad.

---

## Mapa del barrio (para orientar invitados)

| Tramo | Ruta | Estado MVP |
|-------|------|------------|
| Invitación | `/fundador` | Listo |
| Diagnóstico | `/full` → `/full/result` | Listo + archivo |
| **Perfil de usuario** | `/perfil/crear` | **Obligatorio** para barrio |
| Temáticas (purgatorio) | `/full/themes` | Listo |
| Plaza | `/plaza` | Listo |
| Activación (carteles) | `/activacion` | Listo |
| Tres puertas | `/community/*` | Hubs navegables |
| Sembrar proyecto | `/proyectos/sembrar` | Listo (fundadores) |
| Proyectos del barrio | `/proyectos` | Catálogo demo |
| Círculos | `/circulos` | MVP |
| Formación | `/formacion` | MVP |
| Eventos | `/eventos` | MVP |
| Mapa del barrio | `/barrio` | Índice de caminos |

---

## Facilitador — qué hacer si alguien se traba

1. **No ve el resultado:** verificar que llegó a `/full/result` y esperó el banner verde con ID.  
2. **Sin ID / guardado fallido:** pedir descarga `.json` y reenviar al equipo; reintentar con buena conexión.  
3. **No puede sembrar proyecto:** debe tener diagnóstico archivado (miembro fundante). Volver a `/fundador`.  
4. **Plaza vacía:** completar temáticas en `/full/themes` o elegir cartel en `/activacion`.  

---

## Post-ola

- Export final del batch y sesión de reclasificación con jueces  
- Casos `approved` → alimentar aprendizaje validado  
- Documentar tono y copy que funcionó (para compositor y UI)  
