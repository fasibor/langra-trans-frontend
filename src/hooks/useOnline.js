import { useState, useEffect } from 'react';

/**
 * useOnline — tracks browser network connectivity.
 * Shows a toast banner when the user goes offline / comes back online.
 *
 * Returns: boolean (true = online)
 */
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
