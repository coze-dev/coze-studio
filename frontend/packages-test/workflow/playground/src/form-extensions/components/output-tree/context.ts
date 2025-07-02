import { createContext, useContext } from 'react';

interface OutputTreeContext {
  testId?: string;
}

const outputTreeContext = createContext<OutputTreeContext>({});

export const useOutputTreeContext = () => useContext(outputTreeContext);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const OutputTreeContextProvider = outputTreeContext.Provider;
