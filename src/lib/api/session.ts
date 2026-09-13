// FinoTicket V1 — live session state
// Owns the OAuth2 access token, refresh-on-expiry, and the derived UI user.
// Kept framework-free so it is unit-testable and usable outside React.

import { createApiClient, type ApiClient } from './client';
import type { TokenResponse } from './dto';
import type { ConsoleType, PlatformRole, Presence, Role, User } from '../../types';

const STORAGE_KEY = 'finoticket.session.v1';
/** Refresh this many seconds before the token actually expires. */
const REFRESH_SKEW_SECONDS = 60;

export interface SessionSnapshot {
  token: string | null;
  expiresAt: number | null;
  scopes: string[];
  user: User | null;
}

export interface SessionCredentials {
  clientId: string;
  clientSecret: string;
  /** Which console the operator intends to use; drives the derived role. */
  console?: ConsoleType;
  displayName?: string;
  email?: string;
}

type Listener = () => void;

const EMPTY: SessionSnapshot = {
  token: null,
  expiresAt: null,
  scopes: [],
  user: null,
};

/**
 * Derive the UI user from the granted scopes.
 * The API is client-credentials based (no user record yet), so scopes are the
 * only honest source of authorisation level — see plan "Auth for the SPA".
 */
export function userFromScopes(
  scopes: string[],
  console: ConsoleType,
  identity: { displayName?: string; email?: string } = {},
): User {
  const has = (scope: string) => scopes.includes(scope);
  const canWrite = has('tickets:write') || has('customers:write') || has('events:write');

  const role: Role | PlatformRole =
    console === 'platform'
      ? 'PLATFORM_ADMIN'
      : canWrite
        ? 'ADMIN'
        : 'VIEWER';

  const id = `api-client:${console}`;
  const displayName =
    identity.displayName ??
    (console === 'platform' ? 'Platform Operator' : 'API Operator');

  return {
    id,
    tenant_id: console === 'platform' ? undefined : 'ten-1',
    console,
    email: identity.email ?? `${id}@finoticket.local`,
    display_name: displayName,
    role,
    presence: 'ONLINE' as Presence,
    timezone: 'Asia/Tehran',
    language: 'fa',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };
}

export class SessionStore {
  private snapshot: SessionSnapshot = EMPTY;
  private listeners = new Set<Listener>();
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private credentials: SessionCredentials | null = null;

  constructor() {
    this.snapshot = this.readStorage() ?? EMPTY;
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): SessionSnapshot => this.snapshot;

  getToken = (): string | null => this.snapshot.token;

  isAuthenticated = (): boolean => Boolean(this.snapshot.token);

  private notify() {
    this.snapshot = { ...this.snapshot };
    this.listeners.forEach((listener) => listener());
  }

  private readStorage(): SessionSnapshot | null {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SessionSnapshot;

      // Drop an expired session rather than booting into a broken state.
      if (parsed.expiresAt && parsed.expiresAt <= Date.now()) {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private writeStorage(snapshot: SessionSnapshot) {
    try {
      if (!snapshot.token) {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
        return;
      }
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage can be unavailable (private mode); the in-memory state still works.
    }
  }

  /** Exchange client credentials for a bearer token. */
  async login(api: ApiClient, credentials: SessionCredentials): Promise<User> {
    const response: TokenResponse = await api.auth.token(
      credentials.clientId,
      credentials.clientSecret,
    );

    const scopes = response.scope ? response.scope.split(' ').filter(Boolean) : [];
    const consoleType = credentials.console ?? 'tenant';
    const user = userFromScopes(scopes, consoleType, {
      displayName: credentials.displayName,
      email: credentials.email,
    });

    this.credentials = credentials;
    this.applyToken(response, user);
    await this.persistPortalUser(api, user);

    return user;
  }

  /**
   * The API issues client tokens, so there is no "who am I" endpoint yet.
   * Mirror the derived user into the store when live-mode user management exists.
   */
  private async persistPortalUser(api: ApiClient, user: User) {
    if (user.console !== 'tenant') return;

    try {
      await api.notifications.list();
    } catch {
      // Non-fatal: session remains valid even if this probe fails.
    }
  }

  private applyToken(response: TokenResponse, user: User) {
    const expiresAt = Date.now() + response.expires_in * 1000;
    const scopes = response.scope ? response.scope.split(' ').filter(Boolean) : [];

    this.snapshot = {
      token: response.access_token,
      expiresAt,
      scopes,
      user,
    };

    this.writeStorage(this.snapshot);
    this.scheduleRefresh(response.expires_in);
    this.notify();
  }

  private scheduleRefresh(expiresInSeconds: number) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    const delayMs = Math.max(
      0,
      (expiresInSeconds - REFRESH_SKEW_SECONDS) * 1000,
    );

    this.refreshTimer = setTimeout(() => {
      void this.refresh();
    }, delayMs);
  }

  /** Re-issue the token with the stored credentials before it expires. */
  async refresh(): Promise<void> {
    if (!this.credentials) return;

    const api = this.buildClient();
    await this.login(api, this.credentials);
  }

  /** Build a client bound to this session's token. */
  buildClient(onUnauthorized?: () => void): ApiClient {
    return createApiClient({
      getToken: () => this.getToken(),
      onUnauthorized: () => {
        this.logout();
        onUnauthorized?.();
      },
    });
  }

  logout() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.credentials = null;
    this.snapshot = EMPTY;
    this.writeStorage(EMPTY);
    this.notify();
  }

  /** Restore a persisted session's client without re-authenticating. */
  restoreCredentials(credentials: SessionCredentials) {
    this.credentials = credentials;
  }

  /**
   * Adopt a token minted elsewhere (embed host, spec §L11).
   *
   * Used by `<fino-console>`: the tenant's own site already authenticated the
   * agent and hands us a bearer token via postMessage. We trust it for the
   * current tab only — it is deliberately NOT written to localStorage, so the
   * host stays the single source of truth for the session lifecycle (D8).
   */
  adoptExternalToken(input: {
    token: string;
    expiresIn?: number;
    scopes?: string[];
    console?: ConsoleType;
    displayName?: string;
    email?: string;
  }): User {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // No stored credentials: an external token cannot be refreshed by us.
    this.credentials = null;

    const consoleType = input.console ?? 'tenant';
    const scopes =
      input.scopes && input.scopes.length > 0
        ? input.scopes
        : ['tickets:read', 'tickets:write', 'customers:read', 'customers:write', 'events:write'];

    const user = userFromScopes(scopes, consoleType, {
      displayName: input.displayName,
      email: input.email,
    });

    this.snapshot = {
      token: input.token,
      expiresAt: input.expiresIn ? Date.now() + input.expiresIn * 1000 : null,
      scopes,
      user,
    };

    // Intentionally no writeStorage(): an external token is tab-scoped only.
    this.notify();

    return user;
  }
}

export const sessionStore = new SessionStore();
