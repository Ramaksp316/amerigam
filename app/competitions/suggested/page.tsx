import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ViewAllPage() {
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', padding: '20px', color: '#FFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/competitions" style={{ color: '#FFF' }}>
          <ArrowLeft size={24} />
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>View All</h1>
      </div>
      <div style={{ color: '#A1A1AA' }}>
        This page will contain the full list of competitions. Coming soon.
      </div>
    </div>
  );
}
