import { reporter, logger } from '@coze-arch/logger';
import { Toast } from '@coze-arch/coze-design';

export const safeFn =
  (fn: Function) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- no need to check type
  (...args: any[]) => {
    try {
      return fn(...args);
    } catch (e) {
      Toast.error({
        content: `[Coze Workflow] Failed to run function: ${fn.name || '() => any'}`,
      });
      console.error('Failed to run function: ', e);
      reporter.errorEvent({
        namespace: 'workflow',
        eventName: 'workflow_shortcuts_error',
        error: e,
      });
      logger.error(e);
    }
  };
