
import { Settings, Hash, Users, Shuffle, RotateCcw } from 'lucide-react';
import { ClassificationMode } from '../types';

interface TeamSettingsProps {
  mode: ClassificationMode;
  numberOfTeams: number;
  membersPerTeam: number;
  participantCount: number;
  onModeChange: (mode: ClassificationMode) => void;
  onNumberOfTeamsChange: (n: number) => void;
  onMembersPerTeamChange: (n: number) => void;
  onGenerate: () => void;
  onReset: () => void;
  hasTeams: boolean;
}

export default function TeamSettings({
  mode,
  numberOfTeams,
  membersPerTeam,
  participantCount,
  onModeChange,
  onNumberOfTeamsChange,
  onMembersPerTeamChange,
  onGenerate,
  onReset,
  hasTeams,
}: TeamSettingsProps) {
  const maxTeams = Math.max(2, participantCount);
  const maxMembers = Math.max(1, participantCount);

  const resultingTeams =
    mode === 'by-teams'
      ? numberOfTeams
      : Math.ceil(participantCount / membersPerTeam);
  
  const membersDistribution =
    mode === 'by-teams'
      ? `~${Math.ceil(participantCount / numberOfTeams)} por equipo`
      : `${membersPerTeam} por equipo`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-lg">
            <Settings className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Configuración</h2>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Modo de clasificación</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onModeChange('by-teams')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                mode === 'by-teams'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Hash className="w-4 h-4" />
              Por equipos
            </button>
            <button
              onClick={() => onModeChange('by-members')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                mode === 'by-members'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Por miembros
            </button>
          </div>
        </div>

        {/* Number Input */}
        {mode === 'by-teams' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Número de equipos
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNumberOfTeamsChange(Math.max(2, numberOfTeams - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={numberOfTeams}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 2;
                  onNumberOfTeamsChange(Math.max(2, Math.min(maxTeams, val)));
                }}
                min={2}
                max={maxTeams}
                className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              <button
                onClick={() => onNumberOfTeamsChange(Math.min(maxTeams, numberOfTeams + 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Miembros por equipo
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onMembersPerTeamChange(Math.max(1, membersPerTeam - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={membersPerTeam}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  onMembersPerTeamChange(Math.max(1, Math.min(maxMembers, val)));
                }}
                min={1}
                max={maxMembers}
                className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              <button
                onClick={() => onMembersPerTeamChange(Math.min(maxMembers, membersPerTeam + 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Preview Info */}
        {participantCount >= 2 && (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-600/80">
                {participantCount} participantes → {resultingTeams} equipos ({membersDistribution})
              </span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex gap-2">
          <button
            onClick={onGenerate}
            disabled={participantCount < 2}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            <Shuffle className="w-4 h-4" />
            {hasTeams ? 'Reclasificar' : 'Clasificar Equipos'}
          </button>
          {hasTeams && (
            <button
              onClick={onReset}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {participantCount < 2 && (
          <p className="text-xs text-gray-400 text-center">
            Necesitas al menos 2 participantes para clasificar equipos
          </p>
        )}
      </div>
    </div>
  );
}
