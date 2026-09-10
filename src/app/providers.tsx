import React, { useState, useEffect, createContext, useContext } from 'react';
import { fa, en, type Lang, type Translations } from '../i18n';
import { mockUser, mockProducts } from '../data/mock';
import type { Presence } from '../types';
import { Toast } from '../components/ui';

interface ImpersonationState {
  tenantId: string;
  tenantName: string;
  originalUser: typeof mockUser;
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
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(mockUser);
  const [lang, setLang] = useState<Lang>('fa');
  const [product, setProduct] = useState(mockProducts[0]);
  const [presence, setPresence] = useState<Presence>('ONLINE');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null);
  const t = lang === 'fa' ? fa : en;

  // Set direction based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

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

  return (
    <AppContext.Provider value={{ 
      user, setUser, lang, t, setLang, product, setProduct, presence, setPresence, showToast,
      impersonation, startImpersonation, stopImpersonation
    }}>
      {children}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </AppContext.Provider>
  );
}
