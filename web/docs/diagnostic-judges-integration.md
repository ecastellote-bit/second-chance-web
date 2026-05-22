# Integración de jueces — embudo diagnóstico completo

**Orquestación narrativa:** `lib/engines/diagnosticJudgeIntegration.ts`  
**Pipeline:** `lib/engines/analysisPipeline.ts`  
**Producción:** `POST /api/analyze`  
**Lab:** `POST /api/lab-analyze`

---

## Orden de capas (todos activos por defecto)

```text
Semántica (extracción + embeddings, calibrada TS)
  → Motores + afinidades
  → Juez de Descarte (production_exclusion)     ← activo salvo DISCARD_JUDGE_AUDIT_ONLY=true
  → Lectura provisoria + gate compresión
  → Memoria (tokens + embedding ponderado)
  → Panel 5 jueces diagnóstico
  → Distillador (aprendizaje)
  → Juez contextual → adjudicación TS (sentencia)
  → Juez narrativo + palancas (post-pipeline)   ← activo salvo NARRATIVE_*=false
  → Temáticas guiadas + revisión humana (si aplica)
```

---

## Flags de entorno

| Variable | Default | Efecto |
|----------|---------|--------|
| `DISCARD_JUDGE_AUDIT_ONLY` | off | `true` = descarte decorado (no toca scores) |
| `NARRATIVE_COHERENCE_JUDGE_ENABLED` | **on** | `false` = sin juez narrativo |
| `NARRATIVE_COHERENCE_LEVERS_ENABLED` | **on** | `false` = auditoría en trace, sin palancas en copy |

`GET /api/analyze` devuelve `judges: { ... }` con el estado efectivo.

---

## Salida al cliente

- `data` — lectura final (incluye efecto contextual + narrativo en copy/trace)
- `data.narrativeCoherenceReview` — informe del juez narrativo
- `data.negativeEvidenceReview` — descarte
- `data.contextualSituationReview` — contextual
- `data.diagnosticReview` — panel
- `narrativeCoherence` — meta API (latencia, leversApplied)
- `trace.narrativeAdjudication` — palancas aplicadas

---

## Desactivar un juez (emergencia)

```env
DISCARD_JUDGE_AUDIT_ONLY=true
NARRATIVE_COHERENCE_JUDGE_ENABLED=false
```

Panel, contextual y semántica no tienen kill-switch env (siempre en pipeline).
