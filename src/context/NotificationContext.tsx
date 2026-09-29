import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeNotification(id);
    }, 4500);
  }, [removeNotification]);

  const success = useCallback((msg: string) => notify(msg, 'success'), [notify]);
  const error = useCallback((msg: string) => notify(msg, 'error'), [notify]);
  const info = useCallback((msg: string) => notify(msg, 'info'), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-5 ${
              n.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-100'
                : n.type === 'error'
                ? 'bg-rose-950/90 border-rose-700/60 text-rose-100'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
            }`}
          >
            {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {n.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-sm leading-snug">{n.message}</div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white transition shrink-0 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
