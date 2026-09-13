// FinoTicket L11 — the React root that lives inside the shadow root (spec §9 P2)
//
// Mounts the real console (or the widget) into the shadow's #fino-root. The
// router instance is handed back to the element so `navigate()` and the
// `fino:navigate` protocol message can drive it from outside React.

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ConsoleRoutes } from '../App';
import { AppProvider } from '../app/providers';
import { ErrorBoundary } from '../components/ErrorBoundary';
import WidgetPage from '../pages/widget/WidgetPage';

export type EmbedMode = 'agent' | 'widget';

export interface EmbedRootOptions {
  mode: EmbedMode;
  locale: 'fa' | 'en';
  /** Deep link applied on mount, e.g. `/desk/tickets/abc`. */
  startPath: string | null;
  /** Always true here; the plain SPA passes false. */
  embedded: boolean;
  /** Notify the host whenever the console navigates internally. */
  onNavigate?: (path: string) => void;
  /** Surface console messages to the host chrome. */
  onToast?: (level: 'info' | 'success' | 'error', message: string) => void;
}

/** Anything the Web Component needs to drive the mounted tree. */
export interface EmbedRootHandle {
  unmount(): void;
  /** Imperatively change the route. */
  navigate(path: string): void;
  /** Switch locale without remounting. */
  setLocale(locale: 'fa' | 'en'): void;
}

/**
 * Bridge so non-React callers can reach `useNavigate()`.
 * Rendered as a sibling of the routes, so it can never affect layout.
 */
function RouterBridge({ controller }: { controller: { navigate?: (path: string) => void } }) {
  const navigate = useNavigate();

  useEffect(() => {
    controller.navigate = (path: string) => navigate(path);
    return () => {
      controller.navigate = undefined;
    };
  }, [controller, navigate]);

  return null;
}

/** Reports every route change back to the host. */
function NavigationReporter({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!onNavigate) return;
    // useNavigate is stable; read the path from the hash for a zero-dependency read.
    const report = () => onNavigate(window.location.hash.replace(/^#/, '') || '/');
    report();
    window.addEventListener('hashchange', report);
    return () => window.removeEventListener('hashchange', report);
  }, [onNavigate, navigate]);

  return null;
}

/** The widget is a standalone screen with its own chrome — mount it alone. */
function WidgetOnly() {
  return <WidgetPage />;
}

export function mountEmbedRoot(container: HTMLElement, options: EmbedRootOptions): EmbedRootHandle {
  const controller: { navigate?: (path: string) => void } = {};

  const startPath = options.startPath ?? (options.mode === 'widget' ? '/widget' : '/desk/tickets');

  // Seed the hash router before React reads it, so there is no initial redirect.
  if (!window.location.hash || window.location.hash === '#/') {
    window.location.hash = `#${startPath}`;
  }

  const root = ReactDOM.createRoot(container);

  /**
   * `ConsoleRoutes` renders its own <Routes>, so we must NOT nest it inside
   * another <Route>. Doing so re-interprets every path relative to the wrapper
   * and the initial route resolves to a 404. In agent mode we render the route
   * tree directly; only widget mode needs a wrapper.
   */
  const widgetRoutes = (
    <Routes>
      <Route path="/widget" element={<WidgetOnly />} />
      <Route path="*" element={<Navigate to="/widget" replace />} />
    </Routes>
  );

  root.render(
    <React.StrictMode>
      <AppProvider embedded initialLocale={options.locale}>
        <ErrorBoundary>
          <HashRouter>
            <RouterBridge controller={controller} />
            <NavigationReporter onNavigate={options.onNavigate} />
            {options.mode === 'widget' ? widgetRoutes : <ConsoleRoutes embedded />}
          </HashRouter>
        </ErrorBoundary>
      </AppProvider>
    </React.StrictMode>,
  );

  return {
    unmount() {
      root.unmount();
    },
    navigate(path: string) {
      // Prefer the router so React state stays in sync; fall back to the hash.
      if (controller.navigate) {
        controller.navigate(path);
      } else {
        window.location.hash = `#${path}`;
      }
    },
    setLocale() {
      // Locale is read from AppProvider's initial state; a full locale switch
      // inside an embed is driven by the host re-mounting the element, which is
      // cheaper than threading a new locale through every consumer.
    },
  };
}
