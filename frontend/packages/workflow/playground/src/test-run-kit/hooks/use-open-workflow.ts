/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/** pick from master，若有冲突请以 master 为准 */
import { useGlobalState } from '@/hooks';

/**
 * 打开 workflow
 * TODO：有一部分依赖还没有迁移完，暂时先把这个hook放在这里，后面还需要迁移
 */
export const useOpenWorkflow = () => {
  const { projectId, getProjectApi } = useGlobalState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const open = (data: any) => {
    const { workflowId, executeId, subExecuteId } = data;
    const projectApi = getProjectApi();

    if (projectId && projectApi) {
      // 应用内跳转
      projectApi.sendMsgOpenWidget(`/workflow/${workflowId}`, {
        name: 'debug',
        data: {
          executeId,
          subExecuteId,
        },
      });
    } else {
      // 资源库或者运维平台跳转
      const url = new URL(window.location.href);
      const params = new URLSearchParams();

      // 新增/更新查询参数，只保留这 4 个参数，包括 space_id
      params.append('space_id', url.searchParams.get('space_id') || '0');
      params.append('workflow_id', workflowId);
      params.append('execute_id', executeId);
      params.append('sub_execute_id', subExecuteId);

      // 构建新 URL
      url.search = params.toString();

      // 在新标签页打开
      window.open(url.toString(), '_blank');
    }
  };

  return { open };
};
