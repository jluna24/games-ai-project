# Implementation Plan: AI Reasoning Playground

## Overview

Implementación incremental de la app educativa AI Reasoning Playground con Next.js 14 App Router, TypeScript strict, Tailwind CSS y Framer Motion. El plan comienza con el scaffolding del proyecto, luego construye el puzzle de búsqueda binaria completo (incluyendo modo vs IA con SSE), y finaliza con los tres puzzles restantes.

## Tasks

- [x] 1. Scaffolding del proyecto Next.js 14
  - Inicializar proyecto con `create-next-app` usando App Router, TypeScript strict y Tailwind CSS v3
  - Instalar dependencias: `framer-motion`, `openrouter` (o fetch nativo)
  - Configurar `tsconfig.json` con `strict: true` y path aliases (`@/`)
  - Crear `Dockerfile` multi-stage para producción (build + runtime con Node slim)
  - Crear `app/layout.tsx` con fuente y metadata base
  - Crear `app/not-found.tsx` que redirija a `/`
  - Crear rutas vacías: `app/puzzles/binary-search/page.tsx`, `app/puzzles/sorting/page.tsx`, `app/puzzles/hanoi/page.tsx`, `app/puzzles/river-crossing/page.tsx`
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 2. Página principal — Puzzle Selector
  - [x] 2.1 Crear componente `PuzzleCard` (`components/PuzzleCard.tsx`)
    - Implementar con props: `title`, `description`, `href`, `hasAIMode?`, `icon`
    - Mostrar badge/etiqueta "vs IA" cuando `hasAIMode === true`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Implementar `app/page.tsx` (Server Component)
    - Renderizar grid con 4 `PuzzleCard` apuntando a sus rutas
    - _Requirements: 1.3, 2.1, 2.2, 2.3_

- [x] 3. Lógica pura de búsqueda binaria
  - [x] 3.1 Crear `lib/binarySearch.ts`
    - Implementar `generateSortedArray(length: number): number[]`
    - Implementar `calculateMid(left: number, right: number): number`
    - Implementar `moveLeft(left: number, mid: number): { left: number; right: number; mid: number }`
    - Implementar `moveRight(mid: number, right: number): { left: number; right: number; mid: number }`
    - Implementar `checkStatus(array, mid, target, left, right): GameStatus`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 10.2, 10.5_

- [x] 4. Hook `useBinarySearch`
  - [x] 4.1 Crear `hooks/useBinarySearch.ts`
    - Implementar estado inicial con `BinarySearchState` completo
    - Implementar `reset()`: genera nuevo array (4–64 elementos), nuevo target, resetea contadores
    - Implementar `makeMove(direction)`: no-op si `status !== 'playing'`; calcula nuevos L/M/R usando `lib/binarySearch.ts`; incrementa `steps`; actualiza `status`
    - Implementar `startAI()`: no-op si `aiStatus === 'playing'`; abre `EventSource` o `fetch` SSE a `/api/claude`; actualiza `aiPointers` y `aiSteps` por cada chunk; maneja errores y cierre de conexión
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 4.1, 4.7, 4.8, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5. Checkpoint — Lógica de búsqueda binaria
  - Verificar que `useBinarySearch` funciona correctamente con pruebas manuales en el navegador.
  - Asegurarse de que todos los invariantes del estado se cumplen. Preguntar al usuario si hay dudas.

- [x] 6. Componentes visuales de búsqueda binaria
  - [x] 6.1 Crear `components/binary-search/BinarySearchBoard.tsx`
    - Renderizar array como fila de celdas con el valor de cada elemento
    - Mostrar punteros L, M, R animados con Framer Motion (`layout` animation)
    - Mostrar punteros del AIPlayer (`aiPointers`) en color diferente cuando estén disponibles
    - Resaltar celda `mid` del usuario y del AIPlayer
    - _Requirements: 3.3, 4.4_
  - [x] 6.2 Crear `components/binary-search/BinarySearchGame.tsx`
    - Usar `useBinarySearch` hook
    - Renderizar `BinarySearchBoard` con el estado actual
    - Botones: "Ir a la mitad izquierda", "Ir a la mitad derecha", "Reiniciar", "vs IA"
    - Mostrar contador de pasos del usuario en tiempo real
    - Mostrar mensaje de victoria con pasos del usuario y del AIPlayer (Req 3.5, 4.5)
    - Mostrar mensaje de derrota con posición correcta (Req 3.6)
    - Mostrar error SSE con botón de reintento (Req 4.7)
    - _Requirements: 3.3, 3.5, 3.6, 3.7, 3.8, 4.1, 4.5, 4.7, 4.8_
  - [x] 6.3 Conectar `app/puzzles/binary-search/page.tsx`
    - Marcar como `'use client'`
    - Renderizar `BinarySearchGame`
    - _Requirements: 1.4_

