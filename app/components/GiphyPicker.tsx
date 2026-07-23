'use client';

import { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

// The API key provided by the user
const gf = new GiphyFetch('DKmTMFdLDt02eA4Z3n9kHksYoH83EasI');

export default function GiphyPicker({ onGifClick }: { onGifClick: (gifUrl: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Simple debounce for search
  let timeoutId: any;
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setDebouncedSearch(e.target.value);
    }, 500);
  };

  const fetchGifs = (offset: number) => {
    if (debouncedSearch) {
      return gf.search(debouncedSearch, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  return (
    <div style={{ width: '300px', height: '400px', background: 'var(--surface-1)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
        <input 
          type="text" 
          placeholder="Search GIFs..." 
          value={searchTerm}
          onChange={handleSearch}
          className="input-field"
          style={{ margin: 0, padding: '4px 8px', borderRadius: '4px', width: '100%' }}
        />
      </div>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px' }} className="giphy-grid-container">
        <Grid 
          key={debouncedSearch} // Re-mount grid when search changes
          width={280} 
          columns={2} 
          fetchGifs={fetchGifs} 
          onGifClick={(gif, e) => {
            e.preventDefault();
            onGifClick(gif.images.original.url);
          }} 
          noLink={true}
        />
      </div>
    </div>
  );
}
