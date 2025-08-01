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

import { useEffect } from 'react';

import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { type project_memory as ProjectMemory } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { useVariableGroupsStore } from '../../store';

export const useInit = (projectID?: string, version?: string) => {
  const { data: reqData, loading } = useGetVariableList(projectID, version);
  const { initStore } = useVariableGroupsStore();

  useEffect(() => {
    if (loading) {
      return;
    }

    const { variableGroups, canEdit } = reqData;

    initStore({
      variableGroups,
      canEdit: canEdit && !version,
    });
  }, [loading]);

  return {
    loading,
  };
};

const useGetVariableList = (
  projectID?: string,
  version?: string,
): {
  data: {
    variableGroups: ProjectMemory.GroupVariableInfo[];
    canEdit: boolean;
  };
  loading: boolean;
  error: string;
} => {
  const {
    data: reqData,
    loading,
    error,
  } = useRequest(
    async () => {
      if (!projectID) {
        throw new CustomError(
          'useListDataSetReq_error',
          'projectID cannot be empty',
        );
      }
      const res = await MemoryApi.GetProjectVariableList({
        ProjectID: projectID,
        version: version || undefined,
      });

      const { GroupConf, code, CanEdit: canEdit, msg } = res;

      if (code !== 0) {
        return {
          error: msg,
          data: {
            variableGroups: [],
            canEdit: false,
          },
          loading: false,
        };
      }

      if (!GroupConf) {
        return {
          data: {
            variableGroups: [],
            canEdit,
          },
          loading: false,
        };
      }

      return {
        variableGroups: GroupConf,
        canEdit,
      };
    },
    {
      manual: false,
      onError: () => {
        Toast.error({
          content: I18n.t('Network_error'),
          showClose: false,
        });
      },
    },
  );
  return {
    data: {
      variableGroups: reqData?.variableGroups ?? [],
      canEdit: reqData?.canEdit ?? false,
    },
    loading,
    error: error?.message ?? '',
  };
};
