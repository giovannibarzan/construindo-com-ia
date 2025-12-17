import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { LiveEvent } from '../../types';
import EmptyState from '../EmptyState';

const LiveView: React.FC = () => {
    const [events, setEvents] = useState<LiveEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        backend.getLiveEvents().then(data => {
            setEvents(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center p-10 text-gray-500">Carregando eventos...</div>;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 animate-pulse">live_tv</span>
                    Live Exclusiva
                </h2>
                <p className="text-gray-500">Mentoria ao vivo, Vibe Coding e Tira-dúvidas para membros.</p>
            </div>

            {/* Featured Live (Live Now) */}
            {events.find(e => e.isLiveNow) && (
                <div className="w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-800">
                    <div className="aspect-video w-full bg-gray-900 relative flex items-center justify-center">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        {/* Fallback visual if no stream */}
                        {/* <span className="material-symbols-outlined text-6xl text-gray-700">play_circle</span> */}
                    </div>
                    <div className="p-6 bg-gray-900 text-white flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase animate-pulse">Ao Vivo Agora</span>
                                <span className="text-gray-400 text-sm">Assistindo: 342</span>
                            </div>
                            <h3 className="text-xl font-bold">{events.find(e => e.isLiveNow)?.title}</h3>
                            <p className="text-gray-400 mt-1">{events.find(e => e.isLiveNow)?.description}</p>
                        </div>
                        <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                            Abrir Chat
                        </button>
                    </div>
                </div>
            )}

            {/* Upcoming Events */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Próximos Eventos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.filter(e => !e.isLiveNow).map(event => (
                        <div key={event.id} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                            <img src={event.thumbnailUrl} className="w-24 h-24 object-cover rounded-lg bg-gray-200" alt="Thumb" />
                            <div className="flex-1 flex flex-col">
                                <span className="text-xs font-bold text-primary mb-1">{event.startTime}</span>
                                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">{event.title}</h4>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{event.description}</p>
                                <div className="mt-auto pt-2">
                                    <button className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1 hover:underline">
                                        <span className="material-symbols-outlined text-lg">notifications_active</span>
                                        Definir Lembrete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-full">
                            <EmptyState
                                icon="live_tv"
                                title="Nenhuma Live Agendada"
                                description="No momento não temos lives programadas, mas fique tranquilo! Em breve teremos mentorias ao vivo, Vibe Coding e sessões de tira-dúvidas exclusivas para você."
                                gradient="from-red-500 to-pink-600"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveView;