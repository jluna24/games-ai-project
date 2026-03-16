'use client';

import Link from 'next/link';

interface PuzzleCardProps {
  title: string;
  description: string;
  href: string;
  hasAIMode?: boolean;
  icon: React.ReactNode;
}

export default function PuzzleCard({ title, description, href, hasAIMode, icon }: PuzzleCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-lg transition-all duration-200 hover:border-indigo-500 hover:shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-1">
        {hasAIMode && (
          <span className="absolute top-4 right-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white tracking-wide">
            vs IA
          </span>
        )}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 text-2xl">
          {icon}
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
          {title}
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
