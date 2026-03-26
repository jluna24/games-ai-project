'use client';

import Link from 'next/link';
import SortingVisualizer from '@/components/sorting/SortingVisualizer';

export default function SortingPage() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Sorting Visual</h1>
          <p className="text-gray-400">
            Visualización animada del algoritmo bubble sort paso a paso.
          </p>
        </div>

        <SortingVisualizer />

        {/* Explicación del algoritmo */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 flex flex-col gap-4 text-sm text-gray-300">
          <h2 className="text-base font-semibold text-white">¿Cómo funciona Bubble Sort?</h2>

          <p>
            Bubble sort recorre el array comparando pares de elementos adyacentes. Si el elemento
            de la izquierda es mayor que el de la derecha, los intercambia. Repite este proceso
            hasta que no haya más swaps necesarios.
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-gray-400 font-medium">Paso a paso:</p>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-gray-300">
              <li>Compara el elemento en la posición <code className="text-indigo-400">i</code> con el de la posición <code className="text-indigo-400">i+1</code>.</li>
              <li>Si <code className="text-rose-400">arr[i] &gt; arr[i+1]</code>, intercámbialos.</li>
              <li>Avanza al siguiente par y repite hasta el final del array.</li>
              <li>Después de cada pasada completa, el elemento más grande "burbujea" hasta su posición final.</li>
              <li>Repite desde el inicio, ignorando los elementos ya ordenados al final.</li>
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg bg-gray-800 px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Complejidad temporal</p>
              <p className="font-mono text-white">O(n²)</p>
              <p className="text-xs text-gray-500 mt-1">peor y caso promedio</p>
            </div>
            <div className="rounded-lg bg-gray-800 px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Complejidad espacial</p>
              <p className="font-mono text-white">O(1)</p>
              <p className="text-xs text-gray-500 mt-1">in-place, sin memoria extra</p>
            </div>
          </div>

          <p className="text-gray-500 text-xs border-t border-gray-700 pt-3">
            Bubble sort es uno de los algoritmos más simples de entender, pero también uno de los
            menos eficientes para arrays grandes. En la práctica se prefieren algoritmos como
            Merge Sort o Quick Sort que tienen complejidad O(n log n).
          </p>
        </div>
      </div>
    </main>
  );
}
