# Requirements Document

## Introduction

AI Reasoning Playground es una aplicación web educativa inspirada en el paper "The Illusion of Thinking" (Apple, 2025), que demuestra que los Large Reasoning Models colapsan en exactitud más allá de ciertos umbrales de complejidad. La app presenta 4 puzzles/algoritmos interactivos donde el usuario puede jugar y comparar su desempeño contra modelos de IA. El MVP se enfoca en el scaffolding completo y el primer puzzle funcional: búsqueda binaria con modo "vs IA" usando streaming de respuestas desde OpenRouter.

## Glossary

- **App**: La aplicación web AI Reasoning Playground construida con Next.js 14.
- **Playground**: Interfaz principal que lista los puzzles disponibles.
- **BinarySearchGame**: El módulo de búsqueda binaria interactiva con modo vs IA.
- **BinarySearchBoard**: Componente visual que muestra el array con punteros L, M y R.
- **AIPlayer**: El modelo de lenguaje conectado vía OpenRouter que juega búsqueda binaria.
- **StreamingHandler**: El Route Handler de Next.js que gestiona la conexión SSE con OpenRouter.
- **HanoiSimulator**: Módulo que calcula y valida movimientos de la Torre de Hanoi.
- **RiverCrossingSimulator**: Módulo que gestiona el estado del puzzle lobo-oveja-repollo.
- **SortingVisualizer**: Componente que anima bubble sort con control de velocidad.
- **Step**: Un movimiento individual dentro de un puzzle (comparación, swap, movimiento de disco).
- **SSE**: Server-Sent Events, protocolo usado para streaming de respuestas del modelo.

---

## Requirements

### Requirement 1: Scaffolding del proyecto

**User Story:** As a developer, I want a complete Next.js 14 project scaffold with all necessary configuration, so that I can start building features immediately without setup friction.

#### Acceptance Criteria

1. THE App SHALL use Next.js 14 with App Router, TypeScript strict mode, Tailwind CSS v3 y Framer Motion.
2. THE App SHALL incluir un `Dockerfile` que permita ejecutar la aplicación en un contenedor Docker en modo producción.
3. THE App SHALL exponer la página principal en la ruta `/` con una lista navegable de los 4 puzzles disponibles.
4. THE App SHALL exponer rutas individuales en `/puzzles/binary-search`, `/puzzles/sorting`, `/puzzles/hanoi` y `/puzzles/river-crossing`.
5. IF una ruta no existe, THEN THE App SHALL redirigir al usuario a la página principal `/`.

---

### Requirement 2: Página principal — Puzzle Selector

**User Story:** As a user, I want to see all available puzzles on the home page, so that I can choose which algorithm to explore.

#### Acceptance Criteria

1. THE Playground SHALL mostrar una tarjeta por cada uno de los 4 puzzles: Búsqueda Binaria, Sorting Visual, Torre de Hanoi y River Crossing.
2. WHEN el usuario hace clic en una tarjeta de puzzle, THE Playground SHALL navegar a la ruta correspondiente del puzzle.
3. THE Playground SHALL mostrar en la tarjeta de Búsqueda Binaria una etiqueta visible que indique que el modo "vs IA" está disponible.

---

### Requirement 3: Búsqueda Binaria — Juego interactivo

**User Story:** As a user, I want to play binary search interactively on a visual array, so that I can understand the algorithm step by step.

#### Acceptance Criteria

1. THE BinarySearchGame SHALL generar un array ordenado de enteros con longitud configurable entre 4 y 64 elementos.
2. THE BinarySearchGame SHALL seleccionar aleatoriamente un número objetivo (`target`) dentro del array al iniciar cada partida.
3. WHEN el usuario inicia una partida, THE BinarySearchBoard SHALL renderizar el array con los punteros L (left), M (mid) y R (right) en sus posiciones iniciales correctas.
4. WHEN el usuario selecciona "Ir a la mitad izquierda" o "Ir a la mitad derecha", THE BinarySearchGame SHALL actualizar los punteros L, M y R según el algoritmo de búsqueda binaria estándar.
5. WHEN el puntero M apunta al elemento igual al `target`, THE BinarySearchGame SHALL declarar al usuario ganador y mostrar el número de pasos utilizados.
6. IF el usuario agota los pasos posibles sin encontrar el `target`, THEN THE BinarySearchGame SHALL mostrar un mensaje de derrota con la posición correcta del elemento.
7. THE BinarySearchGame SHALL registrar y mostrar el número de pasos realizados por el usuario en tiempo real.
8. WHEN el usuario hace clic en "Reiniciar", THE BinarySearchGame SHALL generar un nuevo array y un nuevo `target` y resetear todos los contadores.

