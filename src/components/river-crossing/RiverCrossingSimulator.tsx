'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Actor,
  RiverCrossingState,
  initialState,
  validateCrossing,
  applyCrossing,
} from '@/lib/riverCrossing';

const ACTOR_EMOJI: Record<Actor, string> = {
  wolf: '🐺',
  sheep: '🐑',
  cabbage: '🥬',
};

const ACTOR_LABEL: Record<Actor, string> = {
  wolf: 'lobo',
  sheep: 'oveja',
  cabbage: 'repollo',
};

const ALL_ACTORS: Actor[] = ['wolf', 'sheep', 'cabbage'];

export default function RiverCrossingSimulator() {
  const [state, setState] = useState<RiverCrossingState>(initialState());
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showViolation = useCallback((message: string) => {
    setState(prev => ({ ...prev, violationMessage: message }));
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, violationMessage: null }));
    }, 2000);
  }, []);

  const handleCross = useCallback(
    (cargo: Actor | null) => {
      if (state.status === 'won') return;

      const result = validateCrossing(state, cargo);
      if (!result.valid) {
        showViolation(result.message ?? 'Movimiento inválido');
        return;
      }

      setState(applyCrossing(state, cargo));
    },
    [state, showViolation]
  );

  const handleReset = () => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setState(initialState());
  };

  const currentShore = state.farmerShore === 'left' ? state.leftShore : state.rightShore;
  const actorsOnFarmerShore = ALL_ACTORS.filter(a => currentShore.includes(a));

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Trip counter */}
      <div className="text-gray-300 text-sm">
        Viajes: <span className="text-white font-bold">{state.trips}</span>
      </div>

      {/* Win message */}
      {state.status === 'won' && (
        <div className="rounded-lg bg-green-900/40 border border-green-500 px-4 py-3 text-green-300 text-center font-semibold">
          🎉 ¡Ganaste! Todos cruzaron en {state.trips} viajes
        </div>
      )}

      {/* Violation message */}
      {state.violationMessage && (
        <div className="rounded-lg bg-red-900/40 border border-red-500 px-4 py-3 text-red-300 text-center text-sm">
          ⚠️ {state.violationMessage}
        </div>
      )}

      {/* Shores */}
      <div className="flex w-full max-w-2xl gap-4 items-stretch">
        {/* Left shore */}
        <Shore
          label="Orilla izquierda"
          actors={state.leftShore}
          hasFarmer={state.farmerShore === 'left'}
          hasBoat={state.boatPosition === 'left'}
        />

        {/* River */}
        <div className="flex flex-col items-center justify-center gap-1 px-2">
          <div className="text-blue-400 text-xs font-medium">🌊</div>
          <div className="w-px flex-1 bg-blue-800/50" />
          <div className="text-blue-400 text-xs font-medium">🌊</div>
        </div>

        {/* Right shore */}
        <Shore
          label="Orilla derecha"
          actors={state.rightShore}
          hasFarmer={state.farmerShore === 'right'}
          hasBoat={state.boatPosition === 'right'}
        />
      </div>

      {/* Action buttons */}
      {state.status === 'playing' && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleCross(null)}
            className="rounded-lg bg-indigo-700 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            🚣 Cruzar solo
          </button>
          {actorsOnFarmerShore.map(actor => (
            <button
              key={actor}
              onClick={() => handleCross(actor)}
              className="rounded-lg bg-indigo-700 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {ACTOR_EMOJI[actor]} Llevar {ACTOR_LABEL[actor]}
            </button>
          ))}
        </div>
      )}

      {/* Reset */}
      <button
        onClick={handleReset}
        className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        ↺ Reiniciar
      </button>
    </div>
  );
}

interface ShoreProps {
  label: string;
  actors: Actor[];
  hasFarmer: boolean;
  hasBoat: boolean;
}

function Shore({ label, actors, hasFarmer, hasBoat }: ShoreProps) {
  return (
    <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 p-4 flex flex-col gap-3 min-h-[140px]">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div className="flex flex-wrap gap-2">
        {hasFarmer && (
          <span className="text-2xl" title="Barquero">🚣</span>
        )}
        {actors.map(actor => (
          <span key={actor} className="text-2xl" title={ACTOR_LABEL[actor]}>
            {ACTOR_EMOJI[actor]}
          </span>
        ))}
      </div>
      {hasBoat && (
        <div className="mt-auto text-xs text-blue-400">⛵ Bote aquí</div>
      )}
    </div>
  );
}
