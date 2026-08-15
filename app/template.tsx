'use client';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition-enter" style={{ width: '100%', minHeight: '100%' }}>
      {children}
    </div>
  );
}
