'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Trophy, BarChart2, Plus } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/feed') {
      return pathname === '/feed' || pathname === '/';
    }
    return pathname?.startsWith(route);
  };

  return (
    <div className="mobile-bottom-nav">
      <Link href="/feed" className={`nav-item ${isActive('/feed') ? 'active' : ''}`} prefetch={true}>
        <Home size={26} strokeWidth={isActive('/feed') ? 2.5 : 2} />
        <span>Home</span>
      </Link>
      
      <Link href="/messages" className={`nav-item ${isActive('/messages') ? 'active' : ''}`} prefetch={true}>
        <MessageCircle size={26} strokeWidth={isActive('/messages') ? 2.5 : 2} />
        <span>Messages</span>
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
