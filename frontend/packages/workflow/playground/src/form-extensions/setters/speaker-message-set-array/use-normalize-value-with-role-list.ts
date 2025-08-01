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

import { useGetSceneFlowRoleList } from '../../../hooks/use-get-scene-flow-params';
import { type SpeakerMessageSetValue } from './types';

export const useNormalizeValueWithRoleList = (
  remoteValue: Array<SpeakerMessageSetValue | undefined> | undefined,
) => {
  const { isLoading, data: roleList } = useGetSceneFlowRoleList();
  if (!remoteValue || isLoading) {
    return [];
  }

  return remoteValue.map(item => {
    // If there is no biz_role_id, it means it is a nickname variable and will not be processed here
    if (!item?.biz_role_id) {
      return item;
    }

    const role = roleList?.find(
      _role => _role.biz_role_id === item?.biz_role_id,
    );

    // If the corresponding role is not found, it means that it has been deleted, and it will not be processed here. The error prompt outside has expired.
    if (!role) {
      return item;
    }

    // If both the nickname saved by value and the character list are available, the character list shall prevail
    if (role?.nickname && item.nickname) {
      return {
        ...item,
        role: role.role,
        nickname: role.nickname,
      } as unknown as SpeakerMessageSetValue;
    }

    return item;
  });
};
