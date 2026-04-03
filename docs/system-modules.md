# Second Chance — System Modules v1

## Intake Engine
### Propósito
Normalizar la entrada del usuario, separar profile y narrative, y validar mínimos antes de activar el pipeline.

### Qué recibe
- datos básicos del usuario
- contexto actual
- respuestas narrativas del flujo

### Qué produce
- UserIntake normalizado
- validación mínima de completitud

### Qué no debe hacer
- no debe inferir dirección vocacional
- no debe producir lectura final

---

## CVME
### Nombre completo
Comprehensive Vocational Memory Engine

### Propósito
Analizar la historia personal del usuario para detectar señales vocacionales/autobiográficas.

### Explora
- recuerdos de infancia
- fascinaciones tempranas
- materias escolares significativas
- experiencias laborales repetidas
- roles sociales naturales
- pérdidas, renuncias y patrones persistentes

### Qué produce
- señales humanas observables
- evidencia autobiográfica asociada

### Qué no debe hacer
- no debe declarar dirección final por sí solo
- no debe confundir intensidad narrativa con evidencia suficiente

---

## Signal Library
### Propósito
Ser el catálogo estructurado de señales humanas que el sistema puede detectar.

### Ejemplos de señales
- social coordination
- pattern analysis
- narrative creation
- cultural curiosity
- opportunity detection
- system thinking

### Cada señal debe incluir
- descripción
- evidencia
- peso relativo

### Qué no debe hacer
- no reemplaza al CVME
- no decide resultados finales

---

## TDM
### Nombre completo
Talent Detection Matrix

### Propósito
Tomar las señales detectadas y calcular perfiles humanos probables.

### Ejemplos de perfiles
- Diplomatic Social Connector
- Community Builder
- Analytical Strategist
- Creative Storyteller
- Technical Builder
- Cultural Explorer
- Empathic Guide

### Qué produce
- ranking corto de perfiles probables
- hipótesis estructuradas, no identidades definitivas

### Qué no debe hacer
- no detecta una “vocación verdadera”
- no sentencia identidad
- no reemplaza al Result Orchestrator

---

## Insight Generator
### Propósito
Transformar resultados técnicos en explicaciones comprensibles, sobrias y legibles para humanos.

### Tipos de insight
- insight de identidad: qué patrón aparece
- insight narrativo: dónde aparece ese patrón en la historia
- insight de posibilidad: en qué entornos suele desplegarse

### Qué no debe hacer
- no debe sonar mesiánico, marketinero o terapéutico
- no debe inventar épica donde hay compresión o cansancio

---

## LTE
### Nombre completo
Life Transition Engine

### Propósito
Analizar la situación actual del usuario y medir su margen real de transición.

### Evalúa
- energía disponible
- estabilidad económica
- activos acumulados
- restricciones actuales
- presión práctica
- margen realista de transición

### Qué produce
- TransitionAssessment estructurado
- evaluación de factibilidad, fricción y margen operativo

### Qué no debe hacer
- no produce action vectors
- no reemplaza al AVE

---

## SEL
### Nombre completo
Strategic Employability Layer

### Propósito
Traducir patrones humanos al lenguaje de ecosistemas laborales plausibles.

### Ejemplos de ecosistemas
- partnerships
- customer success
- community operations
- institutional relations
- program coordination

### Qué produce
- ecosistemas laborales compatibles
- direcciones plausibles de empleabilidad

### Qué no debe hacer
- no debe sonar como una job board genérica
- no debe devolver listas arbitrarias

---

## AVE
### Nombre completo
Action Vector Engine

### Propósito
Convertir insights + transición + empleabilidad en movimientos concretos.

### Cada vector incluye
- descripción
- nivel de fricción
- horizonte temporal
- microacciones iniciales

### Ejemplos de microacciones
- investigar roles específicos
- conversar con alguien del sector
- reescribir experiencia en lenguaje transferible

### Qué produce
- action vectors concretos y limitados
- movimientos pequeños, plausibles y accionables

### Qué no debe hacer
- no debe sugerir saltos fantasiosos
- no debe ignorar restricciones detectadas por LTE

---

## Result Orchestrator
### Propósito
Integrar outputs de todo el pipeline y decidir el tipo de lectura final.

### Salidas válidas
- clear_direction
- compressed_life
- insufficient_evidence

### Qué produce
- FinalReading estructurado
- summaryForUser sobrio y coherente

### Qué no debe hacer
- no inventar claridad donde no la hay
- no suavizar artificialmente tensiones

---

## Re-entry Protocol
### Propósito
Permitir que el usuario:
- agregue información nueva
- corrija respuestas anteriores
- matice interpretaciones

### Función
Recalcular el pipeline sin convertir el producto en algo rígido.

---

## Community Routing Layer
### Propósito
Derivar al usuario a continuidad comunitaria pertinente, inicialmente como placeholder.

### Formas iniciales posibles
- discord_recommended
- cohort_candidate
- reentry_first
- self_guided_next_step

### Qué no debe hacer
- no debe simular una comunidad inexistente
- no debe tener más protagonismo operativo que el vertical slice en esta etapa