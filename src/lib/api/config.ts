// FinoTicket V1 — API mode configuration
// VITE_API_MODE=live  → real Laravel /api/v1
// VITE_API_MODE=mock  → in-memory mockStore (default; keeps GitHub Pages demo working)

export type ApiMode = 'live' | 'mock';

/**
 * Set to true by the embed bundle (see src/embed/boot.ts).
 *
 * An embedded console ALWAYS runs against a real API: the host has explicitly
 * wired an `api-base` and minted a token, so falling back to the in-memory mock
 * store would silently show fictional tickets inside a customer's own site.
 * That is a correctness bug, not a convenience — so the embed overrides the
 * build-time default rather than inheriting it.
 */
let forceLive = false;

/** Called once by the embed bootstrap. */
export function setForceLive(value: boolean): void {
  forceLive = value;
}

function readEnv(key: string): string | undefined {
  if (typeof import.meta === 'undefined') return undefined;
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.[key];
}

export function resolveApiMode(): ApiMode {
  if (forceLive) return 'live';

  const raw = (readEnv('VITE_API_MODE') ?? 'mock').trim().toLowerCase();
  return raw === 'live' ? 'live' : 'mock';
}

/** True when the SPA should talk to the real backend. */
export function isLiveMode(): boolean {
  return resolveApiMode() === 'live';
}

/** True when running against the in-memory mock store. */
export function isMockMode(): boolean {
  return resolveApiMode() === 'mock';
}

export const DEMO_CLIENT = {
  clientId: readEnv('VITE_API_CLIENT_ID') ?? 'ft_demo_client',
  clientSecret: readEnv('VITE_API_CLIENT_SECRET') ?? 'ft_demo_secret_change_me',
};
