import { Users, Shuffle } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <Shuffle className="w-5 h-5 opacity-60" />
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1" width="9" height="9" rx="2" />
              <rect x="14" y="1" width="9" height="9" rx="2" />
              <rect x="1" y="14" width="9" height="9" rx="2" />
              <rect x="14" y="14" width="9" height="9" rx="2" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Clasificador de Equipos
        </h1>
        <p className="text-blue-100 text-sm sm:text-base max-w-md mx-auto">
          Divide a tus participantes en equipos de forma aleatoria y equitativa
        </p>
      </div>
    </header>
  );
}
