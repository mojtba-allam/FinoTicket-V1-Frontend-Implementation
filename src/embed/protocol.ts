// FinoTicket L11 — embed protocol (frozen contract, see FINOTICKET_L11_EMBED_SPEC.md §4)
//
// Every message crossing the host <-> embed boundary is one of these shapes.
// Both directions are origin-checked by FinoConsoleElement.

export const EMBED_TAG = 'fino-console';
export const EMBED_VERSION = '1.0.0';

/** Discriminator prefix so host messages can never be confused with others. */
export const MSG_PREFIX = 'fino:';

// ---------------------------------------------------------------------------
// Host -> Embed
// ---------------------------------------------------------------------------

export interface InitMessage {
  type: 'fino:init';
  token: string;
  expiresIn?: number;
  scopes?: string[];
  console?: 'tenant' | 'platform';
  displayName?: string;
  email?: string;
  locale?: 'fa' | 'en';
  theme?: ThemePayload;
}

export interface TokenMessage {
  type: 'fino:token';
  token: string;
  expiresIn?: number;
}

export interface LogoutMessage {
  type: 'fino:logout';
}

export interface NavigateCommandMessage {
  type: 'fino:navigate';
  path: string;
}

export interface ThemeMessage {
  type: 'fino:theme';
  theme: ThemePayload;
}

export type HostToEmbedMessage =
  | InitMessage
  | TokenMessage
  | LogoutMessage
  | NavigateCommandMessage
  | ThemeMessage;

// ---------------------------------------------------------------------------
// Embed -> Host
// ---------------------------------------------------------------------------

export interface ReadyMessage {
  type: 'fino:ready';
  authenticated: boolean;
  version: string;
}

export interface AuthRequiredMessage {
  type: 'fino:auth-required';
}

export interface ResizeMessage {
  type: 'fino:resize';
  height: number;
}

export interface NavigateEventMessage {
  type: 'fino:navigate';
  path: string;
}

export interface ToastMessage {
  type: 'fino:toast';
  level: 'info' | 'success' | 'error';
  message: string;
}

export interface EmbedErrorMessage {
  type: 'fino:error';
  code: EmbedErrorCode;
  message: string;
}

export type EmbedToHostMessage =
  | ReadyMessage
  | AuthRequiredMessage
  | ResizeMessage
  | NavigateEventMessage
  | ToastMessage
  | EmbedErrorMessage;

export type EmbedErrorCode =
  | 'origin-rejected'
  | 'invalid-attribute'
  | 'mount-failed'
  | 'unauthorized';

// ---------------------------------------------------------------------------
// Theming
// ---------------------------------------------------------------------------

export interface ThemePayload {
  primary?: string;
  primaryFg?: string;
  radius?: string;
  fontFamily?: string;
  surface?: string;
  text?: string;
  border?: string;
  mode?: 'light' | 'dark';
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

const HOST_TYPES: ReadonlySet<string> = new Set([
  'fino:init',
  'fino:token',
  'fino:logout',
  'fino:navigate',
  'fino:theme',
]);

/** Message types the embed emits toward the host. */
const EMBED_TYPES: ReadonlySet<string> = new Set([
  'fino:ready',
  'fino:auth-required',
  'fino:resize',
  'fino:toast',
  'fino:error',
]);

/**
 * `fino:navigate` is intentionally bidirectional: the host can command a route
 * change and the embed reports its own route changes back. It is listed in BOTH
 * guards so neither side silently drops it.
 */
const BIDIRECTIONAL_TYPES: ReadonlySet<string> = new Set(['fino:navigate']);

/**
 * Narrow an unknown postMessage payload to a known host command.
 *
 * Deliberately structural rather than instanceof-based: messages arrive from a
 * different realm, so prototypes are not ours.
 */
export function isHostToEmbedMessage(value: unknown): value is HostToEmbedMessage {
  if (!value || typeof value !== 'object') return false;
  const type = (value as { type?: unknown }).type;
  if (typeof type !== 'string') return false;
  return HOST_TYPES.has(type) || BIDIRECTIONAL_TYPES.has(type);
}

/** True when the payload is one of our own outbound messages (used in tests). */
export function isEmbedToHostMessage(value: unknown): value is EmbedToHostMessage {
  if (!value || typeof value !== 'object') return false;
  const type = (value as { type?: unknown }).type;
  if (typeof type !== 'string') return false;
  if (!type.startsWith(MSG_PREFIX)) return false;
  return EMBED_TYPES.has(type) || BIDIRECTIONAL_TYPES.has(type);
}

/**
 * Parse the comma-separated `allowed-origins` attribute.
 *
 * Accepts full origins only (`https://x.example`), normalises a trailing slash,
 * drops anything unparseable, and de-duplicates.
 */
export function parseAllowedOrigins(raw: string | null | undefined): string[] {
  if (!raw) return [];

  const seen = new Set<string>();

  for (const part of raw.split(',')) {
    const candidate = part.trim();
    if (!candidate) continue;

    try {
      const url = new URL(candidate);
      // Origin only — a path or query would make matching silently never work.
      seen.add(url.origin);
    } catch {
      // Unparseable entries are ignored rather than throwing: a typo in the
      // host's markup must not blank the whole console.
    }
  }

  return [...seen];
}

/** Constant-time-ish origin comparison (case-insensitive, trailing-slash safe). */
export function originMatches(origin: string, allowed: readonly string[]): boolean {
  if (allowed.length === 0) return false;
  // An opaque origin ("null") can never match: it is what a sandboxed frame,
  // a data: URL or a file:// page reports, none of which is our host.
  if (!origin || origin === 'null') return false;

  const normalised = origin.replace(/\/+$/, '').toLowerCase();
  return allowed.some((entry) => entry.replace(/\/+$/, '').toLowerCase() === normalised);
}
