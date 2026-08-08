'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEventForm({ event }: { event: any }) {
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
      eventLevel: formData.get('eventLevel'),
      locationType: formData.get('locationType'),
      venue: formData.get('venue'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      requireApproval: formData.get('requireApproval') === 'on',
      allowTeams: formData.get('allowTeams') === 'on',
      requireSubmissions: formData.get('requireSubmissions') === 'on',
    };

    try {
      const res = await fetch(`/api/events/${event.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        router.push('/competitions');
        router.refresh();
      } else {
        alert('Failed to update event');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating event');
    } finally {
      setLoading(false);
    }
  }

  // Helper to format Date for datetime-local input
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <input type="text" name="name" defaultValue={event.name} placeholder="Event/Competition Name" required className="input-field" />
      <textarea name="description" defaultValue={event.description} placeholder="Description" rows={4} className="input-field" style={{ resize: 'none' }}></textarea>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <select name="category" defaultValue={event.category} className="input-field" required>
          <option value="">Select Category</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Sports">Sports</option>
          <option value="Art & Design">Art & Design</option>
          <option value="Business">Business</option>
          <option value="Other">Other</option>
        </select>

        <select name="eventLevel" defaultValue={event.eventLevel} className="input-field" required>
          <option value="">Event Level</option>
          <option value="Local">Local</option>
          <option value="District">District</option>
          <option value="State">State</option>
          <option value="National">National</option>
          <option value="International">International</option>
        </select>

        <select name="locationType" defaultValue={event.locationType} className="input-field" required>
          <option value="">Location Type</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="HYBRID">Hybrid</option>
        </select>
      </div>

      <input type="text" name="venue" defaultValue={event.venue || ''} placeholder="Venue Location (Optional)" className="input-field" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</label>
          <input type="datetime-local" name="startDate" defaultValue={formatDate(event.startDate)} required className="input-field" />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End Date</label>
          <input type="datetime-local" name="endDate" defaultValue={formatDate(event.endDate)} required className="input-field" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="requireApproval" defaultChecked={event.requireApproval} />
          Require manual approval for registrations
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="allowTeams" defaultChecked={event.allowTeams} />
          Allow participants to form teams
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
          <input type="checkbox" name="requireSubmissions" defaultChecked={event.requireSubmissions} />
          Require project/URL submission
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
