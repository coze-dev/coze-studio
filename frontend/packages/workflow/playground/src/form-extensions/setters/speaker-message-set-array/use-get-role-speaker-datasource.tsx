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

import { I18n } from '@coze-arch/i18n';
import { Space, Tooltip } from '@coze-arch/coze-design';

import { VariableTypeTag } from '../../components/variable-type-tag';
import { useGetSceneFlowRoleList } from '../../../hooks/use-get-scene-flow-params';
import {
  type SpeakerSelectOption,
  type SpeakerSelectDataSource,
} from './types';

export const useGetRoleSpeakerDataSource = (): SpeakerSelectDataSource => {
  const { data: roleList = [] } = useGetSceneFlowRoleList();

  let emptyNickNameIdx = 1;
  return roleList.map((item: SpeakerSelectOption) => ({
    label: (
      <Space className="overflow-hidden">
        <Tooltip content={item.role}>
          <div className="overflow-hidden truncate">{item.role}</div>
        </Tooltip>
        <VariableTypeTag>
          {item.nickname
            ? item.nickname
            : `${I18n.t(
                'scene_edit_roles_list_nickname_empty_seat',
                {},
                '空位',
              )}${emptyNickNameIdx++}`}
        </VariableTypeTag>
      </Space>
    ),
    value: item.biz_role_id,
    biz_role_id: item.biz_role_id,
    role: item.role,
    nickname: item.nickname ?? '',
    extra: {
      biz_role_id: item.biz_role_id as '',
      role: item.role as '',
      nickname: item.nickname as string,
      role_type: item.role_type,
    },
  }));
};
