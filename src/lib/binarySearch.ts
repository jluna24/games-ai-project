type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

/**
 * Genera un array ordenado ascendentemente de `length` enteros únicos aleatorios.
 * El rango de valores es [1, length * 3] para garantizar suficiente espacio.
 */
export function generateSortedArray(length: number): number[] {
  const max = length * 3;
  const set = new Set<number>();
  while (set.size < length) {
    set.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Calcula el índice medio: Math.floor((left + right) / 2)
 */
export function calculateMid(left: number, right: number): number {
  return Math.floor((left + right) / 2);
}

/**
 * Mueve hacia la mitad izquierda: right = mid - 1, recalcula mid.
 */
export function moveLeft(
  left: number,
  mid: number
): { left: number; right: number; mid: number } {
  const right = mid - 1;
  return { left, right, mid: calculateMid(left, right) };
}

/**
 * Mueve hacia la mitad derecha: left = mid + 1, recalcula mid.
 */
export function moveRight(
  mid: number,
  right: number
): { left: number; right: number; mid: number } {
  const left = mid + 1;
  return { left, right, mid: calculateMid(left, right) };
}

/**
 * Determina el status del juego:
 * - 'won'     si array[mid] === target
 * - 'lost'    si left > right
 * - 'playing' en cualquier otro caso
 */
export function checkStatus(
  array: number[],
  mid: number,
  target: number,
  left: number,
  right: number
): GameStatus {
  if (array[mid] === target) return 'won';
  if (left > right) return 'lost';
  return 'playing';
}
