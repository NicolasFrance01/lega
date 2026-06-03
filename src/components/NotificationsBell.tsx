"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { getGlobalNotifications, markGlobalNotificationRead, markAllGlobalNotificationsRead } from "@/actions/ingresos";
import { format } from "date-fns";

export default function NotificationsBell({ userRole }: { userRole: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Solo roles permitidos
  if (!['admin', 'gerente', 'administracion', 'bioquimico'].includes(userRole)) {
    return null;
  }

  const fetchNotifications = async () => {
    const res = await getGlobalNotifications();
    if (res.data) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => n.status === 'unread').length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  const handleMarkRead = async (id: number) => {
    await markGlobalNotificationRead(id);
    await fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllGlobalNotificationsRead();
    await fetchNotifications();
  };

  return (
    <div style={{ position: 'absolute', top: '3rem', right: '0.75rem', zIndex: 100 }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: unreadCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '50%', width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: unreadCount > 0 ? '#F59E0B' : 'var(--primary)',
          position: 'relative', transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        title="Notificaciones"
      >
        <Bell size={14} fill={unreadCount > 0 ? 'currentColor' : 'none'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#EF4444', color: 'white', fontSize: '0.55rem', fontWeight: 800,
            width: '14px', height: '14px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-main)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '35px', left: 'auto', right: '0',
          width: '320px', maxHeight: '400px', overflowY: 'auto',
          backgroundColor: 'var(--bg-main)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--glass-bg)' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Notificaciones</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Check size={14} /> Marcar todo leído
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => { if(notif.status === 'unread') handleMarkRead(notif.id); }}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--glass-border)',
                    background: notif.status === 'unread' ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                    borderLeft: notif.status === 'unread' ? '3px solid #EF4444' : '3px solid transparent',
                    cursor: notif.status === 'unread' ? 'pointer' : 'default',
                    transition: 'all 0.2s'
                  }}
                >
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>{format(new Date(notif.created_at), "dd/MM/yy HH:mm")}</span>
                    {notif.status === 'read' && (
                      <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        <Check size={10} /> Leído por {notif.read_by}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
