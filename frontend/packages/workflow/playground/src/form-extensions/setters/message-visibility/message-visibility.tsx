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

import { useState } from 'react';

import classnames from 'classnames';
import { type Setter } from '@coze-workflow/setters';
import { IconTick } from '@douyinfe/semi-icons';
import { ViewVariableType } from '@coze-workflow/variable';
import { concatTestId } from '@coze-workflow/base';
import { RoleType } from '@coze-arch/idl/social_api';
import { I18n } from '@coze-arch/i18n';
import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { Select, Space, Dropdown, Tag } from '@coze-arch/coze-design';

import PopupContainer from '@/components/popup-container';

import { useGetCurrentInputsParameters } from '../../hooks/use-get-current-input-parameters';
import { useGetSceneFlowRoleList } from '../../../hooks/use-get-scene-flow-params';
import { isRoleUserSettings } from './utils';
import {
  type MessageVisibilityValue,
  type MessageVisibilitySetterOptions,
  type RoleSetting,
  type NicknameVariableSetting,
} from './types';
import { RoleSelectOptionItem } from './role-select-option-item';
import { MessageVisibilityContextProvider } from './context';
import { customVisibilityValue } from './constants';

import styles from './message-visibility.module.less';

const normalOptions = [
  {
    label: I18n.t(
      'scene_workflow_chat_node_conversation_visibility_speaker',
      {},
      '本轮消息的所有发言人可见',
    ),
    value: '2',
  },
  {
    label: I18n.t(
      'scene_workflow_chat_node_conversation_visibility_all',
      {},
      '全员可见',
    ),
    value: '4',
  },
  {
    label: I18n.t(
      'scene_workflow_chat_node_conversation_visibility_custom',
      {},
      '自定义',
    ),
    value: customVisibilityValue,
  },
];

export const MessageVisibility: Setter<
  MessageVisibilityValue,
  MessageVisibilitySetterOptions
> = props => {
  const { value: initialValue, onChange, readonly, testId = '' } = props;
  const inputParameters = useGetCurrentInputsParameters();

  const { data: roleList } = useGetSceneFlowRoleList();

  const [value, setValue] = useState<MessageVisibilityValue | undefined>(
    initialValue,
  );

  const handleValueChange = (newValue: MessageVisibilityValue) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  const renderOptionItem = renderProps => {
    const { label, value: optionValue, onClick, selected } = renderProps;

    const handleClick = () => {
      handleValueChange({
        visibility: optionValue,
        user_settings: undefined,
      });

      onClick();
    };

    if (optionValue === customVisibilityValue) {
      return <RoleSelectOptionItem {...renderProps} />;
    } else {
      return (
        <Dropdown.Item
          className={classnames('w-full justify-start', {
            ['font-semibold']: selected,
          })}
          onClick={handleClick}
          data-testid={concatTestId(testId, optionValue)}
        >
          <Space>
            <IconTick
              className={classnames({
                ['text-[var(--semi-color-text-2)]']: selected,
                ['text-transparent	']: !selected,
              })}
            />
            <div>{label}</div>
          </Space>
        </Dropdown.Item>
      );
    }
  };

  const handleRemoveUserSetting =
    (userSetting: RoleSetting | NicknameVariableSetting) => () => {
      if (!value?.user_settings) {
        return;
      }
      const userSettings = value.user_settings;
      if (isRoleUserSettings(userSettings)) {
        handleValueChange({
          ...value,
          user_settings: (userSettings as RoleSetting[]).filter(
            item => item.biz_role_id !== userSetting.biz_role_id,
          ),
        });
      } else {
        handleValueChange({
          ...value,
          user_settings: (userSettings as NicknameVariableSetting[]).filter(
            item => item.nickname !== userSetting.nickname,
          ),
        });
      }
    };

  const renderSelectedItem: SelectProps['renderSelectedItem'] = option => {
    if (value?.visibility !== customVisibilityValue) {
      return option.label;
    } else {
      if (value?.user_settings?.length) {
        return value?.user_settings?.map(item => (
          <Tag
            color="primary"
            key={item.biz_role_id || item.nickname}
            closable={
              roleList?.find(role => role.biz_role_id === item.biz_role_id)
                ?.role_type === RoleType.Host
                ? false
                : true
            }
            onClose={handleRemoveUserSetting(item)}
          >
            {item.biz_role_id
              ? item.nickname
                ? `${item.role}(${item.nickname})`
                : item.role
              : item.nickname}
          </Tag>
        ));
      } else {
        return null;
      }
    }
  };

  return (
    <MessageVisibilityContextProvider
      value={{
        value,
        handleValueChange,
        nicknameVariables: inputParameters.filter(
          item =>
            item.name &&
            (item.type === ViewVariableType.String ||
              item.type === ViewVariableType.ArrayString),
        ),
        testId,
      }}
    >
      <PopupContainer>
        <Select
          placeholder={I18n.t('workflow_testset_please_select')}
          value={value?.visibility}
          dropdownMatchSelectWidth
          className={classnames('w-full', {
            'pointer-events-none': readonly,
          })}
          optionList={normalOptions}
          renderOptionItem={renderOptionItem}
          dropdownClassName={styles['message-visibility-select-dropdown']}
          renderSelectedItem={renderSelectedItem}
          data-testid={testId}
        />
      </PopupContainer>
    </MessageVisibilityContextProvider>
  );
};
