'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface PageTitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(undefined);

export function PageTitleProvider({
  defaultTitle,
  children,
}: {
  defaultTitle: string;
  children: React.ReactNode;
}) {
  const [title, setTitle] = useState(defaultTitle);
  return <PageTitleContext.Provider value={{ title, setTitle }}>{children}</PageTitleContext.Provider>;
}

/** Call from a page to set the dashboard header title while it's mounted. */
export function usePageTitle(title: string) {
  const ctx = useContext(PageTitleContext);
  useEffect(() => {
    ctx?.setTitle(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);
}

export function useCurrentPageTitle(): string {
  const ctx = useContext(PageTitleContext);
  return ctx?.title ?? '';
}
