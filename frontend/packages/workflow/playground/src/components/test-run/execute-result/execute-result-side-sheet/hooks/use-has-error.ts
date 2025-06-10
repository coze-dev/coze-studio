/* eslint-disable @coze-arch/no-deep-relative-import */
import { useExecStateEntity } from '../../../../../hooks';
import { useNodeErrorList } from './use-node-error-list';
import { useLineErrorList } from './use-line-error-list';

export const useHasError = (options?: { withWarning: boolean }) => {
  const { withWarning = true } = options ?? {};
  const { hasLineError } = useLineErrorList();
  const { nodeErrorList } = useNodeErrorList();
  let hasNodeError = nodeErrorList.length > 0;
  if (!withWarning) {
    hasNodeError =
      nodeErrorList.filter(error => error.errorLevel !== 'warning').length > 0;
  }

  const {
    config: { systemError },
  } = useExecStateEntity();

  return hasLineError || hasNodeError || !!systemError;
};
