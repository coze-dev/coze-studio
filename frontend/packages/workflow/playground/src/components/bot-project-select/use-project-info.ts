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

import { useQuery } from '@tanstack/react-query';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { intelligenceApi, MemoryApi } from '@coze-arch/bot-api';

export const useProjectInfo = (projectId?: string) => {
  const { isLoading, data: variableList } = useQuery({
    queryKey: ['project_info', projectId || ''],
    queryFn: async () => {
      if (!projectId) {
        return undefined;
      }

      const { VariableList } = await MemoryApi.GetProjectVariableList({
        ProjectID: projectId,
      });

      return (
        VariableList?.filter?.(v => v.Enable)?.map(variable => ({
          key: variable.Keyword,
        })) || []
      );
    },
  });

  return { isLoading, variableList };
};

export const useProjectItemInfo = (projectId?: string) => {
  const { isLoading, data: projectItemInfo } = useQuery({
    queryKey: ['project_item_info', projectId || ''],
    queryFn: async () => {
      if (!projectId) {
        return undefined;
      }

      const { data } = await intelligenceApi.GetDraftIntelligenceInfo({
        intelligence_id: projectId,
        intelligence_type: IntelligenceType.Project,
      });
      return data;
    },
  });

  return { isLoading, projectItemInfo };
};
