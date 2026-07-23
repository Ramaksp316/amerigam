'use client';

import { useState } from 'react';
import { updateCustomStatus } from './actions';

export default function CreateStatusForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form action={async (formData) => {
      setLoading(true);
      await updateCustomStatus(formData);
    }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>What's on your mind?</label>
      <input 
        type="text" 
        name="customStatus" 
        placeholder="E.g., Working on a new AI project 🚀" 
        maxLength={60}
        required 
        className="input-field" 
      />
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '-8px' }}>
        This status will appear on your profile and automatically expire in 24 hours.
      </p>
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Updating...' : 'Set Status'}
      </button>
    </form>
  );
}
