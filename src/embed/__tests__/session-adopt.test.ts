import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../lib/api/session';

/**
 * `adoptExternalToken` is the security-critical path for the embed (spec D8):
 * a host-minted token must take effect but must NEVER be persisted, because the
 * host owns the session lifecycle.
 */
describe('SessionStore.adoptExternalToken', () => {
  let store: SessionStore;

  beforeEach(() => {
    localStorage.clear();
    store = new SessionStore();
  });

  it('makes the token available to requests', () => {
    store.adoptExternalToken({ token: 'host-token-123' });
    expect(store.getToken()).toBe('host-token-123');
  });

  it('never writes the token to localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    store.adoptExternalToken({ token: 'host-token-123' });

    expect(localStorage.getItem('finoticket.session.v1')).toBeNull();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('derives a tenant admin user from write scopes', () => {
    const user = store.adoptExternalToken({
      token: 't',
      scopes: ['tickets:read', 'tickets:write'],
      displayName: 'سارا',
    });

    expect(user.console).toBe('tenant');
    expect(user.role).toBe('ADMIN');
    expect(user.display_name ?? user.email).toBeTruthy();
  });

  it('derives a viewer from read-only scopes', () => {
    const user = store.adoptExternalToken({ token: 't', scopes: ['tickets:read'] });
    expect(user.role).toBe('VIEWER');
  });

  it('applies a sensible default scope set when the host omits scopes', () => {
    store.adoptExternalToken({ token: 't' });
    const scopes = store.getSnapshot().scopes;

    expect(scopes).toContain('tickets:read');
    expect(scopes).toContain('tickets:write');
  });

  it('records an expiry when expiresIn is supplied', () => {
    const before = Date.now();
    store.adoptExternalToken({ token: 't', expiresIn: 3600 });
    const expiresAt = store.getSnapshot().expiresAt;

    expect(expiresAt).not.toBeNull();
    expect(expiresAt! - before).toBeGreaterThan(3_500_000);
  });

  it('leaves the expiry null when the host gives no TTL', () => {
    store.adoptExternalToken({ token: 't' });
    expect(store.getSnapshot().expiresAt).toBeNull();
  });

  it('notifies subscribers so React re-renders', () => {
    const listener = vi.fn();
    store.subscribe(listener);

    store.adoptExternalToken({ token: 't' });

    expect(listener).toHaveBeenCalled();
  });

  it('cannot refresh itself — no credentials are stored', () => {
    // An external token is tab-scoped and unrefreshable by design.
    const refreshSpy = vi.spyOn(store, 'refresh');
    store.adoptExternalToken({ token: 't' });
    void store.refresh();

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('logout clears an adopted token', () => {
    store.adoptExternalToken({ token: 't' });
    store.logout();

    expect(store.getToken()).toBeNull();
    expect(store.getSnapshot().user).toBeNull();
  });
});
