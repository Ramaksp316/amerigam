'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';

interface ContactUser {
  id: string;
  name: string | null;
  username: string;
  avatarData: string | null;
  status?: string;
}

export default function NewConversationModal({
  isOpen,
  onClose,
  contacts = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  contacts: ContactUser[];
}) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const filtered = contacts.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      c.username.toLowerCase().includes(term)
    );
  });

  const handleSelect = (userId: string) => {
    onClose();
    router.push(`/messages?userId=${userId}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#16171B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', margin: 0, fontFamily: 'inherit' }}>
            New Message
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A1A1AA',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717A' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people to message..."
              autoFocus
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#1E2026',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                padding: '9px 14px 9px 38px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Contacts list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#71717A', fontSize: '13px' }}>
              {contacts.length === 0
                ? "No connections found yet. Explore network to connect!"
                : "No matching users found."}
            </div>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <ProfilePicture user={user} size={42} showStatus={false} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name || user.username}
                  </div>
                  <div style={{ color: '#71717A', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{user.username}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#1D9BF0',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(29, 155, 240, 0.1)'
                  }}
                >
                  Chat
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
