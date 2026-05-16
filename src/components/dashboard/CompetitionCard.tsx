import { Competition } from '../../types/fortnite';

interface Props {
  competition: Competition;
}

export default function CompetitionCard({ competition }: Props) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-4 hover:bg-[#222] transition-colors cursor-pointer border border-transparent hover:border-gray-800 group">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center border border-white/5">
        {competition.logoUrl ? (
          <img
            src={competition.logoUrl}
            alt={competition.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <span className="text-2xl font-black text-gray-500 uppercase">{competition.name.charAt(0)}</span>
        )}
      </div>
      <div className="flex flex-col overflow-hidden flex-1">
        <h3 className="text-white font-bold text-sm tracking-wide uppercase truncate">
          {competition.name}
        </h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
          {competition.description}
        </p>
      </div>
    </div>
  );
}
