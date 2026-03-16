'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface BinarySearchBoardProps {
  array: number[];
  target: number;
  left: number;
  mid: number;
  right: number;
  aiPointers?: { left: number; mid: number; right: number } | null;
}

interface PointerLabel {
  label: string;
  color: string;
}

function getCellStyle(
  index: number,
  mid: number,
  aiPointers: BinarySearchBoardProps['aiPointers']
): string {
  const isUserMid = index === mid;
  const isAiMid = aiPointers != null && index === aiPointers.mid;

  if (isUserMid && isAiMid) {
    // Both coincide — split gradient border
    return 'bg-indigo-700 border-2 border-amber-400 text-white shadow-lg shadow-indigo-500/30';
  }
  if (isUserMid) {
    return 'bg-indigo-600 border-2 border-indigo-400 text-white shadow-lg shadow-indigo-500/30';
  }
  if (isAiMid) {
    return 'bg-amber-600 border-2 border-amber-400 text-white shadow-lg shadow-amber-500/30';
  }
  return 'bg-gray-800 border border-gray-600 text-gray-300';
}

export default function BinarySearchBoard({
  array,
  target,
  left,
  mid,
  right,
  aiPointers,
}: BinarySearchBoardProps) {
  // Build pointer labels per index
  const pointerMap: Record<number, PointerLabel[]> = {};

  const addPointer = (index: number, label: string, color: string) => {
    if (!pointerMap[index]) pointerMap[index] = [];
    pointerMap[index].push({ label, color });
  };

  addPointer(left, 'L', 'text-green-400');
  addPointer(mid, 'M', 'text-indigo-400');
  addPointer(right, 'R', 'text-red-400');

  if (aiPointers != null) {
    addPointer(aiPointers.mid, 'AI', 'text-amber-400');
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Target badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Buscando:</span>
        <span className="rounded-full bg-indigo-600/30 border border-indigo-500 px-3 py-0.5 text-sm font-semibold text-indigo-300">
          {target}
        </span>
      </div>

      {/* Array cells — horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {array.map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              {/* Cell */}
              <motion.div
                layout
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-mono font-semibold transition-colors duration-200 ${getCellStyle(index, mid, aiPointers)}`}
              >
                {value}
              </motion.div>

              {/* Index label */}
              <span className="text-[10px] text-gray-600">{index}</span>

              {/* Pointer labels */}
              <div className="flex flex-col items-center gap-0.5 min-h-[2.5rem]">
                <AnimatePresence>
                  {(pointerMap[index] ?? []).map(({ label, color }) => (
                    <motion.span
                      key={label}
                      layout
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`text-xs font-bold ${color}`}
                    >
                      {label}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
