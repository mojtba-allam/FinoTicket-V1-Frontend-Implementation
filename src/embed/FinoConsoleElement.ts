// FinoTicket L11 — the <fino-console> Web Component (spec §5)
//
// Renders the FULL agent console (or the customer widget) inside a shadow root,
// authenticates via a postMessage handshake with the host page, and never lets a
// token touch the URL, a log line, or our own localStorage.

import { sessionStore } from '../lib/api/session';
import { setBaseUrlOverride } from '../lib/api/http';
import {
  EMBED_TAG,
  EMBED_VERSION,
  isHostToEmbedMessage,
  originMatches,
  parseAllowedOrigins,
  type EmbedErrorCode,
  type EmbedToHostMessage,
  type HostToEmbedMessage,
  type ThemePayload,
} from './protocol';
import { applyTheme, buildHostStyle } from './theme';
import { mountEmbedRoot, type EmbedRootHandle } from './embedRoot';

/** How long to wait for `fino:init` before telling the host we need a token. */
const AUTH_REQUIRED_DELAY_MS = 250;
/** Resize notifications are debounced to avoid flooding the host. */
const RESIZE_DEBOUNCE_MS = 100;

export type EmbedMode = 'agent' | 'widget';

interface ParsedAttributes {
  mode: EmbedMode;
  apiBase: string | null;
  allowedOrigins: string[];
  locale: 'fa' | 'en';
  theme: ThemePayload;
  height: string | null;
  startPath: string | null;
}

