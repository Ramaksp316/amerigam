'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

// Curated high-res expressive animated reaction stickers
const CURATED_STICKERS = [
  { id: '1', title: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { id: '2', title: 'Party', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: '3', title: 'Laughing', url: 'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif' },
  { id: '4', title: 'Fire', url: 'https://media.giphy.com/media/Lopx9eUi34rbq/giphy.gif' },
  { id: '5', title: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: '6', title: 'Clap', url: 'https://media.giphy.com/media/nbvFVPiEiJH6JOGIok/giphy.gif' },
  { id: '7', title: 'Rocket', url: 'https://media.giphy.com/media/mi6DsSSNKDbUY/giphy.gif' },
  { id: '8', title: '100', url: 'https://media.giphy.com/media/10yXFkBJ0MwGQg/giphy.gif' },
  { id: '9', title: 'Cool', url: 'https://media.giphy.com/media/Od0QRnzwRBYmDU3eEO/giphy.gif' },
  { id: '10', title: 'Dancing', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { id: '11', title: 'GG', url: 'https://media.giphy.com/media/l41JRsph73VokN6ik/giphy.gif' },
  { id: '12', title: 'Love', url: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif' }
];

export default function StickersPopover({
  onSelectSticker,
  onClose
}: {
  onSelectSticker: (url: string) => void;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'stickers' | 'gifs'>('stickers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearchGiphy = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // Using public Giphy search endpoint with fallback
      const apiKey = 'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh'; // Standard Giphy public web API key
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=12&rating=g`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '68px',
        right: '20px',
        width: '320px',
        backgroundColor: '#1E2026',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '18px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
        padding: '14px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'fadeInUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#16171B',
          padding: '3px',
          borderRadius: '10px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('stickers')}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'stickers' ? '#2A2D3A' : 'transparent',
            color: activeTab === 'stickers' ? '#FFFFFF' : '#8E8E93',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🎴 Stickers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gifs')}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'gifs' ? '#2A2D3A' : 'transparent',
            color: activeTab === 'gifs' ? '#FFFFFF' : '#8E8E93',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🎬 Giphy GIFs
        </button>
      </div>

      {/* GIFs Search Input */}
      {activeTab === 'gifs' && (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchGiphy(e.target.value)}
            placeholder="Search Giphy..."
            style={{
              width: '100%',
              backgroundColor: '#16171B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '7px 10px 7px 32px',
              color: '#FFFFFF',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93' }} />
        </div>
      )}

      {/* Stickers Grid */}
      {activeTab === 'stickers' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            maxHeight: '220px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}
        >
          {CURATED_STICKERS.map((stk) => (
            <button
              key={stk.id}
              type="button"
              onClick={() => onSelectSticker(stk.url)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'transform 0.12s ease, background-color 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <img
                src={stk.url}
                alt={stk.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : (
        /* GIFs Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            maxHeight: '220px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}
        >
          {searchResults.length > 0 ? (
            searchResults.map((gif: any) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => onSelectSticker(gif.images?.fixed_height?.url || gif.images?.original?.url)}
                style={{
                  height: '90px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#16171B',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <img
                  src={gif.images?.fixed_height_small?.url || gif.images?.fixed_height?.url}
                  alt="GIF"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </button>
            ))
          ) : (
            CURATED_STICKERS.slice(0, 6).map((stk) => (
              <button
                key={stk.id}
                type="button"
                onClick={() => onSelectSticker(stk.url)}
                style={{
                  height: '90px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#16171B',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <img
                  src={stk.url}
                  alt={stk.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
