import { createContext, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ValueExpressionInputContext = createContext<{
  testId?: string;
}>({});

export const useValueExpressionInputContext = () =>
  useContext(ValueExpressionInputContext);

export { ValueExpressionInputContext };
