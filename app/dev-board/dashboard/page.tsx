'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface Stats {
  totalUsers: number;
  onboardedUsers: number;
  notOnboarded: number;
  todayUsers: number;
  totalPosts: number;
  totalEvents: number;
  totalCommunities: number;
  totalMessages: number;
  activeUsers: number;
  unresolvedErrors: number;
  recentSignups: any[];
  weeklySignupTrend: { date: string; count: number }[];
}

interface ActivityEvent {
  type: 'snapshot' | 'new_signup' | 'active_pulse' | 'new_error';
  message?: string;
  user?: any;
  users?: any[];
  count?: number;
  error?: any;
  timestamp: string;
}

interface ServerHealth {
  cpu: number | null;
  ram: { used: number; total: number; pct: number } | null;
  disk: { used: string; available: string; pct: string } | null;
  pm2: Array<{ name: string; status: string; pid: number; uptime: number; restarts: number; cpu: number; memory: number }> | null;
  timestamp?: string;
  error?: string;
}

interface DevUser {
  id: string;
  username: string | null;
  name: string | null;
  email: string;
  accountType: string;
  onboarded: boolean;
  createdAt: string;
  lastSeen: string;
  status: string;
  city: string | null;
  state: string | null;
  country: string | null;
  amerigamPoints: number;
  bio: string | null;
  personalProfile: { mainIdentity: string | null } | null;
  _count: { posts: number; followers: number; following: number };
}

