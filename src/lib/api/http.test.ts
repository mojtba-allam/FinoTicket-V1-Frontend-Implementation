import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, request, resolveBaseUrl } from './http';

function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('http transport', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON for a successful response', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { data: [{ id: 't-1' }] }));

    const result = await request<{ data: { id: string }[] }>('/api/v1/tickets', {
      token: 'token-abc',
    });

    expect(result.data[0].id).toBe('t-1');
  });

  it('injects the bearer token and idempotency key', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { data: [] }));

    await request('/api/v1/tickets', {
      method: 'POST',
      body: { subject: 'Demo' },
      token: 'token-xyz',
      idempotencyKey: 'key-123',
    });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Record<string, string>;

    expect(headers.Authorization).toBe('Bearer token-xyz');
    expect(headers['Idempotency-Key']).toBe('key-123');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('maps RFC7807 problem+json into a typed validation error', async () => {
    const problemBody = {
      type: 'https://finoticket.local/problems/validation',
      title: 'Unprocessable Entity',
      status: 422,
      detail: 'The given data was invalid.',
      request_id: 'req-422',
      errors: { subject: ['The subject field is required.'] },
    };

    // Each attempt needs a fresh Response — a body can only be read once.
    vi.mocked(fetch).mockImplementation(async () =>
      jsonResponse(422, problemBody, { 'content-type': 'application/problem+json' }),
    );

    await expect(request('/api/v1/tickets', { method: 'POST', body: {} })).rejects.toMatchObject({
      kind: 'validation',
      status: 422,
      requestId: 'req-422',
    });

    try {
      await request('/api/v1/tickets', { method: 'POST', body: {} });
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.fieldErrors.subject).toEqual(['The subject field is required.']);
      expect(apiError.message).toBe('The given data was invalid.');
    }
  });

  it('classifies 401 as unauthorized', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(401, { message: 'Invalid client credentials.' }));

    await expect(request('/api/v1/auth/token', { method: 'POST' })).rejects.toMatchObject({
      kind: 'unauthorized',
      status: 401,
    });
  });

  it('classifies 429 and exposes retry-after seconds', async () => {
    vi.mocked(fetch).mockImplementation(async () =>
      jsonResponse(429, { title: 'Too Many Requests', status: 429 }, { 'retry-after': '42' }),
    );

    try {
      await request('/api/v1/search', { query: { q: 'x' } });
      throw new Error('Expected request to throw');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.kind).toBe('rate_limited');
      expect(apiError.retryAfterSeconds).toBe(42);
      expect(apiError.isRetriable).toBe(true);
    }
  });

  it('classifies 403 and 404', async () => {
    vi.mocked(fetch).mockImplementation(async () => jsonResponse(403, { message: 'forbidden' }));
    await expect(request('/api/v1/agents')).rejects.toMatchObject({ kind: 'forbidden' });

    vi.mocked(fetch).mockImplementation(async () => jsonResponse(404, { message: 'not found' }));
    await expect(request('/api/v1/tickets/nope')).rejects.toMatchObject({ kind: 'not_found' });
  });

  it('classifies 5xx as a retriable server error', async () => {
    vi.mocked(fetch).mockImplementation(async () => jsonResponse(503, { message: 'unavailable' }));

    try {
      await request('/api/v1/health');
      throw new Error('Expected request to throw');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.kind).toBe('server');
      expect(apiError.isRetriable).toBe(true);
    }
  });

  it('classifies a rejected fetch as a network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    try {
      await request('/api/v1/health');
      throw new Error('Expected request to throw');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.kind).toBe('network');
      expect(apiError.status).toBe(0);
      expect(apiError.isRetriable).toBe(true);
    }
  });

  it('serializes query parameters and skips empty values', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { data: [] }));

    await request('/api/v1/search', {
      query: { q: 'چاپگر', mode: 'HYBRID', limit: 10, unused: undefined },
    });

    const [url] = vi.mocked(fetch).mock.calls[0];
    const parsed = new URL(String(url));

    expect(parsed.searchParams.get('q')).toBe('چاپگر');
    expect(parsed.searchParams.get('mode')).toBe('HYBRID');
    expect(parsed.searchParams.get('limit')).toBe('10');
    expect(parsed.searchParams.has('unused')).toBe(false);
  });

  it('defaults the base URL to the local Laravel server', () => {
    expect(resolveBaseUrl()).toBe('http://127.0.0.1:8000');
  });
});
