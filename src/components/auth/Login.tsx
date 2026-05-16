import { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { User } from '../../types/fortnite';
import { db } from '../../utils/db';

interface Props {
  onLoginSuccess: (user: User) => void;
  onToggleAuth: () => void;
}

export default function Login({ onLoginSuccess, onToggleAuth }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = db.users.login(email, password);

    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" style={{ backgroundImage: "url('https://preview.redd.it/blue-fortnite-background-free-for-anyone-to-use-v0-ab94i3q4agk21.jpg?width=640&crop=smart&auto=webp&s=d8b93d0ae84d38125023460c9b39b9dc43774c22')" }}>
      <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]" />
      <div className="w-full max-w-sm bg-[#0f0f0f]/95 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl overflow-y-auto max-h-screen scrollbar-none relative z-10">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Fortnite_F_lettermark_logo.png/250px-Fortnite_F_lettermark_logo.png" 
            className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-xl" 
            alt="Fortnite Logo" 
          />
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">FortniteScore</h1>
          <p className="text-gray-400 mt-1 text-xs font-bold uppercase tracking-widest">Inicia sesión</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00df82] text-black font-black py-3.5 rounded-xl hover:bg-[#00c874] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-green-500/20 text-sm mt-2"
          >
            ENTRAR
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggleAuth}
            className="text-gray-500 hover:text-white transition-colors text-xs font-medium"
          >
            ¿No tienes cuenta? <span className="text-blue-500 font-bold">Regístrate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
