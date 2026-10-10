import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services/services';
import type { Notification } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const TYPE_COLORS: Record<string, string> = {
  claim_update: '#2563eb',
  document_request: '#ea580c',
  ai_validation: '#7c3aed',
  approval_rejection: '#16a34a',
  system: '#64748b',
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data.notifications);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkAll = async () => {
    await notificationService.markAllRead();
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const handleRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((n) => n.map((x) => x._id === id ? { ...x, read: true } : x));
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-header">Notifications</h1>
          <p className="page-subheader">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAll}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Bell size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No notifications yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>You're all caught up!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && handleRead(n._id)}
              style={{
                background: n.read ? '#fff' : '#eff6ff',
                border: `1px solid ${n.read ? '#e2e8f0' : '#bfdbfe'}`,
                borderLeft: `4px solid ${TYPE_COLORS[n.type] || '#64748b'}`,
                borderRadius: 10,
                padding: '14px 18px',
                cursor: n.read ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{n.title}</span>
                    {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{formatDateTime(n.createdAt)}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
                  background: `${TYPE_COLORS[n.type] || '#64748b'}18`,
                  color: TYPE_COLORS[n.type] || '#64748b',
                  whiteSpace: 'nowrap',
                }}>
                  {n.type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
