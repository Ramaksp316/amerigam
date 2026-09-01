'use client';

import { useState } from 'react';
import { createCommunity } from '../communities/actions';
import { Users, Lock, Globe, Shield, Activity, Image as ImageIcon } from 'lucide-react';

export default function CreateCommunityForm() {
  const [loading, setLoading] = useState(false);
  const [communityType, setCommunityType] = useState('PUBLIC');

  return (
    <div style={{ animation: 'fadeIn var(--duration-fast) var(--ease-smooth)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={22} color="#3B82F6" />
          Create Community
        </h1>
      </div>

      <form action={async (formData) => {
        if (loading) return;
        setLoading(true);
        try {
          await createCommunity(formData);
        } catch (error) {
          // If it redirects, it will throw an error that Next.js catches.
          // But if it's a real error, we should stop loading.
          // Next.js handles redirects by throwing an error, so we don't necessarily want to set loading to false here, but we might have to.
        }
      }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Name and Category Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A1A1AA', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Community Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input 
              type="text" 
              name="name" 
              placeholder="e.g. Next.js Developers" 
              required 
              maxLength={50}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A1A1AA', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                name="category" 
                required
                defaultValue=""
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>Select a category</option>
                <option value="Tech & AI">Tech & AI</option>
                <option value="Visual Arts">Visual Arts</option>
                <option value="Business & Startups">Business & Startups</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
                <option value="Gaming & Esports">Gaming & Esports</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="General">General</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#A1A1AA' }}>
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A1A1AA', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Description <span style={{ color: '#52525B', fontWeight: 400, textTransform: 'none' }}>(Optional)</span>
          </label>
          <textarea 
            name="description" 
            placeholder="What is this community about? Who should join?" 
            rows={4}
            maxLength={300}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '15px',
              outline: 'none',
              resize: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        {/* Community Type */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A1A1AA', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Privacy Setting
          </label>
          <input type="hidden" name="type" value={communityType} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Public Option */}
            <div 
              onClick={() => setCommunityType('PUBLIC')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                border: communityType === 'PUBLIC' ? '1px solid #3B82F6' : '1px solid var(--border-color)',
                background: communityType === 'PUBLIC' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: communityType === 'PUBLIC' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Globe size={20} color={communityType === 'PUBLIC' ? '#3B82F6' : '#A1A1AA'} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>Public Community</div>
                <div style={{ fontSize: '13px', color: '#71717A', marginTop: '2px' }}>Anyone can view, join, and post. Best for large open groups.</div>
              </div>
            </div>

            {/* Friend Group / Private Option */}
            <div 
              onClick={() => setCommunityType('FRIEND_GROUP')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                border: communityType === 'FRIEND_GROUP' ? '1px solid #10B981' : '1px solid var(--border-color)',
                background: communityType === 'FRIEND_GROUP' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: communityType === 'FRIEND_GROUP' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Lock size={20} color={communityType === 'FRIEND_GROUP' ? '#10B981' : '#A1A1AA'} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>Private Friend Group</div>
                <div style={{ fontSize: '13px', color: '#71717A', marginTop: '2px' }}>Invite-only. Posts and members are hidden from the public.</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div style={{ marginTop: '16px' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: loading ? '#2563EB' : '#3B82F6',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <Activity size={20} className="spin-animation" />
                Creating...
              </>
            ) : (
              <>
                <Shield size={20} />
                Create Community
              </>
            )}
          </button>
          
          <style dangerouslySetInnerHTML={{__html: `
            .spin-animation {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}} />
        </div>
      </form>
    </div>
  );
}
