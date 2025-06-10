import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowModelsService } from '@/services';

import { useModelType } from '../hooks/use-model-type';

/**
 * 判断模型是不是支持技能
 */
export function useModelSkillDisabled() {
  const modelType = useModelType();

  const modelsService = useService(WorkflowModelsService);
  return !(modelType && modelsService.isFunctionCallModel(modelType));
}
