import { useState } from 'react';
import { Copy, Check, Download, Trophy } from 'lucide-react';
import { Team } from '../types';
import { getTeamColor, getTeamEmoji } from '../utils/shuffle';

interface TeamResultsProps {
  teams: Team[];
}

export default function TeamResults({ teams }: TeamResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyTeam = async (team: Team, index: number) => {
    const text = `${team.name}:\n${team.members.map((m) => `  - ${m.name}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
    }
  };

  const copyAll = async () => {
    const text = teams
      .map(
        (team) =>
          `${team.name}:\n${team.members.map((m) => `  - ${m.name}`).join('\n')}`
      )
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // fallback
    }
  };

  const downloadAsText = () => {
    const text = teams
      .map(
        (team) =>
          `${team.name}:\n${team.members.map((m) => `  - ${m.name}`).join('\n')}`
      )
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipos.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (teams.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-1.5 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Resultados</h2>
          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {teams.length} equipos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-blue-50 flex items-center gap-1"
          >
            {copiedAll ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-green-500">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copiar todo
              </>
            )}
          </button>
          <button
            onClick={downloadAsText}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-blue-50 flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Descargar
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teams.map((team, index) => {
          const color = getTeamColor(index);
          const emoji = getTeamEmoji(index);
          return (
            <div
              key={team.id}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md animate-bounce-in"
              style={{
                borderColor: color.border,
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              {/* Team Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: color.light }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: color.text }}
                  >
                    {team.name}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${color.bg}20`,
                      color: color.text,
                    }}
                  >
                    {team.members.length}
                  </span>
                </div>
                <button
                  onClick={() => copyTeam(team, index)}
                  className="p-1.5 rounded-lg transition-all hover:bg-white/60"
                  style={{ color: color.text }}
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              
              {/* Team Members */}
              <div className="p-3 space-y-1">
                {team.members.map((member, mIndex) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors animate-slide-in"
                    style={{ animationDelay: `${(index * 100) + (mIndex * 50)}ms`, animationFillMode: 'both' }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color.bg }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 truncate">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
