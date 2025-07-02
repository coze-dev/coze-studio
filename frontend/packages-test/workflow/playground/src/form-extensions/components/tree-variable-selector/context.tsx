import { createContext, useContext } from 'react';

import { type ViewVariableMeta } from '@coze-workflow/variable';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';

interface TreeVariableSelectorContext {
  value?: string[];
  dataSource?: TreeNodeData[];
  query?: string;
  setQuery?: (query: string) => void;
  forArrayItem?: boolean;
  invalidContent?: string;
  testId?: string;
  valueSubVariableMeta: ViewVariableMeta | null;
  displayVarName?: string;
  isUnknownValue?: boolean;
}

const TreeVariableSelectorContext = createContext<TreeVariableSelectorContext>({
  valueSubVariableMeta: null,
});

export const useTreeVariableSelectorContext = () =>
  useContext(TreeVariableSelectorContext);

export { TreeVariableSelectorContext };
