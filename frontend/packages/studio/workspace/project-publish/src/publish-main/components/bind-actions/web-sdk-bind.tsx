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

import { type MouseEventHandler } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { FormSelect, type optionRenderProps } from '@coze-arch/coze-design';

import { useProjectPublishStore } from '@/store';
import {
  type ChatflowOptionProps,
  useChatflowOptions,
} from '@/publish-main/hooks/use-chatflow-options';

import { OptionWithTooltip } from '../option-with-tooltip';

export interface WebSdkBindProps {
  checked: boolean;
  record: PublishConnectorInfo;
  onClick: MouseEventHandler;
}

export function WebSdkBind({ checked, record, onClick }: WebSdkBindProps) {
  const { connectorPublishConfig, setProjectPublishInfo } =
    useProjectPublishStore(
      useShallow(state => ({
        connectorPublishConfig: state.connectorPublishConfig,
        setProjectPublishInfo: state.setProjectPublishInfo,
      })),
    );
  const lastSelectedChatflow =
    connectorPublishConfig?.[record.id]?.selected_workflows?.[0]?.workflow_id;

  const { chatflowOptions } = useChatflowOptions();

  const handleChatflowSelect = (option: ChatflowOptionProps) => {
    setProjectPublishInfo({
      connectorPublishConfig: {
        ...connectorPublishConfig,
        [record.id]: {
          selected_workflows: [
            {
              workflow_id: option.value,
              workflow_name: option.label,
            },
          ],
        },
      },
    });
  };

  const removePublishConfig = () => {
    useProjectPublishStore.getState().setProjectPublishInfoByImmer(draft => {
      const target = draft[record.id];
      if (!target?.selected_workflows) {
        return;
      }
      delete target.selected_workflows;
    });
  };

  return (
    <div className={classNames('flex mt-auto')} onClick={onClick}>
      <FormSelect
        field="sdk_chatflow"
        noLabel
        showClear
        noErrorMessage
        fieldClassName="w-[172px]"
        className="w-full"
        placeholder={I18n.t('project_release_Please_select')}
        initValue={lastSelectedChatflow}
        optionList={chatflowOptions}
        renderOptionItem={(option: optionRenderProps) => (
          <OptionWithTooltip option={option} tooltip={option.tooltip} />
        )}
        // onChange is responsible for handling the logic of data emptying
        // onSelect handles data selection logic
        onChange={values => {
          if (typeof values !== 'undefined') {
            return;
          }
          removePublishConfig();
        }}
        onSelect={(_: unknown, option: unknown) =>
          handleChatflowSelect(option as ChatflowOptionProps)
        }
        rules={[
          {
            required: checked,
            message: I18n.t('project_release_Please_select'),
          },
          // Verify that the selected chatflow exists & & is not disabled
          {
            validator: (_rule: unknown, value: unknown) => {
              if (!checked) {
                return true;
              }
              const selected = chatflowOptions?.find(
                option => option.value === (value as string),
              );
              if (!selected) {
                return new Error(I18n.t('project_release_chatflow3'));
              }
              if (selected.disabled) {
                return new Error(selected.tooltip);
              }
              return true;
            },
          },
        ]}
      />
    </div>
  );
}
