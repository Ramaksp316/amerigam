'use client';

import { useEffect } from 'react';
import { pingActiveStatus } from '../actions/activeStatus';

export default function ActiveStatusTracker({ userId }: { userId: string | undefined }) {
  useEffect(() => {
    if (!userId) return;

    // Ping immediately on mount
    pingActiveStatus(userId);

    // Update status every 45 seconds
    const interval = setInterval(() => {
      pingActiveStatus(userId);
    }, 45 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  return null;
}
