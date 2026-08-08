'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Image as ImageIcon, FileText } from 'lucide-react';

export default function CertificateActions({ targetId, fileName }: { targetId: string, fileName: string }) {
  const [loading, setLoading] = useState<'png' | 'pdf' | null>(null);

  const handleDownloadPNG = async () => {
    setLoading('png');
    try {
      const element = document.getElementById(targetId);
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Failed to download image.');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setLoading('pdf');
    try {
      const element = document.getElementById(targetId);
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
      <button 
        onClick={handleDownloadPNG} 
        disabled={loading !== null}
        className="btn btn-outline" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--surface-1)' }}
      >
        <ImageIcon size={18} /> {loading === 'png' ? 'Generating...' : 'Download High-Res PNG'}
      </button>
      
      <button 
        onClick={handleDownloadPDF} 
        disabled={loading !== null}
        className="btn btn-primary" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
      >
        <FileText size={18} /> {loading === 'pdf' ? 'Generating...' : 'Download PDF Document'}
      </button>
    </div>
  );
}
