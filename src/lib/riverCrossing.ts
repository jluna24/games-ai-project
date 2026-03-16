export type Actor = 'wolf' | 'sheep' | 'cabbage';
export type Shore = 'left' | 'right';

export interface RiverCrossingState {
  leftShore: Actor[];
  rightShore: Actor[];
  farmerShore: Shore;
  boatPosition: Shore;
  trips: number;
  status: 'playing' | 'won';
  violationMessage: string | null;
}

export function initialState(): RiverCrossingState {
  return {
    leftShore: ['wolf', 'sheep', 'cabbage'],
    rightShore: [],
    farmerShore: 'left',
    boatPosition: 'left',
    trips: 0,
    status: 'playing',
    violationMessage: null,
  };
}

function isUnsafe(actors: Actor[]): { unsafe: boolean; message?: string } {
  const hasWolf = actors.includes('wolf');
  const hasSheep = actors.includes('sheep');
  const hasCabbage = actors.includes('cabbage');

  if (hasWolf && hasSheep) {
    return { unsafe: true, message: 'El lobo se comería a la oveja' };
  }
  if (hasSheep && hasCabbage) {
    return { unsafe: true, message: 'La oveja se comería el repollo' };
  }
  return { unsafe: false };
}

export function validateCrossing(
  state: RiverCrossingState,
  cargo: Actor | null
): { valid: boolean; message?: string } {
  const currentShore = state.farmerShore === 'left' ? state.leftShore : state.rightShore;

  // If carrying an actor, it must be on the same shore as the farmer
  if (cargo !== null && !currentShore.includes(cargo)) {
    return { valid: false, message: `${cargo} no está en la misma orilla que el barquero` };
  }

  // Simulate what remains on the current shore after crossing
  const remaining = currentShore.filter(a => a !== cargo);

  const check = isUnsafe(remaining);
  if (check.unsafe) {
    return { valid: false, message: check.message };
  }

  return { valid: true };
}

export function applyCrossing(
  state: RiverCrossingState,
  cargo: Actor | null
): RiverCrossingState {
  const otherShore: Shore = state.farmerShore === 'left' ? 'right' : 'left';

  let newLeft = [...state.leftShore];
  let newRight = [...state.rightShore];

  if (cargo !== null) {
    if (state.farmerShore === 'left') {
      newLeft = newLeft.filter(a => a !== cargo);
      newRight = [...newRight, cargo];
    } else {
      newRight = newRight.filter(a => a !== cargo);
      newLeft = [...newLeft, cargo];
    }
  }

  const newState: RiverCrossingState = {
    leftShore: newLeft,
    rightShore: newRight,
    farmerShore: otherShore,
    boatPosition: otherShore,
    trips: state.trips + 1,
    status: 'playing',
    violationMessage: null,
  };

  if (checkWin(newState)) {
    newState.status = 'won';
  }

  return newState;
}

export function checkWin(state: RiverCrossingState): boolean {
  return state.farmerShore === 'right' && state.rightShore.length === 3;
}