interface DevError {
  id: string;
  digest: string | null;
  message: string;
  stack: string | null;
  url: string | null;
  userId: string | null;
  userEmail: string | null;
  resolved: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function GaugeRing({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────
export default function DevDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'live' | 'errors' | 'users' | 'vitals' | 'server'>('live');
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [activityLog, setActivityLog] = useState<{ msg: string; type: string; ts: string; id: string }[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<DevUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [errors, setErrors] = useState<DevError[]>([]);
  const [errorsTotal, setErrorsTotal] = useState(0);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [notifications, setNotifications] = useState<{ title: string; body: string; ts: string }[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const activityEndRef = useRef<HTMLDivElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  // ── Load stats ──
  const loadStats = useCallback(async () => {
    try {
      const r = await fetch('/api/dev/stats');
      if (r.ok) setStats(await r.json());
    } catch {}
  }, []);

  // ── Load server health ──
  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const r = await fetch('/api/dev/server-health');
      if (r.ok) setHealth(await r.json());
    } catch {}
    setHealthLoading(false);
  }, []);

  // ── Load users ──
  const loadUsers = useCallback(async (page = 1, search = '') => {
    try {
      const r = await fetch(`/api/dev/users?page=${page}&search=${encodeURIComponent(search)}`);
      if (r.ok) {
        const data = await r.json();
        setUsers(data.users);
        setUsersTotal(data.total);
      }
    } catch {}
  }, []);

  // ── Load errors ──
  const loadErrors = useCallback(async () => {
    try {
      const r = await fetch('/api/dev/errors?resolved=false');
      if (r.ok) {
        const data = await r.json();
        setErrors(data.errors);
        setErrorsTotal(data.total);
      }
    } catch {}
  }, []);

  // ── Push notifications setup ──
  const setupPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setPushSupported(true);
    try {
      const sw = await navigator.serviceWorker.ready;
      const existing = await sw.pushManager.getSubscription();
      if (existing) {
        setPushEnabled(true);
        return;
      }
    } catch {}
  }, []);

  const enablePush = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      const sw = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await fetch('/api/dev/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      setPushEnabled(true);
    } catch (err) {
      console.error('Push subscription failed:', err);
    }
  }, []);

  // ── SSE Live Activity ──
  const addActivity = useCallback((msg: string, type: string) => {
    setActivityLog(prev => {
      const newLog = [{ msg, type, ts: new Date().toISOString(), id: Math.random().toString(36) }, ...prev];
      return newLog.slice(0, 100); // keep last 100
    });
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    setNotifications(prev => [{ title, body, ts: new Date().toISOString() }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 6000);
  }, []);

  useEffect(() => {
    loadStats();
    loadErrors();
    setupPush();

    // SSE connection
    const sse = new EventSource('/api/dev/activity');
    sseRef.current = sse;

    sse.onmessage = (e) => {
      try {
        const data: ActivityEvent = JSON.parse(e.data);
        switch (data.type) {
          case 'snapshot':
            setOnlineUsers(data.users || []);
            addActivity(`📡 Connected to live stream — ${data.users?.length || 0} users tracked`, 'info');
            break;
          case 'new_signup':
            addActivity(data.message || `✨ New signup: ${data.user?.username}`, 'signup');
            loadStats();
            showNotification('🆕 New Signup!', data.message || `${data.user?.username} joined Amerigam`);
            break;
          case 'active_pulse':
            setOnlineUsers(data.users || []);
            break;
          case 'new_error':
            addActivity(data.message || `⚠️ Error on ${data.error?.url}`, 'error');
            loadErrors();
            showNotification('⚠️ Server Error!', data.message || 'An error occurred on Amerigam');
            break;
        }
      } catch {}
    };

    sse.onerror = () => {
      addActivity('🔌 Activity stream disconnected. Reconnecting...', 'warn');
    };

    // Auto-refresh stats every 30s
    const statsInterval = setInterval(loadStats, 30000);

    return () => {
      sse.close();
      clearInterval(statsInterval);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'server') loadHealth();
    if (activeTab === 'users') loadUsers(usersPage, usersSearch);
    if (activeTab === 'errors') loadErrors();
  }, [activeTab]);

  const handleLogout = async () => {
    await fetch('/api/dev/verify-pin', { method: 'DELETE' });
    router.push('/dev-board');
  };

  const handleDeleteUser = async (userId: string) => {
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }
    try {
      await fetch('/api/dev/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setDeleteConfirm(null);
      loadUsers(usersPage, usersSearch);
      loadStats();
      addActivity(`🗑 User deleted: ${userId}`, 'warn');
    } catch {}
  };

  const handleResolveError = async (id: string) => {
    await fetch('/api/dev/errors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadErrors();
  };

  // ─── TAB ICON COLORS ───
  const tabs = [
    { id: 'live', label: 'Live Stream', icon: '🔴', badge: onlineUsers.length },
    { id: 'errors', label: 'Errors', icon: '⚠️', badge: errorsTotal || 0 },
    { id: 'users', label: 'Users', icon: '👥', badge: stats?.totalUsers },
    { id: 'vitals', label: 'Vitals', icon: '📊', badge: null },
    { id: 'server', label: 'Server', icon: '💻', badge: null },
  ];

  return (
    <div className="dev-board-root" style={{ minHeight: '100vh', backgroundColor: '#06060A', color: '#FAFAFA', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Push Notification Toasts ── */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.map((n, i) => (
          <div key={i} style={{
            background: 'rgba(17,17,27,0.95)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            animation: 'slideIn 0.3s ease',
          }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>{n.title}</div>
            <div style={{ fontSize: '12px', color: '#A1A1AA' }}>{n.body}</div>
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <header style={{
        height: '60px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'rgba(6,6,10,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
          }}>🛰️</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.2px' }}>Mission Control</div>
            <div style={{ fontSize: '11px', color: '#52525B' }}>Amerigam · Developer Board</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 8px rgba(34,197,94,0.6)',
              animation: 'pulse 2s infinite',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '12px', color: '#71717A' }}>{onlineUsers.length} active</span>
          </div>

          {/* Push notification toggle */}
          {pushSupported && !pushEnabled && (
            <button
              onClick={enablePush}
              style={{
                padding: '6px 12px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '8px',
                color: '#818CF8',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🔔 Enable Alerts
            </button>
          )}
          {pushEnabled && (
            <span style={{ fontSize: '12px', color: '#22C55E' }}>🔔 Alerts ON</span>
          )}

          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      {stats && (
        <div style={{
          display: 'flex',
          gap: '1px',
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto',
        }}>
          {[
            { label: 'Total Users', value: stats.totalUsers, color: '#818CF8' },
            { label: 'Online Now', value: onlineUsers.length, color: '#22C55E', pulse: true },
            { label: 'New Today', value: stats.todayUsers, color: '#34D399' },
            { label: 'Posts', value: stats.totalPosts, color: '#60A5FA' },
            { label: 'Events', value: stats.totalEvents, color: '#F59E0B' },
            { label: 'Errors', value: stats.unresolvedErrors, color: stats.unresolvedErrors > 0 ? '#EF4444' : '#71717A' },
            { label: 'Communities', value: stats.totalCommunities, color: '#A78BFA' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: '1 0 auto',
              padding: '12px 20px',
              backgroundColor: '#06060A',
              minWidth: '110px',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {s.value}
                {s.pulse && s.value > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />}
              </div>
              <div style={{ fontSize: '10px', color: '#52525B', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
        overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #6366F1' : '2px solid transparent',
              color: activeTab === tab.id ? '#FAFAFA' : '#71717A',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap',
              marginBottom: '-1px',
              transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
            {tab.badge !== null && tab.badge !== undefined && tab.badge > 0 && (
              <span style={{
                background: tab.id === 'errors' ? '#EF4444' : '#6366F1',
                color: 'white',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '10px',
                fontWeight: 800,
              }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ────── TAB: LIVE STREAM ────── */}
        {activeTab === 'live' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
            {/* Activity Log */}
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>
                📡 Live Activity Log
              </h2>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                height: '500px',
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {activityLog.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#3F3F46', marginTop: '80px', fontSize: '13px' }}>
                    Connecting to live stream...
                  </div>
                )}
                {activityLog.map(event => (
                  <div key={event.id} style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: event.type === 'error' ? 'rgba(239,68,68,0.06)' :
                                event.type === 'signup' ? 'rgba(34,197,94,0.05)' :
                                event.type === 'warn' ? 'rgba(245,158,11,0.05)' :
                                'transparent',
                    borderLeft: `2px solid ${
                      event.type === 'error' ? '#EF4444' :
                      event.type === 'signup' ? '#22C55E' :
                      event.type === 'warn' ? '#F59E0B' :
                      'rgba(255,255,255,0.1)'
                    }`,
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    <span style={{ color: '#3F3F46', fontSize: '11px', whiteSpace: 'nowrap', fontFamily: 'monospace', marginTop: '1px' }}>
                      {formatTime(event.ts)}
                    </span>
                    <span style={{ fontSize: '13px', color: '#D4D4D8', lineHeight: '1.4' }}>{event.msg}</span>
                  </div>
                ))}
                <div ref={activityEndRef} />
              </div>
            </div>

            {/* Online Users Panel */}
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>
                🟢 Active Users ({onlineUsers.length})
              </h2>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                height: '500px',
                overflowY: 'auto',
                padding: '8px',
              }}>
                {onlineUsers.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#3F3F46', marginTop: '60px', fontSize: '13px' }}>
                    No active users right now
                  </div>
                )}
                {onlineUsers.map((u, i) => (
                  <div key={u.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    marginBottom: '4px',
                    background: i === 0 ? 'rgba(99,102,241,0.06)' : 'transparent',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: `hsl(${(u.username || '').charCodeAt(0) * 15}, 50%, 30%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, color: '#FAFAFA', flexShrink: 0,
                    }}>
                      {(u.name || u.username || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA' }}>
                        @{u.username || u.name || 'user'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#52525B' }}>
                        {u.city || u.country || 'Unknown'} · {timeAgo(u.lastSeen)}
                      </div>
                    </div>
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: u.status === 'ONLINE' ? '#22C55E' : '#52525B',
                      boxShadow: u.status === 'ONLINE' ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
                      flexShrink: 0,
                    }} />
                  </div>
                ))}
              </div>

              {/* Recent Signups */}
              {stats?.recentSignups && stats.recentSignups.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px 0' }}>
                    ✨ Latest Signups
                  </h3>
                  {stats.recentSignups.map(u => (
                    <div key={u.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: '#D4D4D8' }}>@{u.username || u.name}</span>
                      <span style={{ color: '#52525B' }}>{timeAgo(u.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ────── TAB: ERRORS ────── */}
        {activeTab === 'errors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                ⚠️ Error Watchdog ({errorsTotal} unresolved)
              </h2>
              <button onClick={loadErrors} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#A1A1AA', fontSize: '12px', cursor: 'pointer' }}>
                Refresh
              </button>
            </div>

            {errors.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '16px',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                <div style={{ color: '#22C55E', fontWeight: 700 }}>All Clear! No active errors.</div>
                <div style={{ color: '#52525B', fontSize: '13px', marginTop: '6px' }}>Amerigam is running smoothly.</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {errors.map(err => (
                <div key={err.id} style={{
                  background: 'rgba(239,68,68,0.04)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                    onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, fontFamily: 'monospace' }}>
                          #{err.digest || 'ERR'}
                        </span>
                        {err.url && <span style={{ color: '#71717A', fontSize: '12px', fontFamily: 'monospace' }}>{err.url}</span>}
                        <span style={{ color: '#3F3F46', fontSize: '11px', marginLeft: 'auto' }}>{timeAgo(err.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#FCA5A5', fontFamily: 'monospace' }}>
                        {err.message?.slice(0, 120)}{err.message?.length > 120 ? '...' : ''}
                      </div>
                      {err.userEmail && (
                        <div style={{ fontSize: '11px', color: '#52525B', marginTop: '6px' }}>
                          Affected: {err.userEmail}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResolveError(err.id); }}
                        style={{ padding: '4px 10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', color: '#22C55E', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Resolve ✓
                      </button>
                      <span style={{ color: '#3F3F46', fontSize: '18px' }}>{expandedError === err.id ? '▴' : '▾'}</span>
                    </div>
                  </div>
                  {expandedError === err.id && err.stack && (
                    <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(239,68,68,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                      <pre style={{ fontSize: '11px', color: '#71717A', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontFamily: 'monospace', maxHeight: '200px', overflowY: 'auto' }}>
                        {err.stack}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────── TAB: USERS ────── */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                👥 Users Directory ({usersTotal} total)
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={usersSearch}
                  onChange={e => { setUsersSearch(e.target.value); setUsersPage(1); }}
                  onKeyDown={e => e.key === 'Enter' && loadUsers(1, usersSearch)}
                  placeholder="Search by name, email, username..."
                  style={{
                    padding: '8px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', color: '#FAFAFA', fontSize: '13px', outline: 'none', width: '260px',
                  }}
                />
                <button
                  onClick={() => loadUsers(1, usersSearch)}
                  style={{ padding: '8px 14px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', color: '#818CF8', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Search
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['User', 'Email', 'Location', 'Type', 'AP', 'Posts/Followers', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#52525B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: `hsl(${(u.username || '').charCodeAt(0) * 15}, 50%, 25%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, flexShrink: 0,
                          }}>
                            {(u.name || u.username || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#FAFAFA' }}>{u.name || '—'}</div>
                            <div style={{ color: '#52525B', fontSize: '11px' }}>@{u.username || 'no-username'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#A1A1AA', fontFamily: 'monospace', fontSize: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px 14px', color: '#71717A', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {[u.city, u.state, u.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                          background: u.accountType === 'BUSINESS' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                          color: u.accountType === 'BUSINESS' ? '#F59E0B' : '#818CF8',
                        }}>
                          {u.accountType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#60A5FA', fontWeight: 700 }}>{u.amerigamPoints}</td>
                      <td style={{ padding: '12px 14px', color: '#71717A', fontSize: '12px' }}>
                        {u._count.posts} posts / {u._count.followers} followers
                      </td>
                      <td style={{ padding: '12px 14px', color: '#52525B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {timeAgo(u.createdAt)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                          background: u.onboarded ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: u.onboarded ? '#22C55E' : '#EF4444',
                        }}>
                          {u.onboarded ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{
                            padding: '4px 10px',
                            background: deleteConfirm === u.id ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${deleteConfirm === u.id ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'}`,
                            borderRadius: '6px',
                            color: '#EF4444',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {deleteConfirm === u.id ? '⚠️ Confirm' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {Array.from({ length: Math.ceil(usersTotal / 20) }, (_, i) => i + 1).slice(0, 10).map(p => (
                <button
                  key={p}
                  onClick={() => { setUsersPage(p); loadUsers(p, usersSearch); }}
                  style={{
                    width: '36px', height: '36px',
                    background: usersPage === p ? '#6366F1' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: usersPage === p ? 'white' : '#71717A',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: usersPage === p ? 700 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ────── TAB: PLATFORM VITALS ────── */}
        {activeTab === 'vitals' && stats && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 20px 0' }}>
              📊 Platform Vitals
            </h2>

            {/* Big Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers, sub: `${stats.onboardedUsers} active · ${stats.notOnboarded} pending`, color: '#818CF8', icon: '👥' },
                { label: 'New Today', value: stats.todayUsers, sub: 'registered today', color: '#34D399', icon: '✨' },
                { label: 'Online Now', value: onlineUsers.length, sub: 'last 5 minutes', color: '#22C55E', icon: '🟢' },
                { label: 'Total Posts', value: stats.totalPosts, sub: 'across platform', color: '#60A5FA', icon: '📝' },
                { label: 'Total Events', value: stats.totalEvents, sub: 'competitions & events', color: '#F59E0B', icon: '🏆' },
                { label: 'Communities', value: stats.totalCommunities, sub: 'active communities', color: '#A78BFA', icon: '🌐' },
                { label: 'Messages', value: stats.totalMessages, sub: 'total messages sent', color: '#F472B6', icon: '💬' },
                { label: 'Active Errors', value: stats.unresolvedErrors, sub: 'need attention', color: stats.unresolvedErrors > 0 ? '#EF4444' : '#22C55E', icon: stats.unresolvedErrors > 0 ? '⚠️' : '✅' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '18px',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#D4D4D8', marginBottom: '3px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: '#52525B' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Weekly Signup Trend */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
                📈 7-Day Signup Trend
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                {stats.weeklySignupTrend.map((day, i) => {
                  const max = Math.max(...stats.weeklySignupTrend.map(d => d.count), 1);
                  const h = Math.max((day.count / max) * 70, 4);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#71717A' }}>{day.count}</span>
                      <div style={{
                        width: '100%', height: `${h}px`, borderRadius: '4px',
                        background: day.count > 0 ? 'linear-gradient(180deg, #6366F1, #4F46E5)' : 'rgba(255,255,255,0.06)',
                        transition: 'height 0.5s ease',
                        boxShadow: day.count > 0 ? '0 0 10px rgba(99,102,241,0.3)' : 'none',
                      }} />
                      <span style={{ fontSize: '9px', color: '#3F3F46' }}>
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ────── TAB: SERVER HEALTH ────── */}
        {activeTab === 'server' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                💻 VPS Server Health
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {health?.timestamp && (
                  <span style={{ fontSize: '11px', color: '#52525B' }}>Updated {timeAgo(health.timestamp)}</span>
                )}
                <button
                  onClick={loadHealth}
                  disabled={healthLoading}
                  style={{ padding: '6px 14px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#818CF8', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {healthLoading ? 'Loading...' : '↻ Refresh'}
                </button>
              </div>
            </div>

            {healthLoading && !health && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#52525B' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔌</div>
                Connecting to VPS...
              </div>
            )}

            {health?.error && (
              <div style={{ padding: '20px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', color: '#EF4444', fontSize: '13px' }}>
                ⚠️ SSH Error: {health.error}
              </div>
            )}

            {health && !health.error && (
              <>
                {/* Gauge Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                  {/* CPU */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                      <GaugeRing pct={health.cpu || 0} color={health.cpu && health.cpu > 80 ? '#EF4444' : health.cpu && health.cpu > 50 ? '#F59E0B' : '#22C55E'} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '16px', fontWeight: 800, color: '#FAFAFA' }}>
                        {health.cpu}%
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4D4D8' }}>CPU Usage</div>
                    <div style={{ fontSize: '11px', color: '#52525B', marginTop: '3px' }}>Server processor</div>
                  </div>

                  {/* RAM */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                      <GaugeRing pct={health.ram?.pct || 0} color={health.ram && health.ram.pct > 85 ? '#EF4444' : health.ram && health.ram.pct > 60 ? '#F59E0B' : '#60A5FA'} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '16px', fontWeight: 800, color: '#FAFAFA' }}>
                        {health.ram?.pct}%
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4D4D8' }}>RAM Usage</div>
                    <div style={{ fontSize: '11px', color: '#52525B', marginTop: '3px' }}>
                      {health.ram?.used}MB / {health.ram?.total}MB
                    </div>
                  </div>

                  {/* Disk */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                      <GaugeRing pct={parseInt(health.disk?.pct || '0')} color='#A78BFA' />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '16px', fontWeight: 800, color: '#FAFAFA' }}>
                        {health.disk?.pct}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4D4D8' }}>Disk Usage</div>
                    <div style={{ fontSize: '11px', color: '#52525B', marginTop: '3px' }}>
                      {health.disk?.used} used · {health.disk?.available} free
                    </div>
                  </div>
                </div>

                {/* PM2 Processes */}
                {health.pm2 && health.pm2.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>PM2 Processes</h3>
                    {health.pm2.map((proc, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        marginBottom: '8px',
                      }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: proc.status === 'online' ? '#22C55E' : '#EF4444',
                          boxShadow: proc.status === 'online' ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
                          flexShrink: 0,
                        }} />
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#FAFAFA', minWidth: '100px' }}>{proc.name}</div>
                        <span style={{ fontSize: '12px', color: proc.status === 'online' ? '#22C55E' : '#EF4444', fontWeight: 600 }}>{proc.status}</span>
                        <span style={{ fontSize: '12px', color: '#52525B' }}>PID {proc.pid}</span>
                        <span style={{ fontSize: '12px', color: '#71717A' }}>{proc.cpu}% CPU</span>
                        <span style={{ fontSize: '12px', color: '#71717A' }}>{proc.memory}MB RAM</span>
                        <span style={{ fontSize: '12px', color: '#52525B', marginLeft: 'auto' }}>↺ {proc.restarts} restarts</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        input::placeholder { color: #3F3F46; }
        input:focus { border-color: rgba(99,102,241,0.4) !important; outline: none; }
      `}</style>
    </div>
  );
}
