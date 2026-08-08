'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      locationType: formData.get('locationType'),
      venue: formData.get('venue'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      requireApproval: formData.get('requireApproval') === 'on',
      allowTeams: formData.get('allowTeams') === 'on',
      requireSubmissions: formData.get('requireSubmissions') === 'on',
    };

    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        router.push('/competitions');
        router.refresh();
      } else {
        alert('Failed to create event');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <input type="text" name="name" placeholder="Event/Competition Name" required className="input-field" />
      <textarea name="description" placeholder="Description" rows={4} className="input-field" style={{ resize: 'none' }}></textarea>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <select name="category" className="input-field" required>
          <option value="">Select Category</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Sports">Sports</option>
          <option value="Art & Design">Art & Design</option>
          <option value="Business">Business</option>
          <option value="Other">Other</option>
        </select>

        <select name="locationType" className="input-field" required>
          <option value="">Location Type</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>

      <input type="text" name="venue" placeholder="Venue Location (Optional)" className="input-field" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</label>
          <input type="datetime-local" name="startDate" required className="input-field" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End Date</label>
          <input type="datetime-local" name="endDate" required className="input-field" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="requireApproval" />
          Require manual approval for registrations
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="allowTeams" />
          Allow participants to form teams
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="requireSubmissions" />
          Require project/URL submission
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
