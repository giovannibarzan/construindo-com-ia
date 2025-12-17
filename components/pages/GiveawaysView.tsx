import React, { useState, useEffect } from 'react';
import { Giveaway } from '../../types';
import { backend } from '../../services/backend';
import GiveawayCard from '../GiveawayCard';
import EmptyState from '../EmptyState';

type GiveawayFilter = 'ALL' | 'OPEN' | 'FUTURE' | 'CLOSED';

const GiveawaysView: React.FC = () => {
    const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
    const [filter, setFilter] = useState<GiveawayFilter>('OPEN');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        backend.getGiveaways().then(data => {
            setGiveaways(data);
            setLoading(false);
        });
    }, []);

    const filteredGiveaways = giveaways.filter(g => {
        if (filter === 'ALL') return true;
        return g.status === filter;
    });

    const getStatusLabel = (status: Giveaway['status']) => {
        switch (status) {
            case 'OPEN': return 'Em andamento';
            case 'FUTURE': return 'Futuro';
            case 'CLOSED': return 'Encerrado';
            default: return '';
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sorteios</h2>
                <p className="text-sm text-gray-500">Participe e ganhe prêmios exclusivos da comunidade.</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-hide">
                {(['OPEN', 'FUTURE', 'CLOSED', 'ALL'] as GiveawayFilter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                    >
                        {f === 'ALL' ? 'Todos' : getStatusLabel(f)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>)
                ) : filteredGiveaways.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyState
                            icon="card_giftcard"
                            title="Em Breve Novos Sorteios!"
                            description="Estamos preparando sorteios incríveis para você! Fique de olho nas notificações para não perder nenhuma oportunidade de ganhar prêmios exclusivos."
                            gradient="from-pink-500 to-orange-500"
                        />
                    </div>
                ) : (
                    filteredGiveaways.map(giveaway => (
                        <GiveawayCard key={giveaway.id} giveaway={giveaway} />
                    ))
                )}
            </div>
        </div>
    );
};

export default GiveawaysView;