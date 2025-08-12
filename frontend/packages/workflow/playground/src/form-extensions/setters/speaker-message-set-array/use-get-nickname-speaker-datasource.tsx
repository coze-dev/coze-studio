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

import {
  VARIABLE_TYPE_ALIAS_MAP,
  ViewVariableType,
} from '@coze-workflow/base/types';
import { Space, Tooltip } from '@coze-arch/coze-design';

import { useGetCurrentInputsParameters } from '../../hooks/use-get-current-input-parameters';
import { VariableTypeTag } from '../../components/variable-type-tag';
import {
  type SpeakerSelectDataSource,
  type SpeakerSelectOption,
} from './types';

export const useGetNicknameSpeakerDataSource = (): SpeakerSelectDataSource => {
  const inputsParameters = useGetCurrentInputsParameters();

  return inputsParameters
    .filter(item => item.type === ViewVariableType.String)
    .map<SpeakerSelectOption>(item => ({
      label: (
        <Space className="overflow-hidden">
          <Tooltip content={item.name}>
            <div className="overflow-hidden truncate">{item.name}</div>
          </Tooltip>
          <VariableTypeTag>
            {VARIABLE_TYPE_ALIAS_MAP[item.type]}
          </VariableTypeTag>
        </Space>
      ),
      value: item.name,
      biz_role_id: '',
      role: '',
      nickname: item.name,
      // labelTag: VARIABLE_TYPE_ALIAS_MAP[item.type],
      extra: {
        biz_role_id: '',
        role: '',
        nickname: item.name,
        role_type: undefined,
      },
    }));
};
