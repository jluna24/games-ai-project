'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useBinarySearch } from '@/hooks/useBinarySearch';
import BinarySearchBoard from './BinarySearchBoard';

export default function BinarySearchGame() {
  const { state, makeMove, startAI, reset } = useBinarySearch();
  const { array, target, left, mid, right, steps, aiSteps, aiPointers, status, aiStatus, errorMessage } = state;

  const isPlaying = status === 'playing';
  const aiRunning = aiStatus === 'playing';

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Board */}
      <BinarySearchBoard
        array={array}
        target={target}
        left={left}
        mid={mid}
        right={right}
        aiPointers={aiPointers}
      />

      {/* Step counters */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-gray-300">
          Tus pasos: <span className="font-bold text-white">{steps}</span>
        </span>
        {aiStatus !== 'idle' && (
          <span className="text-amber-300">
            IA: <span className="font-bold">{aiSteps} pasos</span>
          </span>
        )}
      </div>

      {/* Status messages */}
      <AnimatePresence mode="wait">
        {status === 'won' && (
          <motion.div
            key="won"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-lg bg-green-900/40 border border-green-500 px-4 py-3 text-green-300"
          >
            <p className="font-semibold">¡Encontrado en {steps} pasos!</p>
            {aiStatus === 'won' && (
              <p className="text-sm mt-1 text-green-400">
                Tú: {steps} pasos | IA: {aiSteps} pasos
              </p>
            )}
          </motion.div>
        )}

        {status === 'lost' && (
          <motion.div
            key="lost"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-lg bg-red-900/40 border border-red-500 px-4 py-3 text-red-300"
          >
            <p className="font-semibold">
              No encontrado. El target estaba en posición {array.indexOf(target)}
            </p>
          </motion.div>
        )}

        {aiStatus === 'won' && status === 'playing' && (
          <motion.div
            key="ai-won"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-lg bg-orange-900/40 border border-orange-500 px-4 py-3 text-orange-300"
          >
            <p className="font-semibold">IA terminó en {aiSteps} pasos</p>
          </motion.div>
        )}

        {aiStatus === 'error' && (
          <motion.div
            key="ai-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-lg bg-red-900/40 border border-red-500 px-4 py-3 text-red-300 flex items-center justify-between gap-4"
          >
            <p className="text-sm">{errorMessage}</p>
            <button
              onClick={startAI}
              className="shrink-0 rounded-md bg-red-700 hover:bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors"
            >
              Reintentar IA
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => makeMove('left')}
          disabled={!isPlaying}
          className="rounded-lg bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          ← Mitad izquierda
        </button>

        <button
          onClick={() => makeMove('right')}
          disabled={!isPlaying}
          className="rounded-lg bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Mitad derecha →
        </button>

        <button
          onClick={reset}
          className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Reiniciar
        </button>

        <button
          onClick={startAI}
          disabled={aiRunning}
          className="rounded-lg bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {aiRunning ? 'IA jugando...' : '▶ vs IA'}
        </button>
      </div>
    </div>
  );
}
