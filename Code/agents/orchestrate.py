"""
Herramienta de despacho multi-agente — sub-agentes Ollama Cloud.

IMPORTANTE sobre la arquitectura:

  El "project leader" / orquestador ES Opus 4.7 corriendo dentro de Claude Code
  (la sesión interactiva), NO este script. Opus planifica, descompone la tarea,
  lee los archivos relevantes, arma el prompt, y valida/aplica lo que devuelven
  los sub-agentes.

  Este script es solo el BRAZO DE DESPACHO: recibe un rol + un prompt por STDIN
  (+ archivos de contexto opcionales), llama al modelo Ollama correcto, y
  devuelve el texto final por STDOUT. No llama a la API de Anthropic: hacerlo
  duplicaría a Opus sin contexto y gastaría tokens al pedo.

Uso:
  # El prompt SIEMPRE va por STDIN (evita problemas de escaping/longitud).
  python orchestrate.py <rol> [--files a.js b.js] [--max-tokens N] [--show-reasoning]
  python orchestrate.py roles          # imprime el mapeo rol -> modelo
  python orchestrate.py list-models    # lista modelos disponibles en la cuenta

Roles: frontend | backend | review | analysis

Ejemplos (los corre Opus desde Claude Code):
  echo "Crear componente <PriceDisplay/> ..." | python orchestrate.py frontend --files AppleSales/src/theme.js
  python orchestrate.py analysis --files msReservas/src/controllers/reservas.controller.js <<< "Resumí este controller"
"""

import os
import sys
import time
import argparse
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

AGENTS_DIR = Path(__file__).parent
load_dotenv(AGENTS_DIR / ".env")

# ---------------------------------------------------------------------------
# Cliente Ollama Cloud (API compatible con OpenAI)
# ---------------------------------------------------------------------------

_api_key = os.environ.get("OLLAMA_API_KEY")
if not _api_key:
    sys.exit("ERROR: falta OLLAMA_API_KEY en agents/.env (ver agents/.env.example)")

ollama = OpenAI(
    base_url="https://ollama.com/v1",
    api_key=_api_key,
    timeout=600.0,     # generación de archivos completos puede tardar
    max_retries=0,     # el reintento lo manejamos nosotros
)

# ---------------------------------------------------------------------------
# Mapeo rol -> modelo  (verificado contra la cuenta el 2026-05-17)
# ---------------------------------------------------------------------------

AGENTS = {
    "frontend": "glm-5.1",       # UI, React/Vite, MUI
    "backend":  "kimi-k2.6",     # APIs, lógica, microservicios, bug fixes complejos
    "review":   "minimax-m2.7",  # revisión de código, fixes menores
    "analysis": "minimax-m2.7",  # análisis de código existente
}

DEFAULT_MAX_TOKENS = 12000  # son modelos con razonamiento: el thinking consume budget

# ---------------------------------------------------------------------------
# System prompts por rol
# ---------------------------------------------------------------------------

_COMMON = (
    "Proyecto: Manzana Mordida — app de compra/venta de dispositivos Apple (iPhone, etc.) "
    "con canjes (trade-ins). Backend de microservicios Node.js/Express + MongoDB/Mongoose; "
    "frontend React + Vite (carpeta AppleSales). Respondé en español. Sé preciso y directo, "
    "sin relleno. Cuando generes o modifiques código, devolvé el ARCHIVO COMPLETO (sin "
    "elipsis ni '... resto igual'), en un bloque cerrado y etiquetado con la ruta destino así:\n"
    "```ruta/al/archivo.ext\n<contenido completo>\n```\n"
    "No inventes APIs ni dependencias que no estén en el contexto provisto."
)

