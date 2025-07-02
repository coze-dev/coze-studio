import { createContext, useContext } from 'react';

interface ArraySetterContext {
  currentAddIndex?: number;
  currentIndex?: number;
}

const arraySetterItemContext = createContext<ArraySetterContext>({});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ArraySetterItemContextProvider = arraySetterItemContext.Provider;

export const useArraySetterItemContext = () =>
  useContext(arraySetterItemContext);
