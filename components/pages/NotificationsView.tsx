
import React, { useEffect, useState } from 'react';
import { Notification } from '../../types';
import { backend } from '../../services/backend';

const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getNotifications().then(data => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const handleMarkAllRead = async () => {
      await backend.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch(type) {
      case 'LIKE': return 'favorite';
      case 'COMMENT': return 'chat_bubble';
      case 'FOLLOW': return 'person_add';
      case 'SYSTEM': return 'campaign';
    }
  };

  const getColor = (type: Notification['type']) => {
    switch(type) {
      case 'LIKE': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'COMMENT': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'FOLLOW': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'SYSTEM': return 'text-violet-600 bg-violet-50 dark:bg-violet-900/20';
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificações</h2>
          <button 
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-primary hover:text-blue-600 dark:hover:text-blue-300 hover:underline transition-all"
          >
              Marcar todas como lidas
          </button>
      </div>
      
      {loading ? (
        <div className="flex flex-col gap-4">
             {[1,2,3].map(i => <div key={i} className="h-16 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>)}
        </div>
      ) : (
        notifications.map(notif => (
          <div key={notif.id} className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${notif.read ? 'bg-transparent border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-gray-900/60 border-primary/20 shadow-sm'}`}>
             <div className={`p-3 rounded-full shrink-0 ${getColor(notif.type)}`}>
               <span className="material-symbols-outlined !text-xl">{getIcon(notif.type)}</span>
             </div>
             
             <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 text-sm text-gray-800 dark:text-gray-200">
                   {notif.type === 'SYSTEM' ? (
                       <span className="font-bold text-violet-600 dark:text-violet-400 mr-1">Equipe Construindo com IA</span>
                   ) : (
                       notif.user && <span className="font-bold mr-1 hover:underline cursor-pointer">{notif.user.name}</span>
                   )}
                   <span className="break-words">{notif.message}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{notif.createdAt}</p>
                
                {notif.link && (
                    <a href={notif.link} className="inline-block mt-2 text-xs font-bold text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md">
                        Ver Detalhes
                    </a>
                )}
             </div>
             {!notif.read && <div className="size-2.5 rounded-full bg-primary shrink-0" title="Não lida"></div>}
          </div>
        ))
      )}
      {!loading && notifications.length === 0 && (
          <div className="text-center py-20 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-dashed border-gray-200 dark:border-gray-800">
               <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">notifications_off</span>
              <p className="text-gray-500 font-medium">Nenhuma notificação por enquanto.</p>
          </div>
      )}
    </div>
  );
};

export default NotificationsView;
