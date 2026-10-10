import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/services';
import type { Notification } from '../../types';
import { formatDateTime } from '../../utils/helpers';

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data.notifications);
      setUnread(res.data.data.unreadCount);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const handleMarkAll = async () => {
    await notificationService.markAllRead();
    setUnread(0);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const handleRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((n) => n.map((x) => x._id === id ? { ...x, read: true } : x));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen((o) => !o); load(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8,
        }}
        title="Notifications"
      >
        <Bell size={20} color="#64748b" />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 16, height: 16, borderRadius: '50%',
            background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', right: 0, top: 40, width: 340, maxHeight: 480,
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
              {unread > 0 && (
                <button onClick={handleMarkAll} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 420 }}>
              {notifications.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No notifications</div>
              )}
              {notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleRead(n._id)}
                  style={{
                    padding: '10px 16px', cursor: 'pointer',
                    background: n.read ? '#fff' : '#eff6ff',
                    borderBottom: '1px solid #f8fafc',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{formatDateTime(n.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
