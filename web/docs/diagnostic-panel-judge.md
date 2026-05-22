# Panel de Juez Diagnóstico — VocationUp Second Chance

**Motor:** `web/lib/engines/diagnosticJudgeEngine.ts`  
**Reglas universales:** `web/lib/engines/diagnosticPanelRules.ts`  
**Calibrador:** `web/lib/engines/diagnosticReviewCalibrator.ts`  
**Golden:** `npm run diagnostic:golden`

---

## Propósito

Auditar la **lectura provisoria** (ranking, memoria, léxico, rivalidades) **antes** de la adjudicación final. No re-diagnostica ni modifica `familyScores`.

---

## Sub-jueces (Capa 2)

| `judgeId` | Función |
|-----------|---------|
| `family_score_judge` | Brecha entre top/segundo **elegible** (post-descarte) |
| `similar_case_judge` | Memoria vs top elegible; umbrales de similitud |
| `human_lexicon_judge` | Marcadores léxicos con frases + arquetipos vitales |
| `rivalry_judge` | Pares rivales universales con gap adaptativo |
| `anti_overfit_judge` | Repetición **influyente** (sim ≥ 0.35); confirma o alerta |

---

## Umbrales de similitud (memoria)

| Umbral | Efecto |
|--------|--------|
| &lt; 0.40 | `weak_similarity_warning` — no cuenta como conflicto |
| 0.40–0.55 | `frontier_note` — nota, no conflicto |
| ≥ 0.55 + top ≠ histórico | `conflict` posible |

---

## Integración pipeline

- Recibe `excludedFamilyIds` del Juez de Descarte (solo lectura; no modifica descarte).
- `calibrateDiagnosticReviewIntensity` re-agrega `finalVerdict` tras suavizar conflictos de memoria débil.

---

## Anti-cebado

- Reglas en `diagnosticPanelRules.ts` (pares rivales, léxico por frases).
- Reutiliza `buildUniversalArchetypeSignals` (sostén, compresión, colectivo) sin keywords de un solo caso.
- Golden: Estefi + `voc_human_01–03` + `fail_ref_*`.

---

## Veredictos blandos

`weak_similarity_warning`, `frontier_note`, `aligned_with_caution` — no abren revisión humana solos.
