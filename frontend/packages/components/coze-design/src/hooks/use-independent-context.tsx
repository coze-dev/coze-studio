import { createContext, type ReactNode, useContext } from 'react';

export function createIndependentContext<ContextValue>() {
  const Context = createContext<ContextValue>({} as unknown as ContextValue);

  const useIndependentContext = () => useContext(Context);

  function Provider({
    children,
    value,
  }: {
    value: ContextValue;
    children: ReactNode;
  }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return [Provider, useIndependentContext] as const;
}
