# Carta Magna — VocationUp by Second Chance

**Vigencia:** documento fundacional de gobernanza para trabajo humano + asistentes de IA en este repositorio.

**Autoridad:** Creador y Fundador del proyecto VocationUp by Second Chance:

**Ernesto Joaquín Hugo Castellote** — ciudadano argentino, Documento Nacional de Identidad Nº **25.543.679**.

Solo esa persona (o quien el Fundador nombre por escrito) puede autorizar acciones destructivas.

---

## Artículo I — Prohibición de borrado

Queda **expresamente prohibido** borrar, vaciar, truncar o destruir **cualquier archivo o carpeta** del proyecto sin **autorización expresa** del Fundador en el hilo o canal de trabajo vigente.

No cuenta como autorización:

- Silencio o “seguí nomas”
- Pedidos vagos (“ordená el repo”, “limpiá”)
- Urgencia inferida por la IA
- Acciones en sesiones anteriores sin reconfirmación

## Artículo II — Acciones cubiertas

Incluye, sin limitarse a:

- Eliminación con herramientas del IDE o del agente
- Comandos de terminal destructivos (`rm`, `del`, `git clean`, `reset --hard`, force push, etc.)
- Borrado de datos de usuarios, casos humanos, perfiles, observatorio o exports
- Scripts automáticos no supervisados que alteren el árbol de archivos

## Artículo III — Principio de mínima destrucción

Ante limpieza o refactor:

1. Preferir **editar** antes que borrar  
2. Preferir **archivar** (`archive/`, rama, copia con fecha) antes que eliminar  
3. Listar rutas afectadas y esperar **“autorizado”** explícito del Fundador  

## Artículo IV — Commits y remoto

- No `git push --force` a ramas compartidas sin autorización expresa  
- No commits que el Fundador no haya pedido (salvo regla de proyecto distinta acordada)  
- Los hooks y CI no sustituyen el consentimiento del Fundador para borrados locales  

## Artículo V — Implementación en Cursor

1. Regla de proyecto: `.cursor/rules/carta-magna-no-destructive.mdc` (`alwaysApply: true`)  
2. Regla de usuario global en Cursor (Settings → Rules): mismo principio, copiado del Artículo I  
3. Revisar periódicamente que ningún agente en background tenga permisos destructivos sin supervisión  

## Artículo VI — Personas autorizadas

| Rol | Nombre | Documento | Puede autorizar borrados |
|-----|--------|-----------|---------------------------|
| Creador y Fundador | Ernesto Joaquín Hugo Castellote | DNI 25.543.679 (Argentina) | **Sí** |
| Delegados | Ninguno designado a la fecha | — | Solo si el Fundador lo indica por escrito |

## Firma fundacional

En calidad de Creador y Fundador de **VocationUp by Second Chance**, ratifico esta Carta Magna y su principio de no destrucción sin autorización expresa.

**Ernesto Joaquín Hugo Castellote**  
DNI 25.543.679 · República Argentina  

Lugar y fecha: San Miguel de Tucumán, Provincia de Tucumán, 21 de Mayo de 2026.-

---

*Este documento no reemplaza backups ni control de versiones; los complementa como norma ética y operativa del proyecto.*
