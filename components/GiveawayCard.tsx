
import React from 'react';
import { Giveaway, UserPlan } from '../types';

interface GiveawayCardProps {
  giveaway: Giveaway;
}

const GiveawayCard: React.FC<GiveawayCardProps> = ({ giveaway }) => {
    
  const getStatusLabel = (status: Giveaway['status']) => {
      switch(status) {
          case 'OPEN': return 'Em andamento';
          case 'FUTURE': return 'Futuro';
          case 'CLOSED': return 'Encerrado';
          default: return '';
      }
  };

  const getStatusColor = (status: Giveaway['status']) => {
      switch(status) {
          case 'OPEN': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
          case 'FUTURE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
          case 'CLOSED': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      }
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md h-full flex flex-col ${giveaway.status === 'CLOSED' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold z-10 ${getStatusColor(giveaway.status)}`}>
            {getStatusLabel(giveaway.status)}
        </div>

        {/* Plan Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold z-10 ${giveaway.requiredPlan === UserPlan.PREMIUM ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 shadow-sm' : 'bg-white/90 text-gray-700 backdrop-blur-sm'}`}>
            {giveaway.requiredPlan === UserPlan.PREMIUM ? '💎 Premium' : '🆓 Grátis'}
        </div>

        {/* Image */}
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
             <img 
               src={giveaway.imageUrl} 
               alt={giveaway.title} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               loading="lazy"
             />
        </div>

        <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{giveaway.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">{giveaway.description}</p>
            
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-6 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Participantes</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{giveaway.participants}</span>
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Encerra em</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{giveaway.endDate}</span>
                    </div>
                </div>
                
                {giveaway.status === 'OPEN' ? (
                    <button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary/30 transition-transform active:scale-95 text-sm">
                        Participar
                    </button>
                ) : (
                    <button disabled className="w-full sm:w-auto bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 px-6 py-2 rounded-lg font-bold text-sm cursor-not-allowed">
                        {giveaway.status === 'FUTURE' ? 'Em Breve' : 'Encerrado'}
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default GiveawayCard;
