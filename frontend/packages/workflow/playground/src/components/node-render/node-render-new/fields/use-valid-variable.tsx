import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowVariableFacadeService } from '@coze-workflow/variable';

/**
 * 获取变量，并校验变量作用域
 * @param keyPath
 * @returns
 */
export function useValidVariable(keyPath?: string[]) {
  const node = useCurrentEntity();
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );

  const valid = !!facadeService.getVariableFacadeByKeyPath(keyPath, {
    node,
    checkScope: true,
  });
  const variable = facadeService.getVariableFacadeByKeyPath(keyPath, { node });

  return {
    valid,
    variable,
  };
}
