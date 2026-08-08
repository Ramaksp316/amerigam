'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Play, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

export default function BuilderClient({ initialModel }: { initialModel: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialModel.name);

  // Map backend nodes to ReactFlow nodes
  const initialNodes = initialModel.nodes.map((n: any) => ({
    id: n.id,
    type: 'default',
    position: { x: n.positionX, y: n.positionY },
    data: { 
      label: (
        <div style={{ padding: '10px' }}>
          <strong>{n.name}</strong>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px' }}>Type: {n.type}</div>
        </div>
      )
    },
    // Keep raw data for saving
    backendData: n
  }));

  // Map backend connections to ReactFlow edges
  const initialEdges = initialModel.connections.map((c: any) => ({
    id: c.id,
    source: c.sourceId,
    target: c.targetId,
    label: c.condition || undefined,
    animated: true,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const handleSave = async () => {
    setSaving(true);
    
    // Convert back to backend format
    const backendNodes = nodes.map(n => ({
      id: n.id,
      type: n.backendData?.type || 'STAGE',
      name: n.backendData?.name || 'New Stage',
      config: n.backendData?.config || {},
      positionX: n.position.x,
      positionY: n.position.y
    }));

    const backendConnections = edges.map(e => ({
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      condition: e.label || null
    }));

    try {
      const res = await fetch(`/api/engine/models/${initialModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nodes: backendNodes,
          connections: backendConnections
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Model saved successfully!');
    } catch (err) {
      alert('Error saving model');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish? You cannot modify structural nodes after publishing. (You can clone it later)')) return;
    setSaving(true);
    
    // First save
    const backendNodes = nodes.map(n => ({
      id: n.id,
      type: n.backendData?.type || 'STAGE',
      name: n.backendData?.name || 'New Stage',
      config: n.backendData?.config || {},
      positionX: n.position.x,
      positionY: n.position.y
    }));

    const backendConnections = edges.map(e => ({
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      condition: e.label || null
    }));

    try {
      const res = await fetch(`/api/engine/models/${initialModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nodes: backendNodes,
          connections: backendConnections,
          isPublished: true
        })
      });
      if (!res.ok) throw new Error('Failed to publish');
      alert('Model Published successfully!');
      router.refresh(); // Refresh to show Published badge
    } catch (err) {
      alert('Error publishing model');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: (
          <div style={{ padding: '10px' }}>
            <strong>New Stage</strong>
            <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px' }}>Type: MATCH</div>
          </div>
        )
      },
      backendData: { type: 'MATCH', name: 'New Stage', config: {} }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-1)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/engine/models" className="btn btn-small btn-outline" style={{ padding: '6px' }}>
            <ArrowLeft size={16} />
          </Link>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 800, width: '300px' }}
          />
          {initialModel.isPublished && <span style={{ fontSize: '0.7rem', background: 'var(--success)', color: '#000', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>PUBLISHED</span>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!initialModel.isPublished && (
            <button onClick={handlePublish} disabled={saving} className="btn btn-small btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--success)', color: '#000' }}>
              Publish
            </button>
          )}
          <button onClick={handleAddNode} disabled={initialModel.isPublished} className="btn btn-small btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Plus size={16} /> Add Stage
          </button>
          <button onClick={handleSave} disabled={saving || initialModel.isPublished} className="btn btn-small btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Controls />
          <MiniMap zoomable pannable nodeColor="#4f46e5" maskColor="rgba(0,0,0,0.5)" />
          <Background color="#333" gap={16} />
        </ReactFlow>
      </div>

    </div>
  );
}
