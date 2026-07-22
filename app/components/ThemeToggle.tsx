'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      style={{
        background: 'none',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        width: '100%',
        transition: 'all var(--duration-normal) var(--ease-smooth)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        fontFamily: 'var(--font-family)',
      }}
      aria-label="Toggle Dark Mode"
    >
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'transform var(--duration-normal) var(--ease-spring)',
        transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)',
      }}>
        {theme === 'dark' ? <Moon size={18} color="var(--accent-purple)" /> : <Sun size={18} color="var(--accent-amber)" />}
      </span>
      <span className="text">
        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
}
