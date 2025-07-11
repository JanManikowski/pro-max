'use client';

import { createContext, useContext } from 'react';
import type { Category } from './GlobalDataProvider';

export type GlobalDataContextType = {
  categories: Category[];
  loading: boolean;
};

const GlobalDataContext = createContext<GlobalDataContextType>({
  categories: [],
  loading: true,
});

export default function GlobalDataContextProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: GlobalDataContextType;
}) {
  return (
    <GlobalDataContext.Provider value={data}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export const useGlobalData = () => useContext(GlobalDataContext);
