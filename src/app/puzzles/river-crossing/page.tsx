'use client';

import Link from 'next/link';
import RiverCrossingSimulator from '@/components/river-crossing/RiverCrossingSimulator';

export default function RiverCrossingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10 gap-8">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <Link
          href="/"
          className="self-start text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold">River Crossing</h1>
        <p className="text-gray-400 text-sm max-w-xl">
          Lleva al lobo, la oveja y el repollo al otro lado del río. El bote solo cabe el barquero
          y un pasajero. Si dejas al lobo solo con la oveja, o a la oveja sola con el repollo,
          habrá problemas.
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <RiverCrossingSimulator />
      </div>
    </main>
  );
}
