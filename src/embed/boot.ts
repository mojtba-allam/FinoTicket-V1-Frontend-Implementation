// FinoTicket L11 — embed bootstrap + auto-mount helper
//
// Two responsibilities:
//  1. Register <fino-console> and inject the app CSS INTO the shadow root
//     (never into document.head — that is what breaks host pages).
//  2. Optionally auto-mount: if the page contains `<fino-console data-auto>`,
//     nothing else is needed from the host.
//
// Imported by src/embed/main.tsx so the bundle is a single drop-in file.

import { defineFinoConsole, FinoConsoleElement } from './FinoConsoleElement';
import { EMBED_TAG, EMBED_VERSION } from './protocol';
import { setForceLive } from '../lib/api/config';

/**
 * The app's compiled CSS as a string.
 *
 * `?inline` makes Vite return the CSS text instead of emitting a separate file,
 * which matters because a shadow root cannot reach a <link> in the document.
 */
import appCss from '../index.css?inline';

/**
 * Vite rewrites `url(...)` assets to absolute paths at build time, which are
 * still valid inside a shadow root as long as `api-base` serves them. We keep
 * this hook so a future CDN base can be prefixed here in one place.
 */
function scopeCss(css: string): string {
  return css;
}

/** Put one <style> with the whole app CSS into a shadow root, once. */
export function injectAppStyles(root: ShadowRoot): void {
  if (root.querySelector('style[data-fino-app]')) return;

  const style = document.createElement('style');
  style.setAttribute('data-fino-app', '');
  style.textContent = scopeCss(appCss);
  // After the theme style so host variables still win where they overlap.
  root.appendChild(style);
}

let booted = false;

/** Idempotent bootstrap. Safe to call from multiple entry points. */
export function bootFinoConsole(): void {
  if (booted) return;
  booted = true;

  // An embedded console must always hit a real API — never the demo store.
  // The host supplied `api-base` and a token; showing it fictional data would
  // be a correctness bug in their live site.
  setForceLive(true);

  // Teach the element how to reach the app CSS without importing it itself.
  FinoConsoleElement.injectStyles = injectAppStyles;

  defineFinoConsole();

  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.info(
      `%c${EMBED_TAG}%c v${EMBED_VERSION} ready — mount with <${EMBED_TAG} mode="agent" api-base="…" allowed-origins="…">`,
      'background:#2563eb;color:#fff;padding:2px 6px;border-radius:4px;font-weight:600',
      'color:inherit',
    );
  }
}
