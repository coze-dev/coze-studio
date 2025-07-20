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
    // 如果没有 biz_role_id， 说明是nickname变量，这里不做处理
    if (!item?.biz_role_id) {
      return item;
    }

    const role = roleList?.find(
      _role => _role.biz_role_id === item?.biz_role_id,
    );

    // 如果没找到对应的角色，说明已经被删除，这里不做处理，外面报错提示已失效
    if (!role) {
      return item;
    }

    // 如果 value 保存的 nickname 和 角色列表里的都有，就以角色列表里的为准
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