---

### Requirement 4: Búsqueda Binaria — Modo vs IA con streaming

**User Story:** As a user, I want to watch an AI model play binary search step by step with streaming output, so that I can compare its reasoning process against mine.

#### Acceptance Criteria

1. WHEN el usuario activa el modo "vs IA", THE BinarySearchGame SHALL enviar el array y el `target` al StreamingHandler y comenzar a recibir pasos via SSE.
2. THE StreamingHandler SHALL conectarse a la API de OpenRouter usando la clave configurada en variables de entorno y transmitir la respuesta como SSE al cliente.
3. WHEN el StreamingHandler recibe un chunk de la API de OpenRouter, THE StreamingHandler SHALL reenviar el chunk al cliente sin buffering completo.
4. THE BinarySearchBoard SHALL animar cada paso del AIPlayer con una transición visible de los punteros L, M y R usando Framer Motion.
5. WHEN el AIPlayer encuentra el `target`, THE BinarySearchGame SHALL mostrar el número de pasos del AIPlayer junto al número de pasos del usuario para comparación directa.
6. IF la API de OpenRouter retorna un error HTTP, THEN THE StreamingHandler SHALL retornar una respuesta con el código de error correspondiente y un mensaje descriptivo en JSON.
7. IF la conexión SSE se interrumpe antes de completar, THEN THE BinarySearchGame SHALL mostrar un mensaje de error al usuario y habilitar el botón de reintento.
8. THE BinarySearchGame SHALL permitir al usuario jugar en paralelo mientras el AIPlayer ejecuta su búsqueda, sin bloquear la interacción del usuario.

---

### Requirement 5: Sorting Visual — Bubble Sort animado

**User Story:** As a user, I want to watch bubble sort execute visually with speed control, so that I can understand how the algorithm works at different paces.

#### Acceptance Criteria

1. THE SortingVisualizer SHALL generar un array desordenado de entre 4 y 20 enteros al iniciar.
2. WHEN el usuario presiona "Play", THE SortingVisualizer SHALL ejecutar bubble sort paso a paso con animaciones de swap usando Framer Motion.
3. THE SortingVisualizer SHALL ofrecer un control deslizante de velocidad con al menos 3 niveles: lento, normal y rápido.
4. WHEN el array está completamente ordenado, THE SortingVisualizer SHALL resaltar todos los elementos con un color de completado y detener la animación.
5. WHEN el usuario presiona "Pausar" durante la ejecución, THE SortingVisualizer SHALL detener la animación en el paso actual sin perder el estado.
6. WHEN el usuario presiona "Reiniciar", THE SortingVisualizer SHALL generar un nuevo array desordenado y resetear la animación.

---

### Requirement 6: Torre de Hanoi — Simulador interactivo

**User Story:** As a user, I want to solve the Tower of Hanoi puzzle with N discs, so that I can explore how complexity grows exponentially.

#### Acceptance Criteria

1. THE HanoiSimulator SHALL soportar entre 1 y 12 discos configurables por el usuario antes de iniciar.
2. WHEN el usuario selecciona un disco y un peg destino, THE HanoiSimulator SHALL validar que el movimiento es legal según las reglas de Hanoi (no colocar disco mayor sobre menor).
3. IF el movimiento es ilegal, THEN THE HanoiSimulator SHALL rechazar el movimiento y mostrar un mensaje de error sin alterar el estado del puzzle.
4. WHEN todos los discos están en el peg destino en orden correcto, THE HanoiSimulator SHALL declarar al usuario ganador y mostrar el número de movimientos realizados versus el mínimo óptimo (`2^N - 1`).
5. THE HanoiSimulator SHALL mostrar en todo momento el contador de movimientos realizados y el mínimo óptimo para el N seleccionado.
6. WHEN el usuario hace clic en "Resolver automáticamente", THE HanoiSimulator SHALL ejecutar la solución óptima animada paso a paso.

