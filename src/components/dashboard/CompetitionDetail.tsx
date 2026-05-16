import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, RotateCcw, X, Image as ImageIcon, Pencil, Palette, Plus, ChevronDown, Trash2, History, CheckCircle2 } from 'lucide-react';
import { Competition, BracketParticipant, MatchData, CompetitionBracket, Team, PositionIndicator, CompetitionSection, SectionType, Season } from '../../types/fortnite';
import { db } from '../../utils/db';

interface Props {
  competition: Competition;
  onBack: () => void;
}

export default function CompetitionDetail({ competition, onBack }: Props) {
  // Seasons State
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string>('');
  
  // Sections State
  const [sections, setSections] = useState<CompetitionSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  
  // Active Data State
  const [bracketData, setBracketData] = useState<CompetitionBracket>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [indicators, setIndicators] = useState<PositionIndicator[]>([]);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showFinishSeason, setShowFinishSeason] = useState(false);
  const [editingMatch, setEditingMatch] = useState<{ key: string; slots: number } | null>(null);
  const [showAddTeams, setShowAddTeams] = useState(false);
  const [showAddIndicator, setShowAddIndicator] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const currentSeason = seasons.find(s => s.id === activeSeasonId) || seasons[seasons.length - 1];
  const isReadOnly = currentSeason?.isFinished;
  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

  // Initialize Seasons
  useEffect(() => {
    const savedSeasons = db.seasons.getForCompetition(competition.id);
    if (savedSeasons.length > 0) {
      setSeasons(savedSeasons);
      setActiveSeasonId(savedSeasons[savedSeasons.length - 1].id);
    } else {
      const initialSeason: Season = {
        id: `${competition.id}_s1`,
        year: new Date().getFullYear().toString(),
        name: 'Temporada 1',
        isFinished: false,
        sections: [
          { id: 'l1', type: 'leaderboard', name: 'Tabla de Clasificación' },
          { id: 'p1', type: 'playoffs', name: 'Playoffs' },
          { id: 'e1', type: 'eliminatorias', name: 'Eliminatorias' }
        ]
      };
      setSeasons([initialSeason]);
      setActiveSeasonId(initialSeason.id);
      db.seasons.saveAll(competition.id, [initialSeason]);
    }
  }, [competition.id]);

  // Load Sections when Season changes
  useEffect(() => {
    if (!currentSeason) return;
    setSections(currentSeason.sections);
    setActiveSectionId(currentSeason.sections[0]?.id || '');
  }, [currentSeason?.id]);

  // Load Data when Section changes
  useEffect(() => {
    if (!activeSectionId || !activeSeasonId) return;
    const { teams: t, indicators: i, bracket: b } = db.data.get(activeSeasonId, activeSectionId);
    setTeams(t);
    setIndicators(i);
    setBracketData(b);
  }, [activeSectionId, activeSeasonId]);

  const saveTeams = (newTeams: Team[]) => {
    if (isReadOnly) return;
    setTeams(newTeams);
    db.data.saveTeams(activeSeasonId, activeSectionId, newTeams);
  };

  const saveIndicators = (newIndicators: PositionIndicator[]) => {
    if (isReadOnly) return;
    setIndicators(newIndicators);
    db.data.saveIndicators(activeSeasonId, activeSectionId, newIndicators);
  };

  const saveBracket = (newData: CompetitionBracket) => {
    if (isReadOnly) return;
    setBracketData(newData);
    db.data.saveBracket(activeSeasonId, activeSectionId, newData);
  };

  const handleFinishSeason = (year: string, name: string, champName: string, champLogo: string, nextYear: string, nextName: string) => {
    const updatedSeasons = seasons.map(s => {
      if (s.id === currentSeason.id) {
        return { ...s, year, name, championName: champName, championLogo: champLogo, isFinished: true };
      }
      return s;
    });

    const newSeason: Season = {
      id: `${competition.id}_${Math.random().toString(36).substr(2, 5)}`,
      year: nextYear,
      name: nextName,
      isFinished: false,
      sections: [
        { id: Math.random().toString(36).substr(2, 9), type: 'leaderboard', name: 'Tabla de Clasificación' },
        { id: Math.random().toString(36).substr(2, 9), type: 'playoffs', name: 'Playoffs' },
        { id: Math.random().toString(36).substr(2, 9), type: 'eliminatorias', name: 'Eliminatorias' }
      ]
    };

    const finalSeasons = [...updatedSeasons, newSeason];
    setSeasons(finalSeasons);
    setActiveSeasonId(newSeason.id);
    db.seasons.saveAll(competition.id, finalSeasons);
    setShowFinishSeason(false);
  };

  const updateSections = (newSections: CompetitionSection[]) => {
    if (isReadOnly) return;
    const updatedSeasons = seasons.map(s => s.id === currentSeason.id ? { ...s, sections: newSections } : s);
    setSeasons(updatedSeasons);
    setSections(newSections);
    db.seasons.saveAll(competition.id, updatedSeasons);
  };

  const handleMatchClick = (key: string, slots: number) => {
    if (isReadOnly) return;
    setEditingMatch({ key, slots });
  };

  const handleSaveMatch = (data: MatchData) => {
    if (editingMatch && !isReadOnly) {
      const newData = { ...bracketData, [editingMatch.key]: data };
      saveBracket(newData);
      setEditingMatch(null);
    }
  };

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.eliminations !== a.eliminations) return b.eliminations - a.eliminations;
    return b.victories - a.victories;
  });

  const getIndicatorColor = (pos: number) => {
    for (const ind of indicators) {
      const parts = ind.positions.split(',').map(p => p.trim());
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (pos >= start && pos <= end) return ind.color;
        } else if (Number(part) === pos) return ind.color;
      }
    }
    return null;
  };

  const handleBulkAdd = (names: string) => {
    if (isReadOnly) return;
    const lines = names.split('\n').map(n => n.trim()).filter(n => n !== '');
    const newTeams: Team[] = lines.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      logoUrl: '',
      eliminations: 0,
      victories: 0,
      rounds: 0
    }));
    saveTeams([...teams, ...newTeams]);
    setShowAddTeams(false);
  };

  const MatchBox = ({ matchKey, slots, round = 1 }: { matchKey: string; slots: number; round?: number }) => {
    const data = bracketData[matchKey] || { participants: [] };
    const isSmall = slots === 1;
    return (
      <div 
        onClick={() => handleMatchClick(matchKey, slots)}
        className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-44 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors group ${isSmall ? 'h-10' : 'h-[72px]'}`}
      >
        {isSmall ? (
          <div className="h-10 px-3 flex items-center gap-2">
            {data.participants[0] ? (
              <>
                <img src={data.participants[0].logoUrl} className="w-5 h-5 rounded-lg object-cover" alt="" />
                <span className={`text-[11px] font-bold truncate ${data.participants[0].isGolden && round === 1 ? 'text-golden-yellow' : 'text-gray-200'}`}>{data.participants[0].name}</span>
              </>
            ) : <span className="text-[11px] text-[#666] font-medium">TBD</span>}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {[0, 1].map((idx) => (
              <div key={idx} className={`h-9 px-3 flex items-center gap-2 ${idx === 0 ? 'border-b border-[#222]' : ''} ${round === 1 ? 'justify-between' : ''}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  {data.participants[idx] ? (
                    <>
                      <img src={data.participants[idx].logoUrl} className="w-5 h-5 rounded-md object-cover flex-shrink-0" alt="" />
                      <span className={`text-[11px] truncate ${data.participants[idx].isGolden && round === 1 ? 'text-golden-yellow' : 'text-gray-200 font-bold'}`}>
                        {data.participants[idx].name}
                      </span>
                    </>
                  ) : <span className="text-[11px] text-[#666] font-medium">TBD</span>}
                </div>
                {data.participants[idx] && round === 1 && (
                  <span className="text-[9px] text-[#444] font-bold whitespace-nowrap">
                    {data.participants[idx].eliminations}/{data.participants[idx].victories}/{data.participants[idx].rounds}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    if (!activeSection) return null;
    switch (activeSection.type) {
      case 'leaderboard':
        return (
          <div className="space-y-6 animate-fade-in-up">
            {!isReadOnly && (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAddTeams(true)} className="bg-[#00df82] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00c874] transition-all text-sm"><Plus className="w-4 h-4" /> Agregar Equipos</button>
                <button onClick={() => setShowAddIndicator(true)} className="bg-[#1a1a1a] border border-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#222] transition-all text-sm"><Palette className="w-4 h-4" /> Indicador de Posición</button>
              </div>
            )}
            <div className="bg-[#111] rounded-xl border border-gray-900 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-900 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 w-20">#</th><th className="px-6 py-4">EQUIPO</th><th className="px-2 py-4 w-20 text-center">ELIM.</th><th className="px-2 py-4 w-20 text-center">VICT.</th><th className="px-2 py-4 w-20 text-center">RONDA</th><th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.length > 0 ? sortedTeams.map((team, idx) => {
                    const posColor = getIndicatorColor(idx + 1);
                    return (
                      <tr key={team.id} className="border-b border-gray-900/50 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4"><div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: posColor || 'transparent', border: posColor ? 'none' : '1px solid #222' }}>{idx + 1}</div></td>
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gray-800 overflow-hidden border border-white/5">{team.logoUrl && <img src={team.logoUrl} className="w-full h-full object-cover" alt="" />}</div><span className="font-bold text-sm">{team.name}</span></div></td>
                        <td className="px-2 py-4 text-center font-bold text-gray-400">{team.eliminations}</td>
                        <td className="px-2 py-4 text-center font-bold text-gray-400">{team.victories}</td>
                        <td className="px-2 py-4 text-center font-bold text-gray-400">{team.rounds}</td>
                        <td className="px-6 py-4">
                          {!isReadOnly && <button onClick={() => setEditingTeam(team)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/5 rounded-lg transition-all"><Pencil className="w-4 h-4 text-gray-500" /></button>}
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan={6} className="py-20 text-center text-gray-600 font-medium">No hay equipos</td></tr>}
                </tbody>
              </table>
            </div>
            {indicators.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-900">
                {indicators.map(ind => (
                  <div key={ind.id} className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-gray-800">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ind.color }} />
                    <span className="text-xs font-bold text-gray-400">{ind.name}</span>
                    {!isReadOnly && <button onClick={() => saveIndicators(indicators.filter(i => i.id !== ind.id))} className="ml-1 text-gray-600 hover:text-red-500"><X className="w-3 h-3" /></button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'playoffs':
        return (
          <div className="space-y-6 animate-fade-in-up">
            {!isReadOnly && (
              <div className="flex justify-end">
                <button onClick={() => saveBracket({})} className="flex items-center gap-2 text-red-500/80 hover:text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/5 hover:bg-red-500/10"><RotateCcw className="w-3.5 h-3.5" /> Vaciar</button>
              </div>
            )}
            <div className="flex gap-24 py-4 overflow-x-auto scrollbar-thin">
              {[1, 2].map((group) => (
                <div key={group} className="flex flex-col min-w-max">
                  <h4 className="text-[11px] font-bold text-[#444] uppercase tracking-widest ml-1 mb-10">PLAYOFFS</h4>
                  <div className="flex flex-col gap-12">
                    {[1, 2, 3, 4].map((pairIndex) => (
                      <div key={pairIndex} className="flex items-start h-[160px]">
                        <div className="flex flex-col gap-12">
                          <MatchBox matchKey={`g${group}-p${pairIndex}-r1-m1`} slots={1} />
                          <MatchBox matchKey={`g${group}-p${pairIndex}-r1-m2`} slots={2} />
                        </div>
                        <div className="w-12 h-full"><svg width="48" height="160" viewBox="0 0 48 160" fill="none" shapeRendering="crispEdges"><path d="M0 20H24V124H0M24 72H48" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="square" /></svg></div>
                        <div className="pt-[36px]"><MatchBox matchKey={`g${group}-p${pairIndex}-r2-m1`} slots={2} round={2} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'eliminatorias':
        return (
          <div className="space-y-6 animate-fade-in-up">
            {!isReadOnly && (
              <div className="flex justify-end">
                <button onClick={() => saveBracket({})} className="flex items-center gap-2 text-red-500/80 hover:text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/5 hover:bg-red-500/10"><RotateCcw className="w-3.5 h-3.5" /> Vaciar</button>
              </div>
            )}
            <div className="py-8 overflow-x-auto scrollbar-thin">
              <div className="relative min-w-[1250px]" style={{ height: '980px' }}>
                <h4 className="absolute left-0 top-0 w-44 text-[11px] font-bold text-[#444] uppercase tracking-widest text-center">OCTAVOS</h4>
                <h4 className="absolute left-[308px] top-0 w-44 text-[11px] font-bold text-[#444] uppercase tracking-widest text-center">CUARTOS</h4>
                <h4 className="absolute left-[616px] top-0 w-44 text-[11px] font-bold text-[#444] uppercase tracking-widest text-center">SEMIFINAL</h4>
                <h4 className="absolute left-[924px] top-0 w-44 text-[11px] font-bold text-[#444] uppercase tracking-widest text-center">FINAL</h4>
                <div className="absolute left-0 top-20 flex flex-col gap-8">{[1,2,3,4,5,6,7,8].map(i => <MatchBox key={i} matchKey={`elim-oct-m${i}`} slots={2} />)}</div>
                <div className="absolute left-[176px] top-[116px] w-[132px]">{[0,1,2,3].map(i => <svg key={i} width="132" height="104" viewBox="0 0 132 104" fill="none" className="absolute" style={{ top: `${i * 208}px` }} shapeRendering="crispEdges"><path d="M0 0H66V104H0M66 52H132" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="square" /></svg>)}</div>
                <div className="absolute left-[308px] top-0">{[132, 340, 548, 756].map((top, i) => <div key={i} className="absolute w-44" style={{ top: `${top}px` }}><MatchBox matchKey={`elim-cua-m${i+1}`} slots={2} round={2} /></div>)}</div>
                <div className="absolute left-[484px] top-[168px] w-[132px]">{[0,1].map(i => <svg key={i} width="132" height="208" viewBox="0 0 132 208" fill="none" className="absolute" style={{ top: `${i * 416}px` }} shapeRendering="crispEdges"><path d="M0 0H66V208H0M66 104H132" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="square" /></svg>)}</div>
                <div className="absolute left-[616px] top-0">{[236, 652].map((top, i) => <div key={i} className="absolute w-44" style={{ top: `${top}px` }}><MatchBox matchKey={`elim-sem-m${i+1}`} slots={2} round={2} /></div>)}</div>
                <div className="absolute left-[792px] top-[272px] w-[132px]"><svg width="132" height="416" viewBox="0 0 132 416" fill="none" shapeRendering="crispEdges"><path d="M0 0H66V416H0M66 208H132" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="square" /></svg></div>
                <div className="absolute left-[924px] top-[444px] w-44"><MatchBox matchKey={`elim-fin-m1`} slots={2} round={2} /></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="border-b border-gray-900 bg-[#0f0f0f] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-gray-400" /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {competition.logoUrl ? (
                <img src={competition.logoUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-lg font-black text-gray-400 uppercase">{competition.name.charAt(0)}</span>
              )}
            </div>
            <h1 className="text-lg font-bold tracking-tight">{competition.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SeasonDropdown seasons={seasons} activeId={activeSeasonId} onSelect={setActiveSeasonId} />
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"><Settings className="w-4 h-4" /> Ajustes</button>
        </div>
      </nav>
      <div className="bg-[#0f0f0f] px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex gap-10">
          <TypeDropdown type="leaderboard" label="Tablas de Clasificación" sections={sections} activeId={activeSectionId} onSelect={setActiveSectionId} />
          <TypeDropdown type="playoffs" label="Playoffs" sections={sections} activeId={activeSectionId} onSelect={setActiveSectionId} />
          <TypeDropdown type="eliminatorias" label="Eliminatorias" sections={sections} activeId={activeSectionId} onSelect={setActiveSectionId} />
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-8">{renderTabContent()}</main>
      {editingMatch && !isReadOnly && <MatchEditModal slots={editingMatch.slots} initialData={bracketData[editingMatch.key]} onClose={() => setEditingMatch(null)} onSave={handleSaveMatch} />}
      {showAddTeams && !isReadOnly && <BulkAddTeamsModal onClose={() => setShowAddTeams(false)} onSave={handleBulkAdd} />}
      {showAddIndicator && !isReadOnly && <AddIndicatorModal onClose={() => setShowAddIndicator(false)} onSave={(ind) => { saveIndicators([...indicators, ind]); setShowAddIndicator(false); }} />}
      {editingTeam && !isReadOnly && <EditTeamModal team={editingTeam} onClose={() => setEditingTeam(null)} onSave={(updated) => { saveTeams(teams.map(t => t.id === updated.id ? updated : t)); setEditingTeam(null); }} onDelete={(id) => { saveTeams(teams.filter(t => t.id !== id)); setEditingTeam(null); }} />}
      {showSettings && (
        <SettingsModal 
          currentSeason={currentSeason}
          seasons={seasons}
          setSeasons={setSeasons}
          competitionId={competition.id}
          sections={sections} 
          onSave={updateSections} 
          onClose={() => setShowSettings(false)} 
          onFinishSeason={() => { setShowSettings(false); setShowFinishSeason(true); }} 
          isReadOnly={isReadOnly} 
        />
      )}
      {showFinishSeason && <FinishSeasonModal onSave={handleFinishSeason} onClose={() => setShowFinishSeason(false)} />}
      <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-md border border-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-gray-300">
        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center"><svg viewBox="0 0 16 16" className="w-3 h-3 fill-white"><path d="M15.5702 8.13142C15.7729 8.0412 16.0007 8.18878 15.9892 8.4103C15.8374 11.3192 14.0965 14.0405 11.2531 15.3065C8.40964 16.5725 5.2224 16.0453 2.95912 14.2117C2.78676 14.072 2.82955 13.804 3.03219 13.7137L4.95677 12.8568C5.04866 12.8159 5.15446 12.823 5.24204 12.8725C6.73377 13.7153 8.59176 13.8649 10.2772 13.1145C11.9626 12.3641 13.0947 10.8833 13.4665 9.21075C13.4883 9.11256 13.5539 9.02918 13.6457 8.98827L15.5702 8.13142Z" /></svg></div> Made with Emergent
      </div>
    </div>
  );
}

function SeasonDropdown({ seasons, activeId, onSelect }: { seasons: Season[], activeId: string, onSelect: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeSeason = seasons.find(s => s.id === activeId);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-800 px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all">
        <History className="w-4 h-4 text-gray-500" />
        {activeSeason ? `${activeSeason.year} - ${activeSeason.name}` : 'Seleccionar Temporada'}
        {activeSeason?.championName && <span className="flex items-center gap-1.5 ml-2 text-amber-500"><img src={activeSeason.championLogo} className="w-4 h-4 rounded-lg object-cover" alt="" /> {activeSeason.championName}</span>}
        <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <><div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} /><div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1a1a] border border-gray-800 rounded-xl py-2 shadow-2xl z-30 animate-fade-in-up">
        {seasons.map(s => (
          <button key={s.id} onClick={() => { onSelect(s.id); setIsOpen(false); }} className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${s.id === activeId ? 'bg-blue-500/5' : ''}`}>
            <div className="flex flex-col gap-1">
              <span className={`text-xs font-black ${s.id === activeId ? 'text-blue-400' : 'text-gray-300'}`}>{s.year} - {s.name}</span>
              {s.championName && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500/80">
                  <CheckCircle2 className="w-3 h-3" /> Campeón: {s.championName}
                  <img src={s.championLogo} className="w-3.5 h-3.5 rounded-lg object-cover" alt="" />
                </div>
              )}
              {!s.isFinished && <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-0.5">Actual</span>}
            </div>
          </button>
        ))}
      </div></>}
    </div>
  );
}

function TypeDropdown({ type, label, sections, activeId, onSelect }: { type: SectionType, label: string, sections: CompetitionSection[], activeId: string, onSelect: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const typeSections = sections.filter(s => s.type === type);
  const activeInSection = typeSections.find(s => s.id === activeId);
  if (typeSections.length === 0) return null;
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`py-4 text-xs font-bold transition-all relative flex items-center gap-1.5 ${activeInSection ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
        {activeInSection ? activeInSection.name : label} <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        {activeInSection && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
      </button>
      {isOpen && <><div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} /><div className="absolute top-full left-0 w-56 bg-[#1a1a1a] border border-gray-800 rounded-xl py-2 shadow-2xl z-30 animate-fade-in-up">
        {typeSections.map(s => <button key={s.id} onClick={() => { onSelect(s.id); setIsOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-white/5 transition-colors ${s.id === activeId ? 'text-blue-400 bg-blue-500/5' : 'text-gray-400'}`}>{s.name}</button>)}
      </div></>}
    </div>
  );
}

function FinishSeasonModal({ onSave, onClose }: { onSave: (y: string, n: string, cn: string, cl: string, ny: string, nn: string) => void, onClose: () => void }) {
  const [y, setY] = useState('');
  const [n, setN] = useState('');
  const [cn, setCN] = useState('');
  const [cl, setCL] = useState('');
  const [ny, setNY] = useState('');
  const [nn, setNN] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"><div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} /><div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl w-full max-w-2xl p-10 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-8">Finalizar Temporada</h2>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Datos de Temporada que Cierra</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Año (Ej: 2025)" value={y} onChange={e => setY(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 px-4 text-sm" />
              <input type="text" placeholder="Nombre Temporada" value={n} onChange={e => setN(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 px-4 text-sm" />
              <input type="text" placeholder="Nombre Campeón" value={cn} onChange={e => setCN(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 px-4 text-sm" />
              <input type="url" placeholder="Logo Campeón (URL)" value={cl} onChange={e => setCL(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 px-4 text-sm" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black text-green-500 uppercase tracking-widest">Datos de Nueva Temporada</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Año Nueva (Ej: 2025)" value={ny} onChange={e => setNY(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 px-4 text-sm" />
              <input type="text" placeholder="Nombre Nueva (Ej: Temporada 2)" value={nn} onChange={e => setNN(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 px-4 text-sm" />
            </div>
          </div>
        </div>
        <button onClick={() => onSave(y, n, cn, cl, ny, nn)} className="w-full bg-[#00df82] text-black font-black py-4 rounded-xl hover:bg-[#00c874] transition-all">FINALIZAR Y COMENZAR NUEVA</button>
      </div></div>
  );
}

function SettingsModal({ currentSeason, seasons, setSeasons, competitionId, sections, onSave, onClose, onFinishSeason, isReadOnly }: { currentSeason: Season, seasons: Season[], setSeasons: (s: Season[]) => void, competitionId: string, sections: CompetitionSection[], onSave: (s: CompetitionSection[]) => void, onClose: () => void, onFinishSeason: () => void, isReadOnly?: boolean }) {
  const [localSections, setLocalSections] = useState<CompetitionSection[]>([...sections]);
  const [seasonName, setSeasonName] = useState(currentSeason.name);
  const [seasonYear, setSeasonYear] = useState(currentSeason.year);

  const handleUpdateSeasonInfo = () => {
    const updated = seasons.map(s => s.id === currentSeason.id ? { ...s, name: seasonName, year: seasonYear } : s);
    setSeasons(updated);
    localStorage.setItem(`seasons_${competitionId}`, JSON.stringify(updated));
  };

  const addSection = (type: SectionType) => {
    if (isReadOnly) return;
    const names = { leaderboard: 'Nueva Tabla', playoffs: 'Nuevos Playoffs', eliminatorias: 'Nuevas Eliminatorias' };
    setLocalSections([...localSections, { id: Math.random().toString(36).substr(2, 9), type, name: names[type] }]);
  };
  const removeSection = (id: string) => !isReadOnly && localSections.length > 1 && setLocalSections(localSections.filter(s => s.id !== id));
  const renameSection = (id: string, name: string) => !isReadOnly && setLocalSections(localSections.map(s => s.id === id ? { ...s, name } : s));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl w-full max-w-2xl p-6 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[95vh] scrollbar-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold">Personalizar Competición</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        {!isReadOnly && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 mb-6 space-y-3">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Información de Temporada</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest ml-1">Año</label>
                <input 
                  type="text" 
                  value={seasonYear} 
                  onChange={e => setSeasonYear(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-2 px-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest ml-1">Nombre</label>
                <input 
                  type="text" 
                  value={seasonName} 
                  onChange={e => setSeasonName(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-2 px-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['leaderboard', 'playoffs', 'eliminatorias'] as SectionType[]).map(type => (
            <div key={type} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  {type === 'leaderboard' ? 'Tablas' : type === 'playoffs' ? 'Playoffs' : 'Eliminatorias'}
                </h3>
                {!isReadOnly && (
                  <button onClick={() => addSection(type)} className="p-1 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {localSections.filter(s => s.type === type).map(s => (
                  <div key={s.id} className="group relative">
                    <input 
                      type="text" 
                      disabled={isReadOnly} 
                      value={s.name} 
                      onChange={e => renameSection(s.id, e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-2 px-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-blue-500 transition-all pr-10 disabled:opacity-50"
                    />
                    {!isReadOnly && (
                      <button onClick={() => removeSection(s.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {!isReadOnly && (
            <button 
              onClick={() => { 
                handleUpdateSeasonInfo();
                onSave(localSections); 
                onClose(); 
              }} 
              className="w-full bg-[#00df82] text-black font-black py-4 rounded-2xl hover:bg-[#00c874] transition-all shadow-lg shadow-green-500/20 text-sm uppercase"
            >
              Guardar Cambios
            </button>
          )}
          {!isReadOnly && (
            <button onClick={onFinishSeason} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-sm uppercase flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Finalizar Temporada
            </button>
          )}
          {isReadOnly && <p className="text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">Esta temporada está finalizada</p>}
        </div>
      </div>
    </div>
  );
}

function BulkAddTeamsModal({ onClose, onSave }: { onClose: () => void; onSave: (names: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} /><div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl w-full max-w-lg p-8 relative z-10 shadow-2xl animate-fade-in-up"><div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Agregar Equipos</h2><button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button></div><p className="text-xs text-gray-500 mb-4">Escribe los nombres de los equipos, uno por línea.</p><textarea value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-green-500 min-h-[200px] resize-none mb-6" placeholder="Equipo Alpha&#10;Equipo Beta..." /><button onClick={() => onSave(value)} className="w-full bg-[#00df82] text-black font-black py-4 rounded-xl hover:bg-[#00c874] transition-all">AÑADIR TODOS</button></div></div>
  );
}

function EditTeamModal({ team, onClose, onSave, onDelete }: { team: Team; onClose: () => void; onSave: (t: Team) => void; onDelete: (id: string) => void }) {
  const [data, setData] = useState<Team>({ ...team });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} /><div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl w-full max-w-md p-8 relative z-10 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[90vh]"><div className="flex items-center justify-between mb-8"><h2 className="text-xl font-bold">Editar Equipo</h2><button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button></div><div className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre</label><input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL Escudo</label><input type="url" value={data.logoUrl} onChange={e => setData({...data, logoUrl: e.target.value})} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500" /></div><div className="grid grid-cols-3 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center block">Elim.</label><input type="number" value={data.eliminations} onChange={e => setData({...data, eliminations: parseInt(e.target.value) || 0})} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-2 text-white text-center focus:border-green-500 focus:outline-none" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center block">Vict.</label><input type="number" value={data.victories} onChange={e => setData({...data, victories: parseInt(e.target.value) || 0})} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-2 text-white text-center focus:border-amber-500 focus:outline-none" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center block">Ronda</label><input type="number" value={data.rounds} onChange={e => setData({...data, rounds: parseInt(e.target.value) || 0})} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-2 text-white text-center focus:border-purple-500 focus:outline-none" /></div></div><div className="flex gap-4 pt-4"><button onClick={() => onDelete(data.id)} className="flex-1 border border-red-500/20 text-red-500 py-4 rounded-xl hover:bg-red-500/10 font-bold text-sm">ELIMINAR</button><button onClick={() => onSave(data)} className="flex-[2] bg-[#00df82] text-black font-black py-4 rounded-xl hover:bg-[#00c874] transition-all">GUARDAR</button></div></div></div></div>
  );
}

function AddIndicatorModal({ onClose, onSave }: { onClose: () => void; onSave: (i: PositionIndicator) => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [pos, setPos] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} /><div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl w-full max-w-md p-8 relative z-10 shadow-2xl animate-fade-in-up"><div className="flex items-center justify-between mb-8"><h2 className="text-xl font-bold">Indicador de Posición</h2><button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button></div><div className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500" placeholder="Ej: Clasificados" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Posiciones</label><input type="text" value={pos} onChange={e => setPos(e.target.value)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500" placeholder="Ej: 1-4 o 1,5,8" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Color</label><div className="flex items-center gap-4 bg-[#0f0f0f] border border-gray-800 rounded-xl p-3"><input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 bg-transparent cursor-pointer" /><span className="text-xs font-mono text-gray-400 uppercase">{color}</span></div></div><button onClick={() => onSave({ id: Math.random().toString(36).substr(2, 9), name, color, positions: pos })} className="w-full bg-[#00df82] text-black font-black py-4 rounded-xl hover:bg-[#00c874] transition-all mt-4">GUARDAR INDICADOR</button></div></div></div>
  );
}

function MatchEditModal({ slots, initialData, onClose, onSave }: { slots: number; initialData?: MatchData; onClose: () => void; onSave: (data: MatchData) => void }) {
  const [participants, setParticipants] = useState<BracketParticipant[]>(initialData?.participants || Array(slots).fill(null).map(() => ({ name: '', logoUrl: '', eliminations: 0, victories: 0, rounds: 0, isGolden: false })));
  const updateParticipant = (idx: number, field: keyof BracketParticipant, value: any) => {
    const newParticipants = [...participants];
    newParticipants[idx] = { ...newParticipants[idx], [field]: value };
    setParticipants(newParticipants);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} /><div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl w-full max-w-2xl p-8 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-thin animate-fade-in-up"><div className="flex items-center justify-between mb-8"><h2 className="text-xl font-bold">Configurar Enfrentamiento</h2><button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button></div><div className="space-y-10">
          {participants.map((p, idx) => (
            <div key={idx} className="space-y-6 pb-8 border-b border-gray-800 last:border-0 last:pb-0"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-500/30">{idx + 1}</div><h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Equipo {idx + 1}</h3></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre</label><input type="text" value={p.name} onChange={(e) => updateParticipant(idx, 'name', e.target.value)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" placeholder="Nombre del equipo" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">URL Escudo</label><div className="relative"><ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input type="url" value={p.logoUrl} onChange={(e) => updateParticipant(idx, 'logoUrl', e.target.value)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" placeholder="https://..." /></div></div></div>
              {slots === 2 && (<><div className="grid grid-cols-3 gap-4 pt-2"><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-center block">Eliminaciones</label><input type="number" value={p.eliminations} onChange={(e) => updateParticipant(idx, 'eliminations', parseInt(e.target.value) || 0)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white text-center focus:outline-none focus:border-green-500 transition-colors text-sm" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-center block">Victorias</label><input type="number" value={p.victories} onChange={(e) => updateParticipant(idx, 'victories', parseInt(e.target.value) || 0)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white text-center focus:outline-none focus:border-amber-500 transition-colors text-sm" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-center block">Rondas</label><input type="number" value={p.rounds} onChange={(e) => updateParticipant(idx, 'rounds', parseInt(e.target.value) || 0)} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl py-3 px-4 text-white text-center focus:outline-none focus:border-purple-500 transition-colors text-sm" /></div></div><div className="flex items-center justify-between bg-[#121212] p-4 rounded-xl border border-gray-800"><div className="flex flex-col"><span className="text-xs font-bold text-white">Nombre Dorado</span><span className="text-[10px] text-gray-500">Resaltar el nombre del equipo en color oro</span></div><button onClick={() => updateParticipant(idx, 'isGolden', !p.isGolden)} className={`w-12 h-6 rounded-full transition-colors relative ${p.isGolden ? 'bg-[#FFD700]' : 'bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${p.isGolden ? 'left-7' : 'left-1'}`} /></button></div></>)}
            </div>
          ))}
        </div><button onClick={() => onSave({ participants })} className="w-full bg-[#00df82] text-black font-black py-4 rounded-xl hover:bg-[#00c874] transition-all mt-10 shadow-lg shadow-green-500/10">GUARDAR ENFRENTAMIENTO</button></div></div>
  );
}
