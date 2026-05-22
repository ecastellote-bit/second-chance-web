# Alcance del depósito humano (Human Depot)

## Lo único obligatorio

Para entrenar jueces y no perder casos fundacionales, el depósito debe capturar **solo**:

1. **Cuestionario completo** — intake en `sourceInput` (contexto, narrativa, followup si hubo).
2. **Sentencia del diagnóstico** — lectura entregada en `currentResult`: veredicto del panel, juez narrativo, compositor (`personalizedPresentation`), trace y señales que sostienen la sentencia.

Eso se persiste en `/full/result` vía `HumanCaseArchiveGate` → `POST /api/human-cases` → Blob + JSONL completo + extracto de aprendizaje.

## Lo que NO es depósito humano

No hace falta guardar en el depot (ni bloquear la ola si falta):

- Elección de **temáticas** (`/full/themes`)
- Elección de **activación** / carteles (`/activacion`, bridge desde themes)
- **Recorrido en Comunidad** (plaza, puertas, círculos, sembrar proyecto)

Esos tramos son **producto y UX** para fundadores; pueden quedar en sessionStorage u observatorio liviano, pero **no definen** si el caso sirve para revisión humana o entrenamiento.

## Criterio operativo “caso listo”

| Sí | No |
|----|-----|
| Banner verde + `archiveId` en resultado | Llegó solo a temáticas |
| `cohortBatch` en `clientMeta` (ola fundacional) | Eligió cartel en plaza |
| Extracto de aprendizaje generado | Sembró proyecto en `/proyectos/sembrar` |

## APIs relacionadas (prioridad)

| API | Rol |
|-----|-----|
| `POST /api/human-cases` | **Crítica** — caso completo |
| `GET /api/human-cases?cohortBatch=…` | Operación / lab |
| `npm run cohort:export` | Export para equipo |
| `POST /api/human-cases/…/journey` | Opcional / no usar para ola fundacional |
| `POST /api/founder-projects` | Producto (semillas), no sustituye el archivo diagnóstico |
