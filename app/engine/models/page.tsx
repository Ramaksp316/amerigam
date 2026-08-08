'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Settings, Play, ArrowRight, GitBranch } from 'lucide-react';

export default function CompetitionModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/engine/models')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setModels(data);
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/engine/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Competition Model', description: 'Describe how the competition works.' })
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/engine/models/${data.id}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating model');
    } finally {
      setCreating(false);
    }
  };

  const handleLaunch = async (modelId: string, modelName: string) => {
    const compName = prompt(`Enter a name for your new competition based on "${modelName}":`, `${modelName} - Season 1`);
    if (!compName) return;

    try {
      const res = await fetch('/api/engine/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, name: compName, description: 'Launched from ' + modelName })
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/engine/competitions/${data.id}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error launching competition');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="heading-jakaas" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-2) 0' }}>
            <GitBranch size={32} color="var(--accent-teal)" style={{ filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.5))' }} /> 
            COMPETITION ENGINE
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Design dynamic competition blueprints and execution logic.</p>
        </div>
        <button 
          onClick={handleCreate} 
          disabled={creating}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} /> {creating ? 'Creating...' : 'New Model'}
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading models...</p>
      ) : models.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <GitBranch size={48} color="var(--text-muted)" style={{ margin: '0 auto var(--space-4) auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>No Models Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Create a competition blueprint to define rules, stages, and advancement logic.</p>
          <button onClick={handleCreate} className="btn btn-primary">Create First Model</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {models.map(model => (
            <div key={model.id} className="glass-card hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{model.name}</h3>
                {model.isPublished && (
                  <span style={{ fontSize: '0.7rem', background: 'var(--success)', color: '#000', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>PUBLISHED</span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-4)', flex: 1 }}>
                {model.description || 'No description provided.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
                <span>v{model.version}</span>
                <span>{model._count.nodes} Nodes</span>
                <span>{model._count.competitions} Active</span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Link href={`/engine/models/${model.id}`} className="btn btn-small btn-outline" style={{ flex: 1, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Settings size={14} /> Builder
                </Link>
                {model.isPublished && (
                  <button 
                    onClick={() => handleLaunch(model.id, model.name)}
                    className="btn btn-small btn-primary" 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }} 
                    title="Launch a competition using this model"
                  >
                    <Play size={14} /> Launch
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
