# MVP oficial — checklist 25 días

**Marca:** VocationUp by Second Chance  
**Meta:** MVP honesto, barrio sembrado, primeros usuarios reales con feedback.  
**Lanzamiento oficial:** día 25 (ajustar fecha calendario).

---

## Semana 1 (días 1–7) — Que no se pierdan

### Producto / UX
- [ ] Recorrido pionero claro: `/comenzar` → puertas o diagnóstico → temáticas → activación → plaza post-activación
- [ ] Sin enlaces rotos en el carril principal (probar en celular)
- [ ] Banner MVP visible (“estamos probando…”) en pantallas del recorrido
- [ ] Compromiso con el barrio tras activación (crear / sumarse / explorar primero)
- [ ] Guion oral para facilitadores (abajo)

### Técnico
- [ ] Merge `feat/community-core-v0` → `main` cuando el preview esté validado
- [ ] Vercel: Root Directory = `web`, dominio `vocationup.com` cuando DNS esté listo
- [ ] Push de plaza post-activación + 4 carteles + compromiso
- [ ] Variables de entorno en Vercel si `/api/analyze` se usa en prueba

### Comunidad (preparación)
- [ ] Lista de 5–8 pioneros con nombre y WhatsApp/email
- [ ] Plantilla de invitación (“MVP, tu opinión importa”)

### Aprendizaje (sesión pionero)
Anotar por usuario:
- [ ] ¿Dónde se confundió?
- [ ] ¿Qué lo incomodó?
- [ ] ¿Activación: qué cartel eligió y por qué?
- [ ] ¿Compromiso: qué eligió?
- [ ] ¿Volvería la semana que viene? (sí / no / por qué)

---

## Semana 2 (días 8–14) — Que se comprometan

### Producto
- [ ] Ajustes de copy/UI según semana 1
- [ ] 3–5 piezas reales en catálogos (proyecto, evento, círculo — no inventados)
- [ ] Flujo “presentar proyecto” mínimo (formulario o contacto humano documentado)

### Comunidad
- [ ] Cada pionero con compromiso concreto y fecha (“en 7 días presento idea / me sumo a X”)
- [ ] Segunda ronda de 5–10 usuarios

### Técnico
- [ ] Producción en URL estable (`.com` o `.vercel.app` definitivo)
- [ ] Revisar imágenes `/vu/` en deploy

---

## Semana 3 (días 15–21) — Barrio habitado

### Comunidad
- [ ] Al menos 2 proyectos con persona real detrás
- [ ] 1 evento con fecha creíble
- [ ] 1 círculo con moderación humana activa
- [ ] 1 oferta de formación real (aunque sea enlace externo)
- [ ] Historia corta de 2 pioneros para mostrar en app o WhatsApp

### Producto
- [ ] Destacar contenido sembrado en “primer tramo” según cartel de activación
- [ ] Copy honesto: empleo institucional / gobierno = mediano plazo

### Aprendizaje
- [ ] Tabla de fricciones recurrentes → prioridad dev semana 4

---

## Semana 4 (días 22–25) — Lanzamiento oficial

### Go-to-market
- [ ] Mensaje público alineado (segunda oportunidad + barrio, no “test vocacional mágico”)
- [ ] `main` = producción, deploy verde
- [ ] Checklist “qué está / qué no está” visible para nuevos usuarios (FAQ o banner reducido)

### Comunidad
- [ ] Mínimo 10 compromisos activos o en curso (crear o sumarse)
- [ ] Calendario de siembra post-lanzamiento (quién carga qué cada semana)

### Cierre día 25
- [ ] Demo interna del recorrido completo
- [ ] Retrospectiva: ¿un usuario volvió solo en 7 días?

---

## Guion facilitador (MVP pionero)

1. “Estamos probando una app posible. No está terminada; tu sinceridad nos ayuda.”
2. “No tenés que cambiar de trabajo. Buscamos pasos pequeños y reales.”
3. Recorrido: comenzar → temáticas → activación → plaza → compromiso.
4. Al final: “¿Qué te confundió? ¿Qué te incomodó? ¿Qué te gustaría que existiera en 30 días?”
5. Compromiso: elegir crear proyecto, sumarse a uno, o explorar y volver en X días.

---

## Fuera de alcance (explícito hasta post-MVP)

- Marketplace LATAM completo
- Matching automático 24/7
- Bolsa laboral con empresas reales integradas
- Alianzas gobierno / convenios institucionales en producto
- Miles de herramientas

---

## Dueños sugeridos (completar nombres)

| Área | Responsable | Backup |
|------|-------------|--------|
| Producto / UX | | |
| Dev / deploy | | |
| Siembra comunidad | | |
| Facilitación pioneros | | |
| Contenido real (fotos, textos) | | |

---

## Referencia técnica rápida

- Preview: rama `feat/community-core-v0`
- App: carpeta `web/`
- Activación: 4 carteles → `/plaza`
- Plaza post-activación: cartel + puertas + compromiso + mapa
