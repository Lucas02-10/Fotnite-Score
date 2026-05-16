import { useState, useRef } from 'react';
import { Plus, X, UserPlus, Upload, Trash2, Users } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantInputProps {
  participants: Participant[];
  onAdd: (name: string) => void;
  onAddMultiple: (names: string[]) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function ParticipantInput({
  participants,
  onAdd,
  onAddMultiple,
  onRemove,
  onClearAll,
}: ParticipantInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddSingle = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSingle();
    }
  };

  const handleBulkAdd = () => {
    const names = bulkInput
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (names.length > 0) {
      onAddMultiple(names);
      setBulkInput('');
      setShowBulkInput(false);
    }
  };

  const sampleNames = [
    'Ana García', 'Carlos López', 'María Rodríguez', 'Juan Martínez',
    'Laura Hernández', 'Pedro Sánchez', 'Sofía Torres', 'Diego Ramírez',
    'Valentina Flores', 'Andrés Morales', 'Camila Jiménez', 'Luis Vargas',
  ];

  const handleLoadSample = () => {
    onAddMultiple(sampleNames);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-800">Participantes</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {participants.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="text-xs text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            >
              Cargar ejemplo
            </button>
            {participants.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Single Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un nombre..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-400"
          />
          <button
            onClick={handleAddSingle}
            disabled={!inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Añadir
          </button>
        </div>

        {/* Bulk Input Toggle */}
        <button
          onClick={() => setShowBulkInput(!showBulkInput)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          {showBulkInput ? 'Ocultar entrada masiva' : 'Agregar varios a la vez'}
        </button>

        {/* Bulk Input */}
        {showBulkInput && (
          <div className="animate-fade-in-up space-y-2">
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Ingresa un nombre por línea..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none placeholder:text-gray-400"
            />
            <button
              onClick={handleBulkAdd}
              disabled={!bulkInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 w-full justify-center"
            >
              <UserPlus className="w-4 h-4" />
              Agregar todos
            </button>
          </div>
        )}

        {/* Participants List */}
        {participants.length > 0 ? (
          <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
            {participants.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 hover:bg-blue-50/50 rounded-xl px-3 py-2 group transition-all animate-slide-in"
                style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{p.name}</span>
                </div>
                <button
                  onClick={() => onRemove(p.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">
              Aún no hay participantes. ¡Agrega algunos!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
