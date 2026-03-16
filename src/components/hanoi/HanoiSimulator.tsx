'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { validateMove, applyMove, solveHanoi, initialPegs } from '@/lib/hanoi';

const MAX_DISCS = 12;
const MIN_DISCS = 1;
const AUTO_SOLVE_INTERVAL = 300;

export default function HanoiSimulator() {
  const [discCount, setDiscCount] = useState(3);
  const [started, setStarted] = useState(false);
  const [pegs, setPegs] = useState<number[][]>([[], [], []]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [solving, setSolving] = useState(false);

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const solveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const optimalMoves = Math.pow(2, discCount) - 1;

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 2000);
  }, []);

  const checkWin = useCallback((currentPegs: number[][]): boolean => {
    return currentPegs[2].length === discCount;
  }, [discCount]);

  const handleStart = () => {
    const p = initialPegs(discCount);
    setPegs(p);
    setMoves(0);
    setSelectedPeg(null);
    setWon(false);
    setErrorMsg(null);
    setStarted(true);
  };

  const handleReset = () => {
    if (solveTimerRef.current) clearTimeout(solveTimerRef.current);
    setSolving(false);
    setStarted(false);
    setSelectedPeg(null);
    setWon(false);
    setErrorMsg(null);
  };

  const handlePegClick = (pegIndex: number) => {
    if (won || solving) return;

    if (selectedPeg === null) {
      if (pegs[pegIndex].length === 0) {
        showError('Ese peg está vacío');
        return;
      }
      setSelectedPeg(pegIndex);
    } else {
      if (pegIndex === selectedPeg) {
        setSelectedPeg(null);
        return;
      }
      if (!validateMove(pegs, selectedPeg, pegIndex)) {
        showError('Movimiento ilegal: no puedes colocar un disco mayor sobre uno menor');
        setSelectedPeg(null);
        return;
      }
      const newPegs = applyMove(pegs, selectedPeg, pegIndex);
      const newMoves = moves + 1;
      setPegs(newPegs);
      setMoves(newMoves);
      setSelectedPeg(null);
      if (checkWin(newPegs)) setWon(true);
    }
  };

  const handleAutoSolve = useCallback(() => {
    if (solving || won) return;
    setSolving(true);
    setSelectedPeg(null);

    const solution = solveHanoi(discCount);
    let currentPegs = initialPegs(discCount);
    setPegs(currentPegs);
    setMoves(0);
    setWon(false);

    let i = 0;
    const step = () => {
      if (i >= solution.length) {
        setSolving(false);
        setWon(true);
        setMoves(solution.length);
        return;
      }
      const move = solution[i];
      currentPegs = applyMove(currentPegs, move.from, move.to);
      setPegs([...currentPegs]);
      setMoves(i + 1);
      i++;
      solveTimerRef.current = setTimeout(step, AUTO_SOLVE_INTERVAL);
    };

    solveTimerRef.current = setTimeout(step, AUTO_SOLVE_INTERVAL);
  }, [discCount, solving, won]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (solveTimerRef.current) clearTimeout(solveTimerRef.current);
    };
  }, []);

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <label className="text-gray-300 text-sm font-medium">
            Número de discos: <span className="text-white font-bold">{discCount}</span>
          </label>
          <input
            type="range"
            min={MIN_DISCS}
            max={MAX_DISCS}
            value={discCount}
            onChange={e => setDiscCount(Number(e.target.value))}
            className="w-48 accent-indigo-500"
          />
          <div className="flex gap-4 text-xs text-gray-400">
            <span>{MIN_DISCS}</span>
            <span className="flex-1 text-center">Movimientos óptimos: {optimalMoves}</span>
            <span>{MAX_DISCS}</span>
          </div>
        </div>
        <button
          onClick={handleStart}
          className="rounded-lg bg-indigo-700 hover:bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors"
        >
          Iniciar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Counter */}
      <div className="text-gray-300 text-sm">
        Movimientos: <span className="text-white font-bold">{moves}</span>
        {' / '}
        Óptimo: <span className="text-indigo-400 font-bold">{optimalMoves}</span>
      </div>

      {/* Win message */}
      {won && (
        <div className="rounded-lg bg-green-900/40 border border-green-500 px-4 py-3 text-green-300 text-center font-semibold">
          🎉 ¡Ganaste! Completado en {moves} movimientos
          {moves === optimalMoves && ' (¡solución óptima!)'}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="rounded-lg bg-red-900/40 border border-red-500 px-4 py-3 text-red-300 text-center text-sm">
          {errorMsg}
        </div>
      )}

      {/* Pegs */}
      <div className="flex gap-8 items-end justify-center w-full">
        {pegs.map((peg, pegIdx) => (
          <PegColumn
            key={pegIdx}
            pegIndex={pegIdx}
            discs={peg}
            discCount={discCount}
            isSelected={selectedPeg === pegIdx}
            onClick={() => handlePegClick(pegIdx)}
            disabled={won || solving}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!won && !solving && (
          <button
            onClick={handleAutoSolve}
            className="rounded-lg bg-amber-700 hover:bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            ✨ Resolver automáticamente
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

// --- PegColumn sub-component ---

const PEG_LABEL = ['Izquierdo', 'Centro', 'Derecho'];
const DISC_MIN_WIDTH = 24;
const DISC_MAX_WIDTH = 120;
const DISC_HEIGHT = 20;
const PEG_HEIGHT = 200;

interface PegColumnProps {
  pegIndex: number;
  discs: number[];
  discCount: number;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

function PegColumn({ pegIndex, discs, discCount, isSelected, onClick, disabled }: PegColumnProps) {
  const discWidth = (discId: number) => {
    const ratio = discId / discCount;
    return DISC_MIN_WIDTH + ratio * (DISC_MAX_WIDTH - DISC_MIN_WIDTH);
  };

  const discColor = (discId: number) => {
    const hue = Math.round((discId / discCount) * 270);
    return `hsl(${hue}, 70%, 55%)`;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative flex flex-col-reverse items-center justify-start cursor-pointer rounded-lg p-2 transition-all
          ${isSelected ? 'ring-2 ring-indigo-400 bg-indigo-900/30' : 'hover:bg-gray-800/40'}
          ${disabled ? 'cursor-default' : ''}`}
        style={{ width: DISC_MAX_WIDTH + 24, height: PEG_HEIGHT + 32 }}
        aria-label={`Peg ${PEG_LABEL[pegIndex]}`}
      >
        {/* Pole */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-500 rounded-full"
          style={{ width: 6, height: PEG_HEIGHT }}
        />
        {/* Base */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-500 rounded"
          style={{ width: DISC_MAX_WIDTH + 16, height: 8 }}
        />
        {/* Discs */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-0.5">
          {discs.map((discId, i) => (
            <div
              key={`${pegIndex}-${discId}-${i}`}
              className="rounded"
              style={{
                width: discWidth(discId),
                height: DISC_HEIGHT,
                backgroundColor: discColor(discId),
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            />
          ))}
        </div>
      </button>
      <span className="text-xs text-gray-400">{PEG_LABEL[pegIndex]}</span>
    </div>
  );
}
