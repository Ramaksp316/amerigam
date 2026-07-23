'use client';

import { useState } from 'react';
import { createCommunity } from '../communities/actions';

export default function CreateCommunityForm() {
  const [loading, setLoading] = useState(false);

  return (
    <form action={async (formData) => {
      setLoading(true);
      await createCommunity(formData);
    }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <input type="text" name="name" placeholder="Community Name" required className="input-field" />
      <textarea name="description" placeholder="Description" rows={4} className="input-field" style={{ resize: 'none' }}></textarea>
      
      <select name="category" className="input-field" required>
        <option value="">Select Category</option>
        <option value="Tech & AI">Tech & AI</option>
        <option value="Visual Arts">Visual Arts</option>
        <option value="Business & Startups">Business & Startups</option>
        <option value="Gaming">Gaming</option>
        <option value="General">General</option>
      </select>
      
      <select name="type" className="input-field" required>
        <option value="PUBLIC">Public Community</option>
        <option value="FRIEND_GROUP">Private Friend Group</option>
      </select>
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Creating...' : 'Create Community'}
      </button>
    </form>
  );
}