SYSTEM_PROMPTS = {
    "frontend": (
        "Sos el sub-agente de FRONTEND. Stack: React 19 + Vite 7, Material-UI (MUI) v7 con "
        "el prop `sx`/emotion, Zustand para estado, React Router v7, Axios (clients por "
        "microservicio en src/api/client.js). Tema oscuro, acento rojo de marca (#e31837), "
        "helpers y gradientes en src/theme.js. Componentes accesibles y consistentes con los "
        "existentes en src/components y las páginas en src/pages. " + _COMMON
    ),
    "backend": (
        "Sos el sub-agente de BACKEND. Stack: microservicios Node.js/Express con "
        "Mongoose/MongoDB, patrón schemas/controllers/routes (servicios como msProductos, "
        "msReservas, msCanjes, msClientes, etc.). La comunicación entre servicios es vía HTTP "
        "(fetch con URLs de entorno tipo PRODUCTOSMS_URL). Código production-ready, sin TODOs, "
        "con manejo de errores explícito. " + _COMMON
    ),
    "review": (
        "Sos el sub-agente de REVISIÓN de código. Devolvé hallazgos concretos ordenados por "
        "severidad (crítico/alto/medio/bajo), cada uno con archivo:línea, el problema y un "
        "fix concreto (con diff o código). Si te piden aplicar un fix menor, devolvé el "
        "archivo completo corregido. " + _COMMON
    ),
    "analysis": (
        "Sos el sub-agente de ANÁLISIS. Producí un resumen técnico conciso: propósito del "
        "módulo, dependencias relevantes, funciones/clases clave y su responsabilidad, "
        "patrones, deuda técnica/code smells, y puntos de entrada para futuras "
        "modificaciones. El resumen lo consume Opus para decidir arquitectura. " + _COMMON
    ),
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _log(msg: str) -> None:
    """Metadata va a STDERR para no contaminar el output capturado en STDOUT."""
    print(msg, file=sys.stderr, flush=True)


def build_file_context(paths: list[str]) -> str:
    if not paths:
        return ""
    blocks = []
    for p in paths:
        fp = Path(p)
        if not fp.exists():
            _log(f"  ! archivo no encontrado, se omite: {p}")
            continue
        try:
            content = fp.read_text(encoding="utf-8")
        except Exception as e:  # noqa: BLE001
            _log(f"  ! no se pudo leer {p}: {e}")
            continue
        try:
            rel = fp.resolve().relative_to(AGENTS_DIR.parent)
        except ValueError:
            rel = fp
        blocks.append(f"### ARCHIVO: {rel}\n```\n{content}\n```")
    if not blocks:
        return ""
    return (
        "Contexto — archivos existentes del proyecto (NO los repitas salvo que los "
        "modifiques):\n\n" + "\n\n".join(blocks) + "\n\n---\n\n"
    )


def call_agent(role: str, prompt: str, max_tokens: int, show_reasoning: bool) -> str:
    model = AGENTS[role]
    messages = [
        {"role": "system", "content": SYSTEM_PROMPTS[role]},
        {"role": "user", "content": prompt},
    ]

    last_err = None
    for attempt in (1, 2):
        try:
            t0 = time.time()
            # Streaming: generaciones grandes (archivos completos) superan el
            # timeout total de un request único. El stream lee chunks a medida
            # que llegan, así el timeout aplica por-chunk y no al total.
            stream = ollama.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                stream=True,
            )
            content_parts = []
            reasoning_parts = []
            finish_reason = None
            usage = None
            for ev in stream:
                if getattr(ev, "usage", None) is not None:
                    usage = ev.usage
                if not ev.choices:
                    continue
                ch = ev.choices[0]
                if ch.finish_reason:
                    finish_reason = ch.finish_reason
                delta = ch.delta
                if delta is None:
                    continue
                if delta.content:
                    content_parts.append(delta.content)
                dr = getattr(delta, "reasoning", None)
                if dr:
                    reasoning_parts.append(dr)
            dt = time.time() - t0
            content = "".join(content_parts).strip()
            reasoning = "".join(reasoning_parts) if reasoning_parts else None
            toks = (
                f"{usage.prompt_tokens}/{usage.completion_tokens}"
                if usage else "n/a"
            )
            _log(
                f"  ✓ {role} via {model} | {dt:.1f}s | "
                f"finish={finish_reason} | tokens in/out={toks}"
            )
            if show_reasoning and reasoning:
                _log("  --- reasoning ---\n" + reasoning + "\n  --- /reasoning ---")
            if not content:
                if reasoning:
                    _log(
                        "  ! el modelo solo devolvió reasoning (sin content). "
                        "Subí --max-tokens y reintentá."
                    )
                raise RuntimeError("respuesta vacía del modelo")
            return content
        except Exception as e:  # noqa: BLE001
            last_err = e
            _log(f"  ! intento {attempt}/2 falló: {type(e).__name__}: {str(e)[:200]}")
            if attempt == 1:
                time.sleep(3)

    raise SystemExit(f"ERROR: el sub-agente {role} ({model}) falló: {last_err}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        prog="orchestrate.py",
        description="Despacho a sub-agentes Ollama Cloud. El prompt va por STDIN.",
    )
    parser.add_argument(
        "role",
        help="frontend | backend | review | analysis | roles | list-models",
    )
    parser.add_argument("--files", nargs="*", default=[], help="archivos de contexto")
    parser.add_argument("--max-tokens", type=int, default=DEFAULT_MAX_TOKENS)
    parser.add_argument(
        "--show-reasoning",
        action="store_true",
        help="emite el chain-of-thought del modelo a STDERR (debug)",
    )
    args = parser.parse_args()

    if args.role == "roles":
        for r, m in AGENTS.items():
            print(f"{r:10s} -> {m}")
        return

    if args.role == "list-models":
        for m in sorted(x.id for x in ollama.models.list().data):
            print(m)
        return

    if args.role not in AGENTS:
        sys.exit(
            f"ERROR: rol inválido '{args.role}'. "
            f"Usá uno de: {', '.join(AGENTS)} (o 'roles' / 'list-models')."
        )

    if sys.stdin.isatty():
        sys.exit("ERROR: el prompt debe venir por STDIN (echo '...' | python orchestrate.py <rol>)")
    task = sys.stdin.read().strip()
    if not task:
        sys.exit("ERROR: STDIN vacío — no hay tarea para despachar.")

    file_ctx = build_file_context(args.files)
    prompt = file_ctx + task

    _log(f"[despacho] rol={args.role} modelo={AGENTS[args.role]} "
         f"archivos={len(args.files)} max_tokens={args.max_tokens}")
    result = call_agent(args.role, prompt, args.max_tokens, args.show_reasoning)
    print(result)


if __name__ == "__main__":
    main()
