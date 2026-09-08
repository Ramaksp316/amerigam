'use client';
import { useState } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import { searchPersonalUsers, addMemberToCommunity } from './actions';
import ProfilePicture from '../../components/ProfilePicture';

export default function AddMemberSection({ communityId, members }: { communityId: string, members: any[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (val: string) => {
    setQuery(val);
    setErrorMsg('');
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const users = await searchPersonalUsers(val);
      setResults(users);
    } catch (e) {
      console.error(e);
    }
    setIsSearching(false);
  };

  const handleAdd = async (userId: string) => {
    setAddingId(userId);
    setErrorMsg('');
    try {
      const res = await addMemberToCommunity(communityId, userId);
      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to add user');
      } else {
        setQuery('');
        setResults([]);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to add user');
    }
    setAddingId(null);
  };

  const isMember = (userId: string) => {
    return members.some(m => m.userId === userId);
  };

  return (
    <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--surface-2)', borderRadius: '12px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Add People</h4>
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or @username..." 
          style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-1)', color: 'var(--text-primary)', fontSize: '14px' }}
        />
      </div>

      {errorMsg && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>{errorMsg}</div>}

      {isSearching && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Searching...</div>}

      {!isSearching && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {results.map(user => {
            const alreadyMember = isMember(user.id);
            return (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: 'var(--surface-1)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ProfilePicture user={user} size={32} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name || user.username}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{user.username}</div>
                  </div>
                </div>
                
                {alreadyMember ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Member
                  </span>
                ) : (
                  <button 
                    onClick={() => handleAdd(user.id)}
                    disabled={addingId === user.id}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {addingId === user.id ? 'Adding...' : <><UserPlus size={14} /> Add</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}