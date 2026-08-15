'use client';

import { useEffect, useState } from 'react';

export default function LocalTime({ date, format = 'full' }: { date: Date | string, format?: 'full' | 'time' | 'date' | 'relative' }) {
  const [mounted, setMounted] = useState(false);
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    setMounted(true);
    const d = new Date(date);
    
    if (format === 'relative') {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      const diffWeek = Math.floor(diffDay / 7);
      const diffMonth = Math.floor(diffDay / 30);
      const diffYear = Math.floor(diffDay / 365);

      if (diffSec < 60) {
        setFormatted(`${diffSec}s`);
      } else if (diffMin < 60) {
        setFormatted(`${diffMin}m`);
      } else if (diffHour < 24) {
        setFormatted(`${diffHour}h`);
      } else if (diffDay < 7) {
        setFormatted(`${diffDay}d`);
      } else if (diffWeek < 4) {
        setFormatted(`${diffWeek}w`);
      } else if (diffMonth < 12) {
        setFormatted(`${diffMonth}mo`);
      } else {
        setFormatted(`${diffYear}y`);
      }
    } else if (format === 'time') {
      setFormatted(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else if (format === 'date') {
      setFormatted(d.toLocaleDateString());
    } else {
      setFormatted(`${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }
  }, [date, format]);

  if (!mounted) {
    // Avoid hydration mismatch by rendering nothing or a placeholder initially
    return <span>...</span>;
  }

  return <span>{formatted}</span>;
}
