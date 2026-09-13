// FinoTicket V1 — HTTP transport
// Thin fetch wrapper for the Laravel /api/v1 surface.
// Handles: base URL, bearer auth, RFC7807 problem+json, rate limits, network errors.

export type ApiErrorKind =
  | 'network'      // fetch rejected / offline
  | 'unauthorized' // 401
  | 'forbidden'    // 403
  | 'not_found'    // 404
  | 'validation'   // 422
  | 'rate_limited' // 429
  | 'server'       // 5xx
  | 'unknown';

/** RFC7807 problem details as returned by the backend. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  request_id?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

/** Normalized error thrown by every client call. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly problem: ProblemDetails;
  readonly requestId?: string;
  readonly retryAfterSeconds?: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly body?: unknown;

  constructor(init: {
    kind: ApiErrorKind;
    status: number;
    message: string;
    problem?: ProblemDetails;
    requestId?: string;
    retryAfterSeconds?: number;
    body?: unknown;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.kind = init.kind;
    this.status = init.status;
    this.problem = init.problem ?? {};
    this.requestId = init.requestId ?? init.problem?.request_id;
    this.retryAfterSeconds = init.retryAfterSeconds;
    this.fieldErrors = (init.problem?.errors as Record<string, string[]>) ?? {};
    this.body = init.body;
  }

  /** True when retrying the same request could succeed. */
  get isRetriable(): boolean {
    return this.kind === 'network' || this.kind === 'rate_limited' || this.kind === 'server';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  /** Bearer token for the request. */
  token?: string | null;
  /** Idempotency-Key for create endpoints (spec §35). */
  idempotencyKey?: string;
  signal?: AbortSignal;
  /** Skip JSON parsing — used by the download endpoint. */
  raw?: boolean;
}

/** Shape of the backend's standard list envelope. */
export interface ApiEnvelope<T> {
  data: T;
}

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Runtime override for the API base URL.
 *
 * The embed bundle cannot know the tenant's API host at build time, so
 * `<fino-console api-base="...">` sets this once during upgrade. Left null in
 * the normal SPA, where the Vite env var wins.
 */
let baseUrlOverride: string | null = null;

/** Point every subsequent request at a specific API host. Pass null to reset. */
export function setBaseUrlOverride(value: string | null): void {
  baseUrlOverride = value && value.length > 0 ? trimTrailingSlash(value) : null;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

/** Resolve the API base URL: runtime override, then Vite env, then default. */
export function resolveBaseUrl(): string {
  if (baseUrlOverride) return baseUrlOverride;

  const fromEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL
      : undefined;

  return trimTrailingSlash(fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_BASE_URL);
}

function buildUrl(
  path: string,
  query?: RequestOptions['query'],
): string {
  const base = resolveBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 422) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'unknown';
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;

  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;

  return Math.max(0, Math.round((date - Date.now()) / 1000));
}

/**
 * Perform a request against the FinoTicket API.
 * Throws {@link ApiError} for every non-2xx response and for network failures.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    query,
    headers = {},
    token,
    idempotencyKey,
    signal,
    raw = false,
  } = options;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] ?? 'application/json';
  }
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }
  if (idempotencyKey) {
    finalHeaders['Idempotency-Key'] = idempotencyKey;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    if (aborted) throw error;

    throw new ApiError({
      kind: 'network',
      status: 0,
      message: 'Network request failed. Check your connection and API base URL.',
      body: error,
    });
  }

  if (raw) {
    if (!response.ok) {
      throw await toApiError(response);
    }
    return response as unknown as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('json');
  const payload: unknown = isJson ? await response.json().catch(() => undefined) : await response.text().catch(() => undefined);

  if (!response.ok) {
    throw buildError(response, payload);
  }

  return payload as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('json')
    ? await response.json().catch(() => undefined)
    : await response.text().catch(() => undefined);

  return buildError(response, payload);
}

function buildError(response: Response, payload: unknown): ApiError {
  const problem = (payload && typeof payload === 'object' ? payload : {}) as ProblemDetails;
  const kind = kindForStatus(response.status);

  const message =
    (typeof problem.detail === 'string' && problem.detail) ||
    (typeof problem.title === 'string' && problem.title) ||
    (typeof problem.message === 'string' && (problem.message as string)) ||
    `Request failed with status ${response.status}.`;

  return new ApiError({
    kind,
    status: response.status,
    message,
    problem,
    requestId: (response.headers.get('x-request-id') ?? problem.request_id) || undefined,
    retryAfterSeconds: parseRetryAfter(response.headers.get('retry-after')),
    body: payload,
  });
}
