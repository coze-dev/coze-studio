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
