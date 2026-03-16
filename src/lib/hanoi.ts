export interface HanoiMove {
  from: number; // índice del peg origen (0, 1, 2)
  to: number;   // índice del peg destino (0, 1, 2)
}

/**
 * Retorna true si el movimiento es legal.
 * Ilegal si: peg origen vacío, o disco a mover > disco en cima del peg destino.
 */
export function validateMove(pegs: number[][], from: number, to: number): boolean {
  const fromPeg = pegs[from];
  if (fromPeg.length === 0) return false;

  const movingDisc = fromPeg[fromPeg.length - 1];
  const toPeg = pegs[to];

  if (toPeg.length === 0) return true;

  const topOfDest = toPeg[toPeg.length - 1];
  return movingDisc < topOfDest;
}

/**
 * Aplica el movimiento y retorna los nuevos pegs (inmutable).
 */
export function applyMove(pegs: number[][], from: number, to: number): number[][] {
  const newPegs = pegs.map(peg => [...peg]);
  const disc = newPegs[from].pop()!;
  newPegs[to].push(disc);
  return newPegs;
}

/**
 * Genera la solución óptima recursiva: 2^n - 1 movimientos.
 * from=0, to=2, via=1 por defecto.
 */
export function solveHanoi(n: number, from = 0, to = 2, via = 1): HanoiMove[] {
  if (n === 0) return [];
  return [
    ...solveHanoi(n - 1, from, via, to),
    { from, to },
    ...solveHanoi(n - 1, via, to, from),
  ];
}

/**
 * Estado inicial: todos los discos en peg 0, ordenados de mayor a menor (mayor = ID más alto).
 * Disco 1 = más pequeño, disco n = más grande.
 */
export function initialPegs(n: number): number[][] {
  const peg0: number[] = [];
  for (let i = n; i >= 1; i--) {
    peg0.push(i);
  }
  return [peg0, [], []];
}
