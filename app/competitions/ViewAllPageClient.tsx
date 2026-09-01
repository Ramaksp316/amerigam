'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import CompetitionCard from './components/CompetitionCard'; 

export default function ViewAllPageClient({ title, events, registeredEventIds }: { title: string, events: any[], registeredEventIds: string[] }) {
  const router = useRouter();

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#000000', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#000000', borderBottom: '1px solid #1F1F22' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FFF', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: 0, paddingRight: '32px' }}>{title}</h1>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#A1A1AA', fontSize: '14px' }}>
            No competitions found in this category.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((event) => (
              <CompetitionCard key={event.id} event={event} layout="horizontal-split" isRegistered={registeredEventIds.includes(event.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
