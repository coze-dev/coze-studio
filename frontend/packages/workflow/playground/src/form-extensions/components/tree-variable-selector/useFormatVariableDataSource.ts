/* eslint-disable unicorn/filename-case */
import { type ViewVariableType } from '@coze-workflow/base';

import { useNodeAvailableVariablesWithNode } from '../../hooks/use-node-available-variables';
import { formatWithNodeVariables } from './utils';
import { type VariableTreeDataNode } from './types';

export interface UseFormatVariableDataSourceProps {
  disabledTypes: Array<ViewVariableType>;
}

export const useFormatVariableDataSource = ({
  disabledTypes,
}: UseFormatVariableDataSourceProps): VariableTreeDataNode[] => {
  const variableList = useNodeAvailableVariablesWithNode();

  return formatWithNodeVariables(variableList, disabledTypes);
};
