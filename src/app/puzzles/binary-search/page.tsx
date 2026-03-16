'use client';

import Link from 'next/link';
import BinarySearchGame from '@/components/binary-search/BinarySearchGame';

export default function BinarySearchPage() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          ← Volver
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Búsqueda Binaria</h1>
          <p className="text-gray-400">
            Adivina el número oculto eligiendo mitades. ¿Puedes hacerlo en menos pasos que la IA?
          </p>
        </div>

        <div className="flex justify-center">
          <BinarySearchGame />
        </div>
      </div>
    </main>
  );
}
