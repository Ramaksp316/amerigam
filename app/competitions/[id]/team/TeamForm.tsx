'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const endpoint = mode === 'create' ? `/api/events/${eventId}/teams/create` : `/api/events/${eventId}/teams/join`;
    
    const data = mode === 'create' 
      ? { name: formData.get('name') }
      : { teamCode: formData.get('teamCode') };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', background: 'var(--surface-2)', padding: 'var(--space-1)', borderRadius: 'var(--radius-md)' }}>
        <button 
          onClick={() => { setMode('create'); setError(''); }} 
          style={{ flex: 1, padding: 'var(--space-2)', background: mode === 'create' ? 'var(--primary-color)' : 'transparent', color: mode === 'create' ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
        >
          Create a Team
        </button>
        <button 
          onClick={() => { setMode('join'); setError(''); }} 
          style={{ flex: 1, padding: 'var(--space-2)', background: mode === 'join' ? 'var(--primary-color)' : 'transparent', color: mode === 'join' ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
        >
          Join a Team
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && (
          <div style={{ padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Team Name</label>
            <input type="text" name="name" required placeholder="Enter an awesome team name..." className="input-field" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>You will be the captain and will receive a code to share with your friends.</p>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Team Code</label>
            <input type="text" name="teamCode" required placeholder="Paste the code your captain gave you..." className="input-field" />
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
          {loading ? 'Processing...' : mode === 'create' ? 'Create Team' : 'Join Team'}
        </button>
      </form>
    </div>
  );
}
