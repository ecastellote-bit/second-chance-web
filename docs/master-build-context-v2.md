# Second Chance — Master Build Context v2

## Qué es Second Chance
Second Chance (2ndCh) es una plataforma de orientación vocacional y transición laboral para adultos que se sienten profesionalmente estancados, desconectados o fuera de eje respecto de su trabajo actual.

No es:
- un test vocacional tradicional
- coaching motivacional
- una personality quiz
- terapia
- una bolsa de trabajo
- una promesa de reinvención instantánea

Sí es:
- un sistema serio de lectura estructurada de historia humana
- una plataforma que conecta señales autobiográficas con restricciones reales del presente
- una herramienta que reduce la distancia entre confusión y movimiento posible

## Pregunta central del producto
La pregunta central no es:
“¿Cuál es tu verdadera vocación?”

La pregunta correcta es:
“Dada tu historia, tus capacidades y tu situación actual, ¿qué movimientos laborales tienen más sentido ahora?”

## Target user vigente
Núcleo principal de diseño:
- adultos entre 30 y 60 años

También debe ser usable para adultos fuera de ese rango si pueden leer, escribir y narrar su historia con cierta claridad.

Exclusión estructural:
- menores de edad

## Aprendizaje clave del MVP anterior
El intento de obtener un diagnóstico profundo universal a partir de:
- contexto general
- 5 preguntas
- un prompt gigante en route.ts

no constituye una base seria ni generalizable del producto final.

Ese intento dejó aprendizajes valiosos, pero no debe reutilizarse como columna vertebral del sistema.

## Conclusión estructural
El MVP correcto no es:
- un test corto con prompt gigante
- una demo impresionante pero descartable
- un monolito en route.ts

El MVP correcto es:
- arquitectura final
- profundidad parcial
- vertical slice expandible

## Arquitectura conceptual acordada
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
→ Community Routing Layer (placeholder inicial)

## Tipos de salida válidos
- clear_direction
- compressed_life
- insufficient_evidence

## Qué debe demostrar el MVP
1. que un usuario real puede completar el flujo
2. que se siente leído con más precisión que por un test común
3. que recibe una lectura seria sin fantasía
4. que sale con un movimiento pequeño pero realista

## Regla técnica central
No colapsar la lógica del producto en un único route.ts.
El backend debe orquestar módulos, no convertirse en el cerebro total del sistema.

## Orden operativo de construcción
1. proyecto nuevo
2. docs
3. scaffolding
4. tipos
5. engines lite
6. frontend flow
7. API orchestration modular
8. resultado estructurado
9. re-entry
10. next-step / comunidad placeholder

## Deadlines vigentes
- 2 de mayo de 2026: MVP funcional interno
- 15 de mayo de 2026: MVP listo para testers o muy próximo al lanzamiento