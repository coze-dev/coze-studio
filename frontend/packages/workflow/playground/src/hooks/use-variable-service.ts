import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowVariableService } from '@coze-workflow/variable';

export function useVariableService() {
  const variableService = useService<WorkflowVariableService>(
    WorkflowVariableService,
  );

  return variableService;
}
