'use client';

import { useState } from 'react';

const EMOJI_CATEGORIES = [
  {
    id: 'quick',
    name: 'Top',
    emojis: ['👋', '🔥', '👏', '🚀', '❤️', '😂', '👍', '✨', '🎯', '💯', '🙌', '😍', '🎉', '🤩', '🙏', '💡']
  },
  {
    id: 'smileys',
    name: 'Smiles',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥']
  },
  {
    id: 'gestures',
    name: 'Hands',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🤝']
  },
  {
    id: 'hearts',
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💖', '💗', '💓', '💞', '💕', '💌', '💘', '💝']
  },
  {
    id: 'party',
    name: 'Fun',
    emojis: ['🎉', '🎊', '🎈', '🍾', '🥂', '🍻', '🥳', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💥', '✨', '🎵', '🎶', '🕹️', '🎲']
  }
];

export default function EmojiPickerPopover({
  onSelect,
  onClose
}: {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState('quick');
  const [search, setSearch] = useState('');

  const currentCategory = EMOJI_CATEGORIES.find(c => c.id === activeTab) || EMOJI_CATEGORIES[0];

  const displayedEmojis = search.trim()
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis).filter((e, idx, arr) => arr.indexOf(e) === idx)
    : currentCategory.emojis;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '68px',
        right: '48px',
        width: '310px',
        backgroundColor: '#1E2026',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '18px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
        padding: '12px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animation: 'fadeInUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '8px'
        }}
      >
        {EMOJI_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => { setActiveTab(cat.id); setSearch(''); }}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '8px',
              color: activeTab === cat.id ? '#FFFFFF' : '#8E8E93',
              backgroundColor: activeTab === cat.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              fontSize: '12px',
              fontWeight: activeTab === cat.id ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Emojis */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          maxHeight: '180px',
          overflowY: 'auto',
          padding: '2px'
        }}
      >
        {displayedEmojis.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(emoji)}
            style={{
              fontSize: '22px',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.12s ease, transform 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
