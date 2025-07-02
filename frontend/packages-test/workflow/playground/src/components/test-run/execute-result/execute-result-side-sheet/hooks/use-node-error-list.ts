/* eslint-disable @coze-arch/no-deep-relative-import */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useExecStateEntity } from '../../../../../hooks';
import { type NodeError } from '../../../../../entities/workflow-exec-state-entity';

export const useNodeErrorList = () => {
  const { nodeErrors } = useExecStateEntity();

  const nodeErrorList = Object.keys(nodeErrors).reduce(
    (list, nodeId: string) => {
      const nodeError = nodeErrors[nodeId].filter(
        item => item.errorType === 'node',
      );

      const errors = nodeError.filter(item => item.errorLevel === 'error');
      const warnings = nodeError.filter(item => item.errorLevel === 'warning');

      const results = errors.length > 0 ? errors : warnings;
      if (results.length > 0) {
        return [
          ...list,
          {
            nodeId,
            errorInfo: results.map(error => error.errorInfo).join(';'),
            errorLevel: results[0].errorLevel,
            errorType: 'node',
          } as NodeError,
        ];
      }

      return list;
    },
    [] as NodeError[],
  );

  return {
    nodeErrorList,
    hasNodeError: nodeErrorList.length > 0,
  };
};
