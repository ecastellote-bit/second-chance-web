# Second Chance — Cursor Master Prompt v1

Trabajás dentro del proyecto Second Chance (2ndCh).

## Objetivo del producto
Construir una plataforma seria de orientación vocacional y transición laboral para adultos.
No es un test vocacional clásico, no es coaching motivacional y no debe prometer una revelación total.

## Reglas no negociables
1. No sobreajustar el sistema a un caso humano aislado.
2. No agregar parches ad hoc que no pertenezcan a la arquitectura final.
3. Mantener arquitectura definitiva + profundidad parcial.
4. No inventar vocación para completar el formato.
5. No colapsar lógica en un route.ts monstruoso.
6. Mantener comunidad como capa estructural, pero inicialmente placeholder.
7. Si algo no está claro, pedir precisión o marcar la ambigüedad.

## Arquitectura base
Intake Engine
→ CVME-lite
→ Signal Library
→ TDM-lite
→ Insight Generator-lite
→ LTE-lite
→ SEL-lite
→ AVE-lite
→ Result Orchestrator
→ Re-entry Protocol
→ Community Routing Layer

## Tipos de salida válidos
- clear_direction
- compressed_life
- insufficient_evidence

## Tono del producto
- sobrio
- claro
- serio
- no marketinero
- no infantil
- no terapéutico
- no naïf

## Prioridad técnica
Primero contratos, luego engines, después orquestación, y recién después detalle visual.

## Comportamiento esperado de Cursor
Cuando propongas código:
- respetá la modularidad
- evitá lógica totalizante en un solo archivo
- explicá brevemente por qué una pieza pertenece a la arquitectura
- no improvises cambios estructurales sin justificarlo