'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      projectTitle: formData.get('projectTitle'),
      description: formData.get('description'),
      contentUrl: formData.get('contentUrl')
    };

    try {
      const res = await fetch(`/api/events/${eventId}/submit`, {
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && (
        <div style={{ padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Project Title</label>
        <input type="text" name="projectTitle" required placeholder="My Awesome Project" className="input-field" />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Project URL (Optional)</label>
        <input type="url" name="contentUrl" placeholder="https://github.com/..." className="input-field" />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>Link to GitHub repo, Google Drive folder, Figma design, or live demo.</p>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Description</label>
        <textarea name="description" required placeholder="Describe what you built, tech stack used, and how to run it..." rows={5} className="input-field" style={{ resize: 'vertical' }}></textarea>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
        {loading ? 'Submitting...' : 'Submit Project'}
      </button>
    </form>
  );
}
