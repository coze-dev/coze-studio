import { useState, useEffect } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { type MessageBizType } from '@coze-workflow/base';
import type { Model } from '@coze-arch/bot-api/developer_api';

import { bizTypeToDependencyTypeMap } from '@/services/workflow-dependency-service';
import { DependencySourceType } from '@/constants';

import { WorkflowModelsService } from '../services';
import { useDependencyService } from './use-dependency-service';

/**
 * 统一获取模型数据入口，监听到模型资源变化时，更新模型数据
 */
export const useWorkflowModels = () => {
  const modelsService = useService<WorkflowModelsService>(
    WorkflowModelsService,
  );
  const dependencyService = useDependencyService();
  const [models, setModels] = useState<Model[]>(
    modelsService?.getModels() ?? [],
  );

  useEffect(() => {
    const disposable = dependencyService.onDependencyChange(source => {
      if (
        bizTypeToDependencyTypeMap[source?.bizType as MessageBizType] ===
        DependencySourceType.LLM
      ) {
        const curModels = modelsService?.getModels() ?? [];
        setModels(curModels);
      }
    });

    return () => {
      disposable?.dispose?.();
    };
  }, []);

  return { models };
};
