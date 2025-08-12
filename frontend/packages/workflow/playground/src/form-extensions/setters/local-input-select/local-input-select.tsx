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

import { type FC } from 'react';

import classnames from 'classnames';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { IconTick } from '@douyinfe/semi-icons';
import { type ViewVariableType } from '@coze-workflow/variable';
import { VARIABLE_TYPE_ALIAS_MAP } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { Select, Space, Dropdown } from '@coze-arch/coze-design';

import { useGetCurrentInputsParameters } from '../../hooks/use-get-current-input-parameters';
import { VariableTypeTag } from '../../components/variable-type-tag';

import styles from './local-input-select.module.less';

export const LocalInputSelect: FC<
  SetterComponentProps<
    string,
    {
      disabledTypes?: ViewVariableType[];
      allowedTypes?: ViewVariableType[];
    }
  >
> = props => {
  const { value, onChange, options } = props;
  const { disabledTypes, allowedTypes } = options;

  const inputsParameters = useGetCurrentInputsParameters();

  const renderOptionItem = renderOption => {
    const { selected } = renderOption;
    return (
      <Dropdown.Item
        onClick={renderOption.onClick}
        className={classnames({
          ['font-semibold']: selected,
        })}
      >
        <Space>
          <IconTick
            className={classnames({
              ['text-[var(--semi-color-text-2)]']: selected,
              ['text-transparent	']: !selected,
            })}
          />
          {renderOption.label}{' '}
          <VariableTypeTag>
            {VARIABLE_TYPE_ALIAS_MAP[renderOption.type]}
          </VariableTypeTag>
        </Space>
      </Dropdown.Item>
    );
  };

  return (
    <Select
      className="w-full"
      dropdownMatchSelectWidth
      placeholder={I18n.t(
        'scene_workflow_chat_node_conversation_content_speaker_placeholder',
        {},
        'Please choose player',
      )}
      optionList={inputsParameters
        .filter(item => {
          if (allowedTypes?.length) {
            return allowedTypes.includes(item.type);
          }

          if (!disabledTypes?.length) {
            return true;
          }
          if (disabledTypes?.includes(item.type)) {
            return false;
          } else {
            return true;
          }
        })
        .map(item => ({
          label: item.name,
          value: item.name,
          type: item.type,
        }))}
      value={value}
      onChange={onChange as SelectProps['onChange']}
      onBlur={e => {
        onChange?.(value);
      }}
      renderOptionItem={renderOptionItem}
      dropdownClassName={styles['local-input-select-dropdown']}
      emptyContent={I18n.t('workflow_detail_node_nodata')}
    />
  );
};
