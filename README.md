# AI Reasoning Playground

Aplicación web educativa inspirada en el paper [**"The Illusion of Thinking"** (Apple, 2025)](https://arxiv.org/abs/2506.06941), que demuestra que los Large Reasoning Models colapsan en exactitud más allá de ciertos umbrales de complejidad.

Explora 4 puzzles algorítmicos interactivos y compara tu razonamiento contra modelos de IA en tiempo real.

---

## Puzzles

| Puzzle | Descripción | Modo vs IA |
|---|---|---|
| 🔍 Búsqueda Binaria | Adivina el número oculto eligiendo mitades | ✅ |
| 📊 Sorting Visual | Observa bubble sort animado paso a paso | — |
| 🗼 Torre de Hanoi | Resuelve el puzzle con N discos (1–12) | — |
| 🚣 River Crossing | Lleva al lobo, la oveja y el repollo al otro lado | — |

---

## Stack

- **Next.js 14** — App Router, Server Components, Route Handlers
- **TypeScript** — modo strict
- **Tailwind CSS v3** — estilos
- **Framer Motion** — animaciones
- **OpenRouter** — acceso a modelos de IA vía streaming SSE
- **Docker** — deploy en contenedor

---

## Requisitos

- Node.js 20+
- Una API key de [OpenRouter](https://openrouter.ai)

---

## Ejecución local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local y agrega tu clave:
# OPENROUTER_API_KEY=sk-or-...

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Ejecución con Docker

```bash
# 1. Construir la imagen
docker build -t ai-reasoning-playground .

# 2. Ejecutar el contenedor
docker run -p 3000:3000 \
  -e OPENROUTER_API_KEY=sk-or-... \
  ai-reasoning-playground
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

> La `OPENROUTER_API_KEY` se pasa como variable de entorno en tiempo de ejecución, nunca se incluye en la imagen.

---

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `OPENROUTER_API_KEY` | ✅ | API key de OpenRouter para el modo vs IA |
