import { useRef, type PropsWithChildren, createContext } from 'react';

import { createTestsetManageStore, type TestsetManageState } from './store';

type TestsetManageStore = ReturnType<typeof createTestsetManageStore>;

export const TestsetManageContext = createContext<TestsetManageStore | null>(
  null,
);

export function TestsetManageProvider({
  children,
  ...props
}: PropsWithChildren<TestsetManageState>) {
  const storeRef = useRef<TestsetManageStore>();
  if (!storeRef.current) {
    storeRef.current = createTestsetManageStore(props);
  }

  return (
    <TestsetManageContext.Provider value={storeRef.current}>
      {children}
    </TestsetManageContext.Provider>
  );
}
