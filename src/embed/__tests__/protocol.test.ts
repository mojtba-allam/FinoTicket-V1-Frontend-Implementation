import { describe, expect, it } from 'vitest';
import {
  isEmbedToHostMessage,
  isHostToEmbedMessage,
  originMatches,
  parseAllowedOrigins,
  type EmbedToHostMessage,
  type HostToEmbedMessage,
} from '../protocol';

describe('parseAllowedOrigins', () => {
  it('returns an empty list for empty input', () => {
    expect(parseAllowedOrigins(null)).toEqual([]);
    expect(parseAllowedOrigins('')).toEqual([]);
    expect(parseAllowedOrigins('   ')).toEqual([]);
  });

  it('parses a single origin', () => {
    expect(parseAllowedOrigins('https://shop-aftab.ir')).toEqual(['https://shop-aftab.ir']);
  });

  it('parses, trims and de-duplicates a comma-separated list', () => {
    const parsed = parseAllowedOrigins(
      ' https://a.example , https://b.example , https://a.example ',
    );
    expect(parsed).toEqual(['https://a.example', 'https://b.example']);
  });

  it('normalises away a path so matching still works', () => {
    // A host that pastes a full URL must not silently break the allow-list.
    expect(parseAllowedOrigins('https://a.example/some/page')).toEqual(['https://a.example']);
  });

  it('drops unparseable entries instead of throwing', () => {
    expect(parseAllowedOrigins('not-a-url, https://ok.example')).toEqual(['https://ok.example']);
  });

  it('keeps distinct ports apart', () => {
    expect(parseAllowedOrigins('https://a.example, http://a.example:4000')).toEqual([
      'https://a.example',
      'http://a.example:4000',
    ]);
  });
});

describe('originMatches', () => {
  const allowed = ['https://shop-aftab.ir', 'http://localhost:4000'];

  it('matches an exact origin', () => {
    expect(originMatches('https://shop-aftab.ir', allowed)).toBe(true);
  });

  it('ignores a trailing slash and case differences', () => {
    expect(originMatches('https://Shop-Aftab.IR/', allowed)).toBe(true);
  });

  it('rejects an origin that is not listed', () => {
    expect(originMatches('https://evil.example', allowed)).toBe(false);
  });

  it('rejects everything when the allow-list is empty', () => {
    expect(originMatches('https://shop-aftab.ir', [])).toBe(false);
  });

  it('does not match a subdomain implicitly', () => {
    expect(originMatches('https://app.shop-aftab.ir', allowed)).toBe(false);
  });
});

describe('isHostToEmbedMessage', () => {
  it('accepts every documented host command', () => {
    const messages: HostToEmbedMessage[] = [
      { type: 'fino:init', token: 't' },
      { type: 'fino:token', token: 't' },
      { type: 'fino:logout' },
      { type: 'fino:navigate', path: '/desk/tickets' },
      { type: 'fino:theme', theme: { primary: '#000' } },
    ];
    for (const m of messages) expect(isHostToEmbedMessage(m)).toBe(true);
  });

  it('rejects our own outbound-only messages', () => {
    expect(isHostToEmbedMessage({ type: 'fino:ready', authenticated: true })).toBe(false);
    expect(isHostToEmbedMessage({ type: 'fino:resize', height: 400 })).toBe(false);
    expect(isHostToEmbedMessage({ type: 'fino:toast', level: 'info', message: 'x' })).toBe(false);
  });

  it('accepts fino:navigate, which is bidirectional by design', () => {
    // The host commands a route change AND the embed reports its own.
    expect(isHostToEmbedMessage({ type: 'fino:navigate', path: '/desk' })).toBe(true);
    expect(isEmbedToHostMessage({ type: 'fino:navigate', path: '/desk' })).toBe(true);
  });

  it('rejects unrelated or malformed payloads', () => {
    expect(isHostToEmbedMessage(null)).toBe(false);
    expect(isHostToEmbedMessage('fino:init')).toBe(false);
    expect(isHostToEmbedMessage({})).toBe(false);
    expect(isHostToEmbedMessage({ type: 42 })).toBe(false);
    expect(isHostToEmbedMessage({ type: 'other:init' })).toBe(false);
  });
});

describe('isEmbedToHostMessage', () => {
  it('accepts our outbound message shapes', () => {
    const messages: EmbedToHostMessage[] = [
      { type: 'fino:ready', authenticated: false, version: '1.0.0' },
      { type: 'fino:auth-required' },
      { type: 'fino:resize', height: 512 },
      { type: 'fino:navigate', path: '/desk' },
      { type: 'fino:toast', level: 'success', message: 'ok' },
      { type: 'fino:error', code: 'origin-rejected', message: 'no' },
    ];
    for (const m of messages) expect(isEmbedToHostMessage(m)).toBe(true);
  });

  it('rejects host commands', () => {
    expect(isEmbedToHostMessage({ type: 'fino:init', token: 't' })).toBe(false);
  });
});
