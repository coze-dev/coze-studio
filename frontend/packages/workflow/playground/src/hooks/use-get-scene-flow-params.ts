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

import { throttle, once } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import {
  type GetMetaRoleListResponse,
  RoleType,
} from '@coze-arch/idl/social_api';
import { Toast } from '@coze-arch/coze-design';
import { SocialApi } from '@coze-arch/bot-api';

import { useGlobalState } from './use-global-state';
import { useGetWorkflowMode } from './use-get-workflow-mode';

const warn = once(
  throttle(() => Toast.warning('当前工作流未关联场景'), 10 * 1000),
);

const useQuerySceneFlowMetaRole = () => {
  const globalState = useGlobalState();
  const { isSceneFlow } = useGetWorkflowMode();
  const { bindBizID } = globalState;
  if (isSceneFlow && !bindBizID) {
    warn();
  }

  return useQuery({
    queryKey: ['scene_flow_role_list'],
    staleTime: 10 * 1000,
    queryFn: () =>
      SocialApi.GetMetaRoleList({
        meta_id: bindBizID as string,
      }),
    placeholderData: {
      role_list: [],
    } as unknown as GetMetaRoleListResponse,
    enabled: isSceneFlow && !!bindBizID,
  });
};

export const useGetSceneFlowRoleList = () => {
  const { data: res, isLoading } = useQuerySceneFlowMetaRole();

  return {
    isLoading,
    data: res?.role_list.map(item => ({
      biz_role_id: item.biz_role_id as string,
      role: item.name,
      nickname: item.nickname,
      role_type: item.role_type,
      description: item.description,
    })),
  };
};

export const useGetSceneFlowBot = () => {
  const { data: res, isLoading } = useQuerySceneFlowMetaRole();
  if (isLoading) {
    return null;
  } else {
    const host = res?.role_list?.find(item => item.role_type === RoleType.Host);
    return {
      name: host?.name,
      participantId: host?.participant_id,
    };
  }
};
