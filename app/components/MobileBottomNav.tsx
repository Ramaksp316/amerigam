'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageCircle, Trophy, BarChart2, Plus, PenTool, Clapperboard, Aperture, Target, Users } from 'lucide-react';

export default function MobileBottomNav({ currentUser }: { currentUser?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (route: string) => {
    if (route === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname?.startsWith(route);
  };

  if (pathname?.startsWith('/messages/') && pathname !== '/messages/') {
    return null;
  }

  const options = [
    { id: 'post', icon: PenTool, label: 'Post', href: '/create?type=post', bg: 'linear-gradient(135deg, #8B5CF6, #6366F1)' },
    { id: 'reel', icon: Clapperboard, label: 'Reel', href: '/create?type=reel', bg: 'linear-gradient(135deg, #10B981, #059669)' },
    { id: 'story', icon: Aperture, label: 'Story', href: '/create?type=story', bg: 'linear-gradient(135deg, #F59E0B, #EA580C)' },
    { id: 'community', icon: Users, label: 'Community', href: '/create?type=community', bg: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }
  ];

  if (currentUser?.accountType === 'ORGANIZATION') {
    options.push({ id: 'competition', icon: Target, label: 'Compete', href: '/create?type=competition', bg: 'linear-gradient(135deg, #EC4899, #E11D48)' });
  }

  const radius = 95; // Distance from the center of the plus button
  
  const getOptionStyle = (index: number, total: number) => {
    const step = 180 / (total + 1);
    const angleDeg = 180 - step * (index + 1);
    const angleRad = (angleDeg * Math.PI) / 180;
    
    const x = Math.cos(angleRad) * radius;
    const y = -Math.sin(angleRad) * radius; 

    const isHovered = hoveredOption === options[index].id;

    return {
      transform: isMenuOpen ? `translate(${x}px, ${y}px) scale(${isHovered ? 1.3 : 1})` : `translate(0px, 0px) scale(0.3)`,
      opacity: isMenuOpen ? 1 : 0,
      transition: isMenuOpen 
        ? `transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${isHovered ? '0s' : `${index * 0.04}s`}, opacity 0.3s ${index * 0.04}s, box-shadow 0.25s`
        : `transform 0.2s ease-in, opacity 0.2s ease-in`,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: options[index].bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.7)' : '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: isHovered ? 10001 : 10000,
      color: 'white',
      pointerEvents: isMenuOpen ? 'auto' as const : 'none' as const
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    // Start long press timer for drag interaction
    pressTimer.current = setTimeout(() => {
      setIsMenuOpen(true);
    }, 400); // 400ms is standard for UI long-press (2 seconds feels unresponsive)
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMenuOpen) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const radialOption = el?.closest('.radial-option');
    if (radialOption) {
      setHoveredOption(radialOption.getAttribute('data-id'));
    } else {
      setHoveredOption(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (hoveredOption) {
      const option = options.find(o => o.id === hoveredOption);
      if (option) {
        if (option.id === 'reel') {
          alert("This feature is coming soon");
          setIsMenuOpen(false);
        } else {
          router.push(option.href);
        }
      }
    }
    
    // If it was just a quick tap and menu didn't open yet, toggle it
    if (!isMenuOpen) {
      // The onClick handler will catch this, or we can just do it here:
    } else {
      // If we released while open (and maybe didn't select anything), close it
      if (!hoveredOption) {
        setIsMenuOpen(false);
      }
    }
    setHoveredOption(null);
  };

  return (
    <>
      {isMenuOpen && (
        <div
          className="radial-overlay"
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            // z-index below bottom nav so it doesn't blur the nav items and options
            zIndex: 900, 
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      <div className={`mobile-bottom-nav ${isMenuOpen ? 'nav-blurred' : ''}`}>
        <Link href="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`} prefetch={true}>
          <Home size={26} strokeWidth={isActive('/home') ? 2.5 : 2} />
          <span>Home</span>
        </Link>
        
        <Link href="/messages" className={`nav-item ${isActive('/messages') ? 'active' : ''}`} prefetch={true}>
          <MessageCircle size={26} strokeWidth={isActive('/messages') ? 2.5 : 2} />
          <span>Messages</span>
        </Link>
        
        <div className="nav-item-center" style={{ position: 'relative', zIndex: 1000 }}>
          {/* Radial Options Wrapper */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '56px', height: '56px', zIndex: 9999 }}>
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="radial-option"
                  data-id={option.id}
                  style={getOptionStyle(index, options.length)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (option.id === 'reel') {
                      alert("This feature is coming soon");
                    } else {
                      router.push(option.href);
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              );
            })}
          </div>

          <button 
            className="create-btn"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              handlePointerUp(e);
            }}
            onClick={() => {
              // Toggle menu on a simple tap
              setIsMenuOpen(!isMenuOpen);
            }}
            style={{
              background: 'var(--accent-blue)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              padding: 0,
              boxShadow: isMenuOpen ? '0 0 24px rgba(59, 130, 246, 0.7)' : '0 4px 12px rgba(59, 130, 246, 0.4)',
              zIndex: 10000,
              position: 'relative',
              transition: 'all 0.3s ease',
              touchAction: 'none'
            }}
          >
            <Plus size={32} color="#ffffff" strokeWidth={2.5} style={{
              transform: isMenuOpen ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </button>
        </div>
        
        <Link href="/competitions" className={`nav-item ${isActive('/competitions') ? 'active' : ''}`} prefetch={true}>
          <Trophy size={26} strokeWidth={isActive('/competitions') ? 2.5 : 2} />
          <span>Competitions</span>
        </Link>
        
        <Link href="/ranking" className={`nav-item ${isActive('/ranking') ? 'active' : ''}`} prefetch={true}>
          <BarChart2 size={26} strokeWidth={isActive('/ranking') ? 2.5 : 2} />
          <span>Ranking</span>
        </Link>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .nav-blurred .nav-item {
          filter: blur(4px);
          opacity: 0.5;
          pointer-events: none;
        }
        .nav-item {
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        .radial-option {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
