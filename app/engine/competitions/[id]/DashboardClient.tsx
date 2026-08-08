'use client';

import Link from 'next/link';
import { ArrowLeft, Play, Users, GitBranch, CheckCircle, Activity, Award } from 'lucide-react';
import { advanceStage } from '../actions';
import { useState, useTransition } from 'react';

export default function DashboardClient({ competition }: { competition: any }) {
  const [isPending, startTransition] = useTransition();

  const handleAdvance = async (stageId: string) => {
    if (!confirm('Are you sure you want to advance this stage? Participants will be moved to the next connected stage based on the model rules.')) return;
    
    startTransition(async () => {
      const res = await advanceStage(competition.id, stageId);
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.error);
      }
    });
  };
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <Link href="/engine/competitions" className="btn btn-small btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <ArrowLeft size={16} /> Back to Live Events
          </Link>
          <h1 className="heading-jakaas" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-2) 0' }}>
            <Activity size={32} color="var(--success)" style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }} /> 
            {competition.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
            {competition.description} | Model: {competition.model.name} (v{competition.model.version})
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <span style={{ 
            fontSize: '1rem', fontWeight: 800, padding: '8px 16px', borderRadius: 'var(--radius-full)',
            background: competition.state === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)',
            color: competition.state === 'ACTIVE' ? 'var(--success)' : 'var(--accent-purple)'
          }}>
            {competition.state}
          </span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            ID: {competition.competitionId}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-6)' }}>
        
        {/* Main Stages Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <GitBranch size={20} /> Live Stages
          </h2>
          
          {competition.stages.map((stage: any) => (
            <div key={stage.id} className="glass-card" style={{ padding: 'var(--space-4)', borderLeft: stage.state === 'ACTIVE' || stage.state === 'IN_PROGRESS' ? '4px solid var(--success)' : '4px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{stage.node.name}</h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--surface-2)' }}>{stage.state}</span>
                  {(stage.state === 'READY' || stage.state === 'ACTIVE' || stage.state === 'WAITING_FOR_INPUTS') && (
                    <button 
                      onClick={() => handleAdvance(stage.id)} 
                      disabled={isPending}
                      className="btn btn-small btn-primary" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      {isPending ? 'Advancing...' : 'Advance Stage'}
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>Type: {stage.node.type}</p>
              
              {stage.matchups.length > 0 ? (
                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  {stage.matchups.map((m: any) => (
                    <div key={m.id} style={{ padding: 'var(--space-2)', background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem' }}>Match {m.matchupId.substring(0,8)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.state}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No active matchups.</p>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Users size={18} /> Participants ({competition.entities.length})
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {competition.entities.map((ent: any) => (
                <div key={ent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2)', background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.9rem' }}>{ent.type === 'USER' ? ent.user?.name : ent.team?.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ent.status}</span>
                </div>
              ))}
              {competition.entities.length === 0 && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No participants yet.</p>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Play size={18} /> Global Actions
            </h3>
            <button className="btn btn-outline" style={{ width: '100%', marginBottom: 'var(--space-2)' }}>Add Participant (Override)</button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To advance stages, use the buttons inside each Stage card.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
