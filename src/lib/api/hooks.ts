// FinoTicket V1 — async data hooks
// Bridge between the promise-based DataApi and React components.
// In mock mode values resolve immediately (one microtask), so existing pages
// keep their synchronous feel; in live mode they render real loading states.

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDataApi, type DataApi } from './dataApi';
import { isLiveMode } from './config';
import { mockStore, useMockStore } from './mockStore';
import { ApiError } from './http';

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: ApiError | Error | null;
  reload: () => void;
}

/**
 * Run an async data fetch with loading/error tracking and stale-response guard.
 * `deps` controls re-fetching, mirroring `useEffect` semantics.
 */
export function useAsyncData<T>(
  loader: (api: DataApi) => Promise<T>,
  initial: T,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const current = ++requestId.current;
    let cancelled = false;

    setLoading(true);
    setError(null);

    loaderRef
      .current(getDataApi())
      .then((result) => {
        // Ignore out-of-order responses so fast filter changes can't overwrite.
        if (cancelled || current !== requestId.current) return;
        setData(result);
      })
      .catch((err) => {
        if (cancelled || current !== requestId.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (cancelled || current !== requestId.current) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { data, loading, error, reload };
}

/** Convenience wrapper for list endpoints. */
export function useTickets() {
  const api = getDataApi();
  return useAsyncData((dataApi) => dataApi.tickets.list(), [] as Awaited<ReturnType<DataApi['tickets']['list']>>, [api.mode]);
}

/**
 * Load a collection in live mode, or read the mock store synchronously in mock
 * mode. Keeps existing mock-backed pages unchanged while making them live.
 *
 * @param mockReader   reads the current value from the mock store
 * @param liveLoader   fetches the same collection from the API
 * @param deps         extra dependencies that should trigger a re-fetch
 *                     (e.g. a selected parent id for cascading selectors)
 */
export function useCollection<T>(
  mockReader: () => T,
  liveLoader: (api: DataApi) => Promise<T>,
  deps: unknown[] = [],
): { data: T; loading: boolean; error: Error | null; reload: () => void; mode: 'live' | 'mock' } {
  const live = isLiveMode();
  const api = getDataApi();

  // Mock mode: stay reactive through the store subscription.
  useMockStore();

  const state = useAsyncData<T>(
    (dataApi) => (live ? liveLoader(dataApi) : Promise.resolve(mockReader())),
    live ? ([] as unknown as T) : mockReader(),
    [live, api.mode, ...deps],
  );

  // In mock mode the mockStore subscription above already triggers re-renders,
  // so prefer the freshest synchronous read.
  const data = live ? state.data : mockReader();

  return {
    data,
    loading: live ? state.loading : false,
    error: state.error,
    reload: state.reload,
    mode: api.mode,
  };
}

/** Loading and error surface used by pages in live mode. */
export function describeError(error: ApiError | Error | null): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'network':
        return 'Cannot reach the API. Check that the backend is running and VITE_API_BASE_URL is correct.';
      case 'unauthorized':
        return 'Your session has expired. Please sign in again.';
      case 'forbidden':
        return 'You do not have permission to view this resource.';
      case 'not_found':
        return 'The requested resource was not found.';
      case 'validation':
        return error.message || 'The submitted data is invalid.';
      case 'rate_limited':
        return `Too many requests. Retry in ${error.retryAfterSeconds ?? 30}s.`;
      case 'server':
        return 'The server encountered an error. Please try again.';
      default:
        return error.message;
    }
  }
  return error.message;
}
