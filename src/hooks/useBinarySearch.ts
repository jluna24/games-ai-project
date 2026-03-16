'use client';

import { useCallback, useRef, useState } from 'react';
import {
  generateSortedArray,
  calculateMid,
  moveLeft,
  moveRight,
  checkStatus,
} from '@/lib/binarySearch';

type GameStatus = 'idle' | 'playing' | 'won' | 'lost';
type AIStatus = 'idle' | 'playing' | 'won' | 'error';

interface BinarySearchState {
  array: number[];
  target: number;
  left: number;
  right: number;
  mid: number;
  steps: number;
  aiSteps: number;
  aiPointers: { left: number; mid: number; right: number } | null;
  status: GameStatus;
  aiStatus: AIStatus;
  errorMessage: string | null;
}

interface UseBinarySearchReturn {
  state: BinarySearchState;
  makeMove: (direction: 'left' | 'right') => void;
  startAI: () => void;
  reset: () => void;
}

function createInitialState(): BinarySearchState {
  const array = generateSortedArray(16);
  const target = array[Math.floor(Math.random() * array.length)];
  const left = 0;
  const right = array.length - 1;
  const mid = calculateMid(left, right);
  return {
    array,
    target,
    left,
    right,
    mid,
    steps: 0,
    aiSteps: 0,
    aiPointers: null,
    status: 'playing',
    aiStatus: 'idle',
    errorMessage: null,
  };
}

export function useBinarySearch(): UseBinarySearchReturn {
  const [state, setState] = useState<BinarySearchState>(createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(createInitialState());
  }, []);

  const makeMove = useCallback((direction: 'left' | 'right') => {
    setState((prev: BinarySearchState) => {
      if (prev.status !== 'playing') return prev;

      const pointers =
        direction === 'left'
          ? moveLeft(prev.left, prev.mid)
          : moveRight(prev.mid, prev.right);

      const newStatus = checkStatus(
        prev.array,
        pointers.mid,
        prev.target,
        pointers.left,
        pointers.right
      );

      return {
        ...prev,
        ...pointers,
        steps: prev.steps + 1,
        status: newStatus,
      };
    });
  }, []);

  const startAI = useCallback(() => {
    const current = stateRef.current;
    if (current.aiStatus === 'playing') return;

    const { array, target } = current;

    // Reset AI state before starting
    setState((prev: BinarySearchState) => ({
      ...prev,
      aiStatus: 'playing',
      aiPointers: null,
      aiSteps: 0,
      errorMessage: null,
    }));

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    (async () => {
      let foundSignal = false;
      try {
        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ array, target }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text().catch(() => response.statusText);
          setState((s: BinarySearchState) => ({
            ...s,
            aiStatus: 'error',
            errorMessage: `Server error ${response.status}: ${text}`,
          }));
          return;
        }

        if (!response.body) {
          setState((s: BinarySearchState) => ({
            ...s,
            aiStatus: 'error',
            errorMessage: 'No response body',
          }));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const { left, mid, right, found } = parsed;

              setState((s: BinarySearchState) => ({
                ...s,
                aiPointers: { left, mid, right },
                aiSteps: s.aiSteps + 1,
              }));

              if (found === true) {
                foundSignal = true;
                setState((s: BinarySearchState) => ({ ...s, aiStatus: 'won' }));
              }
            } catch {
              // Ignore unparseable chunks
            }
          }
        }

        if (!foundSignal) {
          setState((s: BinarySearchState) => ({
            ...s,
            aiStatus: 'error',
            errorMessage: 'Connection interrupted',
          }));
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown network error';
        setState((s: BinarySearchState) => ({
          ...s,
          aiStatus: 'error',
          errorMessage: message,
        }));
      }
    })();
  }, []);

  return { state, makeMove, startAI, reset };
}
