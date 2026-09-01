'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Users, Globe, Trophy, Settings, HelpCircle, Info, LogOut, ChevronRight, Film } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

export default function MobileDrawer({ currentUser, joinedCommunities = [], networkUsers = [] }: { currentUser: any, joinedCommunities?: any[], networkUsers?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Handle swipe gestures
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX) return;
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;

      const xDiff = touchEndX - touchStartX;
      const yDiff = touchEndY - touchStartY;

      // Swipe right to open ONLY if gesture started in the top header area (e.g. Y < 90px)
      if (!isOpen && Math.abs(xDiff) > Math.abs(yDiff) * 1.2 && xDiff > 35 && touchStartY < 90) {
        setIsOpen(true);
        touchStartX = 0;
      }
      
      // Swipe left to close
      if (isOpen && Math.abs(xDiff) > Math.abs(yDiff) && xDiff < -50) {
        setIsOpen(false);
        touchStartX = 0;
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen]);

  // Close when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    color: '#F4F4F5',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 500,
  };

  const secondaryItemStyle = {
    ...navItemStyle,
    color: '#A1A1AA',
    fontSize: '15px',
    padding: '14px 20px',
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 99998
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0, left: 0, bottom: 0,
                width: '80vw',
                maxWidth: '320px',
                backgroundColor: '#000000',
                borderRight: '1px solid #27272A',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}
            >
              {/* Header Logo */}
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <Image 
                  src="/logo-new.jpg" 
                  alt="Amerigam" 
                  width={40} 
                  height={40} 
                  style={{ objectFit: 'contain', mixBlendMode: 'screen' }} 
                />
              </div>

              {/* Profile Section */}
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '20px',
                  gap: '16px'
                }}>
                  <ProfilePicture user={currentUser} size={50} showStatus={false} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 600 }}>
                      {currentUser?.name || currentUser?.username || 'Your Name'}
                    </div>
                    <div style={{ color: '#A1A1AA', fontSize: '14px', marginTop: '2px' }}>
                      View your profile
                    </div>
                  </div>
                  <ChevronRight size={20} color="#A1A1AA" />
                </div>
              </Link>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#27272A', margin: '0 20px 10px 20px' }} />

              {/* Main Links */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href="/home" style={navItemStyle}>
                  <Home size={24} color="#F4F4F5" /> Home
                </Link>
                <Link href="/feed" style={navItemStyle}>
                  <Film size={24} color="#F4F4F5" /> Feed
                </Link>
                <Link href="/communities" style={navItemStyle}>
                  <Users size={24} color="#F4F4F5" /> Communities
                </Link>
                <Link href="/network" style={navItemStyle}>
                  <Globe size={24} color="#F4F4F5" /> Network
                </Link>
                <Link href="/ranking" style={navItemStyle}>
                  <Trophy size={24} color="#F4F4F5" /> Leader
                </Link>

                {/* COMMUNITIES PREVIEW */}
                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#71717A', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Communities</div>
                  {joinedCommunities && joinedCommunities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {joinedCommunities.map((cm: any) => (
                        <Link key={cm.community.id} href={`/communities/${cm.community.id}`} onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <Users size={14} color="#A1A1AA" />
                          </div>
                          <span style={{ color: '#F4F4F5', fontSize: '16px', fontWeight: 500 }}>{cm.community.name}</span>
                        </Link>
                      ))}
                      <Link href="/communities" onClick={() => setIsOpen(false)} style={{ color: '#1D9BF0', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>View All</Link>
                    </div>
                  ) : (
                    <Link href="/communities?tab=foryou" onClick={() => setIsOpen(false)} style={{ color: '#1D9BF0', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Discover Communities</Link>
                  )}
                </div>

                {/* NETWORK PREVIEW */}
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#71717A', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Network</div>
                  {networkUsers && networkUsers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {networkUsers.map((nu: any) => (
                        <Link key={nu.following.id} href={`/user/${nu.following.id}`} onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden' }}>
                            {nu.following.profilePictureUrl ? <img src={nu.following.profilePictureUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                          </div>
                          <span style={{ color: '#F4F4F5', fontSize: '16px', fontWeight: 500 }}>{nu.following.name || nu.following.username}</span>
                        </Link>
                      ))}
                      <Link href="/network" onClick={() => setIsOpen(false)} style={{ color: '#1D9BF0', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>View All</Link>
                    </div>
                  ) : (
                    <Link href="/network?tab=foryou" onClick={() => setIsOpen(false)} style={{ color: '#1D9BF0', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>Find people in your field</Link>
                  )}
                </div>

              </div>

              <div style={{ flex: 1 }} />

              {/* Secondary Links */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
                <div style={secondaryItemStyle}>
                  <Settings size={20} /> Settings
                </div>
                <div style={secondaryItemStyle}>
                  <HelpCircle size={20} /> Help & Support
                </div>
                <div style={secondaryItemStyle}>
                  <Info size={20} /> About Us
                </div>
              </div>

              {/* Logout Button (Simple, Red) */}
              <Link href="/login" style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px',
                color: '#EF4444', 
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                marginTop: '10px'
              }}>
                <LogOut size={22} strokeWidth={2.5} /> Log Out
              </Link>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
