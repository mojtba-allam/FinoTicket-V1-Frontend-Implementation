// FinoTicket L11 — theming for the embed (spec §6)
//
// Shadow DOM blocks ordinary CSS inheritance, so the host themes us through CSS
// custom properties, which pierce the boundary by design. We map the public
// `--fino-*` names onto our internal design tokens once, on :host, and leave
// every component using the existing Tailwind classes untouched.

import type { ThemePayload } from './protocol';

/** Defaults applied when the host supplies nothing. */
export const DEFAULT_THEME: Required<Omit<ThemePayload, 'mode'>> & { mode: 'light' | 'dark' } = {
  primary: '#2563eb',
  primaryFg: '#ffffff',
  radius: '8px',
  fontFamily:
    "Vazirmatn, 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
  surface: '#ffffff',
  text: '#111827',
  border: '#e5e7eb',
  mode: 'light',
};

/** Dark-mode defaults, used when theme="dark" and the host gives no colours. */
export const DARK_THEME: Partial<typeof DEFAULT_THEME> = {
  surface: '#0f172a',
  text: '#e2e8f0',
  border: '#1e293b',
};

/**
 * Build the `:host { … }` declaration block for the shadow root.
 *
 * Returned as a plain string so `embedRoot` can append a <style> element before
 * the React tree mounts — this avoids a flash of unstyled content.
 */
export function buildHostStyle(input: ThemePayload = {}): string {
  const mode = input.mode ?? DEFAULT_THEME.mode;
  const base = mode === 'dark' ? { ...DEFAULT_THEME, ...DARK_THEME } : DEFAULT_THEME;

  const primary = input.primary ?? base.primary;
  const surface = input.surface ?? base.surface;
  const text = input.text ?? base.text;
  const border = input.border ?? base.border;
  const radius = input.radius ?? base.radius;
  const fontFamily = input.fontFamily ?? base.fontFamily;
  const primaryFg = input.primaryFg ?? base.primaryFg;

  return `
:host {
  /* Public, host-overridable knobs. */
  --fino-primary: ${primary};
  --fino-primary-fg: ${primaryFg};
  --fino-radius: ${radius};
  --fino-font: ${fontFamily};
  --fino-surface: ${surface};
  --fino-text: ${text};
  --fino-border: ${border};

  /* Map onto the app's internal tokens so existing components pick them up. */
  --brand-500: var(--fino-primary);
  --radius-md: var(--fino-radius);
  --color-surface: var(--fino-surface);
  --color-text: var(--fino-text);
  --color-border: var(--fino-border);

  display: block;
  color-scheme: ${mode};
  font-family: var(--fino-font);
  color: var(--fino-text);
  background: var(--fino-surface);
  /* Prevent the host page's line-height/letter-spacing from leaking in. */
  line-height: 1.5;
  text-align: start;
}

/* The React tree lives here and must fill the element. */
#fino-root {
  display: block;
  min-height: 320px;
  height: 100%;
  background: var(--fino-surface);
  color: var(--fino-text);
  font-family: var(--fino-font);
}

/* Direction is decided by the locale attribute, not the host page. */
:host([dir='rtl']) #fino-root { direction: rtl; }
:host([dir='ltr']) #fino-root { direction: ltr; }
`.trim();
}

/** Apply a theme payload to a live element's shadow root. */
export function applyTheme(root: ShadowRoot, theme: ThemePayload): void {
  let style = root.querySelector<HTMLStyleElement>('style[data-fino-theme]');

  if (!style) {
    style = document.createElement('style');
    style.setAttribute('data-fino-theme', '');
    root.prepend(style);
  }

  style.textContent = buildHostStyle(theme);
}
