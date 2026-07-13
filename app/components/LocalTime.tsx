'use client';

import { useEffect, useState } from 'react';

export default function LocalTime({ date, format = 'full' }: { date: Date | string, format?: 'full' | 'time' | 'date' }) {
  const [mounted, setMounted] = useState(false);
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    setMounted(true);
    const d = new Date(date);
    if (format === 'time') {
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