export class FinoConsoleElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['mode', 'api-base', 'allowed-origins', 'locale', 'theme', 'primary-color', 'start-path'];
  }

  /**
   * Injected by the bootstrap so this module never imports CSS directly.
   * Keeps the element unit-testable without a bundler.
   */
  static injectStyles: ((root: ShadowRoot) => void) | null = null;

  #shadow: ShadowRoot;
  #root: EmbedRootHandle | null = null;
  #attrs: ParsedAttributes | null = null;
  #upgraded = false;
  #authenticated = false;

  #authTimer: ReturnType<typeof setTimeout> | null = null;
  #resizeTimer: ReturnType<typeof setTimeout> | null = null;
  #resizeObserver: ResizeObserver | null = null;

  /** Bound so add/removeEventListener see the same reference. */
  #onMessage = (event: MessageEvent) => this.#handleMessage(event);

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  connectedCallback(): void {
    if (this.#upgraded) return;
    this.#upgraded = true;

    let attrs: ParsedAttributes;
    try {
      attrs = this.#parseAttributes();
    } catch (error) {
      this.#shadow.innerHTML = '';
      this.#reportError('invalid-attribute', (error as Error).message);
      return;
    }

    this.#attrs = attrs;

    if (attrs.apiBase) {
      setBaseUrlOverride(attrs.apiBase);
    }

    // Theme + isolation styles go in before React so there is no flash.
    const style = document.createElement('style');
    style.setAttribute('data-fino-theme', '');
    style.textContent = buildHostStyle(attrs.theme);
    this.#shadow.prepend(style);

    // The app's own CSS lives inside the shadow root, never in document.head.
    FinoConsoleElement.injectStyles?.(this.#shadow);

    const root = document.createElement('div');
    root.id = 'fino-root';
    this.#shadow.appendChild(root);

    this.setAttribute('dir', attrs.locale === 'fa' ? 'rtl' : 'ltr');
    if (attrs.height) this.style.height = attrs.height;

    window.addEventListener('message', this.#onMessage);

    try {
      this.#root = mountEmbedRoot(root, {
        mode: attrs.mode,
        locale: attrs.locale,
        startPath: attrs.startPath,
        embedded: true,
        onNavigate: (path) => this.navigate(path),
        onToast: (level, message) => this.#post({ type: 'fino:toast', level, message }),
      });
    } catch (error) {
      this.#reportError('mount-failed', (error as Error).message);
      return;
    }

    this.#observeResize();

    // Tell the host we are listening, then nudge it for a token if none came.
    this.#post({ type: 'fino:ready', authenticated: this.#authenticated, version: EMBED_VERSION });
    this.#authTimer = setTimeout(() => {
      if (!this.#authenticated) this.#post({ type: 'fino:auth-required' });
    }, AUTH_REQUIRED_DELAY_MS);
  }

  disconnectedCallback(): void {
    window.removeEventListener('message', this.#onMessage);

    if (this.#authTimer) clearTimeout(this.#authTimer);
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    if (this.#resizeObserver) this.#resizeObserver.disconnect();

    this.#root?.unmount();
    this.#root = null;
    this.#upgraded = false;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this.#upgraded || oldValue === newValue) return;

    if (name === 'theme' || name === 'primary-color') {
      try {
        applyTheme(this.#shadow, this.#parseAttributes().theme);
      } catch {
        // A later valid attribute change will fix it up.
      }
      return;
    }

    if (name === 'locale') {
      const locale = newValue === 'en' ? 'en' : 'fa';
      this.setAttribute('dir', locale === 'fa' ? 'rtl' : 'ltr');
      this.#root?.setLocale(locale);
    }
  }

  // -------------------------------------------------------------------------
  // Public imperative API (spec §5.2)
  // -------------------------------------------------------------------------

  /** Adopt a host-minted token. Equivalent to posting `fino:init`. */
  setToken(token: string, options: { expiresIn?: number; scopes?: string[] } = {}): void {
    this.#adoptToken(token, options);
  }

  /** Clear the session and tell the host we need a token again. */
  logout(): void {
    sessionStore.logout();
    this.#authenticated = false;
    this.#post({ type: 'fino:auth-required' });
  }

  /** Drive the console's internal router. */
  navigate(path: string): void {
    this.#root?.navigate(path);
    this.#post({ type: 'fino:navigate', path });
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  #parseAttributes(): ParsedAttributes {
    const mode = (this.getAttribute('mode') ?? 'agent').trim().toLowerCase();
    if (mode !== 'agent' && mode !== 'widget') {
      throw new Error(`${EMBED_TAG}: mode must be "agent" or "widget" (got "${mode}")`);
    }

    const allowedOrigins = parseAllowedOrigins(this.getAttribute('allowed-origins'));
    if (allowedOrigins.length === 0) {
      throw new Error(
        `${EMBED_TAG}: allowed-origins is required and must list at least one full origin`,
      );
    }

    const locale = (this.getAttribute('locale') ?? 'fa').trim().toLowerCase() === 'en' ? 'en' : 'fa';

    const theme: ThemePayload = {
      mode: (this.getAttribute('theme') ?? 'light').trim().toLowerCase() === 'dark' ? 'dark' : 'light',
      primary: this.getAttribute('primary-color') ?? undefined,
    };

    return {
      mode,
      apiBase: this.getAttribute('api-base'),
      allowedOrigins,
      locale,
      theme,
      height: this.getAttribute('height'),
      startPath: this.getAttribute('start-path'),
    };
  }

  #isTrusted(origin: string): boolean {
    // `event.origin` is the literal string "null" for sandboxed frames, `data:`
    // URLs and some file:// contexts. Those are NOT our host and must never be
    // trusted, so reject them before consulting the allow-list.
    if (!origin || origin === 'null') return false;

    return originMatches(origin, this.#attrs?.allowedOrigins ?? []);
  }

  #handleMessage(event: MessageEvent): void {
    if (!this.#isTrusted(event.origin)) {
      // Do not echo back to an untrusted origin — that would leak our presence.
      return;
    }

    if (!isHostToEmbedMessage(event.data)) return;
    this.#applyHostMessage(event.data, event.origin);
  }

  #applyHostMessage(message: HostToEmbedMessage, origin: string): void {
    switch (message.type) {
      case 'fino:init':
        this.#adoptToken(message.token, {
          expiresIn: message.expiresIn,
          scopes: message.scopes,
          console: message.console,
          displayName: message.displayName,
          email: message.email,
        });
        if (message.theme) {
          applyTheme(this.#shadow, { ...message.theme, mode: this.#attrs?.theme.mode ?? 'light' });
        }
        break;

      case 'fino:token':
        this.#adoptToken(message.token, { expiresIn: message.expiresIn });
        break;

      case 'fino:logout':
        this.logout();
        break;

      case 'fino:navigate':
        this.#root?.navigate(message.path);
        break;

      case 'fino:theme':
        applyTheme(this.#shadow, { ...message.theme, mode: this.#attrs?.theme.mode ?? 'light' });
        break;
    }

    void origin;
  }

  #adoptToken(
    token: string,
    options: {
      expiresIn?: number;
      scopes?: string[];
      console?: 'tenant' | 'platform';
      displayName?: string;
      email?: string;
    },
  ): void {
    if (!token) return;

    sessionStore.adoptExternalToken({
      token,
      expiresIn: options.expiresIn,
      scopes: options.scopes,
      console: options.console ?? 'tenant',
      displayName: options.displayName,
      email: options.email,
    });

    this.#authenticated = true;

    if (this.#authTimer) {
      clearTimeout(this.#authTimer);
      this.#authTimer = null;
    }

    this.#post({ type: 'fino:ready', authenticated: true, version: EMBED_VERSION });
  }

  #observeResize(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.#resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const height = Math.ceil(entry.contentRect.height);
      if (height <= 0) return;

      if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
      this.#resizeTimer = setTimeout(() => {
        this.#post({ type: 'fino:resize', height });
      }, RESIZE_DEBOUNCE_MS);
    });

    const root = this.#shadow.querySelector('#fino-root');
    if (root) this.#resizeObserver.observe(root);
  }

  /** Send a message to the host, always at an explicit allowed origin. */
  #post(message: EmbedToHostMessage): void {
    const origins = this.#attrs?.allowedOrigins ?? [];
    if (origins.length === 0) return;

    // The spec forbids '*'. With multiple allowed origins we broadcast only to
    // those we were configured with, which is equivalent to the allow-list.
    for (const origin of origins) {
      try {
        window.parent?.postMessage(message, origin);
      } catch {
        // A cross-origin target that refuses the message is the host's choice.
      }
    }

    // Also re-fire as a DOM event so hosts that prefer addEventListener work.
    this.dispatchEvent(new CustomEvent(message.type, { detail: message, bubbles: false }));
  }

  #reportError(code: EmbedErrorCode, message: string): void {
    this.#post({ type: 'fino:error', code, message });
    // eslint-disable-next-line no-console
    console.error(`[${EMBED_TAG}] ${code}: ${message}`);
  }
}

/** Register the element once. Safe to call repeatedly. */
export function defineFinoConsole(): void {
  if (typeof customElements === 'undefined') return;
  if (customElements.get(EMBED_TAG)) return;
  customElements.define(EMBED_TAG, FinoConsoleElement);
}
