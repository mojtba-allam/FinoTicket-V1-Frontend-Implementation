import { describe, expect, it } from 'vitest';
import { buildHostStyle, DEFAULT_THEME } from '../theme';

describe('buildHostStyle', () => {
  it('emits a :host block with the default theme when nothing is given', () => {
    const css = buildHostStyle();
    expect(css).toContain(':host {');
    expect(css).toContain(`--fino-primary: ${DEFAULT_THEME.primary}`);
    expect(css).toContain('--fino-radius: 8px');
  });

  it('honours a host-supplied primary colour', () => {
    const css = buildHostStyle({ primary: '#0f766e' });
    expect(css).toContain('--fino-primary: #0f766e');
    // The internal token must be re-mapped so components pick it up.
    expect(css).toContain('--brand-500: var(--fino-primary)');
  });

  it('switches the surface for dark mode', () => {
    const light = buildHostStyle({ mode: 'light' });
    const dark = buildHostStyle({ mode: 'dark' });
    expect(light).toContain('color-scheme: light');
    expect(dark).toContain('color-scheme: dark');
    expect(dark).not.toBe(light);
  });

  it('never leaks a document-level selector', () => {
    // Scope discipline: everything must live inside the shadow root.
    const css = buildHostStyle();
    expect(css).not.toMatch(/(^|\n)\s*(body|html|\*)\s*\{/);
  });

  it('styles #fino-root so the React tree fills the element', () => {
    const css = buildHostStyle();
    expect(css).toContain('#fino-root');
    expect(css).toContain('min-height: 320px');
  });
});
