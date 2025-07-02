import { createContext, useContext } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

interface ConditionContext {
  flowNodeEntity: FlowNodeEntity | null;
  readonly: boolean;
  expanded?: boolean;
  setterPath: string;
}
// eslint-disable-next-line @typescript-eslint/naming-convention -- react context
const ConditionContext = createContext<ConditionContext>({
  flowNodeEntity: null,
  readonly: false,
  setterPath: '',
});
export const useConditionContext = () => useContext(ConditionContext);

// eslint-disable-next-line @typescript-eslint/naming-convention -- react context
export const ConditionContextProvider = ConditionContext.Provider;
