import { createContext, useContext } from 'react';

interface InputTreeContext {
  testId?: string;
}

const inputTreeContext = createContext<InputTreeContext>({});

export const useInputTreeContext = () => useContext(inputTreeContext);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const InputTreeContextProvider = inputTreeContext.Provider;
