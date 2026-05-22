# Juez de Descarte — VocationUp Second Chance

**Estado:** producción (exclusiones activas por defecto)  
**Motor:** `web/lib/engines/negativeEvidenceJudge.ts`  
**Adjudicación:** `web/lib/engines/discardJudgeAdjudication.ts`

---

## Misión (Carta Magna)

> **No elige ganador.** Dice qué familias **NO pueden ser** porque el relato y el contexto no las sostienen.

- Evalúa las **22 familias** del registro en cada corrida.
- Emite `strong_discard` / `soft_discard` con evidencia negativa.
- En producción, las familias con descarte duro verificado salen del universo candidato (`score → 0`).
- El siguiente score elegible sube **solo** — sin inventar familia.

---

## Pipeline

```text
Afinidades → Juez de Descarte (22 familias) → applyDiscardExclusions
  → lectura provisoria + jueces + adjudicación (familyScores filtrados)
  → Juez narrativo recibe universo acotado (eligibleFamiliesForAudit)
```

Capa **0** en `analysisPipeline.ts` — antes de `buildFinalReading`.

---

## Veredictos

| Veredicto | Exclusión producción |
|-----------|----------------------|
| `strong_discard` | Sí, si `strength ≥ 0.32` y hay razón/contradicción |
| `soft_discard` | Sí, solo top 8 con evidencia fuerte |
| `keep_candidate` / `frontier_candidate` | No |
| `insufficient_negative_evidence` | No |

**Seguridad:** siempre quedan **≥ 3 familias elegibles**.

---

## Env

| Variable | Efecto |
|----------|--------|
| *(default)* | `production_exclusion` — exclusiones aplicadas |
| `DISCARD_JUDGE_AUDIT_ONLY=true` | Modo decorado legacy (sin tocar scores) |

---

## Lab / smoke

```bash
npm run discard:smoke
```

Panel lab: **Juez de Descarte — exclusión de candidatos** (excluded ids, eligible count, top cambió).

---

## Próximas calibraciones

- Golden set: `npm run discard:golden` (8/8 obligatorio antes de merge).
- Reglas rivales universales en `discardRivalRules.ts` (ver abajo).
- Briefs `failure_reference` en lab (`fail_ref_*`).

---

## Reglas rivales universales (anti-cebado)

| ID | Arquetipo | Familias típicamente afectadas |
|----|-----------|--------------------------------|
| `universal_sosten_vs_system_design` | Sostén admin + compresión/investigación ≠ diseño de sistema | system_designer |
| `universal_sosten_vs_technical_build` | Sostén sin ejecución técnica núcleo | technical_builder |
| `universal_childhood_form_vs_artistic` | Fascinación temprana sin práctica artística adulta | artistic_creator |
| `universal_curiosity_not_lab_science` | Misterios/atar cabos sin método científico | scientific_investigator |
| `universal_sosten_not_operational_orchestrator` | Admin/sostén sin logística vocacional | operational_organizer |
| `universal_sosten_not_resource_steward` | Sostén hogar/trabajo sin mayordomía de recursos | resource_steward |
| `universal_misread_as_*` | Par `misreadAs` del registro con rival más claro | según registro |
| `fail_ref_*` | Solo payloads `[failure_reference:…]` en lab | rivales del brief |

**Anti-cebado severo:** `passesAntiTailoringGate` + no exclusión por una sola palabra; top-3 exige ≥2 evidencias contradictorias salvo regla universal trazada. Inflación por score sin núcleo narrativo (`aff` alto, `sem` bajo) puede activar descarte — aplica a millones de perfiles con el mismo arco, no a un caso.
