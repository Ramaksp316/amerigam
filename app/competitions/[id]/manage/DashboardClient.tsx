'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ registrations, eventId, requireApproval }: { registrations: any[], eventId: string, requireApproval: boolean }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(registrationId: string, action: 'approve' | 'reject' | 'winner') {
    setLoadingId(registrationId);
    try {
      const res = await fetch(`/api/events/${eventId}/manage/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert(`Failed to ${action} application`);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setLoadingId(null);
    }
  }

  const hasWinner = registrations.some(r => r.status === 'WINNER');

  if (registrations.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
            <th style={{ padding: 'var(--space-3)' }}>Participant</th>
            <th style={{ padding: 'var(--space-3)' }}>Type</th>
            <th style={{ padding: 'var(--space-3)' }}>Applied On</th>
            <th style={{ padding: 'var(--space-3)' }}>Status</th>
            <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(reg => (
            <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: 'var(--space-3)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{reg.user.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{reg.user.username || reg.user.amerigamId}</div>
                {reg.team && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-pink)', marginTop: '4px' }}>Team: {reg.team.name}</div>
                )}
              </td>
              <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>{reg.participantType}</td>
              <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>{new Date(reg.joinedAt).toLocaleDateString()}</td>
              <td style={{ padding: 'var(--space-3)' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
                  background: reg.status === 'WINNER' ? 'rgba(168, 85, 247, 0.15)' : reg.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : reg.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: reg.status === 'WINNER' ? 'var(--accent-purple)' : reg.status === 'APPROVED' ? 'var(--success)' : reg.status === 'REJECTED' ? 'var(--danger)' : 'var(--accent-amber)'
                }}>
                  {reg.status}
                </span>
              </td>
              <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                {reg.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-small btn-primary" 
                      style={{ padding: 'var(--space-1) var(--space-3)' }}
                      onClick={() => handleAction(reg.id, 'approve')}
                      disabled={loadingId === reg.id}
                    >
                      {loadingId === reg.id ? '...' : 'Approve'}
                    </button>
                    <button 
                      className="btn btn-small btn-outline" 
                      style={{ padding: 'var(--space-1) var(--space-3)', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={() => handleAction(reg.id, 'reject')}
                      disabled={loadingId === reg.id}
                    >
                      Reject
                    </button>
                  </div>
                )}
                {reg.status === 'APPROVED' && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-small btn-outline" 
                      style={{ padding: 'var(--space-1) var(--space-3)', color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', opacity: hasWinner ? 0.5 : 1 }}
                      onClick={() => handleAction(reg.id, 'winner')}
                      disabled={loadingId === reg.id || hasWinner}
                      title={hasWinner ? "A winner is already selected" : ""}
                    >
                      {loadingId === reg.id ? '...' : 'Mark as Winner'}
                    </button>
                  </div>
                )}
                {reg.status === 'WINNER' && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-small btn-outline" 
                      style={{ padding: 'var(--space-1) var(--space-3)' }}
                      onClick={() => handleAction(reg.id, 'approve')}
                      disabled={loadingId === reg.id}
                    >
                      {loadingId === reg.id ? '...' : 'Revoke Winner'}
                    </button>
                  </div>
                )}
                {reg.status === 'REJECTED' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resolved</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
