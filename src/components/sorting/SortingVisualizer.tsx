'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Types ---

interface SortingStep {
  array: number[];
  comparing: [number, number];
  swap: boolean;
  sortedIndices: number[];
}

type Speed = 'slow' | 'normal' | 'fast';
type Status = 'idle' | 'playing' | 'paused' | 'done';

const SPEED_MAP: Record<Speed, number> = {
  slow: 800,
  normal: 400,
  fast: 150,
};

const ARRAY_SIZE = 12;

// --- Helpers ---

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
}

function computeBubbleSortSteps(initial: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...initial];
  const n = arr.length;
  const sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      const swap = arr[j] > arr[j + 1];
      if (swap) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swap,
        sortedIndices: [...sortedIndices],
      });
    }
    // After each pass, the last unsorted element is now in its final position
    sortedIndices.unshift(n - 1 - i);
  }
  // Mark all as sorted in the final state
  const allSorted = Array.from({ length: n }, (_, i) => i);
  steps.push({
    array: [...arr],
    comparing: [0, 0],
    swap: false,
    sortedIndices: allSorted,
  });

  return steps;
}

// --- Component ---

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>(() => randomArray(ARRAY_SIZE));
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [status, setStatus] = useState<Status>('idle');
  const [speed, setSpeed] = useState<Speed>('normal');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const stepIndexRef = useRef<number>(-1);
  const stepsRef = useRef<SortingStep[]>([]);
  const speedRef = useRef<Speed>('normal');

  // Keep refs in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { stepsRef.current = steps; }, [steps]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback((nextIndex: number) => {
    if (isPausedRef.current) return;
    const currentSteps = stepsRef.current;
    if (nextIndex >= currentSteps.length) {
      setStatus('done');
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (isPausedRef.current) return;
      stepIndexRef.current = nextIndex;
      setStepIndex(nextIndex);
      scheduleNext(nextIndex + 1);
    }, SPEED_MAP[speedRef.current as Speed]);
  }, []);

  const handlePlay = useCallback(() => {
    if (status === 'idle') {
      const newSteps = computeBubbleSortSteps(array);
      stepsRef.current = newSteps;
      setSteps(newSteps);
      isPausedRef.current = false;
      setStatus('playing');
      scheduleNext(0);
    } else if (status === 'paused') {
      isPausedRef.current = false;
      setStatus('playing');
      scheduleNext(stepIndexRef.current + 1);
    }
  }, [status, array, scheduleNext]);

  const handlePause = useCallback(() => {
    isPausedRef.current = true;
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  const handleReset = useCallback(() => {
    clearTimer();
    isPausedRef.current = true;
    const newArr = randomArray(ARRAY_SIZE);
    setArray(newArr);
    setSteps([]);
    setStepIndex(-1);
    stepIndexRef.current = -1;
    stepsRef.current = [];
    setStatus('idle');
    // Allow play to start fresh
    isPausedRef.current = false;
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  // Derived display state
  const currentStep = stepIndex >= 0 && steps.length > 0 ? steps[stepIndex] : null;
  const displayArray = currentStep ? currentStep.array : array;
  const comparing = currentStep ? currentStep.comparing : null;
  const sortedIndices = currentStep ? new Set(currentStep.sortedIndices) : new Set<number>();
  const isDone = status === 'done';

  const maxVal = Math.max(...displayArray);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Bars */}
      <div className="relative flex items-end justify-center gap-1 h-48 bg-gray-900 rounded-xl p-4">
        <AnimatePresence initial={false}>
          {displayArray.map((val: number, i: number) => {
            const isComparing = comparing && (i === comparing[0] || i === comparing[1]);
            const isSorted = sortedIndices.has(i);

            let barColor = 'bg-indigo-500';
            if (isDone || isSorted) barColor = 'bg-green-500';
            else if (isComparing) barColor = 'bg-amber-400';

            const heightPct = (val / maxVal) * 100;

            return (
              <motion.div
                key={`bar-${i}`}
                layoutId={`bar-${i}`}
                className={`rounded-t-sm flex-1 min-w-0 ${barColor} transition-colors duration-150`}
                style={{ height: `${heightPct}%` }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Done message */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-lg bg-green-900/40 border border-green-500 px-4 py-3 text-green-300 text-center font-semibold"
          >
            ¡Ordenado!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed slider */}
      <div className="flex items-center gap-3 text-sm text-gray-300">
        <span className="shrink-0">Velocidad:</span>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={['slow', 'normal', 'fast'].indexOf(speed)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = Number(e.target.value);
            setSpeed((['slow', 'normal', 'fast'] as Speed[])[val]);
          }}
          className="flex-1 accent-indigo-500"
        />
        <span className="shrink-0 w-14 text-right capitalize">{speed === 'slow' ? 'Lento' : speed === 'normal' ? 'Normal' : 'Rápido'}</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {(status === 'idle' || status === 'paused') && (
          <button
            onClick={handlePlay}
            className="rounded-lg bg-indigo-700 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            ▶ {status === 'paused' ? 'Continuar' : 'Play'}
          </button>
        )}

        {status === 'playing' && (
          <button
            onClick={handlePause}
            className="rounded-lg bg-amber-700 hover:bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            ⏸ Pausar
          </button>
        )}

        <button
          onClick={handleReset}
          className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          ↺ Reiniciar
        </button>
      </div>
    </div>
  );
}
