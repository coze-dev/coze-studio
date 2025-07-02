/* eslint-disable @coze-arch/no-deep-relative-import */
import { useExecStateEntity } from '../../../../../hooks';
import { type NodeError } from '../../../../../entities/workflow-exec-state-entity';

export const useLineErrorList = () => {
  const { nodeErrors } = useExecStateEntity();

  const lineErrorList = Object.keys(nodeErrors).reduce(
    (list, nodeId: string) => {
      const lineErrors = nodeErrors[nodeId].filter(
        item => item.errorType === 'line',
      );

      return [...list, ...lineErrors];
    },
    [] as NodeError[],
  );

  return {
    lineErrorList,
    hasLineError: lineErrorList.length > 0,
  };
};
