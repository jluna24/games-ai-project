'use client';

import { useRouter } from 'next/navigation';
import HanoiSimulator from '@/components/hanoi/HanoiSimulator';

export default function HanoiPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10 gap-8">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <button
          onClick={() => router.push('/')}
          className="self-start text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold">Torre de Hanoi</h1>
        <p className="text-gray-400 text-sm max-w-xl">
          Mueve todos los discos del peg izquierdo al derecho. Solo puedes mover un disco a la vez
          y nunca colocar un disco mayor sobre uno menor. Intenta hacerlo en el mínimo de movimientos posible.
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <HanoiSimulator />
      </div>
    </main>
  );
}
