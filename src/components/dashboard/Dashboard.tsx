import { useState } from 'react';
import { ArrowUpDown, LogOut, Plus, X, Image as ImageIcon, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { Competition, User } from '../../types/fortnite';
import CompetitionCard from './CompetitionCard';

interface Props {
  user: User;
  onLogout: () => void;
  onSelectCompetition: (comp: Competition) => void;
  competitions: Competition[];
  onAddCompetition: (comp: Competition) => void;
  onUpdateCompetitions: (comps: Competition[]) => void;
}

export default function Dashboard({ user, onLogout, onSelectCompetition, competitions, onAddCompetition, onUpdateCompetitions }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLogo, setNewLogo] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingComp) {
      const updated = competitions.map(c => c.id === editingComp.id ? { ...c, name: newName, description: newDesc, logoUrl: newLogo } : c);
      onUpdateCompetitions(updated);
      setEditingComp(null);
    } else {
      const newComp: Competition = {
        id: Math.random().toString(36).substr(2, 9),
        ownerEmail: user.email,
        name: newName,
        description: newDesc,
        logoUrl: newLogo,
      };
      onAddCompetition(newComp);
    }
    setShowModal(false);
    setNewName('');
    setNewDesc('');
    setNewLogo('');
  };

  const openEdit = (comp: Competition) => {
    setEditingComp(comp);
    setNewName(comp.name);
    setNewDesc(comp.description);
    setNewLogo(comp.logoUrl);
    setShowModal(true);
  };

  const moveComp = (index: number, direction: 'up' | 'down') => {
    const newComps = [...competitions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newComps.length) return;
    [newComps[index], newComps[targetIndex]] = [newComps[targetIndex], newComps[index]];
    onUpdateCompetitions(newComps);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-900 bg-[#0f0f0f] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Fortnite_F_lettermark_logo.png/250px-Fortnite_F_lettermark_logo.png" 
            className="w-10 h-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] rounded-lg" 
            alt="Fortnite Logo" 
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">FortniteScore</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Bienvenido, {user.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 transition-colors text-sm font-medium ${isEditMode ? 'text-[#3b82f6]' : 'text-gray-400 hover:text-white'}`}
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
          <button 
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowUpDown className="w-4 h-4" />
            Ordenar Competiciones
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        {isEditMode && (
          <div className="mb-6 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl p-4 text-center">
            <p className="text-[#3b82f6] text-sm font-bold">MODO EDICIÓN ACTIVO: Selecciona una competición para modificarla</p>
          </div>
        )}
        
        <div className="mb-8 flex justify-between items-center">
          <button 
            onClick={() => { setEditingComp(null); setNewLogo(''); setNewName(''); setNewDesc(''); setShowModal(true); }}
            className="bg-[#00df82] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00c874] transition-all"
          >
            <Plus className="w-5 h-5" />
            Nueva Competición
          </button>
        </div>

        {competitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((comp) => (
              <div 
                key={comp.id} 
                className={`relative transition-all ${isEditMode ? 'scale-[1.02] ring-2 ring-[#3b82f6]/40 rounded-xl' : ''}`} 
                onClick={() => isEditMode ? openEdit(comp) : onSelectCompetition(comp)}
              >
                <CompetitionCard competition={comp} />
                {isEditMode && (
                  <div className="absolute inset-0 bg-[#3b82f6]/5 rounded-xl pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-gray-900 rounded-3xl">
            <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-inner">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Fortnite_F_lettermark_logo.png/250px-Fortnite_F_lettermark_logo.png" 
                className="w-10 h-10 grayscale opacity-20" 
                alt="Fortnite Logo" 
              />
            </div>
            <h3 className="text-gray-500 font-bold text-lg uppercase tracking-tight">No hay competiciones</h3>
            <p className="text-gray-600 max-w-xs mt-2 text-sm">Crea tu primera competición para empezar a organizar torneos de Fortnite.</p>
          </div>
        )}
      </main>

      {/* Edit / New Competition Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[95vh] scrollbar-none">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold uppercase tracking-tight">{editingComp ? 'Editar Competición' : 'Nueva Competición'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Escudo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    {newLogo ? (
                      <img src={newLogo} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-2xl font-black text-gray-700">{newName ? newName.charAt(0).toUpperCase() : '?'}</span>
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center h-16 bg-[#0f0f0f] border border-dashed border-gray-800 rounded-xl cursor-pointer hover:border-[#3b82f6] transition-colors group">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-500 group-hover:text-[#3b82f6]" />
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Subir Imagen</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#3b82f6] transition-colors"
                  placeholder="Ej: Copa de Verano 2026"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descripción</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#3b82f6] transition-colors min-h-[80px] resize-none"
                  placeholder="Ej: Torneo oficial de la comunidad..."
                />
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-[#00df82] text-black font-black py-3.5 rounded-xl hover:bg-[#00c874] transition-all uppercase text-sm"
                >
                  {editingComp ? 'Guardar Cambios' : 'Crear Competición'}
                </button>
                
                {editingComp && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres eliminar esta competición?')) {
                        onUpdateCompetitions(competitions.filter(c => c.id !== editingComp.id));
                        setShowModal(false);
                      }
                    }}
                    className="w-full bg-red-500/5 text-red-500/60 hover:text-red-500 border border-red-500/10 hover:bg-red-500/10 font-bold py-2.5 rounded-xl transition-all text-xs uppercase"
                  >
                    Eliminar Competición
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl w-full max-w-2xl p-8 relative z-10 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Ordenar Competiciones</h2>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              {competitions.map((comp, idx) => (
                <div key={comp.id} className="flex items-center justify-between bg-[#0f0f0f] border border-gray-800 p-4 rounded-2xl group hover:border-[#3b82f6] transition-all">
                  <div className="flex items-center gap-4">
                    <img src={comp.logoUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <span className="font-bold text-sm">{comp.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => moveComp(idx, 'up')} 
                      disabled={idx === 0}
                      className="p-2 bg-gray-900 rounded-lg text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveComp(idx, 'down')} 
                      disabled={idx === competitions.length - 1}
                      className="p-2 bg-gray-900 rounded-lg text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowOrderModal(false)}
              className="w-full bg-[#00df82] text-black font-black py-4 rounded-xl hover:bg-[#00c874] transition-all mt-8 uppercase"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Floating Badge */}
      <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md border border-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-gray-300">
        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-white">
             <path d="M15.5702 8.13142C15.7729 8.0412 16.0007 8.18878 15.9892 8.4103C15.8374 11.3192 14.0965 14.0405 11.2531 15.3065C8.40964 16.5725 5.2224 16.0453 2.95912 14.2117C2.78676 14.072 2.82955 13.804 3.03219 13.7137L4.95677 12.8568C5.04866 12.8159 5.15446 12.823 5.24204 12.8725C6.73377 13.7153 8.59176 13.8649 10.2772 13.1145C11.9626 12.3641 13.0947 10.8833 13.4665 9.21075C13.4883 9.11256 13.5539 9.02918 13.6457 8.98827L15.5702 8.13142Z" />
          </svg>
        </div>
        Made with Emergent
      </div>
    </div>
  );
}
