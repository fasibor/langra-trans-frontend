import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useAsync — replaces the repeated useState/useEffect/loading/error pattern.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useAsync(() => bookingsAPI.getMine());
 *   const { data, loading, refetch } = useAsync(() => tripsAPI.getAvailable({ date }), [date]);
 *
 * @param {Function} asyncFn  - Function that returns a Promise (axios call)
 * @param {Array}    deps     - Re-run when these values change (like useEffect deps)
 * @param {object}   options
 *   @param {boolean} immediate  - Whether to run on mount (default: true)
 *   @param {*}       initialData - Initial value before first fetch
 */
export function useAsync(asyncFn, deps = [], { immediate = true, initialData = null } = {}) {
  const [data, setData]       = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);

  // Track whether component is still mounted to avoid setState on unmounted
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (mountedRef.current) {
        setData(result.data);
        setLoading(false);
      }
      return result.data;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
      }
      throw err;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * usePolling — runs useAsync on a timer interval.
 * Used on the booking detail page so passengers see confirmations without refreshing.
 *
 * @param {Function} asyncFn
 * @param {number}   intervalMs  - Polling interval in ms (default: 15000 = 15s)
 * @param {boolean}  active      - Only polls when true
 */
export function usePolling(asyncFn, deps = [], intervalMs = 15_000, active = true) {
  const { data, loading, error, refetch } = useAsync(asyncFn, deps);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => { refetch(); }, intervalMs);
    return () => clearInterval(timer);
  }, [active, intervalMs, refetch]);

  return { data, loading, error, refetch };
}
