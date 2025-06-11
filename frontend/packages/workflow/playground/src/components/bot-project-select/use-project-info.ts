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
