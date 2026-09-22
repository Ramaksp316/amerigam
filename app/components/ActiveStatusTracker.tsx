'use client';

import { useEffect, useRef } from 'react';
import { pingActiveStatus } from '../actions/activeStatus';

export default function ActiveStatusTracker({ userId }: { userId: string | undefined }) {
  const isPinging = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const checkAndPing = () => {
      if (isPinging.current) return;
      try {
        const lastPing = sessionStorage.getItem('amg_last_active_ping');
        const now = Date.now();
        // Only ping if at least 2 minutes (120 seconds) have passed
        if (!lastPing || now - Number(lastPing) > 120 * 1000) {
          sessionStorage.setItem('amg_last_active_ping', String(now));
          isPinging.current = true;
          pingActiveStatus(userId).finally(() => {
            isPinging.current = false;
          });
        }
      } catch (e) {}
    };

    // Check with slight delay so page navigation completes first without database lock
    const initialTimer = setTimeout(checkAndPing, 3000);
    const interval = setInterval(checkAndPing, 90 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [userId]);

  return null;
}
