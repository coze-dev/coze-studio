import { useService } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/base';

import { WorkflowModelsService } from '@/services';

import { useModelType } from '../../hooks/use-model-type';

/**
 * 模型支持的数据类型
 */
export function useModelEnabledTypes() {
  const modelType = useModelType();
  const modelsService = useService(WorkflowModelsService);
  const modelAbility = modelsService.getModelAbility(modelType);
  const enabledTypes: ViewVariableType[] = [];

  if (modelAbility?.image_understanding) {
    enabledTypes.push(ViewVariableType.Image);
  }

  if (modelAbility?.video_understanding) {
    enabledTypes.push(ViewVariableType.Video);
  }

  return enabledTypes;
}
