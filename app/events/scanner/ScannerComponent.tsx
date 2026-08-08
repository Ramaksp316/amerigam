'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function ScannerComponent() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: {width: 250, height: 250}, rememberLastUsedCamera: true },
      /* verbose= */ false
    );
    
    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string, decodedResult: any) {
    if (!scanning) return; // Prevent multiple scans
    
    // Pause scanner
    setScanning(false);
    if (scannerRef.current) {
        scannerRef.current.pause(true);
    }

    try {
      const res = await fetch('/api/events/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: decodedText, gateInfo: 'Main Gate' })
      });
      
      const data = await res.json();
      setScanResult({
        status: res.status,
        data
      });
    } catch (err) {
      setScanResult({
        status: 500,
        data: { error: 'Network Error' }
      });
    }
  }

  function onScanFailure(error: any) {
    // ignore background scanning errors
  }

  function resumeScanning() {
    setScanResult(null);
    setScanning(true);
    if (scannerRef.current) {
        scannerRef.current.resume();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* Scanner Box */}
      <div 
        id="qr-reader" 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          margin: '0 auto', 
          borderRadius: 'var(--radius-lg)', 
          overflow: 'hidden',
          border: '2px solid var(--border-color)',
          background: '#000'
        }} 
      />

      {/* Result Card */}
      {scanResult && (
        <div className="glass-card" style={{ 
          borderLeft: scanResult.data.success ? '4px solid var(--success)' : 
                     scanResult.data.alreadyCheckedIn ? '4px solid var(--accent-amber)' : 
                     '4px solid var(--danger)',
          textAlign: 'center',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            {scanResult.data.success ? (
              <CheckCircle size={64} color="var(--success)" />
            ) : scanResult.data.alreadyCheckedIn ? (
              <AlertTriangle size={64} color="var(--accent-amber)" />
            ) : (
              <XCircle size={64} color="var(--danger)" />
            )}
          </div>

          <h2 style={{ 
            fontSize: '2rem', 
            margin: '0 0 var(--space-2) 0',
            color: scanResult.data.success ? 'var(--success)' : 
                   scanResult.data.alreadyCheckedIn ? 'var(--accent-amber)' : 'var(--danger)'
          }}>
            {scanResult.data.message || scanResult.data.error}
          </h2>

          {scanResult.data.participant && (
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--surface-1)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>{scanResult.data.participant.name}</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{scanResult.data.participant.amerigamId}</p>
              
              {scanResult.data.alreadyCheckedIn && (
                <p style={{ margin: 'var(--space-2) 0 0 0', fontSize: '0.9rem', color: 'var(--accent-amber)' }}>
                  Scanned at: {new Date(scanResult.data.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          <button onClick={resumeScanning} className="btn btn-primary" style={{ marginTop: 'var(--space-6)', width: '100%' }}>
            Scan Next Person
          </button>
        </div>
      )}
    </div>
  );
}
