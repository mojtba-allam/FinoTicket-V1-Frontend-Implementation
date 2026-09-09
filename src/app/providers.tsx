import React, { createContext, useContext } from 'react';
import { fa, en, type Lang, type Translations } from '../i18n';
import { mockUser, mockProducts } from '../data/mock';
import type { Presence } from '../types';

interface AppContextType {
  user: typeof mockUser;
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  product: typeof mockProducts[0];
  setProduct: (p: typeof mockProducts[0]) => void;
  presence: Presence;
  setPresence: (p: Presence) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => useContext(AppContext);
