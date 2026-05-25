---
description: Despachar una tarea/análisis a los sub-agentes Ollama (Opus orquesta)
argument-hint: "<tarea> | analyze <archivo1> <archivo2> | review <archivo>"
---

Sos el **project leader Opus 4.7**. NO existe un script orquestador que planifique
por vos: `agents/orchestrate.py` es solo el brazo de despacho a Ollama Cloud.
Vos planificás, leés archivos, validás y aplicás.

Tarea: $ARGUMENTS

Pasos:

1. **Planificá.** Descomponé la tarea y decidí el rol del sub-agente:
   - `frontend` (glm-5.1) — UI, React 19/Vite, MUI v7, Zustand (carpeta AppleSales)
   - `backend` (kimi-k2.6) — APIs, lógica, microservicios Express/Mongoose, bug fixes complejos
   - `review` (minimax-m2.7) — revisión de código / fixes menores
   - `analysis` (minimax-m2.7) — entender/resumir código existente
   Si empieza con `analyze` o `review`, usá ese rol sobre los archivos dados.

2. **Reuní contexto vos mismo.** Leé (Read/Grep) los archivos relevantes y
   pasalos al sub-agente con `--files`. No mandes una tarea a ciegas.

3. **Despachá** (prompt por STDIN, desde `agents/`):
   ```bash
   cd agents && echo "<prompt detallado para el sub-agente>" \
     | ./.venv/bin/python orchestrate.py <rol> --files <rutas relativas a la raíz>
   ```
   Para varios archivos de análisis, una llamada por archivo o agrupados.

4. **Validá críticamente.** Revisá el output: errores, convenciones del
   proyecto (tema y tokens en AppleSales/src/theme.js, patrón de microservicios
   schemas/controllers/routes, manejo de errores), seguridad. Si está mal,
   re-despachá con feedback concreto.

5. **Aplicá** los cambios con Edit/Write vos mismo (el script no toca el disco).
   Corré build/tests si aplica.

6. **Reportá**: qué rol/modelo se usó, qué validaste y cambiaste, y el resultado.
