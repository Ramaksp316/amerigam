'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyForm({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const participantType = formData.get('participantType') as string;
    
    // In a real scenario we might also send the motivation letter or other fields
    // But currently the API only strictly needs participantType.

    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantType })
      });

      if (res.ok) {
        router.push('/competitions');
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Registration failed: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network Error while applying.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      
      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Participant Type
        </label>
        <select name="participantType" className="input-field" required>
          <option value="PARTICIPANT">Participant (General)</option>
          <option value="STUDENT">Student</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="MENTOR">Mentor / Volunteer</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Why do you want to join this event?
        </label>
        <textarea 
          name="motivation" 
          placeholder="I am passionate about..." 
          rows={4} 
          className="input-field" 
          style={{ resize: 'none' }} 
          required
        ></textarea>
      </div>

      {event.allowTeams && (
        <div style={{ padding: 'var(--space-3)', background: 'rgba(236, 72, 153, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#ec4899', fontWeight: 600 }}>
            Note: This is a Team Event. You can join or create a team from the dashboard after registering!
          </p>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
        {loading ? 'Submitting Application...' : 'Confirm & Apply'}
      </button>
    </form>
  );
}
