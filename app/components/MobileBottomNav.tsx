import Link from 'next/link';
import { Home, MessageCircle, Trophy, BarChart2, Plus } from 'lucide-react';

export default function MobileBottomNav() {
  return (
    <div className="mobile-bottom-nav">
      <Link href="/feed" className="nav-item active">
        <Home size={24} strokeWidth={2.5} />
        <span>Home</span>
      </Link>
      
      <Link href="/messages" className="nav-item">
        <MessageCircle size={24} color="#71717A" />
        <span style={{ color: '#71717A' }}>Messages</span>
      </Link>
      
      <div className="nav-item-center">
        <Link href="/create" className="create-btn">
          <Plus size={32} color="black" strokeWidth={2.5} />
        </Link>
      </div>
      
      <Link href="/competitions" className="nav-item">
        <Trophy size={24} color="#71717A" />
        <span style={{ color: '#71717A' }}>Competitions</span>
      </Link>
      
      <Link href="/ranking" className="nav-item">
        <BarChart2 size={24} color="#71717A" />
        <span style={{ color: '#71717A' }}>Your Ranking</span>
      </Link>
    </div>
  );
}
