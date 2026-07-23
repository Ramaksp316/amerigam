'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Trash2, Save, CornerDownRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { createNotebookPage, updateNotebookPage, deleteNotebookPage } from './actions';

export default function CommunityNotebook({
  community,
  userId
}: {
  community: any;
  userId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);

  // Notes array
  const notes = community.notes || [];

  // Editing state for the active notes in the current spread
  const [localTitles, setLocalTitles] = useState<Record<string, string>>({});
  const [localContents, setLocalContents] = useState<Record<string, string>>({});
  const [localPenColors, setLocalPenColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize local state for all notes
    const titles: Record<string, string> = {};
    const contents: Record<string, string> = {};
    const colors: Record<string, string> = {};
    notes.forEach((n: any) => {
      titles[n.id] = n.title;
      contents[n.id] = n.content;
      colors[n.id] = n.penColor;
    });
    setLocalTitles(titles);
    setLocalContents(contents);
    setLocalPenColors(colors);
  }, [notes]);

  const totalSpreads = Math.max(1, Math.ceil((notes.length + 1) / 2));

  // Determine what's on the left and right page of the current spread
  const getLeftPageNote = () => {
    if (currentSpread === 0) return null; // Spread 0 left is ALWAYS the Index
    const noteIndex = (currentSpread * 2) - 1;
    return notes[noteIndex] || null;
  };

  const getRightPageNote = () => {
    const noteIndex = currentSpread * 2;
    return notes[noteIndex] || null;
  };

  const leftNote = getLeftPageNote();
  const rightNote = getRightPageNote();

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentSpread < totalSpreads - 1) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread(prev => prev + 1);
        setIsFlipping(false);
      }, 400); // 400ms CSS transition
    } else if (direction === 'prev' && currentSpread > 0) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread(prev => prev - 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const jumpToNote = (noteId: string) => {
    const index = notes.findIndex((n: any) => n.id === noteId);
    if (index !== -1) {
      const spreadIndex = Math.floor((index + 1) / 2);
      if (spreadIndex !== currentSpread) {
        setFlipDirection(spreadIndex > currentSpread ? 'next' : 'prev');
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentSpread(spreadIndex);
          setIsFlipping(false);
        }, 400);
      }
    }
  };

  const handleAddPage = async () => {
    const newPage = await createNotebookPage(community.id);
    if (newPage) {
      router.refresh();
      // Jump to the new spread
      setTimeout(() => {
        const newTotalNotes = notes.length + 1;
        const newSpread = Math.floor((newTotalNotes) / 2);
        setCurrentSpread(newSpread);
      }, 500);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm("Are you sure you want to tear out this page?")) {
      await deleteNotebookPage(pageId, community.id);
      router.refresh();
      // Adjust spread if we delete the last item on the last spread
      if (currentSpread >= Math.ceil(notes.length / 2)) {
        setCurrentSpread(Math.max(0, currentSpread - 1));
      }
    }
  };

  const handleSave = async (noteId: string) => {
    setSaving(true);
    const formData = new FormData();
    formData.append('pageId', noteId);
    formData.append('communityId', community.id);
    formData.append('title', localTitles[noteId] || '');
    formData.append('content', localContents[noteId] || '');
    formData.append('penColor', localPenColors[noteId] || '#1e3a8a');

    await updateNotebookPage(formData);
    setSaving(false);
    router.refresh();
  };

  // --- Rendering Helpers ---
  const renderNoteEditor = (note: any, side: 'left' | 'right') => {
    if (!note) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontFamily: 'Georgia', fontSize: '2rem' }}>Blank Page</h2>
      </div>
    );

    const title = localTitles[note.id] ?? note.title;
    const content = localContents[note.id] ?? note.content;
    const penColor = localPenColors[note.id] ?? note.penColor;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setLocalTitles(prev => ({ ...prev, [note.id]: e.target.value }))}
            placeholder="Page Title"
            style={{
              fontSize: '1.4rem', fontFamily: 'Georgia', border: 'none', background: 'transparent',
              borderBottom: '2px dashed rgba(0,0,0,0.1)', color: '#3A271A', width: '60%', outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setLocalPenColors(prev => ({ ...prev, [note.id]: e.target.value }))}
              style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              title="Ink Color"
            />
            <button onClick={() => handleSave(note.id)} disabled={saving} className="btn-icon" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}>
              <Save size={16} />
            </button>
            <button onClick={() => handleDeletePage(note.id)} className="btn-icon" style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setLocalContents(prev => ({ ...prev, [note.id]: e.target.value }))}
          className="notebook-text notebook-rules"
          placeholder="Start writing your thoughts here..."
          style={{ flexGrow: 1, color: penColor }}
        />
        <div style={{ textAlign: side === 'left' ? 'left' : 'right', padding: '8px 0', fontSize: '12px', color: '#8B5A2B', fontFamily: 'Georgia' }}>
          Page {notes.findIndex((n: any) => n.id === note.id) + 1}
        </div>
      </div>
    );
  };

  const renderIndex = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #8B5A2B', paddingBottom: '12px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: '#3A271A', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
          Index
        </h2>
        <button
          onClick={handleAddPage}
          style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: '1px solid #8B5A2B', color: '#8B5A2B', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <Plus size={14} /> New Page
        </button>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#8B5A2B', opacity: 0.6 }}>
            <p style={{ fontFamily: 'Georgia', fontStyle: 'italic' }}>The notebook is empty. Write the first page!</p>
          </div>
        ) : (
          notes.map((page: any, idx: number) => (
            <div
              key={page.id}
              onClick={() => jumpToNote(page.id)}
              style={{ padding: '12px 16px', borderBottom: '1px dashed rgba(139, 90, 43, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 90, 43, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'Georgia', color: '#8B5A2B', fontWeight: 'bold' }}>{idx + 1}.</span>
                <span style={{ fontFamily: 'Georgia', fontSize: '1.1rem', color: '#3A271A' }}>
                  {page.title || 'Untitled Page'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-4)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap');
        
        .notebook-rules {
          background-color: transparent;
          background-image: linear-gradient(rgba(30, 58, 138, 0.1) 1px, transparent 1px);
          background-size: 100% 36px;
          line-height: 36px;
        }

        .notebook-text {
          font-family: 'Caveat', cursive;
          font-size: 24px;
          border: none;
          outline: none;
          width: 100%;
          resize: none;
        }

        .flip-container {
          perspective: 2000px;
          width: 100%;
          max-width: 1100px;
          height: 700px;
        }

        .book {
          width: 100%;
          height: 100%;
          display: flex;
          background: #2A190E;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          border: 10px solid #3E2515;
          position: relative;
        }
        
        .book-spine {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 40px;
          transform: translateX(-50%);
          background: linear-gradient(to right, #1a0f08, #3E2515, #1a0f08);
          z-index: 10;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }

        .page {
          flex: 1;
          background: #FAF6EE;
          position: relative;
          overflow: hidden;
          padding: 30px 40px;
          transition: transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        
        .page.left {
          border-right: 1px solid rgba(0,0,0,0.1);
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          box-shadow: inset -15px 0 20px -15px rgba(0,0,0,0.3);
          transform-origin: right center;
        }
        
        .page.right {
          border-left: 1px solid rgba(0,0,0,0.1);
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          box-shadow: inset 15px 0 20px -15px rgba(0,0,0,0.3);
          transform-origin: left center;
        }

        /* Flipping animations */
        .flipping-next .page.right {
          transform: rotateY(-90deg);
          opacity: 0.5;
        }
        .flipping-prev .page.left {
          transform: rotateY(90deg);
          opacity: 0.5;
        }
      `}} />

      {!isOpen ? (
        <div style={{
          maxWidth: '600px', width: '100%', height: '700px',
          background: 'linear-gradient(135deg, #4A2E1B 0%, #2A190E 100%)',
          borderRadius: '16px 24px 24px 16px',
          boxShadow: '20px 20px 40px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', transform: 'perspective(1500px) rotateY(-5deg)',
          transition: 'transform 0.5s ease', border: '2px solid #5C3D24', borderLeft: '25px solid #22130A'
        }}
        onClick={() => setIsOpen(true)}
        className="hover-card"
        >
          <div style={{
            width: '80%', background: '#FDFBF7', border: '6px double #4A2E1B',
            borderRadius: '8px', padding: '40px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}>
            <h1 style={{ fontFamily: 'Georgia, serif', color: '#4A2E1B', margin: 0, fontSize: '3rem', fontWeight: 800 }}>NOTEBOOK</h1>
            <div style={{ width: '80px', height: '4px', background: '#4A2E1B', margin: '20px auto' }}></div>
            <p style={{ fontFamily: 'sans-serif', textTransform: 'uppercase', fontSize: '1.2rem', color: '#8b5a2b', fontWeight: 700, letterSpacing: '4px' }}>
              {community.name}
            </p>
          </div>
          <div style={{ marginTop: '50px', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Click to Open Book</span>
            <BookOpen size={32} color="var(--accent-amber)" />
          </div>
        </div>
      ) : (
        <div className="flip-container">
          <div className={`book ${isFlipping ? (flipDirection === 'next' ? 'flipping-next' : 'flipping-prev') : ''}`}>
            
            {/* Left Page */}
            <div className="page left">
              {currentSpread === 0 ? renderIndex() : renderNoteEditor(leftNote, 'left')}
              
              {/* Prev Page Button */}
              {currentSpread > 0 && (
                <button 
                  onClick={() => handlePageTurn('prev')} 
                  disabled={isFlipping}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
                >
                  <ChevronLeft size={24} color="#8B5A2B" />
                </button>
              )}
            </div>

            <div className="book-spine"></div>

            {/* Right Page */}
            <div className="page right">
              {renderNoteEditor(rightNote, 'right')}
              
              {/* Next Page Button */}
              {currentSpread < totalSpreads - 1 && (
                <button 
                  onClick={() => handlePageTurn('next')}
                  disabled={isFlipping}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
                >
                  <ChevronRight size={24} color="#8B5A2B" />
                </button>
              )}
            </div>
            
            {/* Close Book Button */}
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', zIndex: 100 }}
            >
              Close Notebook
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