- [x] 7. Route Handler SSE — `/api/claude`
  - [x] 7.1 Crear `lib/openrouter.ts`
    - Definir constante `OPENROUTER_MODEL` con el modelo fijo (ej. `"anthropic/claude-3.5-sonnet"`)
    - Implementar función `streamBinarySearch(array, target)` que llama a OpenRouter con `stream: true`
    - Leer `OPENROUTER_API_KEY` desde `process.env`; lanzar error si no está definida
    - Incluir header `HTTP-Referer` con la URL de la aplicación
    - _Requirements: 11.2, 11.5, 11.7_
  - [x] 7.2 Crear `app/api/claude/route.ts`
    - Aceptar POST; validar body (`array`, `target`); retornar HTTP 400 si inválido
    - Retornar HTTP 500 si `OPENROUTER_API_KEY` no está definida
    - Construir prompt estructurado según el template del diseño
    - Retornar `ReadableStream` con `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
    - Formatear cada chunk como `data: {json}\n\n`
    - Reenviar código de error de OpenRouter si la API falla
    - _Requirements: 4.2, 4.3, 4.6, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 8. Checkpoint — Modo vs IA end-to-end
  - Verificar flujo completo: usuario activa "vs IA", el board anima los punteros del AIPlayer en tiempo real, al finalizar se muestra comparación de pasos.
  - Verificar manejo de errores SSE. Preguntar al usuario si hay dudas.

- [x] 9. Sorting Visual — Bubble Sort animado
  - [x] 9.1 Crear `components/sorting/SortingVisualizer.tsx`
    - Generar array desordenado de 4–20 enteros al montar
    - Implementar bubble sort paso a paso con `useRef` para control de pausa/play
    - Animar swaps con Framer Motion (`layout` animation en barras o celdas)
    - Control deslizante de velocidad: lento (800ms), normal (400ms), rápido (150ms)
    - Resaltar elementos comparados actualmente; resaltar todos al completar
    - Botones: "Play", "Pausar", "Reiniciar"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [x] 9.2 Conectar `app/puzzles/sorting/page.tsx`
    - Marcar como `'use client'`; renderizar `SortingVisualizer`
    - _Requirements: 1.4_

- [x] 10. Torre de Hanoi — Simulador interactivo
  - [x] 10.1 Crear `lib/hanoi.ts`
    - Implementar `validateMove(pegs, fromPeg, toPeg): boolean`
    - Implementar `applyMove(pegs, fromPeg, toPeg): number[][]`
    - Implementar `solveHanoi(n, from, to, via): Move[]` (solución recursiva óptima)
    - _Requirements: 6.2, 6.3, 6.6_
  - [x] 10.2 Crear `components/hanoi/HanoiSimulator.tsx`
    - Selector de discos (1–12) antes de iniciar
    - Renderizar 3 pegs con discos apilados (tamaño proporcional)
    - Click en disco para seleccionar, click en peg destino para mover
    - Validar movimiento; mostrar error si ilegal sin cambiar estado
    - Mostrar contador de movimientos y mínimo óptimo (`2^N - 1`)
    - Botón "Resolver automáticamente": animar solución óptima paso a paso
    - Declarar ganador cuando todos los discos estén en peg destino
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 10.3 Conectar `app/puzzles/hanoi/page.tsx`
    - Marcar como `'use client'`; renderizar `HanoiSimulator`
    - _Requirements: 1.4_

- [x] 11. River Crossing — Puzzle lobo, oveja y repollo
  - [x] 11.1 Crear `lib/riverCrossing.ts`
    - Implementar `validateCrossing(state, cargo): { valid: boolean; message?: string }`
    - Implementar `applyCrossing(state, cargo): RiverCrossingState`
    - Implementar `checkWin(state): boolean`
    - _Requirements: 7.2, 7.3_
  - [x] 11.2 Crear `components/river-crossing/RiverCrossingSimulator.tsx`
    - Estado inicial: barquero, lobo, oveja y repollo en orilla izquierda
    - Mostrar ambas orillas y posición del bote en todo momento
    - Selector de qué llevar en el bote (barquero solo o barquero + actor)
    - Validar selección; mostrar mensaje de restricción violada si aplica
    - Mostrar contador de viajes
    - Declarar ganador cuando todos estén en orilla derecha
    - Botón "Reiniciar": restaurar estado inicial
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 11.3 Conectar `app/puzzles/river-crossing/page.tsx`
    - Marcar como `'use client'`; renderizar `RiverCrossingSimulator`
    - _Requirements: 1.4_

- [ ] 12. Checkpoint final — Verificación completa
  - Verificar que las 4 rutas de puzzles funcionan y la navegación desde home es correcta.
  - Verificar que `not-found.tsx` redirige a `/`.
  - Verificar que el Dockerfile construye y ejecuta la app correctamente.
  - Preguntar al usuario si hay dudas antes de cerrar.

## Notes

- No hay property-based tests ni unit tests en este MVP; la validación es manual en el navegador.
- Las tareas son secuenciales: cada una construye sobre la anterior.
- El modo vs IA requiere `OPENROUTER_API_KEY` en `.env.local` para funcionar.
- El modelo de OpenRouter es fijo en `lib/openrouter.ts`; no hay selector de modelos ni `complexity-thresholds.json`.
- Los puzzles 9–11 (Sorting, Hanoi, River Crossing) son independientes entre sí y pueden implementarse en paralelo si se desea.
