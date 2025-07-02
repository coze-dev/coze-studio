import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { useExecStateEntity } from '@/hooks';

import { isOutputVariable } from '../../utils/is-output-variable';

/**
 * 判断变量是否是输出变量
 */
export function useIsOutputVariable(groupIndex: number, variableIndex: number) {
  const execEntity = useExecStateEntity();
  const node = useCurrentEntity();
  const executeNodeResult = execEntity.getNodeExecResult(node.id);

  return isOutputVariable(groupIndex, variableIndex, executeNodeResult);
}
