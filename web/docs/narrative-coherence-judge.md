# Juez de Coherencia Narrativa — VocationUp Second Chance

**Versión:** 1.5  
**`judgeId`:** `narrative_coherence_judge`  
**Estado actual:** Integrado en producción (`/api/analyze`) — Fase 1.5 + Fase 2 palancas **activas por defecto**

---

## Propósito

Auditar si la hipótesis vocacional del motor (familia top, `corePattern`, `resultType`) **resuena con la historia de vida** del usuario, sin volver a diagnosticar ni recalcular scores.

> *¿Esta etiqueta y este cierre le pertenecen a esta biografía, o son una distorsión mecánica?*

---

## Carta Magna — Atribuciones

### Sí puede

- Leer `UserIntake` completo (textos íntegros).
- Emitir `narrativeSummary`, `coreTension`, `verdict`, `evidence`, `riskFlags`, `alternativeFamilies`.
- Sugerir `family` como **recomendación auditiva** (no como score oficial en Fase 1).
- Discrepar documentado con citas del intake.

### No puede (líneas rojas)

- Modificar `familyScores`, afinidades, embeddings o `learningSignal`.
- Sustituir `extractSemanticSignals` ni re-ejecutar similitud vectorial.
- Escribir directamente `summaryForUser` al usuario.
- Cambiar `resultType` por su cuenta (solo `finalizeReadingAfterDiagnosticReview` en Fase 2+).
- Inventar hechos no presentes en el intake.

### Principio de capas

```text
Semántica/embeddings (entrada) → Motores → Lectura provisoria
  → Panel de 5 jueces → narrative_coherence_judge (auditoría)
  → Adjudicación final → Lectura pública
```

**LLM recomienda; TypeScript valida; adjudicación decide** (Fase 2+).

---

## Ideales esperables (A–F)

No se da **nacimiento público con influencia en sentencia** hasta cumplir **A + B + C** en golden set.

| Ideal | Compromiso | No nos conformamos con |
|-------|------------|-------------------------|
| **A** | Historia integrada, no keywords | `narrativeSummary` como lista de temas |
| **B** | `narrative_mismatch` real con ≥2 citas | Mismatch vago o `aligned` siempre |
| **C** | `compressed_life_undetected` cuando el cierre es fuerte | Ignorar compresión si trace ya la nombró pero `resultType` es `clear_direction` |
| **D** | `narrativeSummary` + `coreTension` útiles | Repetir `corePattern` del motor |
| **E** | Auditor, no segundo motor | Re-puntuar familias |
| **F** | Trascendente (visible en lab; Fase 2 con palancas) | Finding solo en trace ignorado |

### Métricas gate (lab)

| Métrica | Meta mínima |
|---------|-------------|
| Sensibilidad casos mismatch esperados | ≥ 85% |
| Especificidad casos `aligned` | ≥ 80% |
| `mismatch` con ≥2 citas verificables | 100% |
| Casos “sentencia grosera” — palancas 2 evitan cierre incorrecto | 100% (Fase 2) |
| Falsos positivos en `aligned` activando palanca 2 | < 20% (Fase 2) |

---

## Fases de despliegue

### Fase 1 — Auditoría

- Juez corre en **`/api/lab-analyze`** (y opcionalmente `NARRATIVE_COHERENCE_JUDGE_ENABLED=true` en analyze).
- Salida en `trace.narrativeCoherenceReview` + top-level `narrativeCoherenceReview`.
- **Sin** cambio en `familyScores`, orden ni `resultType` visible.
- Bloque obligatorio en `/lab`.

### Fase 1.5 — Dos ejes + panorama (actual)

- Campos obligatorios: `directionFit`, `compressionConcern`, `closureRisk`, `sostenActual` (opcional).
- El user prompt incluye **expediente del pipeline**: top 3 + gap, juez diagnóstico, juez contextual, flags semánticos.
- Si el pipeline ya detectó compresión → TS puede elevar `compressionConcern` a `moderate`/`high`.
- Modo intake sintético breve: `family` opcional.
- Modo **`failure_reference`** (`[failure_reference:case_id]`): párrafo único de lab; brief con señales de contraste y calibración TS (`failureReferenceAudit.ts`).
- `lexical_trap` puede incluir `suspectedPair: [id_a, id_b]`.
- Lab: optgroup **Golden refractarios** (Estefi + human_01–03 + fail_ref_*).

### Fase 2 — Palancas de cierre (producción)

Post-pipeline vía `applyNarrativeJudgeToDiagnosticReading` (`diagnosticJudgeIntegration.ts`). **Activas por defecto**; desactivar con `NARRATIVE_COHERENCE_LEVERS_ENABLED=false`. **No** modifica `familyScores`.

1. **Palanca 1:** `compressed_life_undetected` + high → veto cierre `clear_direction` (copy frontera).
2. **Palanca 2:** `narrative_mismatch` + confidence ≥ 0.75 + (risk high o `family` ≠ top motor) → frontera / `needsHumanReview`.
3. **Palanca 3:** copy de cierre prudente cuando 1 o 2 aplican.

**Campo `family`:** el LLM debe recomendar por historia; si repite la top del motor en mismatch, TS promueve la primera `alternativeFamilies` distinta (sin sesgar familias por nombre).

### Fase 3 — Intervención sutil en scores (condicional)

Solo tras gate de incidencia positiva real:

- LLM **recomienda**; TS **aplica** nudges (δ ≤ 0.08, máx. 1 swap en top, trace `narrativeScoreAdjustment`).
- Nunca recálculo completo del puente de afinidades.

---

## Contrato JSON de salida

Ver `web/lib/types/narrativeCoherence.ts`.

Veredictos: `aligned` | `frontier` | `narrative_mismatch` | `red_flag`.

`riskFlags.type`: `lexical_trap` | `narrative_distortion` | `compressed_life_undetected` | `false_rivalry`.

---

## Activación

| Entorno | Cómo |
|---------|------|
| Lab | `POST /api/lab-analyze` — `forceLevers: true` |
| Producción `/api/analyze` | **Activo por defecto** (`NARRATIVE_COHERENCE_JUDGE_ENABLED=false` para apagar) |
| Palancas Fase 2 | **Activas por defecto** (`NARRATIVE_COHERENCE_LEVERS_ENABLED=false` para solo auditoría) |
| Health | `GET /api/analyze` → `judges` |

---

## Archivos de implementación

| Archivo | Rol |
|---------|-----|
| `lib/types/narrativeCoherence.ts` | Tipos |
| `lib/engines/narrativeCoherenceJudge.ts` | Juez (OpenAI + validación TS) |
| `lib/engines/narrativeCoherenceContext.ts` | Expediente pipeline read-only |
| `lib/engines/narrativeCoherenceAdjudication.ts` | Palancas Fase 2 |
| `lib/testing/estefiLabPayload.ts` | Payload Estefi (lab) |
| `lib/testing/failRefLabPayloads.ts` | Payloads fail_ref (lab) |
| `app/api/lab-analyze/route.ts` | Invocación post-pipeline |
| `scripts/runNarrativeGoldenSet.ts` | Corrida golden (`npm run narrative:golden`) |
| `docs/narrative-judge-golden-set.md` | Casos y criterios de prueba |

---

## Referencia

Golden set y columnas de evaluación: [narrative-judge-golden-set.md](./narrative-judge-golden-set.md).
