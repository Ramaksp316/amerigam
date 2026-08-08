'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Activity, GitBranch } from 'lucide-react';

export default function CompetitionsListPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/engine/competitions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCompetitions(data);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="heading-jakaas" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-2) 0' }}>
            <Activity size={32} color="var(--success)" style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }} /> 
            LIVE COMPETITIONS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Execute and manage active competitions.</p>
        </div>
        <Link href="/engine/models" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <GitBranch size={18} /> Manage Models
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading live competitions...</p>
      ) : competitions.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <Activity size={48} color="var(--text-muted)" style={{ margin: '0 auto var(--space-4) auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>No Live Competitions</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Launch a competition from one of your Published Models.</p>
          <Link href="/engine/models" className="btn btn-primary">Go to Models</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {competitions.map(comp => (
            <div key={comp.id} className="glass-card hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-5)', borderLeft: comp.state === 'ACTIVE' ? '4px solid var(--success)' : '4px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{comp.name}</h3>
                <span style={{ fontSize: '0.7rem', background: comp.state === 'ACTIVE' ? 'var(--success)' : 'var(--surface-2)', color: comp.state === 'ACTIVE' ? '#000' : 'var(--text-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                  {comp.state}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-4)', flex: 1 }}>
                Model: {comp.model?.name} (v{comp.model?.version})
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
                <span>ID: {comp.competitionId.substring(0,8)}</span>
                <span>{comp._count.entities} Participants</span>
                <span>{comp._count.stages} Stages</span>
              </div>

              <Link href={`/engine/competitions/${comp.id}`} className="btn btn-small btn-primary" style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
                Open Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
