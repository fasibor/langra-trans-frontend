import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationsAPI } from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const mountedRef    = useRef(true);
  const eventSourceRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ limit: 30 });
      if (!mountedRef.current) return;
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count   || 0);
    } catch {
      /* non-critical — silently ignore */
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Set mounted = true at the TOP of this effect, before any async work
    mountedRef.current = true;

    if (!user) return;

    fetchNotifications();

    const token = localStorage.getItem('lt_token');
    if (!token) return;

    const url = `${notificationsAPI.streamUrl()}?token=${encodeURIComponent(token)}`;
    const es  = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('notification', (e) => {
      if (!mountedRef.current) return;
      try {
        const notif = JSON.parse(e.data);
        setNotifications(prev => {
          if (prev.find(n => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });
        if (!notif.is_read) setUnreadCount(prev => prev + 1);
      } catch { /* ignore malformed events */ }
    });

    return () => {
      mountedRef.current = false;
      es.close();
      eventSourceRef.current = null;
    };
  }, [user, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markRead, markAllRead, refetch: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
