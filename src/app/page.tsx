import PuzzleCard from '@/components/PuzzleCard';

const puzzles = [
  {
    title: 'Búsqueda Binaria',
    description:
      'Explora la búsqueda binaria de forma interactiva y compite en modo vs IA para ver cómo el modelo razona paso a paso.',
    href: '/puzzles/binary-search',
    hasAIMode: true,
    icon: '🔍',
  },
  {
    title: 'Sorting Visual',
    description:
      'Observa el algoritmo bubble sort animado en tiempo real y comprende cómo se ordenan los elementos.',
    href: '/puzzles/sorting',
    hasAIMode: false,
    icon: '📊',
  },
  {
    title: 'Torre de Hanoi',
    description:
      'Resuelve el clásico puzzle de la Torre de Hanoi con N discos y descubre el número óptimo de movimientos.',
    href: '/puzzles/hanoi',
    hasAIMode: false,
    icon: '🗼',
  },
  {
    title: 'River Crossing',
    description:
      'Lleva al lobo, la oveja y el repollo al otro lado del río sin que ninguno se coma al otro.',
    href: '/puzzles/river-crossing',
    hasAIMode: false,
    icon: '🚣',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            AI Reasoning Playground
          </h1>
          <p className="mx-auto max-w-xl text-base text-gray-400 leading-relaxed">
            Inspirado en{' '}
            <span className="text-indigo-400 font-medium">
              &ldquo;The Illusion of Thinking&rdquo;
            </span>{' '}
            (Apple, 2025) — explora empíricamente los límites de los Large Reasoning Models.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {puzzles.map((puzzle) => (
            <PuzzleCard
              key={puzzle.href}
              title={puzzle.title}
              description={puzzle.description}
              href={puzzle.href}
              hasAIMode={puzzle.hasAIMode}
              icon={puzzle.icon}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
