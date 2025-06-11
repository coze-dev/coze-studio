import { useMemo } from 'react';

import { isGlobalVariableKey } from '@coze-workflow/variable';

import { useNodeAvailableVariablesWithNode } from '@/form-extensions/hooks';

import { type RelatedVariablesHookProps } from '../types';

export default function useRelatedVariable({
  variablesFormatter = v => v,
}: RelatedVariablesHookProps) {
  const availableVariables = useNodeAvailableVariablesWithNode();

  const globalVariables = useMemo(
    () =>
      variablesFormatter(
        availableVariables.filter(
          item => item.nodeId && isGlobalVariableKey(item.nodeId),
        ),
      ),
    [availableVariables, variablesFormatter],
  );

  return {
    globalVariables,
  };
}
