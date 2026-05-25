# Proyecto: Manzana Mordida

App de compra/venta de dispositivos Apple (iPhone, etc.) con canjes (trade-ins).
Backend de microservicios Node.js/Express + MongoDB/Mongoose; frontend React 19 +
Vite (carpeta `AppleSales`).

## Arquitectura de agentes

El **orquestador / project leader es Opus 4.7 corriendo dentro de Claude Code**
(esta sesión). NO es un script ni un proceso aparte. Opus planifica, descompone
la tarea, lee los archivos relevantes, arma el prompt, **valida y aplica** lo que
devuelven los sub-agentes, y corre los tests/builds.

`agents/orchestrate.py` es únicamente el **brazo de despacho**: recibe un rol +
un prompt por STDIN (+ archivos de contexto opcionales), llama al modelo Ollama
Cloud correcto y devuelve el texto por STDOUT. No llama a la API de Anthropic.

```
Opus 4.7 (project leader — esta sesión de Claude Code)
  1. planifica y descompone la tarea
  2. lee los archivos relevantes (Read/Grep)
  3. arma el prompt y despacha al sub-agente vía orchestrate.py:
       ├── glm-5.1        → frontend (UI, React 19/Vite, MUI v7, Zustand)
       ├── minimax-m2.7   → review / analysis (revisión, análisis, fixes menores)
       └── kimi-k2.6      → backend (APIs, microservicios Express/Mongoose, fixes complejos)
  4. revisa críticamente el output, lo aplica con Edit/Write
  5. corre build/tests; si hay que iterar, vuelve a despachar con feedback
  6. reporta el resultado validado
```

## Cuándo usar el despacho a sub-agentes

- Codificación sustancial (código nuevo, refactors, bug fixes)
- Análisis de archivos existentes antes de modificarlos
- Revisión de código

Examinar/analizar el codebase para planificar, modificar o revisar (incluido
armar roadmaps o evaluar deuda técnica) **SÍ se despacha** al rol `analysis`/
`review` (Minimax m2.7). Opus construye la síntesis estratégica SOBRE esos
hallazgos, no en lugar de ellos.

**Cuándo NO** (Opus lo hace directo, y es la lista completa de excepciones):
preguntas rápidas, cambios de una línea, greps de orientación puntuales, y el
bootstrap del propio setup de agentes (no puede despacharse a sí mismo). Una
quota de Ollama sin tocar tras una tarea de análisis = se ignoró la arquitectura.

## Comandos (los corre Opus; el prompt SIEMPRE va por STDIN)

```bash
cd agents

# Despachar una tarea a un rol (prompt por stdin):
echo "Crear componente <PriceDisplay/> con soporte AR$/US$" \
  | ./.venv/bin/python orchestrate.py frontend --files ../AppleSales/src/theme.js

# Análisis de archivos existentes:
./.venv/bin/python orchestrate.py analysis \
  --files ../msReservas/src/controllers/reservas.controller.js \
  <<< "Resumí este controller y su deuda técnica"

# Revisión de código:
./.venv/bin/python orchestrate.py review \
  --files ../msProductos/src/controllers/EquipoController.js \
  <<< "Revisá seguridad y manejo de errores"

# Utilidades:
./.venv/bin/python orchestrate.py roles         # mapeo rol -> modelo
./.venv/bin/python orchestrate.py list-models   # modelos disponibles en la cuenta
```

Flags: `--files a b ...` (contexto), `--max-tokens N` (default 12000),
`--show-reasoning` (debug, manda el chain-of-thought a STDERR).
STDOUT = respuesta del sub-agente. STDERR = metadata (modelo, latencia, tokens).

**Slash command:** `/multiagent <tarea>` o `/multiagent analyze <archivos>`.

## Setup inicial (solo una vez)

```bash
cd agents
python3.14 -m venv .venv && ./.venv/bin/pip install openai python-dotenv
cp .env.example .env
# Completar OLLAMA_API_KEY en agents/.env
```

(El venv en `agents/.venv` ya está creado con las deps instaladas.)

## Notas

- Solo se necesita `OLLAMA_API_KEY`. **No** se usa `ANTHROPIC_API_KEY`:
  duplicar a Opus en un subproceso sin contexto gastaría tokens al pedo.
- La key va en `agents/.env` (gitignored), nunca en el código.
- Modelos verificados contra la cuenta el 2026-05-17. Si un modelo deja de
  existir, `./.venv/bin/python orchestrate.py list-models` muestra los disponibles.
- Opus NUNCA entrega output de un sub-agente sin revisarlo y aplicarlo él mismo.
