import React, { useState, useEffect, createContext, useContext, useSyncExternalStore } from 'react';
import { fa, en, type Lang, type Translations } from '../i18n';
import { mockUser, mockProducts } from '../data/mock';
import type { Presence } from '../types';
import { Toast } from '../components/ui';
import { isLiveMode } from '../lib/api/config';
import { sessionStore } from '../lib/api/session';
import { resetDataApi } from '../lib/api/dataApi';

interface ImpersonationState {
  tenantId: string;
  tenantName: string;
  originalUser: typeof mockUser;
}

/** Session controls exposed to pages (live mode only). */
interface SessionActions {
  /** True when the SPA is wired to the real Laravel API. */
  isLive: boolean;
  /** True once a bearer token is held. */
  isAuthenticated: boolean;
  /** Exchange client credentials for a token (live mode). */
  login: (credentials: {
    clientId: string;
    clientSecret: string;
    console?: 'platform' | 'tenant';
    displayName?: string;
    email?: string;
  }) => Promise<typeof mockUser>;
  logout: () => void;
}

interface AppContextType {
  user: typeof mockUser;
  setUser: (user: typeof mockUser) => void;
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  product: typeof mockProducts[0];
  setProduct: (p: typeof mockProducts[0]) => void;
  presence: Presence;
  setPresence: (p: Presence) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  impersonation: ImpersonationState | null;
  startImpersonation: (tenantId: string, tenantName: string) => void;
  stopImpersonation: () => void;
  session: SessionActions;
  /**
   * True when rendered inside the <fino-console> shadow root.
   * The host owns authentication, so there is no in-app login route.
   */
  embedded: boolean;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => useContext(AppContext);

/**
 * Placeholder identity used while a live session has no token.
 * `session.isAuthenticated` is what actually gates routes, so components can
 * keep treating `user` as always present.
 */
const GUEST_USER: typeof mockUser = {
  ...mockUser,
  id: 'anonymous',
  email: '',
  display_name: 'Guest',
  role: 'VIEWER',
  status: 'INVITED',
};

export function AppProvider({
  children,
  initialLocale = 'fa',
  embedded = false,
}: {
  children: React.ReactNode;
  initialLocale?: Lang;
  embedded?: boolean;
}) {
  // In live mode the session owns the user; in mock mode we keep the demo user.
  const live = isLiveMode();
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot);
  const [mockModeUser, setMockModeUser] = useState(mockUser);
  const user = live ? (session.user ?? GUEST_USER) : mockModeUser;
  const setUser = setMockModeUser;

  const [lang, setLang] = useState<Lang>(initialLocale);
  const [product, setProduct] = useState(mockProducts[0]);
  const [presence, setPresence] = useState<Presence>('ONLINE');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null);
  const t = lang === 'fa' ? fa : en;

  // Set direction based on language.
  // In an embed we must NOT touch the host document — the shadow root owns
  // direction via :host([dir]) instead (spec §6).
  useEffect(() => {
    if (embedded) return;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, embedded]);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => setToast({ msg, type });

  const startImpersonation = (tenantId: string, tenantName: string) => {
    // Save original user and switch to tenant admin mock
    const originalUser = user;
    const tenantAdminUser = {
      ...mockUser,
      id: `impersonated-${tenantId}`,
      display_name: lang === 'fa' ? `ادمین ${tenantName}` : `${tenantName} Admin`,
      role: 'ADMIN' as const,
    };
    setUser(tenantAdminUser);
    setImpersonation({ tenantId, tenantName, originalUser });
  };

  const stopImpersonation = () => {
    if (impersonation) {
      setUser(impersonation.originalUser);
      setImpersonation(null);
    }
  };

  /**
   * Live mode: obtain a bearer token, then rebuild the data client so every
   * request carries it.
   */
  const login = async (credentials: {
    clientId: string;
    clientSecret: string;
    console?: 'platform' | 'tenant';
    displayName?: string;
    email?: string;
  }) => {
    const api = sessionStore.buildClient(() => {
      resetDataApi();
    });

    const loggedIn = await sessionStore.login(api, credentials);
    resetDataApi();

    return loggedIn as typeof mockUser;
  };

  const logout = () => {
    sessionStore.logout();
    resetDataApi();
  };

  const sessionActions: SessionActions = {
    isLive: live,
    isAuthenticated: live ? Boolean(session.token) : Boolean(user),
    login,
    logout,
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, lang, t, setLang, product, setProduct, presence, setPresence, showToast,
      impersonation, startImpersonation, stopImpersonation, session: sessionActions, embedded
    }}>
      {children}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AppContext.Provider>
  );
}
