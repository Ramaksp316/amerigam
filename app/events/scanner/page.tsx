import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ScannerComponent from './ScannerComponent';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export default async function ScannerPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-2) 0' }}>
          <Camera size={28} color="var(--accent-purple)" /> STAFF SCANNER
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Point camera at participant's QR Event Pass</p>
      </div>

      <ScannerComponent />
      
      <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
         <Link href="/competitions" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Exit Scanner</Link>
      </div>
    </div>
  );
}
