'use client';

import Link from 'next/link';
import SortingVisualizer from '@/components/sorting/SortingVisualizer';

export default function SortingPage() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          ← Volver
        </Link>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Sorting Visual</h1>
          <p className="text-gray-400">
            Visualización animada del algoritmo bubble sort paso a paso.
          </p>
        </div>
        <SortingVisualizer />
      </div>
    </main>
  );
}