---

### Requirement 7: River Crossing — Puzzle lobo, oveja y repollo

**User Story:** As a user, I want to solve the wolf-sheep-cabbage river crossing puzzle, so that I can experience a classic constraint-satisfaction problem.

#### Acceptance Criteria

1. THE RiverCrossingSimulator SHALL presentar el caso fijo con los actores: barquero, lobo, oveja y repollo en la orilla izquierda.
2. WHEN el usuario selecciona qué llevar en el bote (barquero solo, o barquero + un actor), THE RiverCrossingSimulator SHALL validar que la selección no viola las restricciones del puzzle (lobo no puede quedarse solo con oveja; oveja no puede quedarse sola con repollo).
3. IF una selección viola las restricciones, THEN THE RiverCrossingSimulator SHALL rechazar el movimiento y mostrar qué restricción se viola.
4. WHEN todos los actores están en la orilla derecha, THE RiverCrossingSimulator SHALL declarar al usuario ganador y mostrar el número de viajes realizados.
5. THE RiverCrossingSimulator SHALL mostrar el estado actual de ambas orillas y la posición del bote en todo momento.
6. WHEN el usuario hace clic en "Reiniciar", THE RiverCrossingSimulator SHALL restaurar todos los actores a la orilla izquierda.

---

### Requirement 10: Hook useBinarySearch

**User Story:** As a developer, I want a custom React hook that encapsulates all binary search game logic, so that the UI components remain presentational and the logic is testable in isolation.

#### Acceptance Criteria

1. THE App SHALL implementar un hook `useBinarySearch` que exponga: `state: BinarySearchState`, `makeMove(direction: 'left' | 'right'): void`, `startAI(): void`, `reset(): void`.
2. WHEN `makeMove` es llamado, THE App SHALL calcular los nuevos valores de `left`, `mid` y `right` según el algoritmo de búsqueda binaria e incrementar `steps`.
3. WHEN `startAI` es llamado, THE App SHALL abrir una conexión SSE al endpoint `/api/claude/route` y actualizar `aiSteps` con cada chunk recibido.
4. IF `makeMove` es llamado con `status` diferente de `'playing'`, THEN THE App SHALL ignorar la llamada sin lanzar errores.
5. THE App SHALL calcular automáticamente `status` como `'won'` cuando `array[mid] === target` y como `'lost'` cuando `left > right`.

---

### Requirement 11: Route Handler SSE — /api/claude

**User Story:** As a developer, I want a Next.js Route Handler that streams AI responses via SSE, so that the client can receive binary search steps in real time.

#### Acceptance Criteria

1. THE StreamingHandler SHALL aceptar peticiones POST en `/api/claude` con un body JSON que contenga `array: number[]` y `target: number`.
2. THE StreamingHandler SHALL construir un prompt estructurado que instruya al modelo a resolver búsqueda binaria paso a paso, emitiendo cada paso como un objeto JSON en el stream.
3. THE StreamingHandler SHALL retornar una respuesta con `Content-Type: text/event-stream` y los headers necesarios para deshabilitar buffering (`Cache-Control: no-cache`, `Connection: keep-alive`).
4. WHEN el modelo emite un paso completo, THE StreamingHandler SHALL formatear el chunk como `data: {json}\n\n` siguiendo el protocolo SSE estándar.
5. THE StreamingHandler SHALL leer la clave de API de OpenRouter desde la variable de entorno `OPENROUTER_API_KEY` y nunca exponerla al cliente.
6. IF `OPENROUTER_API_KEY` no está definida en el entorno, THEN THE StreamingHandler SHALL retornar HTTP 500 con el mensaje `"OPENROUTER_API_KEY is not configured"`.
7. THE StreamingHandler SHALL incluir el header `HTTP-Referer` con la URL de la aplicación al llamar a la API de OpenRouter, según los requisitos de la plataforma.
