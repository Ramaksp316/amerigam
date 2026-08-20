'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, Trophy, BarChart2, Plus } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname?.startsWith(route);
  };

  return (
    <div className="mobile-bottom-nav">
      <Link href="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`} prefetch={true}>
        <Home size={26} strokeWidth={isActive('/home') ? 2.5 : 2} />
        <span>Home</span>
      </Link>
      
      <Link href="/feed" className={`nav-item ${isActive('/feed') ? 'active' : ''}`} prefetch={true}>
        <PlaySquare size={26} strokeWidth={isActive('/feed') ? 2.5 : 2} />
        <span>Feed</span>
      </Link>
      
      <div className="nav-item-center">
        <Link href="/create" className="create-btn">
          <Plus size={32} color="#000000" strokeWidth={2.5} />
        </Link>
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
  );
}
